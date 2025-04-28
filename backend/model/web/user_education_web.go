package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type CreateEducationRequest struct {
	InstituteName string  `json:"institute_name" validate:"required"`
	Major         string  `json:"major" validate:"required"`
	StartMonth    string  `json:"start_month" validate:"required"`
	StartYear     string  `json:"start_year" validate:"required"`
	EndMonth      *string `json:"end_month"`
	EndYear       *string `json:"end_year"`
	Caption       *string `json:"caption"`
	Photo         *string `json:"photo"`
}

type UpdateEducationRequest struct {
	InstituteName string  `json:"institute_name" validate:"required"`
	Major         string  `json:"major" validate:"required"`
	StartMonth    string  `json:"start_month" validate:"required"`
	StartYear     string  `json:"start_year" validate:"required"`
	EndMonth      *string `json:"end_month"`
	EndYear       *string `json:"end_year"`
	Caption       *string `json:"caption"`
	Photo         *string `json:"photo"`
}

// Response models
type EducationResponse struct {
	Id            uuid.UUID `json:"id"`
	UserId        uuid.UUID `json:"user_id"`
	InstituteName string    `json:"institute_name"`
	Major         string    `json:"major"`
	StartMonth    string    `json:"start_month"`
	StartYear     string    `json:"start_year"`
	EndMonth      *string   `json:"end_month,omitempty"`
	EndYear       *string   `json:"end_year,omitempty"`
	Caption       *string   `json:"caption,omitempty"`
	Photo         *string   `json:"photo,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type EducationListResponse struct {
	Educations []EducationResponse `json:"educations"`
	Total      int                 `json:"total"`
}
