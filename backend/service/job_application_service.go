package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type JobApplicationService interface {
	Create(ctx context.Context, request web.CreateJobApplicationRequest, jobVacancyId uuid.UUID, applicantId uuid.UUID) web.JobApplicationResponse
	Update(ctx context.Context, request web.UpdateJobApplicationRequest, applicationId uuid.UUID, applicantId uuid.UUID) web.JobApplicationResponse
	Delete(ctx context.Context, applicationId uuid.UUID, applicantId uuid.UUID)
	FindById(ctx context.Context, applicationId uuid.UUID) web.JobApplicationResponse
	FindByJobVacancy(ctx context.Context, jobVacancyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse
	FindByApplicant(ctx context.Context, applicantId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse
	FindByCompany(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse
	FindWithFilters(ctx context.Context, request web.JobApplicationFilterRequest) web.JobApplicationListResponse
	ReviewApplication(ctx context.Context, request web.ReviewJobApplicationRequest, applicationId uuid.UUID, reviewerId uuid.UUID) web.JobApplicationResponse
	UploadCV(ctx context.Context, applicationId uuid.UUID, applicantId uuid.UUID, filePath string) web.JobApplicationResponse
	GetStats(ctx context.Context, companyId *uuid.UUID) web.JobApplicationStatsResponse
	HasApplied(ctx context.Context, jobVacancyId, applicantId uuid.UUID) bool
}
