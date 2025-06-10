package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CompanyFollowerServiceImpl struct {
	CompanyFollowerRepository repository.CompanyFollowerRepository
	CompanyRepository         repository.CompanyRepository
	UserRepository            repository.UserRepository
	NotificationService       NotificationService
	DB                        *sql.DB
	Validate                  *validator.Validate
}

func NewCompanyFollowerService(
	companyFollowerRepository repository.CompanyFollowerRepository,
	companyRepository repository.CompanyRepository,
	userRepository repository.UserRepository,
	notificationService NotificationService,
	db *sql.DB,
	validate *validator.Validate,
) CompanyFollowerService {
	return &CompanyFollowerServiceImpl{
		CompanyFollowerRepository: companyFollowerRepository,
		CompanyRepository:         companyRepository,
		UserRepository:            userRepository,
		NotificationService:       notificationService,
		DB:                        db,
		Validate:                  validate,
	}
}

func (service *CompanyFollowerServiceImpl) FollowCompany(ctx context.Context, userId uuid.UUID, request web.FollowCompanyRequest) web.CompanyFollowerResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists
	company, err := service.CompanyRepository.FindById(ctx, tx, request.CompanyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Check if user exists
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Check if already following
	isFollowing := service.CompanyFollowerRepository.IsFollowing(ctx, tx, userId, request.CompanyId)
	if isFollowing {
		panic(exception.NewBadRequestError("Already following this company"))
	}

	// Create follow relationship
	follower := domain.CompanyFollower{
		Id:        uuid.New(),
		CompanyId: request.CompanyId,
		UserId:    userId,
		CreatedAt: time.Now(),
	}

	follower = service.CompanyFollowerRepository.Follow(ctx, tx, follower)

	// Send notification to company owner/admins
	go func() {
		notificationCtx := context.Background()
		referenceId := follower.Id
		service.NotificationService.Create(
			notificationCtx,
			company.OwnerId,
			string(domain.NotificationCategoryCompany),
			"company_follow",
			"New Company Follower",
			fmt.Sprintf("%s started following your company %s", user.Name, company.Name),
			&referenceId,
			stringPtr("company_follow"),
			&userId,
		)
	}()

	// Convert to response
	return helper.ToCompanyFollowerResponse(follower)
}

func (service *CompanyFollowerServiceImpl) UnfollowCompany(ctx context.Context, userId uuid.UUID, request web.UnfollowCompanyRequest) {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, request.CompanyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Check if currently following
	isFollowing := service.CompanyFollowerRepository.IsFollowing(ctx, tx, userId, request.CompanyId)
	if !isFollowing {
		panic(exception.NewBadRequestError("Not following this company"))
	}

	// Remove follow relationship
	err = service.CompanyFollowerRepository.Unfollow(ctx, tx, userId, request.CompanyId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to unfollow company"))
	}
}

func (service *CompanyFollowerServiceImpl) GetCompanyFollowers(ctx context.Context, companyId uuid.UUID, limit, offset int) web.CompanyFollowersListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Get followers
	followers, total, err := service.CompanyFollowerRepository.FindFollowersByCompanyId(ctx, tx, companyId, limit, offset)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to get company followers"))
	}

	// Convert to response
	var followerResponses []web.CompanyFollowerResponse
	for _, follower := range followers {
		response := web.CompanyFollowerResponse{
			Id:        follower.Id.String(),
			CompanyId: follower.CompanyId.String(),
			UserId:    follower.UserId.String(),
			CreatedAt: follower.CreatedAt,
		}

		// Add user info if available
		if follower.User != nil {
			response.User = &web.UserBasicInfo{
				Id:       follower.User.Id.String(),
				Name:     follower.User.Name,
				Username: follower.User.Username,
				Avatar:   follower.User.Avatar,
			}
		}

		// Add company info if available
		if follower.Company != nil {
			response.Company = &web.CompanyBasicInfo{
				Id:   follower.Company.Id.String(),
				Name: follower.Company.Name,
				Logo: follower.Company.Logo,
			}
		}

		followerResponses = append(followerResponses, response)
	}

	return web.CompanyFollowersListResponse{
		Followers: followerResponses,
		Total:     total,
		Limit:     limit,
		Offset:    offset,
	}
}

func (service *CompanyFollowerServiceImpl) GetUserFollowingCompanies(ctx context.Context, userId uuid.UUID, limit, offset int) web.UserFollowingCompaniesResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Get following companies
	following, total, err := service.CompanyFollowerRepository.FindFollowingByUserId(ctx, tx, userId, limit, offset)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to get following companies"))
	}

	// Convert to response
	var followingResponses []web.CompanyFollowerResponse
	for _, follow := range following {
		followingResponses = append(followingResponses, helper.ToCompanyFollowerResponse(follow))
	}

	return web.UserFollowingCompaniesResponse{
		Companies: followingResponses,
		Total:     total,
		Limit:     limit,
		Offset:    offset,
	}
}

func (service *CompanyFollowerServiceImpl) CheckFollowStatus(ctx context.Context, userId, companyId uuid.UUID) web.FollowStatusResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	isFollowing := service.CompanyFollowerRepository.IsFollowing(ctx, tx, userId, companyId)

	return web.FollowStatusResponse{
		IsFollowing: isFollowing,
	}
}

func (service *CompanyFollowerServiceImpl) GetFollowStatusForCompanies(ctx context.Context, userId uuid.UUID, companyIds []uuid.UUID) map[string]bool {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	followStatus := service.CompanyFollowerRepository.GetFollowStatusForCompanies(ctx, tx, userId, companyIds)

	// Convert UUID keys to string keys
	result := make(map[string]bool)
	for companyId, isFollowing := range followStatus {
		result[companyId.String()] = isFollowing
	}

	return result
}
