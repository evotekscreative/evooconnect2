package service

import (
	"context"
	"evoconnect/backend/model/web"
	"github.com/google/uuid"
	"mime/multipart"
)

type CompanyManagementService interface {
	// User Company Management
	GetAllCompanies(ctx context.Context, userId uuid.UUID, limit, offset int) web.CompanyListResponse
	GetRandomCompanies(ctx context.Context, page, pageSize int) web.CompanyListResponse
	GetMyCompanies(ctx context.Context, userId uuid.UUID) []web.CompanyManagementResponse
	// GetCompanyById(ctx context.Context, companyId uuid.UUID, userId uuid.UUID) web.CompanyPublicResponse
	GetCompanyDetail(ctx context.Context, companyId uuid.UUID, userId uuid.UUID) web.CompanyDetailResponse
	RequestEdit(ctx context.Context, companyId uuid.UUID, userId uuid.UUID, request web.CreateCompanyEditRequestRequest, logoFile *multipart.FileHeader) web.CompanyEditRequestResponse
	GetMyEditRequests(ctx context.Context, userId uuid.UUID) []web.CompanyEditRequestResponse
	GetEditRequestById(ctx context.Context, editRequestId uuid.UUID, userId uuid.UUID) web.CompanyEditRequestResponse
	DeleteCompany(ctx context.Context, requestId, userId uuid.UUID) error
	DeleteCompanyEditRequest(ctx context.Context, requestId, userId uuid.UUID) error

	// Admin Management
	GetAllEditRequests(ctx context.Context, limit, offset int) []web.CompanyEditRequestResponse
	GetEditRequestsByStatus(ctx context.Context, status string, limit, offset int) []web.CompanyEditRequestResponse
	GetEditRequestDetail(ctx context.Context, requestId uuid.UUID) web.CompanyEditRequestResponse
	ReviewEditRequest(ctx context.Context, requestId uuid.UUID, reviewerId uuid.UUID, request web.ReviewCompanyEditRequestRequest) web.CompanyEditRequestResponse
	GetEditRequestStats(ctx context.Context) map[string]int
	GetCompanyStats(ctx context.Context, companyId uuid.UUID) web.CompanyStatsResponse
}
