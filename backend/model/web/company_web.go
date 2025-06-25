package web

import (
	"time"

	"github.com/google/uuid"
)

type CompanySubmissionRequest struct {
	Name        string `json:"name" validate:"required,max=100"`
	LinkedinUrl string `json:"linkedin_url" validate:"required"`
	Website     string `json:"website"`
	Industry    string `json:"industry" validate:"required,max=100"`
	Size        string `json:"size" validate:"required"`
	Type        string `json:"type" validate:"required"`
	Tagline     string `json:"tagline,omitempty"`
}

type CompanyManagementResponse struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	LinkedinUrl string    `json:"linkedin_url"`
	Website     string    `json:"website"`
	Industry    string    `json:"industry"`
	Size        string    `json:"size"`
	Type        string    `json:"type"`
	Logo        string    `json:"logo"`
	Tagline     string    `json:"tagline"`
	Location    string    `json:"location"`
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Additional info for management
	HasPendingEdit bool                         `json:"has_pending_edit"`
	PendingEditId  string                       `json:"pending_edit_id,omitempty"`
	EditRequests   []CompanyEditRequestResponse `json:"edit_requests,omitempty"`

	// info for user
	IsPendingJoinRequest bool       `json:"is_pending_join_request,omitempty"`
	JoinRequestId        *uuid.UUID `json:"join_request_id,omitempty"`
	IsMemberOfCompany    bool       `json:"is_member_of_company"`

	// New follow information
	IsFollowing    bool `json:"is_following,omitempty"`
	FollowersCount int  `json:"followers_count"`
	FollowingCount int  `json:"following_count"`
}

type CompanyPublicResponse struct {
	Id   string `json:"id"`
	Name string `json:"name"`

	LinkedinUrl string    `json:"linkedin_url"`
	Website     string    `json:"website"`
	Industry    string    `json:"industry"`
	Size        string    `json:"size"`
	Type        string    `json:"type"`
	Logo        string    `json:"logo"`
	Tagline     string    `json:"tagline"`
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	TakenDownAt *time.Time `json:"taken_down_at,omitempty"` // For soft delete

	// Owner information
	Owner *UserBasicInfo `json:"owner,omitempty"`
	// Follow information
	IsFollowing    bool `json:"is_following,omitempty"`
	FollowersCount int  `json:"followers_count,omitempty"`
	FollowingCount int  `json:"following_count,omitempty"`
	// Membership information
	IsPendingJoinRequest bool       `json:"is_pending_join_request,omitempty"`
	JoinRequestId        *uuid.UUID `json:"join_request_id,omitempty"`
	IsMemberOfCompany    bool       `json:"is_member_of_company,omitempty"`
	UserRole             string     `json:"user_role,omitempty"`
	// Edit information
	HasPendingEdit bool   `json:"has_pending_edit,omitempty"`
	PendingEditId  string `json:"pending_edit_id,omitempty"`
	// Additional info for management
	EditRequests []CompanyEditRequestResponse `json:"edit_requests,omitempty"`
	// Additional info for public view
	IsPublic bool `json:"is_public,omitempty"` // Indicates if the company is publicly listed
	// Additional info for company detail view
	HasJobVacancies bool `json:"has_job_vacancies,omitempty"` // Indicates if the company has job vacancies
	IsReported       bool `json:"is_reported,omitempty"`
}

// Add new response for company details with follow info
type CompanyDetailResponse struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	LinkedinUrl string    `json:"linkedin_url"`
	Website     string    `json:"website"`
	Industry    string    `json:"industry"`
	Size        string    `json:"size"`
	Type        string    `json:"type"`
	Logo        string    `json:"logo"`
	Tagline     string    `json:"tagline"`
	Location    string    `json:"location"`
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	TakenDownAt *time.Time `json:"taken_down_at,omitempty"`

	// Owner information
	Owner *UserBasicInfo `json:"owner,omitempty"`

	// Follow information
	IsFollowing    bool `json:"is_following"`
	FollowersCount int  `json:"followers_count"`

	// Membership information
	IsPendingJoinRequest bool       `json:"is_pending_join_request"`
	JoinRequestId        *uuid.UUID `json:"join_request_id,omitempty"`
	IsMemberOfCompany    bool       `json:"is_member_of_company"`
	UserRole             string     `json:"user_role,omitempty"`

	// Edit information
	HasPendingEdit bool   `json:"has_pending_edit"`
	PendingEditId  string `json:"pending_edit_id,omitempty"`
	IsReported       bool   `json:"is_reported,omitempty"`
}

// Add to existing responses
type CompanyListResponse struct {
	Companies []CompanyDetailResponse `json:"companies"`
	Total     int                     `json:"total"`
	Limit     int                     `json:"limit"`
	Offset    int                     `json:"offset"`
}
