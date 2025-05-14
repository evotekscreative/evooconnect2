package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type PostServiceImpl struct {
	UserRepository        repository.UserRepository
	PostRepository        repository.PostRepository
	ConnectionRepository  repository.ConnectionRepository
	GroupRepository       repository.GroupRepository
	GroupMemberRepository repository.GroupMemberRepository
	DB                    *sql.DB
	Validate              *validator.Validate
}

func NewPostService(
	userRepository repository.UserRepository,
	postRepository repository.PostRepository,
	connectionRepository repository.ConnectionRepository,
	groupRepository repository.GroupRepository,
	groupMemberRepository repository.GroupMemberRepository,
	db *sql.DB, validate *validator.Validate) PostService {
	return &PostServiceImpl{
		UserRepository:        userRepository,
		PostRepository:        postRepository,
		ConnectionRepository:  connectionRepository,
		GroupRepository:       groupRepository,
		GroupMemberRepository: groupMemberRepository,
		DB:                    db,
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

	// fmt.Println("start create post")
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

	// Check if the current user has liked this post
	post.IsLiked = service.PostRepository.IsLiked(ctx, tx, postId, currentUserId)
	post.User.IsConnected = service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, post.UserId)

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) FindAll(ctx context.Context, limit, offset int, currentUserId uuid.UUID) []web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Error 1: Fungsi FindAll hanya mengembalikan 1 nilai, bukan 2
	posts := service.PostRepository.FindAll(ctx, tx, currentUserId, limit, offset)

	// Ambil ID user yang sedang login
	currentUserIdStr, ok := ctx.Value("user_id").(string)
	if ok {
		currentUserId, _ = uuid.Parse(currentUserIdStr)
		// if err == nil {
		// 	// Cek koneksi untuk setiap post
		// 	for i := range posts {
		// 		if posts[i].User != nil && posts[i].UserId != currentUserId {
		// 			posts[i].User.IsConnected = service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, posts[i].UserId)
		// 		}
		// 	}
		// }
	}
	// Check which posts the current user has liked
	var postResponses []web.PostResponse
	for _, post := range posts {
		post.IsLiked = service.PostRepository.IsLiked(ctx, tx, post.Id, currentUserId)
		post.User.IsConnected = service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, post.UserId)
		// fmt.Println("connected: ", post.User.IsConnected, "postId: ", post.Id, "userId: ", post.UserId, "currentUserId: ", currentUserId)
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
		post.User.IsConnected = service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, post.UserId)
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
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Verify user is a member of the group
	member := service.GroupMemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
	if member.GroupId == uuid.Nil || !member.IsActive {
		panic(exception.NewForbiddenError("You are not a member of this group"))
	}

	// Check group exists and get its privacy level
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("Group not found"))
	}

	// Using the group's privacy setting for the post visibility
	visibility := group.PrivacyLevel

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

	post := domain.Post{
		UserId:     userId,
		Content:    request.Content,
		Images:     imagePaths,
		Visibility: visibility,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
		GroupId:    &groupId,
	}

	post = service.PostRepository.CreatePostGroup(ctx, tx, post, groupId)

	// Add user and group data to response
	user, _ := service.UserRepository.FindById(ctx, tx, userId)
	post.User = &user
	post.Group = &group

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) FindByGroupId(ctx context.Context, groupId uuid.UUID, userId uuid.UUID, limit, offset int) []web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if group exists
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("Group not found"))
	}

	// For private groups, verify the user is a member
	if group.PrivacyLevel == "private" {
		member := service.GroupMemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
		if member.GroupId == uuid.Nil || !member.IsActive {
			panic(exception.NewForbiddenError("You don't have permission to view posts in this group"))
		}
	}

	// Get posts for the group
	posts := service.PostRepository.FindByGroupId(ctx, tx, groupId, userId, limit, offset)

	// Check if current user has liked each post
	for i := range posts {
		posts[i].IsLiked = service.PostRepository.IsLiked(ctx, tx, posts[i].Id, userId)
	}

	return helper.ToPostResponses(posts)
}
