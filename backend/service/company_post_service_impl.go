package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/entity"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"mime/multipart"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CompanyPostServiceImpl struct {
	DB                      *sql.DB
	CompanyPostRepository   repository.CompanyPostRepository
	MemberCompanyRepository repository.MemberCompanyRepository
	CompanyRepository       repository.CompanyRepository
	UserRepository          repository.UserRepository
	NotificationService     NotificationService
	Validate                *validator.Validate
}

func NewCompanyPostService(
	db *sql.DB,
	companyPostRepository repository.CompanyPostRepository,
	memberCompanyRepository repository.MemberCompanyRepository,
	companyRepository repository.CompanyRepository,
	userRepository repository.UserRepository,
	notificationService NotificationService,
	validate *validator.Validate,
) CompanyPostService {
	return &CompanyPostServiceImpl{
		DB:                      db,
		CompanyPostRepository:   companyPostRepository,
		MemberCompanyRepository: memberCompanyRepository,
		CompanyRepository:       companyRepository,
		UserRepository:          userRepository,
		NotificationService:     notificationService,
		Validate:                validate,
	}
}

func (service *CompanyPostServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreateCompanyPostRequest, files []*multipart.FileHeader) web.CompanyPostResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, request.CompanyId)
	if err != nil {
		panic(exception.NewNotFoundError("company not found"))
	}

	// Check if user has permission (super_admin or admin)
	member, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, request.CompanyId)
	if err != nil {
		panic(exception.NewForbiddenError("you are not a member of this company"))
	}

	if member.Role != entity.RoleSuperAdmin && member.Role != entity.RoleAdmin {
		panic(exception.NewForbiddenError("you don't have permission to create posts for this company"))
	}

	// Handle file uploads
	var imagePaths []string
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			panic(exception.NewInternalServerError("Failed to open uploaded file: " + err.Error()))
		}

		result, err := helper.UploadImage(file, fileHeader, helper.DirCompanyPosts, userId.String(), "images")
		file.Close()

		if err != nil {
			panic(exception.NewInternalServerError("Failed to upload image: " + err.Error()))
		}

		imagePaths = append(imagePaths, result.RelativePath)
	}

	// Create company post
	post := domain.CompanyPost{
		CompanyId:      request.CompanyId,
		CreatorId:      userId,
		Title:          request.Title,
		Content:        request.Content,
		Images:         imagePaths,
		Status:         request.Status,
		Visibility:     request.Visibility,
		IsAnnouncement: request.IsAnnouncement,
	}

	post, err = service.CompanyPostRepository.Create(ctx, tx, post)
	helper.PanicIfError(err)

	// Send notification to company members if published
	if request.Status == "published" {
		service.sendNotificationToCompanyMembers(post, userId)
	}

	return service.toCompanyPostResponse(post, userId)
}

func (service *CompanyPostServiceImpl) Update(ctx context.Context, userId, postId uuid.UUID, request web.UpdateCompanyPostRequest, files []*multipart.FileHeader) web.CompanyPostResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get existing post
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check permission (only creator, company super_admin, or admin can update)
	if post.CreatorId != userId {
		member, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to update this post"))
		}

		if member.Role != entity.RoleSuperAdmin && member.Role != entity.RoleAdmin {
			panic(exception.NewForbiddenError("you don't have permission to update this post"))
		}
	}

	// Handle image updates
	imagePaths := request.ExistingImages

	// Remove deleted images from filesystem
	for _, removedImage := range request.RemovedImages {
		if err := helper.DeleteFile(removedImage); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to remove image %s: %v\n", removedImage, err)
		}
		// Remove from existing images
		for i, existingImage := range imagePaths {
			if existingImage == removedImage {
				imagePaths = append(imagePaths[:i], imagePaths[i+1:]...)
				break
			}
		}
	}

	// Handle new file uploads
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			panic(exception.NewInternalServerError("Failed to open uploaded file: " + err.Error()))
		}

		result, err := helper.UploadImage(file, fileHeader, helper.DirCompanyPosts, userId.String(), "images")
		file.Close()

		if err != nil {
			panic(exception.NewInternalServerError("Failed to upload image: " + err.Error()))
		}

		imagePaths = append(imagePaths, result.RelativePath)
	}

	// Update post data
	post.Title = request.Title
	post.Content = request.Content
	post.Images = imagePaths
	post.Status = request.Status
	post.Visibility = request.Visibility
	post.IsAnnouncement = request.IsAnnouncement

	post, err = service.CompanyPostRepository.Update(ctx, tx, post)
	helper.PanicIfError(err)

	return service.toCompanyPostResponse(post, userId)
}

