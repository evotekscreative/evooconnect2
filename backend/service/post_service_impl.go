package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"mime/multipart"
	"sort"
	"time"
)

type PostServiceImpl struct {
	UserRepository        repository.UserRepository
	PostRepository        repository.PostRepository
	CommentRepository     repository.CommentRepository
	ConnectionRepository  repository.ConnectionRepository
	GroupRepository       repository.GroupRepository
	GroupMemberRepository repository.GroupMemberRepository
	NotificationService   NotificationService
	DB                    *sql.DB
	Validate              *validator.Validate

	GroupService          GroupService
	PendingPostRepository repository.PendingPostRepository
}

type ExtendedPost struct {
	domain.Post
	Status   string     `json:"status"`
	IsPinned bool       `json:"is_pinned"`
	PinnedAt *time.Time `json:"pinned_at,omitempty"`
}

func NewPostService(
	userRepository repository.UserRepository,
	postRepository repository.PostRepository,
	commentRepository repository.CommentRepository,
	connectionRepository repository.ConnectionRepository,
	groupRepository repository.GroupRepository,
	groupMemberRepository repository.GroupMemberRepository,
	notificationService NotificationService,
	groupService GroupService,
	pendingPostRepository repository.PendingPostRepository,
	db *sql.DB, validate *validator.Validate) PostService {
	return &PostServiceImpl{
		UserRepository:        userRepository,
		PostRepository:        postRepository,
		CommentRepository:     commentRepository,
		ConnectionRepository:  connectionRepository,
		GroupRepository:       groupRepository,
		GroupMemberRepository: groupMemberRepository,
		NotificationService:   notificationService,
		DB:                    db,
		GroupService:          groupService,
		PendingPostRepository: pendingPostRepository,
		Validate:              validate,
	}
}

func (service *PostServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreatePostRequest, files []*multipart.FileHeader) web.PostResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Process image uploads
	var imagePaths []string
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			panic(exception.NewInternalServerError("Failed to open uploaded file: " + err.Error()))
		}

		result, err := helper.UploadImage(file, fileHeader, helper.DirPosts, userId.String(), "images")
		file.Close()

		if err != nil {
			panic(exception.NewInternalServerError("Failed to upload image: " + err.Error()))
		}

		imagePaths = append(imagePaths, result.RelativePath)
	}

	// Create post
	post := domain.Post{
		Id:         uuid.New(),
		UserId:     userId,
		Content:    request.Content,
		Images:     imagePaths,
		Visibility: request.Visibility,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	post = service.PostRepository.Save(ctx, tx, post)

	fullPost, err := service.PostRepository.FindById(ctx, tx, post.Id)
	helper.PanicIfError(err)

	fullPost.IsLiked = service.PostRepository.IsLiked(ctx, tx, post.Id, userId)
	// fullPost.CommentsCount, _ = service.CommentRepository.CountByPostId(ctx, tx, post.Id)
	fullPost.LikesCount = service.PostRepository.GetLikesCount(ctx, tx, post.Id)

	// Kirim notifikasi ke koneksi pengguna
	if service.NotificationService != nil {
		// Ambil data pengguna terlebih dahulu sebelum goroutine
		user, err := service.UserRepository.FindById(ctx, tx, userId)
		if err == nil { // Hanya lanjutkan jika berhasil mendapatkan user
			// Ambil koneksi pengguna terlebih dahulu - gunakan limit yang lebih besar
			connections, _ := service.ConnectionRepository.FindConnectionsByUserId(ctx, tx, userId, 100, 0)

			// Salin data yang diperlukan untuk goroutine
			userName := user.Name
			postId := post.Id

			// Debug: cetak jumlah koneksi yang ditemukan
			fmt.Printf("Sending notifications to %d connections for user %s\n", len(connections), userId)

			go func() {
				// Kirim notifikasi ke setiap koneksi
				for _, connection := range connections {
					var connectedUserId uuid.UUID

					// Tentukan ID pengguna yang terhubung
					if connection.UserId1 == userId {
						connectedUserId = connection.UserId2
					} else if connection.UserId2 == userId {
						connectedUserId = connection.UserId1
					} else {
						continue
					}

					// Debug: cetak ID user yang akan menerima notifikasi
					fmt.Printf("Sending notification to user %s\n", connectedUserId)

					refType := "post"
					service.NotificationService.Create(
						context.Background(),
						connectedUserId,
						string(domain.NotificationCategoryPost),
						string(domain.NotificationTypePostNew),
						"New Post",
						fmt.Sprintf("%s shared a new post", userName),
						&postId,
						&refType,
						&userId,
					)
				}
			}()
		}
	}

	return helper.ToPostResponse(fullPost)
}

// Bagian Update method
func (service *PostServiceImpl) Update(ctx context.Context, postId uuid.UUID, userId uuid.UUID, request web.UpdatePostRequest, files []*multipart.FileHeader) web.PostResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing post
	existingPost, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Verify ownership
	if existingPost.UserId != userId {
		panic(exception.NewForbiddenError("You do not have permission to update this post"))
	}

	// Store original image paths to compare later
	originalImages := existingPost.Images

	// Initialize imagePaths with existing images from the request
	// If request.Images is empty and no new files are uploaded,
	// we'll keep using the original images
	var imagePaths []string
	if request.Images != nil && len(request.Images) > 0 {
		// Use the explicitly provided existing images
		imagePaths = append(imagePaths, request.Images...)
	} else if files == nil || len(files) == 0 {
		// No new uploads and no explicit existing images - keep original
		imagePaths = originalImages
	}

	// Process new uploaded files (if any)
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			panic(exception.NewInternalServerError("Failed to open uploaded file: " + err.Error()))
		}

		result, err := helper.UploadImage(file, fileHeader, helper.DirPosts, userId.String(), "images")
		file.Close()

		if err != nil {
			panic(exception.NewInternalServerError("Failed to upload image: " + err.Error()))
		}

		imagePaths = append(imagePaths, result.RelativePath)
	}

	// Update post
	existingPost.Content = request.Content
	existingPost.Images = imagePaths
	existingPost.Visibility = request.Visibility
	existingPost.UpdatedAt = time.Now()

	updatedPost := service.PostRepository.Update(ctx, tx, existingPost)

	// Check if the current user has liked this post
	updatedPost.IsLiked = service.PostRepository.IsLiked(ctx, tx, postId, userId)
	updatedPost.CommentsCount, _ = service.CommentRepository.CountByPostId(ctx, tx, postId)
	updatedPost.LikesCount = service.PostRepository.GetLikesCount(ctx, tx, postId)

	// After successful update, clean up unused images in background
	go service.cleanupUnusedImages(originalImages, imagePaths)

	return helper.ToPostResponse(updatedPost)
}

