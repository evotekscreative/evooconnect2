package web

import (
	"time"

	"github.com/google/uuid"
)

type CreateCompanyJoinRequestRequest struct {
	CompanyId uuid.UUID `json:"company_id" validate:"required"`
	Message   string    `json:"message" validate:"required,min=10,max=500"`
}

type ReviewCompanyJoinRequestRequest struct {
	Status          string  `json:"status" validate:"required,oneof=approved rejected"`
	RejectionReason *string `json:"rejection_reason"`
}

type CompanyJoinRequestResponse struct {
	Id              uuid.UUID  `json:"id"`
	UserId          uuid.UUID  `json:"user_id"`
	CompanyId       uuid.UUID  `json:"company_id"`
	Message         string     `json:"message"`
	Status          string     `json:"status"`
	RequestedAt     time.Time  `json:"requested_at"`
	ResponsedAt     *time.Time `json:"responsed_at"`
	ResponseBy      *uuid.UUID `json:"response_by"`
	RejectionReason *string    `json:"rejection_reason"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	// Relations
	User      *UserBriefResponse    `json:"user,omitempty"`
	Company   *CompanyBriefResponse `json:"company,omitempty"`
	Responder *UserBriefResponse    `json:"responder,omitempty"`
}

type CompanyBriefResponse struct {
	Id       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Logo     *string   `json:"logo"`
	Industry string    `json:"industry"`
	Website  *string   `json:"website"`
}