func (service *CompanyPostServiceImpl) Delete(ctx context.Context, userId, postId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get existing post
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check permission (only creator or company super_admin can delete)
	if post.CreatorId != userId {
		member, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to delete this post"))
		}

		if member.Role != entity.RoleSuperAdmin {
			panic(exception.NewForbiddenError("you don't have permission to delete this post"))
		}
	}

	postImages := post.Images

	err = service.CompanyPostRepository.Delete(ctx, tx, postId)
	helper.PanicIfError(err)

	for _, image := range postImages {
		err := helper.DeleteFile(image)
		if err != nil {
			panic(exception.NewInternalServerError(err.Error()))
		}
	}
}

func (service *CompanyPostServiceImpl) FindById(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.CompanyPostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("Company post not found"))
	}

	// Jika postingan sudah di-takedown, periksa apakah user adalah pemilik atau admin perusahaan
	if post.Status == "taken_down" && post.TakenDownAt != nil {
		// Jika user bukan pemilik postingan
		if post.CreatorId != userId {
			// Periksa apakah user adalah admin perusahaan
			memberInfo, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
			if err != nil || (memberInfo.Role != "owner" && memberInfo.Role != "admin" && memberInfo.Role != "super_admin") {
				// Jika bukan admin atau pemilik, kembalikan not found
				panic(exception.NewNotFoundError("Company post not found"))
			}
		}
	}

	return service.toCompanyPostResponse(post, userId)
}

func (service *CompanyPostServiceImpl) FindByCompanyId(ctx context.Context, companyId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("company not found"))
	}

	// Check if user can view company posts
	isMember := false
	_, err = service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, companyId)
	if err == nil {
		isMember = true
	}

	posts, total, err := service.CompanyPostRepository.FindByCompanyId(ctx, tx, companyId, limit, offset)
	helper.PanicIfError(err)

	var responses []web.CompanyPostResponse
	for _, post := range posts {
		// Filter based on visibility
		if post.Visibility == "members_only" && !isMember {
			continue
		}
		responses = append(responses, service.toCompanyPostResponse(post, userId))
	}

	return web.CompanyPostListResponse{
		Posts: responses,
		Pagination: web.PaginationResponse{
			Total:   total,
			Limit:   limit,
			Offset:  offset,
			HasNext: offset+limit < total,
			HasPrev: offset > 0,
		},
	}
}

func (service *CompanyPostServiceImpl) FindByCreatorId(ctx context.Context, creatorId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	posts, total, err := service.CompanyPostRepository.FindByCreatorId(ctx, tx, creatorId, limit, offset)
	helper.PanicIfError(err)

	var responses []web.CompanyPostResponse
	for _, post := range posts {
		// Check visibility permissions
		if post.Visibility == "members_only" {
			_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
			if err != nil {
				continue // Skip if not a member
			}
		}
		responses = append(responses, service.toCompanyPostResponse(post, userId))
	}

	return web.CompanyPostListResponse{
		Posts: responses,
		Pagination: web.PaginationResponse{
			Total:   total,
			Limit:   limit,
			Offset:  offset,
			HasNext: offset+limit < total,
			HasPrev: offset > 0,
		},
	}
}

func (service *CompanyPostServiceImpl) FindWithFilters(ctx context.Context, userId uuid.UUID, filter web.CompanyPostFilterRequest) web.CompanyPostListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	posts, total, err := service.CompanyPostRepository.FindWithFilters(
		ctx, tx, filter.CompanyId, filter.Status, filter.Visibility,
		filter.CreatorId, filter.Search, filter.Limit, filter.Offset,
	)
	helper.PanicIfError(err)

	var responses []web.CompanyPostResponse
	for _, post := range posts {
		// Check visibility permissions
		if post.Visibility == "members_only" {
			_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
			if err != nil {
				continue // Skip if not a member
			}
		}
		responses = append(responses, service.toCompanyPostResponse(post, userId))
	}

	return web.CompanyPostListResponse{
		Posts: responses,
		Pagination: web.PaginationResponse{
			Total:   total,
			Limit:   filter.Limit,
			Offset:  filter.Offset,
			HasNext: filter.Offset+filter.Limit < total,
			HasPrev: filter.Offset > 0,
		},
	}
}

