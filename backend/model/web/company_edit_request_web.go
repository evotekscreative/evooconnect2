package web

import (
	"time"
)

type CreateCompanyEditRequestRequest struct {
	Name        string `json:"name" validate:"required,max=100"`
	LinkedinUrl string `json:"linkedin_url" validate:"required,min=3,max=100"`
	Website     string `json:"website"`
	Industry    string `json:"industry" validate:"required,max=100"`
	Size        string `json:"size" validate:"required"`
	Type        string `json:"type" validate:"required"`
	Tagline     string `json:"tagline,omitempty"`
	Location    string `json:"location"  validate:"omitempty,max=250"`
}

type CompanyEditData struct {
	Name        string `json:"name"`
	LinkedinUrl string `json:"linkedin_url"`
	Website     string `json:"website"`
	Industry    string `json:"industry"`
	Size        string `json:"size"`
	Type        string `json:"type"`
	Logo        string `json:"logo"`
	Tagline     string `json:"tagline"`
}

type CompanyEditRequestResponse struct {
	Id               string             `json:"id"`
	CompanyId        string             `json:"company_id"`
	UserId           string             `json:"user_id"`
	RequestedChanges CompanyEditData    `json:"requested_changes"`
	CurrentData      CompanyEditData    `json:"current_data"`
	Status           string             `json:"status"`
	RejectionReason  string             `json:"rejection_reason,omitempty"`
	ReviewedBy       string             `json:"reviewed_by,omitempty"`
	ReviewedAt       *time.Time         `json:"reviewed_at,omitempty"`
	CreatedAt        time.Time          `json:"created_at"`
	UpdatedAt        time.Time          `json:"updated_at"`
	Company          *CompanyResponse   `json:"company,omitempty"`
	User             *UserBriefResponse `json:"user,omitempty"`
}

type ReviewCompanyEditRequestRequest struct {
	Status          string `json:"status" validate:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejection_reason"`
}
