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
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
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

// New method to upload post images
func (service *PostServiceImpl) UploadImages(ctx context.Context, userId uuid.UUID, fileHeaders []*multipart.FileHeader) web.UploadPostImagesResponse {
	// Create upload directory if it doesn't exist
	uploadDir := "uploads/posts/" + userId.String()
	err := os.MkdirAll(uploadDir, 0755)
	helper.PanicIfError(err)

	var uploadedFiles []string

	// Process each file
	for _, fileHeader := range fileHeaders {
		// Validate file type
		if !isValidImageType(fileHeader) {
			panic(exception.NewBadRequestError("Invalid file type. Only image files are allowed"))
		}

		// Generate unique filename
		filename := generateUniqueFilename(fileHeader.Filename)
		filepath := uploadDir + "/" + filename

		// Open the uploaded file
		file, err := fileHeader.Open()
		helper.PanicIfError(err)
		defer file.Close()

		// Create destination file
		dst, err := os.Create(filepath)
		helper.PanicIfError(err)
		defer dst.Close()

		// Copy file contents
		_, err = io.Copy(dst, file)
		helper.PanicIfError(err)

		// Store relative path
		uploadedFiles = append(uploadedFiles, filepath)
	}

	return web.UploadPostImagesResponse{
		Filenames: uploadedFiles,
	}
}

// Helper function to validate image types
func isValidImageType(fileHeader *multipart.FileHeader) bool {
	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		return false
	}
	defer file.Close()

	// Read first 512 bytes for MIME type detection
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return false
	}

	// Seek back to beginning of file
	_, err = file.Seek(0, 0)
	if err != nil {
		return false
	}

	// Check MIME type
	mimeType := http.DetectContentType(buffer)
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}

	return validTypes[mimeType]
}

// Helper function to generate a unique filename
func generateUniqueFilename(originalFilename string) string {
	// Extract file extension
	extension := filepath.Ext(originalFilename)

	// Generate timestamp-based unique name
	timestamp := time.Now().UnixNano()
	randomString := fmt.Sprintf("%d", timestamp)

	return randomString + extension
}
