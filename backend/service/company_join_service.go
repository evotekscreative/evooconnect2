package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type CompanyJoinRequestService interface {
	Create(ctx context.Context, userId uuid.UUID, request web.CreateCompanyJoinRequestRequest) web.CompanyJoinRequestResponse
	FindById(ctx context.Context, requestId uuid.UUID) web.CompanyJoinRequestResponse
	FindByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) []web.CompanyJoinRequestResponse
	FindByCompanyId(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) []web.CompanyJoinRequestResponse
	Review(ctx context.Context, requestId, reviewerId uuid.UUID, request web.ReviewCompanyJoinRequestRequest) web.CompanyJoinRequestResponse
	Cancel(ctx context.Context, requestId, userId uuid.UUID)
	GetPendingCount(ctx context.Context, companyId uuid.UUID) int
}
