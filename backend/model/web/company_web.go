package web

import "time"

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
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Additional info for management
	HasPendingEdit bool                         `json:"has_pending_edit"`
	PendingEditId  string                       `json:"pending_edit_id,omitempty"`
	EditRequests   []CompanyEditRequestResponse `json:"edit_requests,omitempty"`

	// info for user
	IsPendingJoinRequest bool `json:"is_pending_join_request,omitempty"`
	IsMemberOfCompany    bool `json:"is_member_of_company"`

	// New follow information
	IsFollowing    bool `json:"is_following,omitempty"`
	FollowersCount int  `json:"followers_count"`
	FollowingCount int  `json:"following_count"`
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
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Owner information
	Owner *UserBasicInfo `json:"owner,omitempty"`

	// Follow information
	IsFollowing    bool `json:"is_following"`
	FollowersCount int  `json:"followers_count"`

	// Membership information
	IsPendingJoinRequest bool   `json:"is_pending_join_request"`
	IsMemberOfCompany    bool   `json:"is_member_of_company"`
	UserRole             string `json:"user_role,omitempty"`

	// Edit information
	HasPendingEdit bool   `json:"has_pending_edit"`
	PendingEditId  string `json:"pending_edit_id,omitempty"`
}

// Add to existing responses
type CompanyListResponse struct {
	Companies []CompanyDetailResponse `json:"companies"`
	Total     int                     `json:"total"`
	Limit     int                     `json:"limit"`
	Offset    int                     `json:"offset"`
}
