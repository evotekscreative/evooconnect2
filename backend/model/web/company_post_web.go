package web

import (
	"time"

	"github.com/google/uuid"
)

type CreateCompanyPostRequest struct {
	CompanyId      uuid.UUID `json:"company_id" validate:"required"`
	Title          string    `json:"title" validate:"required,min=1,max=200"`
	Content        string    `json:"content" validate:"required,min=1"`
	Status         string    `json:"status" validate:"required,oneof=draft published"`
	Visibility     string    `json:"visibility" validate:"required,oneof=public members_only"`
	IsAnnouncement bool      `json:"is_announcement"`
}

type UpdateCompanyPostRequest struct {
	Title          string   `json:"title" validate:"required,min=1,max=200"`
	Content        string   `json:"content" validate:"required,min=1"`
	Status         string   `json:"status" validate:"required,oneof=draft published archived"`
	Visibility     string   `json:"visibility" validate:"required,oneof=public members_only"`
	IsAnnouncement bool     `json:"is_announcement"`
	ExistingImages []string `json:"existing_images"`
	RemovedImages  []string `json:"removed_images"`
}

type CompanyPostFilterRequest struct {
	CompanyId  *uuid.UUID `query:"company_id"`
	Status     string     `query:"status"`
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
	Title          string                    `json:"title"`
	Content        string                    `json:"content"`
	Images         []string                  `json:"images"`
	Status         string                    `json:"status"`
	Visibility     string                    `json:"visibility"`
	IsAnnouncement bool                      `json:"is_announcement"`
	CreatedAt      time.Time                 `json:"created_at"`
	UpdatedAt      time.Time                 `json:"updated_at"`
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
