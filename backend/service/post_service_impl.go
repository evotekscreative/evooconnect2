package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type PostServiceImpl struct {
	PostRepository repository.PostRepository
	DB             *sql.DB
	Validate       *validator.Validate
}

func NewPostService(postRepository repository.PostRepository, db *sql.DB, validate *validator.Validate) PostService {
	return &PostServiceImpl{
		PostRepository: postRepository,
		DB:             db,
		Validate:       validate,
	}
}

func (service *PostServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreatePostRequest) web.PostResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Create post with current timestamp
	post := domain.Post{
		UserId:     userId,
		Content:    request.Content,
		Images:     request.Images,
		Visibility: request.Visibility,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	post = service.PostRepository.Save(ctx, tx, post)

	// Retrieve the full post with user information
	fullPost, err := service.PostRepository.FindById(ctx, tx, post.Id)
	helper.PanicIfError(err)

	// Check if the current user has liked this post
	fullPost.IsLiked = service.PostRepository.IsLiked(ctx, tx, post.Id, userId)

	return helper.ToPostResponse(fullPost)
}

// Bagian Update method
func (service *PostServiceImpl) Update(ctx context.Context, postId uuid.UUID, userId uuid.UUID, request web.UpdatePostRequest) web.PostResponse {
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

	// Update post
	existingPost.Content = request.Content
	existingPost.Images = request.Images
	existingPost.Visibility = request.Visibility
	existingPost.UpdatedAt = time.Now()

	updatedPost := service.PostRepository.Update(ctx, tx, existingPost)

	// Check if the current user has liked this post
	updatedPost.IsLiked = service.PostRepository.IsLiked(ctx, tx, postId, userId)

	return helper.ToPostResponse(updatedPost)
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

	// Verify ownership
	if existingPost.UserId != userId {
		panic(exception.NewForbiddenError("You do not have permission to delete this post"))
	}

	service.PostRepository.Delete(ctx, tx, postId)
}

func (service *PostServiceImpl) FindById(ctx context.Context, postId uuid.UUID, currentUserId uuid.UUID) web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	post, err := service.PostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Check if the current user has liked this post
	post.IsLiked = service.PostRepository.IsLiked(ctx, tx, postId, currentUserId)

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) FindAll(ctx context.Context, limit, offset int, currentUserId uuid.UUID) []web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	posts := service.PostRepository.FindAll(ctx, tx, limit, offset)

	// Check which posts the current user has liked
	var postResponses []web.PostResponse
	for _, post := range posts {
		post.IsLiked = service.PostRepository.IsLiked(ctx, tx, post.Id, currentUserId)
		postResponses = append(postResponses, helper.ToPostResponse(post))
	}

	return postResponses
}

func (service *PostServiceImpl) FindByUserId(ctx context.Context, targetUserId uuid.UUID, limit, offset int, currentUserId uuid.UUID) []web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	posts := service.PostRepository.FindByUserId(ctx, tx, targetUserId, limit, offset)

	// Check which posts the current user has liked
	var postResponses []web.PostResponse
	for _, post := range posts {
		post.IsLiked = service.PostRepository.IsLiked(ctx, tx, post.Id, currentUserId)
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