// Helper method to clean up unused images
func (service *PostServiceImpl) cleanupUnusedImages(oldImages, newImages []string) {
	// Create a map for quick lookup of new images
	newImageMap := make(map[string]bool)
	for _, img := range newImages {
		newImageMap[img] = true
	}

	// Delete any old images that aren't in the new images list
	for _, oldImg := range oldImages {
		if !newImageMap[oldImg] {
			// This image is no longer being used, delete it
			err := helper.DeleteFile(oldImg)
			if err != nil {
				// Just log the error, don't fail the process
				fmt.Printf("Error deleting unused image %s: %v\n", oldImg, err)
			} else {
				fmt.Printf("Successfully deleted unused image: %s\n", oldImg)
			}
		}
	}
}

func (service *PostServiceImpl) Delete(ctx context.Context, postId uuid.UUID, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing post
	existingPost, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	postImages := existingPost.Images

	// Verify ownership
	if existingPost.UserId != userId {
		panic(exception.NewForbiddenError("You do not have permission to delete this post"))
	}

	service.PostRepository.Delete(ctx, tx, postId)

	for _, image := range postImages {
		err := helper.DeleteFile(image)
		if err != nil {
			panic(exception.NewInternalServerError(err.Error()))
		}
	}
}

func (service *PostServiceImpl) FindById(ctx context.Context, postId uuid.UUID, currentUserId uuid.UUID) web.PostResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    post, err := service.PostRepository.FindById(ctx, tx, postId)
    if err != nil {
        panic(exception.NewNotFoundError("Post not found"))
    }

    // Pastikan informasi user diambil dengan benar
    if post.User == nil || post.User.Id == uuid.Nil {
        user, err := service.UserRepository.FindById(ctx, tx, post.UserId)
        if err == nil {
            post.User = &user
        }
    }

    // Check if the current user has liked this post
    post.IsLiked = service.PostRepository.IsLiked(ctx, tx, postId, currentUserId)
    post.CommentsCount, _ = service.CommentRepository.CountByPostId(ctx, tx, postId)
    post.LikesCount = service.PostRepository.GetLikesCount(ctx, tx, postId)

    // Set connection status
    if post.User != nil && post.UserId != currentUserId {
        post.User.IsConnected = service.ConnectionRepository.IsConnected(ctx, tx, currentUserId, post.UserId)
    } else if post.User != nil && post.UserId == currentUserId {
        post.User.IsConnected = false
    }

    // Ambil informasi grup jika post berada dalam grup
    if post.GroupId != nil {
        group, err := service.GroupRepository.FindById(ctx, tx, *post.GroupId)
        if err == nil {
            post.Group = &group
        }
    }

    return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) FindAll(ctx context.Context, limit, offset int, currentUserId uuid.UUID) []web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Ambil semua post
	posts := service.PostRepository.FindAll(ctx, tx, currentUserId, limit, offset)

	// Ambil ID user yang sedang login
	currentUserIdStr, ok := ctx.Value("user_id").(string)
	if ok {
		currentUserId, _ = uuid.Parse(currentUserIdStr)
	}

	// Check which posts the current user has liked and set connection status
	var postResponses []web.PostResponse
	for _, post := range posts {
		post.IsLiked = service.PostRepository.IsLiked(ctx, tx, post.Id, currentUserId)
		post.CommentsCount, _ = service.CommentRepository.CountByPostId(ctx, tx, post.Id)
		post.LikesCount = service.PostRepository.GetLikesCount(ctx, tx, post.Id)

		// Perbaikan: Gunakan IsConnected alih-alih CheckConnectionExists
		// dan pastikan parameter diberikan dengan benar
		if post.User != nil && post.UserId != currentUserId {
			post.User.IsConnected = service.ConnectionRepository.IsConnected(ctx, tx, currentUserId, post.UserId)
		} else if post.User != nil && post.UserId == currentUserId {
			// Jika post dibuat oleh user yang sedang login, set IsConnected ke false
			post.User.IsConnected = false
		}

		if post.GroupId != nil {
			group, err := service.GroupRepository.FindById(ctx, tx, *post.GroupId)
			if err == nil {
				post.Group = &group
			}
		}
		postResponses = append(postResponses, helper.ToPostResponse(post))
	}

	return postResponses
}

func (service *PostServiceImpl) FindByUserId(ctx context.Context, targetUserId uuid.UUID, limit, offset int, currentUserId uuid.UUID) []web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	posts := service.PostRepository.FindByUserId(ctx, tx, targetUserId, currentUserId, limit, offset)

	// Check which posts the current user has liked
	var postResponses []web.PostResponse
	for _, post := range posts {
		post.IsLiked = service.PostRepository.IsLiked(ctx, tx, post.Id, currentUserId)
		post.CommentsCount, _ = service.CommentRepository.CountByPostId(ctx, tx, post.Id)
		post.LikesCount = service.PostRepository.GetLikesCount(ctx, tx, post.Id)

		// Perbaikan: Gunakan IsConnected alih-alih CheckConnectionExists
		// dan pastikan parameter diberikan dengan benar
		if post.User != nil && post.UserId != currentUserId {
			post.User.IsConnected = service.ConnectionRepository.IsConnected(ctx, tx, currentUserId, post.UserId)
		} else if post.User != nil && post.UserId == currentUserId {
			// Jika post dibuat oleh user yang sedang login, set IsConnected ke false
			post.User.IsConnected = false
		}

		postResponses = append(postResponses, helper.ToPostResponse(post))
	}

	return postResponses
}

