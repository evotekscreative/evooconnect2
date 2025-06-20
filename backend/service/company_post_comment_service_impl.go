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

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CompanyPostCommentServiceImpl struct {
	DB                           *sql.DB
	CompanyPostCommentRepository repository.CompanyPostCommentRepository
	CompanyPostRepository        repository.CompanyPostRepository
	MemberCompanyRepository      repository.MemberCompanyRepository
	UserRepository               repository.UserRepository
	NotificationService          NotificationService
	Validate                     *validator.Validate
}

func NewCompanyPostCommentService(
	db *sql.DB,
	companyPostCommentRepository repository.CompanyPostCommentRepository,
	companyPostRepository repository.CompanyPostRepository,
	memberCompanyRepository repository.MemberCompanyRepository,
	userRepository repository.UserRepository,
	notificationService NotificationService,
	validate *validator.Validate,
) CompanyPostCommentService {
	return &CompanyPostCommentServiceImpl{
		DB:                           db,
		CompanyPostCommentRepository: companyPostCommentRepository,
		CompanyPostRepository:        companyPostRepository,
		MemberCompanyRepository:      memberCompanyRepository,
		UserRepository:               userRepository,
		NotificationService:          notificationService,
		Validate:                     validate,
	}
}

// CreateComment - Create main comment
func (service *CompanyPostCommentServiceImpl) CreateComment(ctx context.Context, userId, postId uuid.UUID, request web.CreateCompanyPostCommentRequest) web.CompanyPostCommentResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company post exists
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check permission based on post visibility
	if post.Visibility == "members_only" {
		_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to comment on this post"))
		}
	}

	// Create main comment (parent_id = nil, comment_to_id = nil)
	comment := domain.CompanyPostComment{
		PostId:      postId,
		UserId:      userId,
		ParentId:    nil,
		CommentToId: nil,
		Content:     request.Content,
	}

	comment, err = service.CompanyPostCommentRepository.Create(ctx, tx, comment)
	helper.PanicIfError(err)

	// Send notification to post creator
	if post.CreatorId != userId && service.NotificationService != nil {
		service.sendCommentNotification(ctx, post, comment, userId)
	}

	return service.toCompanyPostCommentResponse(comment, userId)
}

// CreateReply - Create reply comment
func (service *CompanyPostCommentServiceImpl) CreateReply(ctx context.Context, userId, postId uuid.UUID, request web.CreateCompanyPostReplyRequest) web.CompanyPostCommentResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Debug logging
	fmt.Printf("CreateReply - PostId: %s, ParentId: %s, UserId: %s\n", postId, request.ParentId, userId)

	// Check if company post exists
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		fmt.Printf("Post not found error: %v\n", err)
		panic(exception.NewNotFoundError("company post not found"))
	}
	fmt.Printf("Post found: %s\n", post.Id)

	// Check if parent comment exists - pastikan query benar
	fmt.Printf("Looking for parent comment with ID: %s\n", request.ParentId)
	parentComment, err := service.CompanyPostCommentRepository.FindById(ctx, tx, request.ParentId)
	if err != nil {
		fmt.Printf("Parent comment not found error: %v\n", err)
		// Let's check if the comment exists with a simple query
		var exists bool
		checkSQL := "SELECT EXISTS(SELECT 1 FROM company_post_comments WHERE id = $1)"
		checkErr := tx.QueryRowContext(ctx, checkSQL, request.ParentId).Scan(&exists)
		if checkErr != nil {
			fmt.Printf("Error checking comment existence: %v\n", checkErr)
		} else {
			fmt.Printf("Comment exists: %v\n", exists)
		}
		panic(exception.NewNotFoundError("parent comment not found"))
	}
	fmt.Printf("Parent comment found: %s\n", parentComment.Id)

	// Verify parent comment belongs to the same post
	if parentComment.PostId != postId {
		panic(exception.NewBadRequestError("parent comment does not belong to this post"))
	}

	// Check permission based on post visibility
	if post.Visibility == "members_only" {
		_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to reply to this comment"))
		}
	}

	// Create reply comment (parent_id = request.ParentId, comment_to_id = nil)
	comment := domain.CompanyPostComment{
		PostId:      postId,
		UserId:      userId,
		ParentId:    &request.ParentId,
		CommentToId: nil, // Reply biasa, bukan sub-reply
		Content:     request.Content,
	}

	comment, err = service.CompanyPostCommentRepository.Create(ctx, tx, comment)
	if err != nil {
		fmt.Printf("Error creating comment: %v\n", err)
		helper.PanicIfError(err)
	}

	// Send notification to parent comment author (if different from current user)
	if parentComment.UserId != userId && service.NotificationService != nil {
		service.sendReplyNotification(ctx, post, parentComment, comment, userId)
	}

	return service.toCompanyPostCommentResponse(comment, userId)
}

