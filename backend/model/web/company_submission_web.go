package web

import (
	"time"

	"github.com/google/uuid"
)

type CreateCompanySubmissionRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	LinkedinUrl string `json:"linkedin_url" validate:"required,min=3,max=100"`
	Website     string `json:"website" validate:"omitempty,url"`
	Industry    string `json:"industry" validate:"required,min=2,max=100"`
	Size        string `json:"size" validate:"required"`
	Type        string `json:"type" validate:"required"`
	Tagline     string `json:"tagline" validate:"omitempty,max=250"`
}

type ReviewCompanySubmissionRequest struct {
	Status          string `json:"status" validate:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejection_reason" validate:"required_if=Status rejected"`
}

type CompanySubmissionResponse struct {
	ID              uuid.UUID          `json:"id"`
	UserId          uuid.UUID          `json:"user_id"`
	Name            string             `json:"name"`
	LinkedinUrl     string             `json:"linkedin_url"`
	Website         string             `json:"website"`
	Industry        string             `json:"industry"`
	Size            string             `json:"size"`
	Type            string             `json:"type"`
	Logo            string             `json:"logo"`
	Tagline         string             `json:"tagline"`
	Status          string             `json:"status"`
	RejectionReason string             `json:"rejection_reason,omitempty"`
	ReviewedBy      *uuid.UUID         `json:"reviewed_by,omitempty"`
	ReviewedAt      *time.Time         `json:"reviewed_at,omitempty"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
	User            *UserBriefResponse `json:"user,omitempty"`
	ReviewedByAdmin *AdminResponse     `json:"reviewed_by_admin,omitempty"`
}

type CompanyResponse struct {
	ID          uuid.UUID          `json:"id"`
	OwnerId     uuid.UUID          `json:"owner_id"`
	Name        string             `json:"name"`
	LinkedinUrl string             `json:"linkedin_url"`
	Website     string             `json:"website"`
	Industry    string             `json:"industry"`
	Size        string             `json:"size"`
	Type        string             `json:"type"`
	Logo        string             `json:"logo"`
	Tagline     string             `json:"tagline"`
	Description string             `json:"description"`
	IsVerified  bool               `json:"is_verified"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	Owner       *UserBriefResponse `json:"owner,omitempty"`
}