func (service *PostServiceImpl) LikePost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find post
	post, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Like the post (the repository will check if already liked)
	err = service.PostRepository.LikePost(ctx, tx, postId, userId)
	if err != nil {
		// It's okay if post is already liked
		if err.Error() != "post already liked" {
			helper.PanicIfError(err)
		}
	}

	// Kirim notifikasi ke pemilik post jika bukan diri sendiri
	if post.UserId != userId && service.NotificationService != nil {
		// Ambil data user terlebih dahulu
		user, err := service.UserRepository.FindById(ctx, tx, userId)
		if err == nil {
			// Simpan data yang diperlukan
			userName := user.Name
			postOwnerId := post.UserId

			go func() {
				refType := "post_like"
				service.NotificationService.Create(
					context.Background(),
					postOwnerId,
					string(domain.NotificationCategoryPost),
					string(domain.NotificationTypePostLike),
					"Post Like",
					fmt.Sprintf("%s liked your post", userName),
					&postId,
					&refType,
					&userId,
				)
			}()
		}
	}

	// Re-fetch post with updated like count
	post, err = service.PostRepository.FindById(ctx, tx, postId)
	helper.PanicIfError(err)

	post.IsLiked = true

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) UnlikePost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find post
	post, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Unlike the post
	err = service.PostRepository.UnlikePost(ctx, tx, postId, userId)
	if err != nil {
		// It's okay if post is not liked yet
		if err.Error() != "post not liked yet" {
			helper.PanicIfError(err)
		}
	}

	// Re-fetch post with updated like count
	post, err = service.PostRepository.FindById(ctx, tx, postId)
	helper.PanicIfError(err)

	post.IsLiked = false

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) CreateGroupPost(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, request web.CreatePostRequest, files []*multipart.FileHeader) web.PostResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	if err != nil {
		panic(exception.NewInternalServerError("Failed to begin transaction: " + err.Error()))
	}
	defer helper.CommitOrRollback(tx)

	// Verify user is a member of the group with simple query
	memberSQL := `SELECT group_id, role, is_active FROM group_members WHERE group_id = $1 AND user_id = $2`
	var memberGroupId uuid.UUID
	var role string
	var isActive bool

	err = tx.QueryRowContext(ctx, memberSQL, groupId, userId).Scan(&memberGroupId, &role, &isActive)
	if err != nil || !isActive {
		panic(exception.NewForbiddenError("You are not a member of this group"))
	}

	// Check group exists with simple query
	groupSQL := `SELECT id, name, description, privacy_level, creator_id, post_approval
                FROM groups
                WHERE id = $1`

	var group domain.Group
	err = tx.QueryRowContext(ctx, groupSQL, groupId).Scan(
		&group.Id,
		&group.Name,
		&group.Description,
		&group.PrivacyLevel,
		&group.CreatorId,
		&group.PostApproval,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			panic(exception.NewNotFoundError("Group not found"))
		}
		panic(exception.NewInternalServerError("Failed to get group info: " + err.Error()))
	}

	fmt.Printf("DEBUG: Group %s has post_approval: %v\n", group.Id, group.PostApproval)

	// Process uploads
	var imagePaths []string
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		helper.PanicIfError(err)
		result, err := helper.UploadImage(file, fileHeader, helper.DirPosts, userId.String(), "images")
		file.Close()
		helper.PanicIfError(err)
		imagePaths = append(imagePaths, result.RelativePath)
	}

	// Check if post approval is enabled and user is not admin/moderator/creator
	isAdmin := (role == "admin" || role == "moderator" || group.CreatorId == userId)
	fmt.Printf("DEBUG: User %s is admin/moderator/creator: %v\n", userId, isAdmin)

	// Create post
	postId := uuid.New()
	var postStatus string

	// Set status based on group post approval setting and user role
	if group.PostApproval && !isAdmin {
		postStatus = "pending"
		fmt.Printf("DEBUG: Post requires approval. Setting status to pending.\n")
	} else {
		postStatus = "approved"
	}

	postSQL := `INSERT INTO posts(id, user_id, content, images, visibility, group_id, created_at, updated_at, status)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id`

	imagesJSON, err := json.Marshal(imagePaths)
	helper.PanicIfError(err)

	now := time.Now()

	_, err = tx.ExecContext(ctx, postSQL,
		postId,
		userId,
		request.Content,
		imagesJSON,
		"group",
		groupId,
		now,
		now,
		postStatus,
	)
	helper.PanicIfError(err)

	fmt.Printf("DEBUG: Post saved with ID: %s and GroupId: %s with status: %s\n", postId, groupId, postStatus)

	// Get the created post
	post := domain.Post{
		Id:         postId,
		UserId:     userId,
		Content:    request.Content,
		Images:     imagePaths,
		Visibility: "group",
		GroupId:    &groupId,
		CreatedAt:  now,
		UpdatedAt:  now,
		Status:     postStatus,
	}

	// Get user info
	userSQL := `SELECT id, name, email, username, COALESCE(photo, ''), COALESCE(headline, '')
                FROM users
                WHERE id = $1`

	var user domain.User
	err = tx.QueryRowContext(ctx, userSQL, userId).Scan(
		&user.Id,
		&user.Name,
		&user.Email,
		&user.Username,
		&user.Photo,
		&user.Headline,
	)

	if err == nil {
		post.User = &user
	}

	post.Group = &group

	// Kirim notifikasi ke anggota grup jika post disetujui (approved)
	if postStatus == "approved" && service.NotificationService != nil {
		// Ambil data yang diperlukan sebelum goroutine
		userName := user.Name
		groupName := group.Name
		postId := post.Id

		// Ambil anggota grup terlebih dahulu
		membersSQL := `SELECT user_id FROM group_members WHERE group_id = $1 AND is_active = true`
		memberRows, err := tx.QueryContext(ctx, membersSQL, groupId)
		if err != nil {
			fmt.Printf("ERROR: Failed to get group members: %v\n", err)
		} else {
			defer memberRows.Close()

			var memberIds []uuid.UUID
			for memberRows.Next() {
				var memberId uuid.UUID
				if err := memberRows.Scan(&memberId); err == nil && memberId != userId {
					memberIds = append(memberIds, memberId)
				}
			}

			// Debug: cetak jumlah anggota grup
			fmt.Printf("Sending notifications to %d group members for post %s\n", len(memberIds), post.Id)

			// Salin data untuk goroutine
			finalMemberIds := memberIds

			go func() {
				// Gunakan context baru untuk goroutine
				newCtx := context.Background()
				newTx, err := service.DB.Begin()
				if err != nil {
					fmt.Printf("Error creating transaction in goroutine: %v\n", err)
					return
				}
				defer newTx.Commit() // Commit transaction di goroutine

				for _, memberId := range finalMemberIds {
					refType := "group_post"
					service.NotificationService.Create(
						newCtx,
						memberId,
						string(domain.NotificationCategoryGroup),
						"group_post_new",
						"New Group Post",
						fmt.Sprintf("%s posted in %s", userName, groupName),
						&postId,
						&refType,
						&userId,
					)
				}
			}()
		}
	}

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) FindByGroupId(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, limit, offset int) []web.PostResponse {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("ERROR: Failed to begin transaction: %v\n", err)
		return []web.PostResponse{}
	}
	defer helper.CommitOrRollback(tx)

	fmt.Printf("DEBUG: Finding posts for group %s by user %s\n", groupId, userId)

	// Check if group exists
	groupSQL := `SELECT id, name, description, privacy_level, creator_id, post_approval
                FROM groups
                WHERE id = $1`

	var group domain.Group
	err = tx.QueryRowContext(ctx, groupSQL, groupId).Scan(
		&group.Id,
		&group.Name,
		&group.Description,
		&group.PrivacyLevel,
		&group.CreatorId,
		&group.PostApproval,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			panic(exception.NewNotFoundError("Group not found"))
		}
		fmt.Printf("ERROR: Failed to get group info: %v\n", err)
		return []web.PostResponse{}
	}

	fmt.Printf("DEBUG: Group %s found with privacy_level: %s, post_approval: %v\n",
		group.Id, group.PrivacyLevel, group.PostApproval)

	// For private groups, verify the user is a member
	if group.PrivacyLevel == "private" {
		memberSQL := `SELECT COUNT(*) FROM group_members 
                    WHERE group_id = $1 AND user_id = $2 AND is_active = true`
		var count int
		err = tx.QueryRowContext(ctx, memberSQL, groupId, userId).Scan(&count)
		if err != nil || count == 0 {
			panic(exception.NewForbiddenError("You don't have permission to view posts in this group"))
		}
	}

	// Check if user is admin/moderator/creator
	isAdmin := false
	memberRoleSQL := `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`
	var role string
	err = tx.QueryRowContext(ctx, memberRoleSQL, groupId, userId).Scan(&role)
	if err == nil && (role == "admin" || role == "moderator" || group.CreatorId == userId) {
		isAdmin = true
	}

	fmt.Printf("DEBUG: User %s is admin/moderator/creator: %v\n", userId, isAdmin)

	// Get posts for the group - only approved posts or user's own pending posts
	var postsSQL string
	var rows *sql.Rows

	// PERBAIKAN: Hanya tampilkan post dengan status 'approved'
	postsSQL = `SELECT p.id, p.user_id, p.content, p.images, p.visibility, p.created_at, p.updated_at, p.group_id, COALESCE(p.status, 'approved') as status
                FROM posts p
                WHERE p.group_id = $1 AND (p.status = 'approved' OR p.status IS NULL)
                ORDER BY p.created_at DESC
                LIMIT $2 OFFSET $3`

	fmt.Printf("DEBUG SQL: %s with params: %s, %d, %d\n", postsSQL, groupId, limit, offset)

	rows, err = tx.QueryContext(ctx, postsSQL, groupId, limit, offset)
	if err != nil {
		fmt.Printf("ERROR: Failed to query posts: %v\n", err)
		return []web.PostResponse{}
	}
	defer rows.Close()

	type PostWithStatus struct {
		domain.Post
		Status   string
		IsPinned bool
		PinnedAt *time.Time
	}

	var postsWithStatus []PostWithStatus
	for rows.Next() {
		var post PostWithStatus
		var imagesBytes []byte
		var groupIdPtr *uuid.UUID
		var status string

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&imagesBytes,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&groupIdPtr,
			&status,
		)
		if err != nil {
			fmt.Printf("ERROR: Failed to scan post: %v\n", err)
			continue
		}

		post.GroupId = groupIdPtr
		post.Status = status

		// Parse images JSON
		if imagesBytes != nil {
			err = json.Unmarshal(imagesBytes, &post.Images)
			if err != nil {
				fmt.Printf("ERROR: Failed to unmarshal images: %v\n", err)
				post.Images = []string{}
			}
		}

		postsWithStatus = append(postsWithStatus, post)
	}

	fmt.Printf("DEBUG: Found %d posts for group %s\n", len(postsWithStatus), groupId)

	// Get pinned posts information
	pinnedPostsSQL := `SELECT post_id, pinned_at FROM group_pinned_posts WHERE group_id = $1`
	pinnedRows, err := tx.QueryContext(ctx, pinnedPostsSQL, groupId)
	if err != nil {
		fmt.Printf("ERROR: Failed to query pinned posts: %v\n", err)
	} else {
		defer pinnedRows.Close()

		// Create a map of pinned posts
		pinnedPostsMap := make(map[uuid.UUID]time.Time)
		for pinnedRows.Next() {
			var postId uuid.UUID
			var pinnedAt time.Time
			if err := pinnedRows.Scan(&postId, &pinnedAt); err == nil {
				pinnedPostsMap[postId] = pinnedAt
			}
		}

		// Mark posts as pinned
		for i := range postsWithStatus {
			if pinnedAt, isPinned := pinnedPostsMap[postsWithStatus[i].Id]; isPinned {
				postsWithStatus[i].IsPinned = true
				postsWithStatus[i].PinnedAt = &pinnedAt
			}
		}
	}

	// Sort posts: pinned first, then regular by creation date
	sort.SliceStable(postsWithStatus, func(i, j int) bool {
		// If both are pinned or both are not pinned, sort by pinned time or created time
		if postsWithStatus[i].IsPinned == postsWithStatus[j].IsPinned {
			if postsWithStatus[i].IsPinned {
				// Both are pinned, sort by pinned time (newer first)
				return postsWithStatus[i].PinnedAt.After(*postsWithStatus[j].PinnedAt)
			}
			// Both are not pinned, sort by created time (newer first)
			return postsWithStatus[i].CreatedAt.After(postsWithStatus[j].CreatedAt)
		}
		// Pinned posts come first
		return postsWithStatus[i].IsPinned
	})

	// Filter and enrich posts
	var responses []web.PostResponse
	for _, post := range postsWithStatus {
		// Get user info
		var user domain.User
		userSQL := `SELECT id, name, email, username, COALESCE(photo, ''), COALESCE(headline, '')
                    FROM users WHERE id = $1`
		err = tx.QueryRowContext(ctx, userSQL, post.UserId).Scan(
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline,
		)
		if err != nil {
			fmt.Printf("ERROR: Failed to get user info: %v\n", err)
			continue
		}

		// Check if post is liked
		likeSQL := `SELECT COUNT(*) FROM post_likes WHERE post_id = $1 AND user_id = $2`
		var likeCount int
		err = tx.QueryRowContext(ctx, likeSQL, post.Id, userId).Scan(&likeCount)
		isLiked := err == nil && likeCount > 0

		// Get likes count
		likesCountSQL := `SELECT COUNT(*) FROM post_likes WHERE post_id = $1`
		var likesCount int
		err = tx.QueryRowContext(ctx, likesCountSQL, post.Id).Scan(&likesCount)
		if err != nil {
			likesCount = 0
		}

		// Get comments count
		commentsCountSQL := `SELECT COUNT(*) FROM comments WHERE post_id = $1`
		var commentsCount int
		err = tx.QueryRowContext(ctx, commentsCountSQL, post.Id).Scan(&commentsCount)
		if err != nil {
			commentsCount = 0
		}

		// Create response
		response := web.PostResponse{
			Id:            post.Id,
			UserId:        post.UserId,
			Content:       post.Content,
			Images:        post.Images,
			LikesCount:    likesCount,
			CommentsCount: commentsCount,
			Visibility:    post.Visibility,
			IsLiked:       isLiked,
			Status:        post.Status,
			IsPinned:      post.IsPinned,
			PinnedAt:      post.PinnedAt,
			User: web.UserShort{
				Id:       user.Id,
				Name:     user.Name,
				Username: user.Username,
			},
			GroupId:   post.GroupId,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
		}

		// Jika Photo dan Headline adalah pointer di UserShort
		if user.Photo != "" {
			photo := user.Photo
			response.User.Photo = &photo
		}

		if user.Headline != "" {
			headline := user.Headline
			response.User.Headline = &headline
		}

		// Tambahkan Group jika ada
		if group.Id != uuid.Nil {
			response.Group = &web.GroupResponse{
				Id:           group.Id,
				Name:         group.Name,
				Description:  group.Description,
				PrivacyLevel: group.PrivacyLevel,
			}

			if group.CreatorId != uuid.Nil {
				response.Group.CreatorId = group.CreatorId
			}
		}

		responses = append(responses, response)
	}

	fmt.Printf("DEBUG: Returning %d post responses\n", len(responses))
	return responses
}

