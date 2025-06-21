package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type SaveJobRequest struct {
	JobVacancyId uuid.UUID `json:"job_vacancy_id" validate:"required"`
}

// Response models
type SavedJobResponse struct {
	Id           uuid.UUID           `json:"id"`
	JobVacancyId uuid.UUID           `json:"job_vacancy_id"`
	UserId       uuid.UUID           `json:"user_id"`
	CreatedAt    time.Time           `json:"created_at"`
	JobVacancy   *JobVacancyResponse `json:"job_vacancy,omitempty"`
}

type SavedJobListResponse struct {
	Jobs       []SavedJobResponse `json:"jobs"`
	TotalCount int                `json:"total_count"`
	Page       int                `json:"page"`
	PageSize   int                `json:"page_size"`
	TotalPages int                `json:"total_pages"`
}
