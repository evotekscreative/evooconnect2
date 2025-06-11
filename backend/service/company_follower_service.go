package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type CompanyFollowerService interface {
	// Core operations
	FollowCompany(ctx context.Context, userId uuid.UUID, request web.FollowCompanyRequest) web.CompanyFollowerResponse
	UnfollowCompany(ctx context.Context, userId uuid.UUID, request web.UnfollowCompanyRequest)

	// Query operations
	GetCompanyFollowers(ctx context.Context, companyId uuid.UUID, limit, offset int) web.CompanyFollowersListResponse
	GetUserFollowingCompanies(ctx context.Context, userId uuid.UUID, limit, offset int) web.UserFollowingCompaniesResponse

	// Check operations
	CheckFollowStatus(ctx context.Context, userId, companyId uuid.UUID) web.FollowStatusResponse

	// Batch operations
	GetFollowStatusForCompanies(ctx context.Context, userId uuid.UUID, companyIds []uuid.UUID) map[string]bool
}