func (service *PostServiceImpl) ApprovePost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	fmt.Printf("DEBUG: Approving post %s by user %s\n", postId, userId)

	// Get the post directly from database instead of using repository
	postSQL := `SELECT id, user_id, content, images, visibility, created_at, updated_at, group_id, COALESCE(status, 'pending') as status
				FROM posts
				WHERE id = $1`

	var post domain.Post
	var imagesBytes []byte
	var groupIdPtr *uuid.UUID
	var status string

	err = tx.QueryRowContext(ctx, postSQL, postId).Scan(
		&post.Id,
		&post.UserId,
		&post.Content,
		&imagesBytes,
		&post.Visibility,
		&post.CreatedAt,
		&post.UpdatedAt,
		&groupIdPtr,
		&status,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			panic(exception.NewNotFoundError("post not found"))
		}
		panic(exception.NewInternalServerError("Failed to get post: " + err.Error()))
	}

	post.GroupId = groupIdPtr
	post.Status = status

	// Parse images JSON
	if imagesBytes != nil {
		err = json.Unmarshal(imagesBytes, &post.Images)
		if err != nil {
			fmt.Printf("ERROR: Failed to unmarshal images: %v\n", err)
			post.Images = []string{}
		}
	}

	fmt.Printf("DEBUG: Found post with ID: %s, GroupId: %v, Status: %s\n", post.Id, post.GroupId, post.Status)

	// Check if post belongs to a group
	if post.GroupId == nil {
		panic(exception.NewBadRequestError("post is not a group post"))
	}

	// Check if post status is pending
	if post.Status != "pending" {
		panic(exception.NewBadRequestError("post is not pending approval"))
	}

	// Check if user has permission
	if !service.GroupService.IsGroupModeratorOrAdmin(ctx, *post.GroupId, userId) {
		panic(exception.NewForbiddenError("only group admins and moderators can approve posts"))
	}

	// Update post status
	updateSQL := `UPDATE posts SET status = 'approved' WHERE id = $1`
	_, err = tx.ExecContext(ctx, updateSQL, postId)
	helper.PanicIfError(err)

	fmt.Printf("DEBUG: Updated post status to approved\n")

	// Get updated post
	post, err = service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("post not found"))
	}

	// Get post author
	author, _ := service.UserRepository.FindById(ctx, tx, post.UserId)
	post.User = &author

	// Get group info for notification before closing transaction
	var groupName string = "the group"
	if post.GroupId != nil {
		groupSQL := `SELECT name FROM groups WHERE id = $1`
		err = tx.QueryRowContext(ctx, groupSQL, *post.GroupId).Scan(&groupName)
		if err != nil {
			fmt.Printf("WARNING: Failed to get group name: %v\n", err)
		}
	}

	// Store necessary data for notification
	postAuthorId := post.UserId
	postId = post.Id

	// Notify post author after transaction is committed
	if service.NotificationService != nil {
		go func(postAuthorId uuid.UUID, postId uuid.UUID, groupName string, userId uuid.UUID) {
			refType := "group_post_approved"
			service.NotificationService.Create(
				context.Background(),
				postAuthorId,
				string(domain.NotificationCategoryGroup),
				"group_post_approved",
				"Post Approved",
				fmt.Sprintf("Your post in %s has been approved", groupName),
				&postId,
				&refType,
				&userId,
			)
		}(postAuthorId, postId, groupName, userId)
	}

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) RejectPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	fmt.Printf("DEBUG: Rejecting post %s by user %s\n", postId, userId)

	// Get the post directly from database instead of using repository
	postSQL := `SELECT id, user_id, content, images, visibility, created_at, updated_at, group_id, COALESCE(status, 'pending') as status
				FROM posts
				WHERE id = $1`

	var post domain.Post
	var imagesBytes []byte
	var groupIdPtr *uuid.UUID
	var status string

	err = tx.QueryRowContext(ctx, postSQL, postId).Scan(
		&post.Id,
		&post.UserId,
		&post.Content,
		&imagesBytes,
		&post.Visibility,
		&post.CreatedAt,
		&post.UpdatedAt,
		&groupIdPtr,
		&status,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			panic(exception.NewNotFoundError("post not found"))
		}
		panic(exception.NewInternalServerError("Failed to get post: " + err.Error()))
	}

	post.GroupId = groupIdPtr
	post.Status = status

	// Parse images JSON
	if imagesBytes != nil {
		err = json.Unmarshal(imagesBytes, &post.Images)
		if err != nil {
			fmt.Printf("ERROR: Failed to unmarshal images: %v\n", err)
			post.Images = []string{}
		}
	}

	fmt.Printf("DEBUG: Found post with ID: %s, GroupId: %v, Status: %s\n", post.Id, post.GroupId, post.Status)

	// Check if post belongs to a group
	if post.GroupId == nil {
		panic(exception.NewBadRequestError("post is not a group post"))
	}

	// Check if post status is pending
	if post.Status != "pending" {
		panic(exception.NewBadRequestError("post is not pending approval"))
	}

	// Check if user has permission
	if !service.GroupService.IsGroupModeratorOrAdmin(ctx, *post.GroupId, userId) {
		panic(exception.NewForbiddenError("only group admins and moderators can reject posts"))
	}

	// Get group info for notification before closing transaction
	var groupName string = "the group"
	if post.GroupId != nil {
		groupSQL := `SELECT name FROM groups WHERE id = $1`
		err = tx.QueryRowContext(ctx, groupSQL, *post.GroupId).Scan(&groupName)
		if err != nil {
			fmt.Printf("WARNING: Failed to get group name: %v\n", err)
		}
	}

	// Store necessary data for notification
	postAuthorId := post.UserId

	// Delete post images if any
	for _, imagePath := range post.Images {
		err := helper.DeleteFile(imagePath)
		if err != nil {
			fmt.Printf("WARNING: Failed to delete image %s: %v\n", imagePath, err)
		} else {
			fmt.Printf("DEBUG: Deleted image: %s\n", imagePath)
		}
	}

	// Delete post likes
	deleteLikesSQL := `DELETE FROM post_likes WHERE post_id = $1`
	_, err = tx.ExecContext(ctx, deleteLikesSQL, postId)
	if err != nil {
		fmt.Printf("WARNING: Failed to delete post likes: %v\n", err)
	} else {
		fmt.Printf("DEBUG: Deleted likes for post %s\n", postId)
	}

	// Delete post comments
	deleteCommentsSQL := `DELETE FROM comments WHERE post_id = $1`
	_, err = tx.ExecContext(ctx, deleteCommentsSQL, postId)
	if err != nil {
		fmt.Printf("WARNING: Failed to delete post comments: %v\n", err)
	} else {
		fmt.Printf("DEBUG: Deleted comments for post %s\n", postId)
	}

	// Delete the post
	deletePostSQL := `DELETE FROM posts WHERE id = $1`
	_, err = tx.ExecContext(ctx, deletePostSQL, postId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to delete post: " + err.Error()))
	}
	fmt.Printf("DEBUG: Deleted post %s\n", postId)

	// Notify post author after transaction is committed
	if service.NotificationService != nil {
		go func(postAuthorId uuid.UUID, postId uuid.UUID, groupName string, userId uuid.UUID) {
			refType := "group_post_rejected"
			service.NotificationService.Create(
				context.Background(),
				postAuthorId,
				string(domain.NotificationCategoryGroup),
				"group_post_rejected",
				"Post Rejected",
				fmt.Sprintf("Your post in %s has been rejected", groupName),
				nil, // Post ID is now nil since post is deleted
				&refType,
				&userId,
			)
		}(postAuthorId, postId, groupName, userId)
	}
}

