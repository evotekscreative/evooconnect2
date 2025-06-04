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
}
