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
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CommentServiceImpl struct {
	CommentRepository   repository.CommentRepository
	PostRepository      repository.PostRepository
	UserRepository      repository.UserRepository
	NotificationService NotificationService
	DB                  *sql.DB
	Validate            *validator.Validate
}

func NewCommentService(
	commentRepository repository.CommentRepository,
	postRepository repository.PostRepository,
	userRepository repository.UserRepository,
	notificationService NotificationService,
	db *sql.DB,
	validate *validator.Validate) CommentService {
	return &CommentServiceImpl{
		CommentRepository:   commentRepository,
		PostRepository:      postRepository,
		UserRepository:      userRepository,
		NotificationService: notificationService,
		DB:                  db,
		Validate:            validate,
	}
}

// Mengubah implementasi Create agar sesuai dengan interface
func (service *CommentServiceImpl) Create(ctx context.Context, postId uuid.UUID, userId uuid.UUID, request web.CreateCommentRequest) web.CommentResponse {
	// Validasi request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Periksa apakah post ada
	post, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("Post not found"))
	}

	// Check visibility (jika post private, hanya pemilik yang bisa mengomentari)
	if post.Visibility == "private" && post.UserId != userId {
		panic(exception.NewForbiddenError("You don't have permission to comment on this post"))
	}

	// Create comment
	comment := domain.Comment{
		PostId:   postId,
		UserId:   userId,
		Content:  request.Content,
		ParentId: request.ParentId, // Null untuk komentar utama
	}

	newComment := service.CommentRepository.Save(ctx, tx, comment)

	// Get user info
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}
	newComment.User = &user

	// Kirim notifikasi ke pemilik post jika bukan diri sendiri
	if post.UserId != userId && service.NotificationService != nil {
		refType := "post_comment"
		go func() {
			service.NotificationService.Create(
				context.Background(),
				post.UserId,
				string(domain.NotificationCategoryPost),
				string(domain.NotificationTypePostComment),
				"Post Comment",
				fmt.Sprintf("%s commented on your post", user.Name),
				&postId,
				&refType,
				&userId,
			)
		}()
	}

	return helper.ToCommentResponse(newComment)
}

// Mengubah FindByPostId menjadi GetByPostId agar sesuai interface
func (service *CommentServiceImpl) GetByPostId(ctx context.Context, postId uuid.UUID, limit, offset int) web.CommentListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if post exists
	_, err = service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("Post not found"))
	}

	var nilParentId *uuid.UUID = nil
	comments, err := service.CommentRepository.FindByPostId(ctx, tx, postId, nilParentId, limit, offset)
	helper.PanicIfError(err)
	total, err := service.CommentRepository.CountByPostId(ctx, tx, postId)
	helper.PanicIfError(err)

	// Hitung jumlah replies untuk setiap komentar
	commentResponses := make([]web.CommentResponse, 0)
	for _, comment := range comments {
		// Konversi ke response
		commentResponse := helper.ToCommentResponse(comment)

		// Hitung jumlah replies secara eksplisit
		repliesCount, err := service.CommentRepository.CountRepliesByParentId(ctx, tx, comment.Id)
		if err == nil {
			commentResponse.RepliesCount = repliesCount
		}

		commentResponses = append(commentResponses, commentResponse)
	}

	return web.CommentListResponse{
		Comments: commentResponses,
		Total:    total,
	}
}

// Mengubah FindById menjadi GetById agar sesuai interface
func (service *CommentServiceImpl) GetById(ctx context.Context, commentId uuid.UUID) web.CommentResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	return helper.ToCommentResponse(comment)
}

// Mengubah implementasi Update agar sesuai interface
func (service *CommentServiceImpl) Update(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentRequest) web.CommentResponse {
	// Validasi request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Periksa apakah komentar ada
	comment, err := service.CommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	// Periksa apakah pengguna adalah pemilik komentar
	if comment.UserId != userId {
		panic(exception.NewForbiddenError("You can only edit your own comments"))
	}

	// Update komentar
	comment.Content = request.Content
	updatedComment, err := service.CommentRepository.Update(ctx, tx, comment)
	helper.PanicIfError(err)

	return helper.ToCommentResponse(updatedComment)
}

// Mengubah implementasi Delete agar sesuai interface
func (service *CommentServiceImpl) Delete(ctx context.Context, commentId uuid.UUID, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Periksa apakah komentar ada
	comment, err := service.CommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	// Periksa apakah pengguna adalah pemilik komentar atau pemilik post
	post, err := service.PostRepository.FindById(ctx, tx, comment.PostId)
	if err != nil {
		panic(exception.NewNotFoundError("Post not found"))
	}

	// Pengguna dapat menghapus komentar jika mereka adalah pemilik komentar atau pemilik post
	if comment.UserId != userId && post.UserId != userId {
		panic(exception.NewForbiddenError("You don't have permission to delete this comment"))
	}

	// Hapus komentar (dan balasannya jika ada)
	err = service.CommentRepository.Delete(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewInternalServerError(err.Error()))
	}
}

