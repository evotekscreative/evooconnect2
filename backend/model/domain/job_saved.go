package domain

import (
	"time"

	"github.com/google/uuid"
)

type SavedJob struct {
	Id           uuid.UUID `json:"id"`
	UserId       uuid.UUID `json:"user_id"`
	JobVacancyId uuid.UUID `json:"job_vacancy_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relations
	JobVacancy *JobVacancy `json:"job_vacancy,omitempty"`
	User       *User       `json:"user,omitempty"`
}
