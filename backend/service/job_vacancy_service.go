package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type JobVacancyService interface {
	Create(ctx context.Context, request web.CreateJobVacancyRequest, companyId uuid.UUID, creatorId uuid.UUID) web.JobVacancyResponse
	Update(ctx context.Context, request web.UpdateJobVacancyRequest, jobVacancyId uuid.UUID, creatorId uuid.UUID) web.JobVacancyResponse
	Delete(ctx context.Context, jobVacancyId uuid.UUID, creatorId uuid.UUID)
	FindById(ctx context.Context, jobVacancyId uuid.UUID) web.JobVacancyResponse
	FindByCompany(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) web.JobVacancyListResponse
	FindByCreator(ctx context.Context, creatorId uuid.UUID, limit, offset int) web.JobVacancyListResponse
	FindWithFilters(ctx context.Context, request web.JobVacancyFilterRequest) web.JobVacancyListResponse
	FindPublicJobs(ctx context.Context, request web.PublicJobSearchRequest) web.JobVacancyListResponse
	UpdateStatus(ctx context.Context, jobVacancyId uuid.UUID, status string, userId uuid.UUID) web.JobVacancyResponse
	IncrementViewCount(ctx context.Context, jobVacancyId uuid.UUID)
	GetStats(ctx context.Context, companyId *uuid.UUID) web.JobVacancyStatsResponse
	GetCompanyJobStats(ctx context.Context, companyId uuid.UUID) web.JobVacancyStatsResponse
}
