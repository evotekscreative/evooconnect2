package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type JobApplicationService interface {
	Create(ctx context.Context, request web.CreateJobApplicationRequest, jobVacancyId, applicantId uuid.UUID) web.JobApplicationResponse
	Update(ctx context.Context, request web.UpdateJobApplicationRequest, jobApplicationId, applicantId uuid.UUID) web.JobApplicationResponse
	Delete(ctx context.Context, jobApplicationId, applicantId uuid.UUID)
	FindById(ctx context.Context, jobApplicationId uuid.UUID) web.JobApplicationResponse
	FindByJobVacancyId(ctx context.Context, jobVacancyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse
	FindByApplicantId(ctx context.Context, applicantId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse
	FindByCompanyId(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse
	FindWithFilters(ctx context.Context, request web.JobApplicationFilterRequest) web.JobApplicationListResponse
	ReviewApplication(ctx context.Context, request web.ReviewJobApplicationRequest, jobApplicationId, reviewerId uuid.UUID) web.JobApplicationResponse
	GetStats(ctx context.Context, companyId *uuid.UUID) web.JobApplicationStatsResponse
	HasApplied(ctx context.Context, jobVacancyId, applicantId uuid.UUID) bool
}
