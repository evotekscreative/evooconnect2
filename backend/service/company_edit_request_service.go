package service

import (
	"context"
	"evoconnect/backend/model/web"
	"github.com/google/uuid"
	"mime/multipart"
)

type CompanyManagementService interface {
	// User Company Management
	GetAllCompanies(ctx context.Context, userId uuid.UUID, limit, offset int) []web.CompanyManagementResponse
	GetMyCompanies(ctx context.Context, userId uuid.UUID) []web.CompanyManagementResponse
	GetCompanyDetail(ctx context.Context, companyId uuid.UUID, userId uuid.UUID) web.CompanyManagementResponse
	RequestEdit(ctx context.Context, companyId uuid.UUID, userId uuid.UUID, request web.CreateCompanyEditRequestRequest, logoFile *multipart.FileHeader) web.CompanyEditRequestResponse
	GetMyEditRequests(ctx context.Context, userId uuid.UUID) []web.CompanyEditRequestResponse
	DeleteCompany(ctx context.Context, requestId, userId uuid.UUID) error
	DeleteCompanyEditRequest(ctx context.Context, requestId, userId uuid.UUID) error

	// Admin Management
	GetAllEditRequests(ctx context.Context, limit, offset int) []web.CompanyEditRequestResponse
	GetEditRequestsByStatus(ctx context.Context, status string, limit, offset int) []web.CompanyEditRequestResponse
	GetEditRequestDetail(ctx context.Context, requestId uuid.UUID) web.CompanyEditRequestResponse
	ReviewEditRequest(ctx context.Context, requestId uuid.UUID, reviewerId uuid.UUID, request web.ReviewCompanyEditRequestRequest) web.CompanyEditRequestResponse
	GetEditRequestStats(ctx context.Context) map[string]int
}
