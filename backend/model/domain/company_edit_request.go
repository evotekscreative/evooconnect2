package domain

import (
	"github.com/google/uuid"
	"time"
)

type CompanyEditRequestStatus string

const (
	CompanyEditRequestStatusPending  CompanyEditRequestStatus = "pending"
	CompanyEditRequestStatusApproved CompanyEditRequestStatus = "approved"
	CompanyEditRequestStatusRejected CompanyEditRequestStatus = "rejected"
)

type CompanyEditRequest struct {
	Id               uuid.UUID                `db:"id"`
	CompanyId        uuid.UUID                `db:"company_id"`
	UserId           uuid.UUID                `db:"user_id"`
	RequestedChanges string                   `db:"requested_changes"` // JSON string of changes
	CurrentData      string                   `db:"current_data"`      // JSON string of current company data
	Status           CompanyEditRequestStatus `db:"status"`
	RejectionReason  string                   `db:"rejection_reason"`
	ReviewedBy       *uuid.UUID               `db:"reviewed_by"`
	ReviewedAt       *time.Time               `db:"reviewed_at"`
	CreatedAt        time.Time                `db:"created_at"`
	UpdatedAt        time.Time                `db:"updated_at"`

	// Relations
	Company         *Company `db:"-"`
	User            *User    `db:"-"`
	ReviewedByAdmin *Admin   `db:"-"`
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