func (service *CompanyPostCommentServiceImpl) CreateSubReply(ctx context.Context, userId, postId uuid.UUID, request web.CreateCompanyPostSubReplyRequest) web.CompanyPostCommentResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company post exists
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check if parent comment exists
	parentComment, err := service.CompanyPostCommentRepository.FindById(ctx, tx, request.ParentId)
	if err != nil {
		panic(exception.NewNotFoundError("parent comment not found"))
	}

	// Check if comment-to comment exists
	commentToComment, err := service.CompanyPostCommentRepository.FindById(ctx, tx, request.CommentToId)
	if err != nil {
		panic(exception.NewNotFoundError("comment being replied to not found"))
	}

	// Verify parent comment belongs to the same post
	if parentComment.PostId != postId {
		panic(exception.NewBadRequestError("parent comment does not belong to this post"))
	}

	// Verify comment-to comment belongs to the same parent or is the parent itself
	if commentToComment.Id != request.ParentId && (commentToComment.ParentId == nil || *commentToComment.ParentId != request.ParentId) {
		panic(exception.NewBadRequestError("comment being replied to must be the parent comment or a reply to the same parent"))
	}

	// Check permission based on post visibility
	if post.Visibility == "members_only" {
		_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to reply to this comment"))
		}
	}

	// Create sub-reply comment
	comment := domain.CompanyPostComment{
		PostId:      postId,
		UserId:      userId,
		ParentId:    &request.ParentId,
		CommentToId: &request.CommentToId,
		Content:     request.Content,
	}

	comment, err = service.CompanyPostCommentRepository.Create(ctx, tx, comment)
	helper.PanicIfError(err)

	// Send notification to parent comment author (if different from current user and comment-to author)
	if parentComment.UserId != userId && parentComment.UserId != commentToComment.UserId && service.NotificationService != nil {
		service.sendReplyNotification(ctx, post, parentComment, comment, userId)
	}

	// Send notification to comment-to author (if different from current user)
	if commentToComment.UserId != userId && service.NotificationService != nil {
		service.sendMentionNotification(ctx, post, comment, userId, commentToComment)
	}

	return service.toCompanyPostCommentResponse(comment, userId)
}

// Update comment
func (service *CompanyPostCommentServiceImpl) Update(ctx context.Context, userId, commentId uuid.UUID, request web.UpdateCompanyPostCommentRequest) web.CompanyPostCommentResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if comment exists
	comment, err := service.CompanyPostCommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("comment not found"))
	}

	// Check permission (only comment owner can update)
	if comment.UserId != userId {
		panic(exception.NewForbiddenError("you can only update your own comments"))
	}

	// Update comment content
	comment.Content = request.Content

	comment, err = service.CompanyPostCommentRepository.Update(ctx, tx, comment)
	helper.PanicIfError(err)

	return service.toCompanyPostCommentResponse(comment, userId)
}

// Delete comment
func (service *CompanyPostCommentServiceImpl) Delete(ctx context.Context, userId, commentId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if comment exists
	comment, err := service.CompanyPostCommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("comment not found"))
	}

	// Get the post to check additional permissions
	post, err := service.CompanyPostRepository.FindById(ctx, tx, comment.PostId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check permission (comment owner, post creator, or company super admin can delete)
	canDelete := false
	if comment.UserId == userId {
		canDelete = true
	} else if post.CreatorId == userId {
		canDelete = true
	} else {
		// Check if user is company super admin
		member, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err == nil && member.Role == entity.RoleSuperAdmin {
			canDelete = true
		}
	}

	if !canDelete {
		panic(exception.NewForbiddenError("you don't have permission to delete this comment"))
	}

	// Delete comment (this will also delete replies due to CASCADE)
	err = service.CompanyPostCommentRepository.Delete(ctx, tx, commentId)
	helper.PanicIfError(err)
}

