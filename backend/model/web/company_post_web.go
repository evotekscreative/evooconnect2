package web

import (
	"time"

	"github.com/google/uuid"
)

type CreateCompanyPostRequest struct {
	CompanyId      uuid.UUID `json:"company_id" validate:"required"`
	Content        string    `json:"content" validate:"required,min=1"`
	Visibility     string    `json:"visibility" validate:"required,oneof=public members_only"`
	IsAnnouncement bool      `json:"is_announcement"`
}

type UpdateCompanyPostRequest struct {
	Content        string   `json:"content" validate:"required,min=1"`
	Visibility     string   `json:"visibility" validate:"required,oneof=public members_only"`
	IsAnnouncement bool     `json:"is_announcement"`
	ExistingImages []string `json:"existing_images"`
	RemovedImages  []string `json:"removed_images"`
}

type CompanyPostFilterRequest struct {
	CompanyId  *uuid.UUID `query:"company_id"`
	Visibility string     `query:"visibility"`
	CreatorId  *uuid.UUID `query:"creator_id"`
	Search     string     `query:"search"`
	Limit      int        `query:"limit" validate:"min=1,max=100"`
	Offset     int        `query:"offset" validate:"min=0"`
}

type CompanyPostResponse struct {
	Id             uuid.UUID                 `json:"id"`
	CompanyId      uuid.UUID                 `json:"company_id"`
	CreatorId      uuid.UUID                 `json:"creator_id"`
	Content        string                    `json:"content"`
	Images         []string                  `json:"images"`
	Visibility     string                    `json:"visibility"`
	IsAnnouncement bool                      `json:"is_announcement"`
	CreatedAt      time.Time                 `json:"created_at"`
	UpdatedAt      time.Time                 `json:"updated_at"`
	TakenDownAt    *time.Time                `json:"taken_down_at,omitempty"` // Waktu ketika post diambil turun
	Company        *CompanyBriefResponse     `json:"company,omitempty"`
	Creator        *UserCompanyBriefResponse `json:"creator,omitempty"`

	// Stats
	LikesCount    int  `json:"likes_count"`
	CommentsCount int  `json:"comments_count"`
	IsLiked       bool `json:"is_liked"`
}

type UserCompanyBriefResponse struct {
	Id       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Username string    `json:"username"`
	Photo    string    `json:"photo"`
	Role     string    `json:"role"` // Role dalam company
}

type CompanyPostListResponse struct {
	Posts      []CompanyPostResponse `json:"posts"`
	Pagination PaginationResponse    `json:"pagination"`
}

type PaginationResponse struct {
	Total   int  `json:"total"`
	Limit   int  `json:"limit"`
	Offset  int  `json:"offset"`
	PerPage int  `json:"per_page"`
	HasNext bool `json:"has_next"`
	HasPrev bool `json:"has_prev"`
}
