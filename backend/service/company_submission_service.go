package service

import (
	"context"
	"evoconnect/backend/model/web"
	"mime/multipart"

	"github.com/google/uuid"
)

type CompanySubmissionService interface {
	Create(ctx context.Context, userId uuid.UUID, request web.CreateCompanySubmissionRequest, logoFile *multipart.FileHeader) web.CompanySubmissionResponse
	FindById(ctx context.Context, id uuid.UUID) web.CompanySubmissionResponse
	FindByUserId(ctx context.Context, userId uuid.UUID) []web.CompanySubmissionResponse
	FindAll(ctx context.Context, limit, offset int) []web.CompanySubmissionResponse
	FindByStatus(ctx context.Context, status string, limit, offset int) []web.CompanySubmissionResponse
	Review(ctx context.Context, submissionId uuid.UUID, reviewerId uuid.UUID, request web.ReviewCompanySubmissionRequest) web.CompanySubmissionResponse
	GetSubmissionStats(ctx context.Context) map[string]int
}
