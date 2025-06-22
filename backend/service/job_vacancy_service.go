package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type JobVacancyService interface {
	Create(ctx context.Context, request web.CreateJobVacancyRequest, companyId, creatorId uuid.UUID) web.JobVacancyResponse
	Update(ctx context.Context, request web.UpdateJobVacancyRequest, jobVacancyId uuid.UUID, userId uuid.UUID) web.JobVacancyResponse
	Delete(ctx context.Context, jobVacancyId uuid.UUID, userId uuid.UUID) error
	FindById(ctx context.Context, jobVacancyId uuid.UUID, userId *uuid.UUID) web.JobVacancyResponse
	FindByCompanyId(ctx context.Context, companyId uuid.UUID, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse
	FindByCompanyIdWithStatus(ctx context.Context, companyId uuid.UUID, status string, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse
	FindByCreatorId(ctx context.Context, creatorId uuid.UUID, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse
	FindAll(ctx context.Context, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse
	FindActiveJobs(ctx context.Context, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse
	SearchJobs(ctx context.Context, request web.JobVacancySearchRequest, userId *uuid.UUID) web.JobVacancyListResponse
	UpdateStatus(ctx context.Context, jobVacancyId uuid.UUID, status string, userId uuid.UUID) error
	GetPublicJobDetail(ctx context.Context, jobVacancyId uuid.UUID, userId *uuid.UUID) web.JobVacancyPublicResponse
}