func (service *PostServiceImpl) FindPendingPostsByGroupId(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, limit, offset int) []web.PendingPostResponse {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("ERROR: Failed to begin transaction: %v\n", err)
		return []web.PendingPostResponse{}
	}
	defer helper.CommitOrRollback(tx)

	fmt.Printf("DEBUG: Finding pending posts for group %s by user %s\n", groupId, userId)

	// Check if user has permission to view pending posts
	isAdmin := false
	if service.GroupService != nil {
		isAdmin = service.GroupService.IsGroupModeratorOrAdmin(ctx, groupId, userId)
	} else {
		// Fallback if GroupService is nil
		group, err := service.GroupRepository.FindById(ctx, tx, groupId)
		if err == nil {
			member := service.GroupMemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
			isAdmin = (group.CreatorId == userId) || (member.Role == "admin" || member.Role == "moderator")
		}
	}

	fmt.Printf("DEBUG: User is admin/moderator: %v\n", isAdmin)

	if !isAdmin {
		fmt.Printf("DEBUG: User is not admin/moderator, returning empty list\n")
		return []web.PendingPostResponse{} // Return empty list instead of panic
	}

	// Verify if status column exists in posts table
	var hasStatusColumn bool
	checkColumnSQL := `SELECT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name = 'posts' AND column_name = 'status'
	)`
	err = tx.QueryRowContext(ctx, checkColumnSQL).Scan(&hasStatusColumn)
	if err != nil {
		fmt.Printf("ERROR: Failed to check if status column exists: %v\n", err)
		return []web.PendingPostResponse{}
	}

	// Query posts with status = 'pending'
	var SQL string
	if hasStatusColumn {
		SQL = `SELECT p.id, p.user_id, p.content, p.images, p.visibility, p.created_at, p.updated_at, p.group_id, p.status
				FROM posts p
				WHERE p.group_id = $1 AND p.status = 'pending'
				ORDER BY p.created_at DESC
				LIMIT $2 OFFSET $3`
	} else {
		// Fallback if status column doesn't exist yet
		fmt.Printf("WARNING: Status column doesn't exist in posts table\n")
		return []web.PendingPostResponse{}
	}

	fmt.Printf("DEBUG: Executing SQL: %s with groupId: %s, limit: %d, offset: %d\n", SQL, groupId, limit, offset)

	rows, err := tx.QueryContext(ctx, SQL, groupId, limit, offset)
	if err != nil {
		fmt.Printf("ERROR: Failed to query pending posts: %v\n", err)
		return []web.PendingPostResponse{}
	}
	defer rows.Close()

	var pendingPosts []web.PendingPostResponse
	for rows.Next() {
		post := domain.Post{}
		var imagesBytes []byte
		var groupIdPtr *uuid.UUID
		var status string

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&imagesBytes,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&groupIdPtr,
			&status,
		)
		if err != nil {
			fmt.Printf("ERROR: Failed to scan post: %v\n", err)
			continue
		}

		post.GroupId = groupIdPtr
		post.Status = status

		// Parse images JSON
		if imagesBytes != nil {
			err = json.Unmarshal(imagesBytes, &post.Images)
			if err != nil {
				fmt.Printf("ERROR: Failed to unmarshal images: %v\n", err)
				post.Images = []string{}
			}
		}

		// Get user info in a separate transaction to avoid connection issues
		userTx, err := service.DB.Begin()
		if err != nil {
			fmt.Printf("ERROR: Failed to begin user transaction: %v\n", err)
			continue
		}

		var user domain.User
		userSQL := `SELECT id, name, email, username, COALESCE(photo, ''), COALESCE(headline, '')
					FROM users WHERE id = $1`
		err = userTx.QueryRowContext(ctx, userSQL, post.UserId).Scan(
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline,
		)

		if err != nil {
			fmt.Printf("ERROR: Failed to get user info: %v\n", err)
			userTx.Rollback()
			continue
		}
		userTx.Commit()

		post.User = &user

		// Create post response
		postResponse := web.PostResponse{
			Id:            post.Id,
			UserId:        post.UserId,
			Content:       post.Content,
			Images:        post.Images,
			LikesCount:    0, // Simplified for now
			CommentsCount: 0, // Simplified for now
			Visibility:    post.Visibility,
			IsLiked:       false, // Simplified for now
			Status:        post.Status,
			User: web.UserShort{
				Id:       user.Id,
				Name:     user.Name,
				Username: user.Username,
			},
			GroupId:   post.GroupId,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
		}

		// Jika Photo dan Headline adalah pointer di UserShort
		if user.Photo != "" {
			photo := user.Photo
			postResponse.User.Photo = &photo
		}

		if user.Headline != "" {
			headline := user.Headline
			postResponse.User.Headline = &headline
		}

		// Create pending post response
		pendingResponse := web.PendingPostResponse{
			Id:        post.Id, // Gunakan ID post sebagai ID pending post
			PostId:    post.Id,
			GroupId:   *post.GroupId,
			Status:    post.Status,
			Post:      postResponse,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
		}

		pendingPosts = append(pendingPosts, pendingResponse)
	}

	fmt.Printf("DEBUG: Returning %d pending post responses\n", len(pendingPosts))
	return pendingPosts
}