// Tambahkan implementasi Reply sesuai interface
func (service *CommentServiceImpl) Reply(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentRequest) web.CommentResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Cari komentar yang akan dibalas
	parentComment, err := service.CommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		fmt.Println("Error finding parent comment:", err)
		panic(exception.NewNotFoundError("Comment not found"))
	}

	// Tentukan parent_id yang benar
	// Jika komentar yang dibalas adalah komentar utama, gunakan ID-nya sebagai parent_id
	// Jika komentar yang dibalas adalah balasan, gunakan parent_id dari komentar tersebut
	var parentId *uuid.UUID
	if parentComment.ParentId == nil {
		// Ini adalah komentar utama, jadi gunakan ID-nya sebagai parent_id
		parentId = &commentId
	} else {
		// Ini adalah balasan, jadi gunakan parent_id dari komentar tersebut
		parentId = parentComment.ParentId
	}

	// Buat komentar baru sebagai balasan
	comment := domain.Comment{
		Id:        uuid.New(),
		PostId:    parentComment.PostId,
		UserId:    userId,
		ParentId:  parentId,   // Set parent ID ke ID komentar utama
		ReplyToId: &commentId, // Set reply_to_id ke ID komentar yang dibalas langsung
		Content:   request.Content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Simpan komentar
	result := service.CommentRepository.Save(ctx, tx, comment)

	// Ambil informasi user untuk komentar
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Ambil informasi user untuk komentar yang dibalas
	parentUser, err := service.UserRepository.FindById(ctx, tx, parentComment.UserId)
	if err != nil {
		panic(exception.NewNotFoundError("Parent comment user not found"))
	}

	// Buat response
	response := web.CommentResponse{
		Id:        result.Id,
		PostId:    result.PostId,
		Content:   result.Content,
		CreatedAt: result.CreatedAt,
		UpdatedAt: result.UpdatedAt,
		User: web.CommentUserInfo{
			Id:       user.Id,
			Name:     user.Name,
			Username: user.Username,
			Photo:    user.Photo,
		},
		RepliesCount: 0,
		ParentId:     result.ParentId,
		ReplyTo: &web.ReplyToInfo{
			Id:           parentComment.Id,
			Content:      parentComment.Content,
			Username:     parentUser.Username,
			Name:         parentUser.Name,
			ProfilePhoto: parentUser.Photo,
		},
	}

	return response
}

// Tambahkan implementasi GetReplies sesuai interface
func (service *CommentServiceImpl) GetReplies(ctx context.Context, commentId uuid.UUID, limit int, offset int) web.CommentListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Cari komentar yang akan diambil balasannya
	parentComment, err := service.CommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	// Ambil balasan komentar
	replies, err := service.CommentRepository.FindRepliesByParentIdSafe(ctx, tx, commentId)
	helper.PanicIfError(err)

	// Hitung total balasan
	count, err := service.CommentRepository.CountRepliesByParentId(ctx, tx, commentId)
	helper.PanicIfError(err)

	// Buat response
	var replyResponses []web.CommentResponse
	for _, reply := range replies {
		// Ambil informasi user untuk balasan
		user, err := service.UserRepository.FindById(ctx, tx, reply.UserId)
		if err != nil {
			continue // Skip jika user tidak ditemukan
		}

		// Tentukan komentar yang dibalas
		var replyToComment domain.Comment
		var replyToUser domain.User

		if reply.ReplyToId != nil {
			// Jika ada reply_to_id, ambil komentar yang dibalas langsung
			replyToComment, err = service.CommentRepository.FindById(ctx, tx, *reply.ReplyToId)
			if err == nil {
				// Ambil user dari komentar yang dibalas
				replyToUser, err = service.UserRepository.FindById(ctx, tx, replyToComment.UserId)
				if err != nil {
					// Jika user tidak ditemukan, gunakan parent comment
					replyToUser = *parentComment.User
				}
			} else {
				// Jika komentar yang dibalas tidak ditemukan, gunakan parent comment
				replyToComment = parentComment
				replyToUser = *parentComment.User
			}
		} else {
			// Jika tidak ada reply_to_id, gunakan parent comment
			replyToComment = parentComment
			replyToUser = *parentComment.User
		}

		replyResponse := web.CommentResponse{
			Id:        reply.Id,
			PostId:    reply.PostId,
			Content:   reply.Content,
			CreatedAt: reply.CreatedAt,
			UpdatedAt: reply.UpdatedAt,
			User: web.CommentUserInfo{
				Id:       user.Id,
				Name:     user.Name,
				Username: user.Username,
				Photo:    user.Photo,
			},
			RepliesCount: 0, // Balasan tidak memiliki balasan lagi
			ParentId:     reply.ParentId,
			ReplyTo: &web.ReplyToInfo{
				Id:           replyToComment.Id,
				Content:      replyToComment.Content,
				Username:     replyToUser.Username,
				Name:         replyToUser.Name,
				ProfilePhoto: replyToUser.Photo,
			},
		}

		replyResponses = append(replyResponses, replyResponse)
	}

	return web.CommentListResponse{
		Comments: replyResponses,
		Total:    count,
	}
}
