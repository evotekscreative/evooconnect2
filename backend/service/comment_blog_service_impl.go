package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CommentBlogServiceImpl struct {
	CommentBlogRepository repository.CommentBlogRepository
	BlogRepository        repository.BlogRepository
	UserRepository        repository.UserRepository
	DB                    *sql.DB
	Validate              *validator.Validate
}

func NewCommentBlogService(
	commentBlogRepository repository.CommentBlogRepository,
	blogRepository repository.BlogRepository,
	userRepository repository.UserRepository,
	db *sql.DB,
	validate *validator.Validate) CommentBlogService {
	return &CommentBlogServiceImpl{
		CommentBlogRepository: commentBlogRepository,
		BlogRepository:        blogRepository,
		UserRepository:       userRepository,
		DB:                   db,
		Validate:             validate,
	}
}

func (service *CommentBlogServiceImpl) Create(ctx context.Context, blogId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	if _, err := service.BlogRepository.FindByID(ctx, blogId.String()); err != nil {
        panic(exception.NewNotFoundError("Blog not found"))
    }

	// HAPUS: if blog.Visibility == ... (karena field-nya gak ada)

	comment := domain.CommentBlog{
		BlogId:   blogId,
		UserId:   userId,
		Content:  request.Content,
		ParentId: request.ParentId,
	}

	newComment := service.CommentBlogRepository.Save(ctx, tx, comment)

	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}
	newComment.User = &user

	return helper.ToCommentBlogResponse(newComment)
}

func (service *CommentBlogServiceImpl) GetByBlogId(ctx context.Context, blogId uuid.UUID, limit, offset int) web.CommentBlogListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	_, err = service.BlogRepository.FindByID(ctx, blogId.String())
	if err != nil {
		panic(exception.NewNotFoundError("Blog not found"))
	}

	var nilParentId *uuid.UUID = nil
	comments, err := service.CommentBlogRepository.FindByBlogId(ctx, tx, blogId, nilParentId, limit, offset)
	helper.PanicIfError(err)
	total, err := service.CommentBlogRepository.CountByBlogId(ctx, tx, blogId)
	helper.PanicIfError(err)

	return web.CommentBlogListResponse{
		Comments: helper.ToCommentBlogResponses(comments),
		Total:    total,
	}
}

func (service *CommentBlogServiceImpl) GetById(ctx context.Context, commentId uuid.UUID) web.CommentBlogResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	return helper.ToCommentBlogResponse(comment)
}

func (service *CommentBlogServiceImpl) Update(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	if comment.UserId != userId {
		panic(exception.NewForbiddenError("You can only edit your own comments"))
	}

	comment.Content = request.Content
	updatedComment, err := service.CommentBlogRepository.Update(ctx, tx, comment)
	helper.PanicIfError(err)

	return helper.ToCommentBlogResponse(updatedComment)
}

func (service *CommentBlogServiceImpl) Delete(ctx context.Context, commentId uuid.UUID, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	blog, err := service.BlogRepository.FindByID(ctx, comment.BlogId.String())
	if err != nil {
		panic(exception.NewNotFoundError("Blog not found"))
	}

	// Perbaiki tipe data string vs UUID
	if comment.UserId != userId && blog.UserID != userId.String() {
		panic(exception.NewForbiddenError("You don't have permission to delete this comment"))
	}

	err = service.CommentBlogRepository.Delete(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewInternalServerError(err.Error()))
	}
}

func (service *CommentBlogServiceImpl) Reply(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	parentComment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Parent comment not found"))
	}

	if parentComment.ParentId != nil {
		panic(exception.NewBadRequestError("Cannot reply to a reply"))
	}

	reply := domain.CommentBlog{
		BlogId:   parentComment.BlogId,
		UserId:   userId,
		ParentId: &commentId,
		Content:  request.Content,
	}

	newReply := service.CommentBlogRepository.Save(ctx, tx, reply)

	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}
	newReply.User = &user

	return helper.ToCommentBlogResponse(newReply)
}

func (service *CommentBlogServiceImpl) GetReplies(ctx context.Context, commentId uuid.UUID, limit, offset int) web.CommentBlogListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	_, err = service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Parent comment not found"))
	}

	replies := service.CommentBlogRepository.FindRepliesByParentId(ctx, tx, commentId)

	total, err := service.CommentBlogRepository.CountRepliesByParentId(ctx, tx, commentId)
	helper.PanicIfError(err)

	return web.CommentBlogListResponse{
		Comments: helper.ToCommentBlogResponses(replies),
		Total:    total,
	}
}