func (service *PostServiceImpl) PinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Cari post
	post, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("Post not found"))
	}

	// Periksa apakah post berada dalam grup
	if post.GroupId == nil {
		panic(exception.NewBadRequestError("This post is not in a group"))
	}

	// Periksa apakah user adalah admin/moderator/creator grup
	member := service.GroupMemberRepository.FindByGroupIdAndUserId(ctx, tx, *post.GroupId, userId)
	if member.GroupId == uuid.Nil {
		panic(exception.NewForbiddenError("You are not a member of this group"))
	}

	if member.Role != "admin" && member.Role != "creator" && member.Role != "moderator" {
		panic(exception.NewForbiddenError("Only admin, creator, or moderator can pin posts"))
	}

	// Periksa jumlah post yang sudah di-pin
	pinnedCount, err := service.PostRepository.CountPinnedPostsByGroupId(ctx, tx, *post.GroupId)
	helper.PanicIfError(err)

	if pinnedCount >= 3 {
		panic(exception.NewBadRequestError("Maximum number of pinned posts (3) has been reached"))
	}

	// Pin post
	updatedPost, err := service.PostRepository.PinPost(ctx, tx, postId)
	helper.PanicIfError(err)

	// Ambil informasi user
	user, err := service.UserRepository.FindById(ctx, tx, updatedPost.UserId)
	if err == nil {
		updatedPost.User = &user
	}

	// Ambil informasi grup
	if updatedPost.GroupId != nil {
		group, err := service.GroupRepository.FindById(ctx, tx, *updatedPost.GroupId)
		if err == nil {
			updatedPost.Group = &group
		}
	}

	return helper.ToPostResponse(updatedPost)
}