// FindById - Find comment by ID
func (service *CompanyPostCommentServiceImpl) FindById(ctx context.Context, commentId uuid.UUID, userId uuid.UUID) web.CompanyPostCommentResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CompanyPostCommentRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("comment not found"))
	}

	// Get the post to check permissions
	post, err := service.CompanyPostRepository.FindById(ctx, tx, comment.PostId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check if user can view this comment based on post visibility
	if post.Visibility == "members_only" {
		_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to view this comment"))
		}
	}

	return service.toCompanyPostCommentResponse(comment, userId)
}

// GetCommentsByPostId - Get all main comments by post ID
func (service *CompanyPostCommentServiceImpl) GetCommentsByPostId(ctx context.Context, postId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostCommentListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if post exists
	post, err := service.CompanyPostRepository.FindById(ctx, tx, postId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check if user can view comments based on post visibility
	if post.Visibility == "members_only" {
		_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to view comments on this post"))
		}
	}

	// Get main comments (parent_id IS NULL)
	comments, total, err := service.CompanyPostCommentRepository.FindMainCommentsByPostId(ctx, tx, postId, limit, offset)
	helper.PanicIfError(err)

	var responses []web.CompanyPostCommentResponse
	for _, comment := range comments {
		responses = append(responses, service.toCompanyPostCommentResponse(comment, userId))
	}

	return web.CompanyPostCommentListResponse{
		Comments: responses,
		Pagination: web.PaginationResponse{
			Total:   total,
			Limit:   limit,
			Offset:  offset,
			HasNext: offset+limit < total,
			HasPrev: offset > 0,
		},
	}
}

// GetRepliesByParentId - Get all replies by parent comment ID
func (service *CompanyPostCommentServiceImpl) GetRepliesByParentId(ctx context.Context, parentId uuid.UUID, userId uuid.UUID, limit, offset int) web.CompanyPostCommentListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if parent comment exists
	parentComment, err := service.CompanyPostCommentRepository.FindById(ctx, tx, parentId)
	if err != nil {
		panic(exception.NewNotFoundError("parent comment not found"))
	}

	// Get the post to check permissions
	post, err := service.CompanyPostRepository.FindById(ctx, tx, parentComment.PostId)
	if err != nil {
		panic(exception.NewNotFoundError("company post not found"))
	}

	// Check if user can view replies based on post visibility
	if post.Visibility == "members_only" {
		_, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, post.CompanyId)
		if err != nil {
			panic(exception.NewForbiddenError("you don't have permission to view replies on this comment"))
		}
	}

	// Get replies (parent_id = parentId)
	replies, total, err := service.CompanyPostCommentRepository.FindRepliesByParentId(ctx, tx, parentId, limit, offset)
	helper.PanicIfError(err)

	var responses []web.CompanyPostCommentResponse
	for _, reply := range replies {
		responses = append(responses, service.toCompanyPostCommentResponse(reply, userId))
	}

	return web.CompanyPostCommentListResponse{
		Comments: responses,
		Pagination: web.PaginationResponse{
			Total:   total,
			Limit:   limit,
			Offset:  offset,
			HasNext: offset+limit < total,
			HasPrev: offset > 0,
		},
	}
}

