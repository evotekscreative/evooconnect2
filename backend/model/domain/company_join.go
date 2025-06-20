package domain

import (
	"time"

	"github.com/google/uuid"
)

type CompanyJoinRequest struct {
	Id              uuid.UUID  `json:"id"`
	UserId          uuid.UUID  `json:"user_id"`
	CompanyId       uuid.UUID  `json:"company_id"`
	Message         string     `json:"message"`
	Status          string     `json:"status"` // pending, approved, rejected
	RequestedAt     time.Time  `json:"requested_at"`
	ResponsedAt     *time.Time `json:"responsed_at"`
	ResponseBy      *uuid.UUID `json:"response_by"`
	RejectionReason *string    `json:"rejection_reason"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	// Relations
	User      *User    `json:"user,omitempty"`
	Company   *Company `json:"company,omitempty"`
	Responder *User    `json:"responder,omitempty"`
}