func (service *CompanyPostServiceImpl) UpdateStatus(ctx context.Context, userId, postId uuid.UUID, status string) web.CompanyPostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get existing post
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check permission (only creator or company super_admin can update status)
	if post.CreatorId != userId {
		member, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to update this post"))
		}

		if member.Role != entity.RoleSuperAdmin {
			panic(exception.NewForbiddenError("you don't have permission to update this post"))
		}
	}

	err = service.CompanyPostRepository.UpdateStatus(ctx, tx, postId, status)
	helper.PanicIfError(err)

	// Get updated post
	post, err = service.CompanyPostRepository.FindById(ctx, tx, postId)
	helper.PanicIfError(err)

	// Send notification if status changed to published
	if status == "published" && post.Status != "published" {
		service.sendNotificationToCompanyMembers(post, userId)
	}

	return service.toCompanyPostResponse(post, userId)
}

// func (service *CompanyPostServiceImpl) toCompanyPostResponse(post domain.CompanyPost, userId uuid.UUID) web.CompanyPostResponse {
// 	tx, err := service.DB.Begin()
// 	helper.PanicIfError(err)
// 	defer helper.CommitOrRollback(tx)

// 	// Get stats
// 	likesCount := service.CompanyPostRepository.GetLikesCount(context.Background(), tx, post.Id)
// 	commentsCount, _ := service.CompanyPostRepository.GetCommentsCount(context.Background(), tx, post.Id)
// 	isLiked := service.CompanyPostRepository.IsLiked(context.Background(), tx, post.Id, userId)

// 	response := web.CompanyPostResponse{
// 		Id:             post.Id,
// 		CompanyId:      post.CompanyId,
// 		CreatorId:      post.CreatorId,
// 		Title:          post.Title,
// 		Content:        post.Content,
// 		Images:         post.Images,
// 		Status:         post.Status,
// 		Visibility:     post.Visibility,
// 		IsAnnouncement: post.IsAnnouncement,
// 		CreatedAt:      post.CreatedAt,
// 		UpdatedAt:      post.UpdatedAt,
// 		LikesCount:     likesCount,
// 		CommentsCount:  commentsCount,
// 		IsLiked:        isLiked,
// 	}

// 	// Add company info if available
// 	if post.Company != nil {
// 		response.Company = &web.CompanyBriefResponse{
// 			Id:       post.Company.Id,
// 			Name:     post.Company.Name,
// 			Logo:     &post.Company.Logo,
// 			Industry: post.Company.Industry,
// 		}
// 	}

// 	// Add creator info if available
// 	if post.Creator != nil {
// 		// Get creator's role in the company
// 		role := ""
// 		member, err := service.MemberCompanyRepository.FindByUserAndCompany(context.Background(), tx, post.CreatorId, post.CompanyId)
// 		if err == nil {
// 			role = string(member.Role)
// 		}

// 		response.Creator = &web.UserCompanyBriefResponse{
// 			Id:       post.Creator.Id,
// 			Name:     post.Creator.Name,
// 			Username: post.Creator.Username,
// 			Photo:    post.Creator.Photo,
// 			Role:     role,
// 		}
// 	}

// 	return response
// }

func (service *CompanyPostServiceImpl) sendNotificationToCompanyMembers(post domain.CompanyPost, creatorId uuid.UUID) {
	if service.NotificationService == nil {
		return
	}

	go func() {
		tx, err := service.DB.Begin()
		if err != nil {
			return
		}
		defer helper.CommitOrRollback(tx)

		// Get creator info
		user, err := service.UserRepository.FindById(context.Background(), tx, creatorId)
		if err != nil {
			return
		}

		// Get company members (exclude creator)
		members, _, err := service.MemberCompanyRepository.FindByCompanyID(context.Background(), tx, post.CompanyId, 1000, 0)
		if err != nil {
			return
		}

		refType := "company_post"
		notificationTitle := "New Company Post"
		if post.IsAnnouncement {
			notificationTitle = "Company Announcement"
		}

		for _, member := range members {
			if member.UserID != creatorId && member.Status == "active" {
				service.NotificationService.Create(
					context.Background(),
					member.UserID,
					string(domain.NotificationCategoryCompany),
					"company_post",
					notificationTitle,
					fmt.Sprintf("%s posted: %s", user.Name, post.Title),
					&post.CompanyId,
					&refType,
					&post.Id,
				)
			}
		}
	}()
}

