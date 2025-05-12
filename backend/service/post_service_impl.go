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
	"net/http"
	"path/filepath"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type PostServiceImpl struct {
	PostRepository       repository.PostRepository
	ConnectionRepository repository.ConnectionRepository
	DB                   *sql.DB
	Validate             *validator.Validate
}

func NewPostService(postRepository repository.PostRepository, connectionRepository repository.ConnectionRepository, db *sql.DB, validate *validator.Validate) PostService {
	return &PostServiceImpl{
		PostRepository:       postRepository,
		ConnectionRepository: connectionRepository,
		DB:                   db,
		Validate:             validate,
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

	// Ambil ID user yang sedang login
	currentUserIdStr, ok := ctx.Value("user_id").(string)
	if ok {
		currentUserId, err := uuid.Parse(currentUserIdStr)
		if err == nil && post.User != nil && post.UserId != currentUserId {
			post.User.IsConnected = service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, post.UserId)
		}
	}

	// Check if the current user has liked this post
	post.IsLiked = service.PostRepository.IsLiked(ctx, tx, postId, currentUserId)

	return helper.ToPostResponse(post)
}

func (service *PostServiceImpl) FindAll(ctx context.Context, limit, offset int, currentUserId uuid.UUID) []web.PostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Error 1: Fungsi FindAll hanya mengembalikan 1 nilai, bukan 2
	posts := service.PostRepository.FindAll(ctx, tx, limit, offset)

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
