package domain

import (
	"github.com/google/uuid"
	"time"
)

type CompanyPost struct {
	Id             uuid.UUID `json:"id"`
	CompanyId      uuid.UUID `json:"company_id"`
	CreatorId      uuid.UUID `json:"creator_id"`
	Title          string    `json:"title"`
	Content        string    `json:"content"`
	Images         []string  `json:"images"`
	Status         string    `json:"status"`     // draft, published, archived
	Visibility     string    `json:"visibility"` // public, members_only
	IsAnnouncement bool      `json:"is_announcement"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	TakenDownAt    *time.Time `json:"taken_down_at,omitempty"` // Waktu ketika post diambil turun

	// Relations
	Company *Company `json:"company,omitempty"`
	Creator *User    `json:"creator,omitempty"`
}

type CompanyPostStatus string

const (
	CompanyPostStatusDraft     CompanyPostStatus = "draft"
	CompanyPostStatusPublished CompanyPostStatus = "published"
	CompanyPostStatusArchived  CompanyPostStatus = "archived"
)

type CompanyPostVisibility string

const (
	CompanyPostVisibilityPublic      CompanyPostVisibility = "public"
	CompanyPostVisibilityMembersOnly CompanyPostVisibility = "members_only"
)

type UserCompanyBriefResponse struct {
	Id       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Username string    `json:"username"`
	Photo    string    `json:"photo"`
	Role     string    `json:"role"` // Role dalam company
}