func (service *CompanyPostServiceImpl) LikePost(ctx context.Context, userId, postId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if post exists
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check if post is accessible to user based on visibility
	if post.Visibility == "members_only" {
		_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to like this post"))
		}
	}

	// Check if already liked
	if service.CompanyPostRepository.IsLiked(ctx, tx, postId, userId) {
		panic(exception.NewBadRequestError("you have already liked this post"))
	}

	// Like the post
	err = service.CompanyPostRepository.LikePost(ctx, tx, postId, userId)
	helper.PanicIfError(err)

	// Send notification to post creator if it's not the same user
	if post.CreatorId != userId && service.NotificationService != nil {
		service.sendLikeNotification(ctx, post, userId)
	}
}

func (service *CompanyPostServiceImpl) UnlikePost(ctx context.Context, userId, postId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if post exists
	_, err = service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check if post is liked
	if !service.CompanyPostRepository.IsLiked(ctx, tx, postId, userId) {
		panic(exception.NewBadRequestError("you haven't liked this post"))
	}

	// Unlike the post
	err = service.CompanyPostRepository.UnlikePost(ctx, tx, postId, userId)
	helper.PanicIfError(err)
}

// Update existing toCompanyPostResponse method
func (service *CompanyPostServiceImpl) toCompanyPostResponse(post domain.CompanyPost, userId uuid.UUID) web.CompanyPostResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	ctx := context.Background()

	// Get stats using consistent method names
	likesCount := service.CompanyPostRepository.GetLikesCount(ctx, tx, post.Id)
	commentsCount, err := service.CompanyPostRepository.GetCommentsCount(ctx, tx, post.Id)
	if err != nil {
		panic(exception.NewInternalServerError("failed to get comments count"))
	}
	isLiked := service.CompanyPostRepository.IsLiked(ctx, tx, post.Id, userId)

	response := web.CompanyPostResponse{
		Id:             post.Id,
		CompanyId:      post.CompanyId,
		CreatorId:      post.CreatorId,
		Title:          post.Title,
		Content:        post.Content,
		Images:         post.Images,
		Status:         post.Status,
		Visibility:     post.Visibility,
		IsAnnouncement: post.IsAnnouncement,
		CreatedAt:      post.CreatedAt,
		UpdatedAt:      post.UpdatedAt,
		TakenDownAt:    post.TakenDownAt, // Tambahkan field ini
		LikesCount:     likesCount,
		CommentsCount:  commentsCount,
		IsLiked:        isLiked,
	}

	// Add company info if available
	if post.Company != nil {
		response.Company = &web.CompanyBriefResponse{
			Id:       post.Company.Id,
			Name:     post.Company.Name,
			Logo:     &post.Company.Logo,
			Industry: post.Company.Industry,
		}
	}

	// Add creator info if available
	if post.Creator != nil {
		// Get creator's role in the company
		role := ""
		member, err := service.MemberCompanyRepository.FindByUserAndCompany(context.Background(), tx, post.CreatorId, post.CompanyId)
		if err == nil {
			role = string(member.Role)
		}

		response.Creator = &web.UserCompanyBriefResponse{
			Id:       post.Creator.Id,
			Name:     post.Creator.Name,
			Username: post.Creator.Username,
			Photo:    post.Creator.Photo,
			Role:     role,
		}
	}

	return response
}


func (service *CompanyPostServiceImpl) sendLikeNotification(ctx context.Context, post domain.CompanyPost, likerUserId uuid.UUID) {
	if service.NotificationService == nil {
		return
	}

	go func() {
		tx, err := service.DB.Begin()
		if err != nil {
			return
		}
		defer helper.CommitOrRollback(tx)

		// Get liker info
		user, err := service.UserRepository.FindById(context.Background(), tx, likerUserId)
		if err != nil {
			return
		}

		refType := "company_post_like"
		service.NotificationService.Create(
			context.Background(),
			post.CreatorId,
			string(domain.NotificationCategoryEngagement),
			"company_post_like",
			"Post Liked",
			fmt.Sprintf("%s liked your company post: %s", user.Name, post.Title),
			&post.CompanyId,
			&refType,
			&post.Id,
		)
	}()
}
