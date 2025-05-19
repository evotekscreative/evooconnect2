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

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CommentServiceImpl struct {
	CommentRepository repository.CommentRepository
	PostRepository    repository.PostRepository
	UserRepository    repository.UserRepository
	NotificationService NotificationService
	DB                *sql.DB
	Validate          *validator.Validate
}

func NewCommentService(
	commentRepository repository.CommentRepository,
	postRepository repository.PostRepository,
	userRepository repository.UserRepository,
	notificationService NotificationService,
	db *sql.DB,
	validate *validator.Validate) CommentService {
	return &CommentServiceImpl{
		CommentRepository: commentRepository,
		PostRepository:    postRepository,
		UserRepository:    userRepository,
		NotificationService: notificationService,
		DB:                db,
		Validate:          validate,
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

	return web.CommentListResponse{
		Comments: helper.ToCommentResponses(comments),
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
// Tambahkan implementasi Reply sesuai interface
func (service *CommentServiceImpl) Reply(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentRequest) web.CommentResponse {
	// Validasi request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Periksa apakah komentar induk ada
	parentComment, err := service.CommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Parent comment not found"))
	}

	// Periksa apakah komentar induk sudah merupakan balasan
	if parentComment.ParentId != nil {
		panic(exception.NewBadRequestError("Cannot reply to a reply"))
	}

	// Buat balasan komentar
	reply := domain.Comment{
		PostId:   parentComment.PostId,
		UserId:   userId,
		ParentId: &commentId, // Set parent ID
		Content:  request.Content,
	}

	newReply := service.CommentRepository.Save(ctx, tx, reply)

	// Get user info
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}
	newReply.User = &user

	// Kirim notifikasi ke pemilik komentar jika bukan diri sendiri
	if parentComment.UserId != userId && service.NotificationService != nil {
		// Gunakan tipe notifikasi yang berbeda untuk balasan komentar
		refType := "comment_reply" // Berbeda dari "post_comment"
		parentUserId := parentComment.UserId
		postId := parentComment.PostId
		userName := user.Name
		
		fmt.Printf("DEBUG: Sending comment reply notification. From: %s, To: %s, CommentID: %s, PostID: %s\n", 
			userId, parentUserId, commentId, postId)
		
		// Kirim notifikasi tanpa goroutine untuk debugging
		notifResponse := service.NotificationService.Create(
			ctx, // Gunakan context yang sama dengan request
			parentUserId,
			string(domain.NotificationCategoryPost),
			"comment_reply", // Gunakan string literal untuk tipe notifikasi khusus
			"Comment Reply", // Judul yang berbeda untuk membedakan dari komentar biasa
			fmt.Sprintf("%s replied to your comment", userName),
			&postId,
			&refType,
			&userId,
		)
		
		fmt.Printf("DEBUG: Comment reply notification response: %+v\n", notifResponse)
	}

	return helper.ToCommentResponse(newReply)
}

// Tambahkan implementasi GetReplies sesuai interface
func (service *CommentServiceImpl) GetReplies(ctx context.Context, commentId uuid.UUID, limit, offset int) web.CommentListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Periksa apakah komentar induk ada
	_, err = service.CommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Parent comment not found"))
	}

	// Ambil balasan untuk komentar tertentu
	// replies, err := service.CommentRepository.FindRepliesByParentId(ctx, tx, commentId, limit, offset)
	replies := service.CommentRepository.FindRepliesByParentId(ctx, tx, commentId)

	total, err := service.CommentRepository.CountRepliesByParentId(ctx, tx, commentId)
	helper.PanicIfError(err)

	return web.CommentListResponse{
		Comments: helper.ToCommentResponses(replies),
		Total:    total,
	}
}