func (service *PostServiceImpl) UnpinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Cari post
	post, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("Post not found"))
	}

	// Periksa apakah post berada dalam grup
	if post.GroupId == nil {
		panic(exception.NewBadRequestError("This post is not in a group"))
	}

	// Periksa apakah user adalah admin/moderator/creator grup
	member := service.GroupMemberRepository.FindByGroupIdAndUserId(ctx, tx, *post.GroupId, userId)
	if member.GroupId == uuid.Nil {
		panic(exception.NewForbiddenError("You are not a member of this group"))
	}

	if member.Role != "admin" && member.Role != "creator" && member.Role != "moderator" {
		panic(exception.NewForbiddenError("Only admin, creator, or moderator can unpin posts"))
	}

	// Unpin post
	err = service.PostRepository.UnpinPost(ctx, tx, postId)
	helper.PanicIfError(err)

	// Ambil post yang sudah diupdate
	updatedPost, err := service.PostRepository.FindById(ctx, tx, postId)
	helper.PanicIfError(err)

	// Ambil informasi user
	user, err := service.UserRepository.FindById(ctx, tx, updatedPost.UserId)
	if err == nil {
		updatedPost.User = &user
	}

	// Ambil informasi grup
	if updatedPost.GroupId != nil {
		group, err := service.GroupRepository.FindById(ctx, tx, *updatedPost.GroupId)
		if err == nil {
			updatedPost.Group = &group
		}
	}

	return helper.ToPostResponse(updatedPost)
}