// Convert domain comment to response
func (service *CompanyPostCommentServiceImpl) toCompanyPostCommentResponse(comment domain.CompanyPostComment, userId uuid.UUID) web.CompanyPostCommentResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	ctx := context.Background()

	// Get reply count for this comment (only if it's a main comment)
	replyCount := 0
	if comment.ParentId == nil {
		replyCount, _ = service.CompanyPostCommentRepository.CountRepliesByParentId(ctx, tx, comment.Id)
	}

	response := web.CompanyPostCommentResponse{
		Id:          comment.Id,
		PostId:      comment.PostId,
		UserId:      comment.UserId,
		ParentId:    comment.ParentId,
		CommentToId: comment.CommentToId,
		Content:     comment.Content,
		CreatedAt:   comment.CreatedAt,
		UpdatedAt:   comment.UpdatedAt,
		ReplyCount:  replyCount,
	}

	// Add user info if available
	if comment.User != nil {
		response.User = &web.UserBriefResponse{
			Id:       comment.User.Id,
			Name:     comment.User.Name,
			Username: comment.User.Username,
			Photo:    comment.User.Photo,
		}
	}

	// Add comment-to-comment info if available
	if comment.CommentToComment != nil {
		response.CommentToComment = &web.CompanyPostCommentBrief{
			Id:      comment.CommentToComment.Id,
			Content: comment.CommentToComment.Content,
		}

		// Add user info for comment-to-comment
		if comment.CommentToComment.User != nil {
			response.CommentToComment.User = &web.UserBriefResponse{
				Id:       comment.CommentToComment.User.Id,
				Name:     comment.CommentToComment.User.Name,
				Username: comment.CommentToComment.User.Username,
				Photo:    comment.CommentToComment.User.Photo,
			}
		}
	}

	return response
}

// Send notification when someone comments on a post
func (service *CompanyPostCommentServiceImpl) sendCommentNotification(ctx context.Context, post domain.CompanyPost, comment domain.CompanyPostComment, commenterUserId uuid.UUID) {
	if service.NotificationService == nil {
		return
	}

	go func() {
		tx, err := service.DB.Begin()
		if err != nil {
			return
		}
		defer helper.CommitOrRollback(tx)

		// Get commenter info
		user, err := service.UserRepository.FindById(context.Background(), tx, commenterUserId)
		if err != nil {
			return
		}

		refType := "company_post_comment"
		service.NotificationService.Create(
			context.Background(),
			post.CreatorId,
			string(domain.NotificationCategoryEngagement),
			"company_post_comment",
			"New Comment",
			fmt.Sprintf("%s commented on your company post: %s", user.Name, post.Title),
			&post.CompanyId,
			&refType,
			&comment.Id,
		)
	}()
}

// Send notification when someone replies to a comment
func (service *CompanyPostCommentServiceImpl) sendReplyNotification(ctx context.Context, post domain.CompanyPost, parentComment domain.CompanyPostComment, reply domain.CompanyPostComment, replierUserId uuid.UUID) {
	if service.NotificationService == nil {
		return
	}

	go func() {
		tx, err := service.DB.Begin()
		if err != nil {
			return
		}
		defer helper.CommitOrRollback(tx)

		// Get replier info
		user, err := service.UserRepository.FindById(context.Background(), tx, replierUserId)
		if err != nil {
			return
		}

		refType := "company_post_comment_reply"
		service.NotificationService.Create(
			context.Background(),
			parentComment.UserId,
			string(domain.NotificationCategoryEngagement),
			"company_post_comment_reply",
			"Comment Reply",
			fmt.Sprintf("%s replied to your comment on: %s", user.Name, post.Title),
			&post.CompanyId,
			&refType,
			&reply.Id,
		)
	}()
}

// Send notification when someone mentions a user in a sub-reply
func (service *CompanyPostCommentServiceImpl) sendMentionNotification(ctx context.Context, post domain.CompanyPost, comment domain.CompanyPostComment, mentionerUserId uuid.UUID, mentionedComment domain.CompanyPostComment) {
	if service.NotificationService == nil {
		return
	}

	go func() {
		tx, err := service.DB.Begin()
		if err != nil {
			return
		}
		defer helper.CommitOrRollback(tx)

		// Get mentioner info
		user, err := service.UserRepository.FindById(context.Background(), tx, mentionerUserId)
		if err != nil {
			return
		}

		refType := "company_post_comment_mention"
		service.NotificationService.Create(
			context.Background(),
			mentionedComment.UserId,
			string(domain.NotificationCategoryEngagement),
			"company_post_comment_mention",
			"Mentioned in Comment",
			fmt.Sprintf("%s replied to your comment on: %s", user.Name, post.Title),
			&post.CompanyId,
			&refType,
			&comment.Id,
		)
	}()
}
