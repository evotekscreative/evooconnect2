package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type FollowCompanyRequest struct {
	CompanyId uuid.UUID `json:"company_id" validate:"required"`
}

type UnfollowCompanyRequest struct {
	CompanyId uuid.UUID `json:"company_id" validate:"required"`
}

// Response models
type CompanyFollowerResponse struct {
	Id        string    `json:"id"`
	CompanyId string    `json:"company_id"`
	UserId    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relations
	Company *CompanyBasicInfo `json:"company,omitempty"`
	User    *UserBasicInfo    `json:"user,omitempty"`
}

type CompanyBasicInfo struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}

type CompanyFollowersListResponse struct {
	Followers []CompanyFollowerResponse `json:"followers"`
	Total     int                       `json:"total"`
	Limit     int                       `json:"limit"`
	Offset    int                       `json:"offset"`
}

type UserFollowingCompaniesResponse struct {
	Companies []CompanyFollowerResponse `json:"companies"`
	Total     int                       `json:"total"`
	Limit     int                       `json:"limit"`
	Offset    int                       `json:"offset"`
}

type FollowStatusResponse struct {
	IsFollowing bool `json:"is_following"`
}