func (service *PostServiceImpl) FindPendingPostsByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) []web.PendingPostResponse {
	// Gunakan koneksi baru untuk menghindari masalah koneksi
	db := service.DB

	// Query sederhana untuk mendapatkan post milik user dengan group_id tidak null
	SQL := `SELECT id, user_id, content, visibility, created_at, updated_at, group_id, status
            FROM posts 
            WHERE user_id = $1 AND group_id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3`

	rows, err := db.QueryContext(ctx, SQL, userId, limit, offset)
	if err != nil {
		fmt.Printf("ERROR: Failed to query posts: %v\n", err)
		return []web.PendingPostResponse{}
	}
	defer rows.Close()

	var pendingPosts []web.PendingPostResponse
	for rows.Next() {
		var post domain.Post
		var groupIdPtr *uuid.UUID
		var statusNull sql.NullString

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&groupIdPtr,
			&statusNull,
		)

		if err != nil {
			fmt.Printf("ERROR: Failed to scan post: %v\n", err)
			continue
		}

		post.GroupId = groupIdPtr
		if statusNull.Valid {
			post.Status = statusNull.String
		}

		// Ambil informasi user
		userSQL := `SELECT id, name, username, COALESCE(photo, ''), COALESCE(headline, '')
                    FROM users WHERE id = $1`
		var user domain.User
		err = db.QueryRowContext(ctx, userSQL, post.UserId).Scan(
			&user.Id,
			&user.Name,
			&user.Username,
			&user.Photo,
			&user.Headline,
		)
		if err == nil {
			post.User = &user
		}

		// Ambil informasi grup
		var group domain.Group
		if post.GroupId != nil {
			groupSQL := `SELECT id, name, description, rule, COALESCE(image, '') as image, 
                        privacy_level, invite_policy, post_approval, creator_id, created_at, updated_at
                        FROM groups WHERE id = $1`
			err = db.QueryRowContext(ctx, groupSQL, *post.GroupId).Scan(
				&group.Id,
				&group.Name,
				&group.Description,
				&group.Rule,
				&group.Image,
				&group.PrivacyLevel,
				&group.InvitePolicy,
				&group.PostApproval,
				&group.CreatorId,
				&group.CreatedAt,
				&group.UpdatedAt,
			)
			if err == nil {
				post.Group = &group
			}
		}

		// Buat response sederhana
		pendingResponse := web.PendingPostResponse{
			Id:        post.Id,
			PostId:    post.Id,
			GroupId:   *post.GroupId,
			Status:    post.Status,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
		}

		// Tambahkan post info dengan user dan group
		postResponse := web.PostResponse{
			Id:         post.Id,
			UserId:     post.UserId,
			Content:    post.Content,
			Visibility: post.Visibility,
			Status:     post.Status,
			GroupId:    post.GroupId,
			CreatedAt:  post.CreatedAt,
			UpdatedAt:  post.UpdatedAt,
		}

		// Tambahkan user info
		if post.User != nil {
			postResponse.User = web.UserShort{
				Id:       post.User.Id,
				Name:     post.User.Name,
				Username: post.User.Username,
			}

			if post.User.Photo != "" {
				photo := post.User.Photo
				postResponse.User.Photo = &photo
			}

			if post.User.Headline != "" {
				headline := post.User.Headline
				postResponse.User.Headline = &headline
			}
		}

		// Tambahkan group info
		if post.Group != nil {
			// Buat struct baru yang hanya berisi field yang kita inginkan
			postResponse.Group = &web.GroupResponse{
				Id:           post.Group.Id,
				Name:         post.Group.Name,
				Description:  post.Group.Description,
				Rule:         post.Group.Rule,
				PrivacyLevel: post.Group.PrivacyLevel,
				InvitePolicy: post.Group.InvitePolicy,
				PostApproval: post.Group.PostApproval,
				CreatorId:    post.Group.CreatorId,
			}

			if post.Group.Image != nil && *post.Group.Image != "" {
				postResponse.Group.Image = post.Group.Image // Langsung gunakan pointer yang sudah ada
			}
		}

		pendingResponse.Post = postResponse
		pendingPosts = append(pendingPosts, pendingResponse)
	}

	return pendingPosts
}

func (service *PostServiceImpl) FindPendingPostsByUserIdAndGroupId(ctx context.Context, userId uuid.UUID, groupId uuid.UUID, limit, offset int) []web.PendingPostResponse {
    // Gunakan koneksi baru untuk menghindari masalah koneksi
    db := service.DB

    // Query untuk mendapatkan post milik user di grup tertentu
    SQL := `SELECT id, user_id, content, visibility, created_at, updated_at, group_id, status
            FROM posts 
            WHERE user_id = $1 AND group_id = $2
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4`

    rows, err := db.QueryContext(ctx, SQL, userId, groupId, limit, offset)
    if err != nil {
        fmt.Printf("ERROR: Failed to query posts: %v\n", err)
        return []web.PendingPostResponse{}
    }
    defer rows.Close()

    var pendingPosts []web.PendingPostResponse
    for rows.Next() {
        var post domain.Post
        var groupIdPtr *uuid.UUID
        var statusNull sql.NullString

        err := rows.Scan(
            &post.Id,
            &post.UserId,
            &post.Content,
            &post.Visibility,
            &post.CreatedAt,
            &post.UpdatedAt,
            &groupIdPtr,
            &statusNull,
        )

        if err != nil {
            fmt.Printf("ERROR: Failed to scan post: %v\n", err)
            continue
        }

        post.GroupId = groupIdPtr
        if statusNull.Valid {
            post.Status = statusNull.String
        }

        // Ambil informasi user
        userSQL := `SELECT id, name, username, COALESCE(photo, ''), COALESCE(headline, '')
                    FROM users WHERE id = $1`
        var user domain.User
        err = db.QueryRowContext(ctx, userSQL, post.UserId).Scan(
            &user.Id,
            &user.Name,
            &user.Username,
            &user.Photo,
            &user.Headline,
        )
        if err == nil {
            post.User = &user
        }

        // Ambil informasi grup
        var group domain.Group
        if post.GroupId != nil {
            groupSQL := `SELECT id, name, description, rule, COALESCE(image, '') as image, 
                        privacy_level, invite_policy, post_approval, creator_id
                        FROM groups WHERE id = $1`
            err = db.QueryRowContext(ctx, groupSQL, *post.GroupId).Scan(
                &group.Id,
                &group.Name,
                &group.Description,
                &group.Rule,
                &group.Image,
                &group.PrivacyLevel,
                &group.InvitePolicy,
                &group.PostApproval,
                &group.CreatorId,
            )
            if err == nil {
                post.Group = &group
            }
        }

        // Buat response sederhana
        pendingResponse := web.PendingPostResponse{
            Id:        post.Id,
            PostId:    post.Id,
            GroupId:   *post.GroupId,
            Status:    post.Status,
            CreatedAt: post.CreatedAt,
            UpdatedAt: post.UpdatedAt,
        }

        // Tambahkan post info dengan user dan group
        postResponse := web.PostResponse{
            Id:         post.Id,
            UserId:     post.UserId,
            Content:    post.Content,
            Visibility: post.Visibility,
            Status:     post.Status,
            GroupId:    post.GroupId,
            CreatedAt:  post.CreatedAt,
            UpdatedAt:  post.UpdatedAt,
        }

        // Tambahkan user info
        if post.User != nil {
            postResponse.User = web.UserShort{
                Id:       post.User.Id,
                Name:     post.User.Name,
                Username: post.User.Username,
            }

            if post.User.Photo != "" {
                photo := post.User.Photo
                postResponse.User.Photo = &photo
            }

            if post.User.Headline != "" {
                headline := post.User.Headline
                postResponse.User.Headline = &headline
            }
        }

        // Tambahkan group info
        if post.Group != nil {
            // Buat struct baru yang hanya berisi field yang kita inginkan
            postResponse.Group = &web.GroupResponse{
                Id:           post.Group.Id,
                Name:         post.Group.Name,
                Description:  post.Group.Description,
                Rule:         post.Group.Rule,
                PrivacyLevel: post.Group.PrivacyLevel,
                InvitePolicy: post.Group.InvitePolicy,
                PostApproval: post.Group.PostApproval,
                CreatorId:    post.Group.CreatorId,
            }

			if post.Group.Image != nil && *post.Group.Image != "" {
				postResponse.Group.Image = post.Group.Image // Langsung gunakan pointer yang sudah ada
			}
		}

        pendingResponse.Post = postResponse
        pendingPosts = append(pendingPosts, pendingResponse)
    }

    return pendingPosts
}
