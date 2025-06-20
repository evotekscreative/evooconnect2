package domain

import (
	"time"

	"github.com/google/uuid"
)

type CompanySubmissionStatus string

const (
	CompanySubmissionStatusPending  CompanySubmissionStatus = "pending"
	CompanySubmissionStatusApproved CompanySubmissionStatus = "approved"
	CompanySubmissionStatusRejected CompanySubmissionStatus = "rejected"
)

type CompanySubmission struct {
	Id              uuid.UUID               `db:"id"`
	UserId          uuid.UUID               `db:"user_id"`
	Name            string                  `db:"name"`
	LinkedinUrl     string                  `db:"linkedin_url"`
	Website         string                  `db:"website"`
	Industry        string                  `db:"industry"`
	Size            string                  `db:"size"`
	Type            string                  `db:"type"`
	Logo            string                  `db:"logo"`
	Tagline         string                  `db:"tagline"`
	Status          CompanySubmissionStatus `db:"status"`
	RejectionReason string                  `db:"rejection_reason"`
	ReviewedBy      *uuid.UUID              `db:"reviewed_by"`
	ReviewedAt      *time.Time              `db:"reviewed_at"`
	DeletedAt       *time.Time              `db:"deleted_at"` // Added for soft delete
	CreatedAt       time.Time               `db:"created_at"`
	UpdatedAt       time.Time               `db:"updated_at"`

	// Relations
	User            *User  `db:"-"`
	ReviewedByAdmin *Admin `db:"-"`
}

type Company struct {
	Id          uuid.UUID `db:"id"`
	OwnerId     uuid.UUID `db:"owner_id"`
	Name        string    `db:"name"`
	LinkedinUrl string    `db:"linkedin_url"`
	Website     string    `db:"website"`
	Industry    string    `db:"industry"`
	Size        string    `db:"size"`
	Type        string    `db:"type"`
	Logo        string    `db:"logo"`
	Tagline     string    `db:"tagline"`
	Description string    `db:"description"`
	IsVerified  bool      `db:"is_verified"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`

	// Relations
	Owner *User `db:"-"`
}

type CompanyFollower struct {
	Id        uuid.UUID `json:"id"`
	CompanyId uuid.UUID `json:"company_id"`
	UserId    uuid.UUID `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relations
	Company *Company       `json:"company,omitempty"`
	User    *UserBasicInfo `json:"user,omitempty"`
}

type UserBasicInfo struct {
	Id       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Username string    `json:"username"`
	Photo    string    `json:"photo"`
}
