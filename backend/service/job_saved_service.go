package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type SavedJobService interface {
	SaveJob(ctx context.Context, userId, jobVacancyId uuid.UUID) web.SavedJobResponse
	UnsaveJob(ctx context.Context, userId, jobVacancyId uuid.UUID) error
	FindSavedJobs(ctx context.Context, userId uuid.UUID, page, pageSize int) web.SavedJobListResponse
	IsJobSaved(ctx context.Context, userId, jobVacancyId uuid.UUID) bool
}
