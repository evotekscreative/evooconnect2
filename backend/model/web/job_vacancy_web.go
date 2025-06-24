package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type CreateJobVacancyRequest struct {
	Title               string   `json:"title" validate:"required,min=5,max=200"`
	Description         string   `json:"description" validate:"required,min=50"`
	Requirements        string   `json:"requirements" validate:"required,min=20"`
	Location            string   `json:"location" validate:"required,min=2,max=100"`
	JobType             string   `json:"job_type" validate:"required,oneof=full-time part-time contract internship freelance"`
	ExperienceLevel     string   `json:"experience_level" validate:"required,oneof=entry mid senior lead executive"`
	MinSalary           *float64 `json:"min_salary" validate:"omitempty,min=0"`
	MaxSalary           *float64 `json:"max_salary" validate:"omitempty,min=0"`
	Currency            string   `json:"currency" validate:"required,oneof=USD IDR EUR GBP"`
	Skills              []string `json:"skills" validate:"required,min=1,max=20,dive,min=1,max=50"`
	Benefits            string   `json:"benefits" validate:"omitempty,max=1000"`
	WorkType            string   `json:"work_type" validate:"required,oneof=remote hybrid in-office"`
	ApplicationDeadline *string  `json:"application_deadline" validate:"omitempty"`
	TypeApply           string   `json:"type_apply" validate:"required,oneof=simple_apply external_apply"`
	ExternalLink        *string  `json:"external_link" validate:"required_if=TypeApply external_apply,omitempty,url"`
	// CompanyId           uuid.UUID `json:"company_id" validate:"required,uuid"`
}

type UpdateJobVacancyRequest struct {
	Title               string   `json:"title" validate:"required,min=5,max=200"`
	Description         string   `json:"description" validate:"required,min=50"`
	Requirements        string   `json:"requirements" validate:"required,min=20"`
	Location            string   `json:"location" validate:"required,min=2,max=100"`
	JobType             string   `json:"job_type" validate:"required,oneof=full-time part-time contract internship freelance"`
	ExperienceLevel     string   `json:"experience_level" validate:"required,oneof=entry mid senior lead executive"`
	MinSalary           *float64 `json:"min_salary" validate:"omitempty,min=0"`
	MaxSalary           *float64 `json:"max_salary" validate:"omitempty,min=0"`
	Currency            string   `json:"currency" validate:"required,oneof=USD IDR EUR GBP"`
	Skills              []string `json:"skills" validate:"required,min=1,max=20,dive,min=1,max=50"`
	Benefits            string   `json:"benefits" validate:"omitempty,max=1000"`
	WorkType            string   `json:"work_type" validate:"required,oneof=remote hybrid in-office"`
	ApplicationDeadline *string  `json:"application_deadline" validate:"omitempty"`
	Status              string   `json:"status" validate:"required,oneof=draft active closed archived"`
	TypeApply           string   `json:"type_apply" validate:"required,oneof=simple_apply external_apply"`
	ExternalLink        *string  `json:"external_link" validate:"required_if=TypeApply external_apply,omitempty,url"`
}

// Response models
type JobVacancyResponse struct {
	Id                  string     `json:"id"`
	CompanyId           string     `json:"company_id"`
	CreatorId           *string    `json:"creator_id"`
	Title               string     `json:"title"`
	Description         string     `json:"description"`
	Requirements        string     `json:"requirements"`
	Location            string     `json:"location"`
	JobType             string     `json:"job_type"`
	ExperienceLevel     string     `json:"experience_level"`
	MinSalary           *float64   `json:"min_salary"`
	MaxSalary           *float64   `json:"max_salary"`
	Currency            string     `json:"currency"`
	Skills              []string   `json:"skills"`
	Benefits            string     `json:"benefits"`
	WorkType            string     `json:"work_type"`
	ApplicationDeadline *time.Time `json:"application_deadline"`
	Status              string     `json:"status"`
	TypeApply           string     `json:"type_apply"`
	ExternalLink        *string    `json:"external_link"`
	HasApplied          bool       `json:"has_applied"`
	IsSaved             bool       `json:"is_saved"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	TakenDownAt         *time.Time `json:"taken_down_at,omitempty"`

	// Relations
	Company *CompanyBasicResponse `json:"company,omitempty"`
	Creator *UserBasicResponse    `json:"creator,omitempty"`
}

type CompanyBasicResponse struct {
	Id       string  `json:"id"`
	Name     string  `json:"name"`
	Logo     *string `json:"logo"`
	Industry string  `json:"industry"`
	Location string  `json:"location"`
}

type UserBasicResponse struct {
	Id       string  `json:"id"`
	Name     string  `json:"name"`
	Email    string  `json:"email"`
	Photo    *string `json:"photo"`
	Username string  `json:"username"`
}

// Additional response models for public job listings
type JobVacancyListResponse struct {
	Jobs       []JobVacancyResponse `json:"jobs"`
	TotalCount int                  `json:"total_count"`
	Page       int                  `json:"page"`
	PageSize   int                  `json:"page_size"`
	TotalPages int                  `json:"total_pages"`
}

type JobVacancyPublicResponse struct {
	Id                  string     `json:"id"`
	CompanyId           string     `json:"company_id"`
	Title               string     `json:"title"`
	Description         string     `json:"description"`
	Requirements        string     `json:"requirements"`
	Location            string     `json:"location"`
	JobType             string     `json:"job_type"`
	ExperienceLevel     string     `json:"experience_level"`
	MinSalary           *float64   `json:"min_salary"`
	MaxSalary           *float64   `json:"max_salary"`
	Currency            string     `json:"currency"`
	Skills              []string   `json:"skills"`
	Benefits            string     `json:"benefits"`
	WorkType            string     `json:"work_type"`
	ApplicationDeadline *time.Time `json:"application_deadline"`
	TypeApply           string     `json:"type_apply"`
	ExternalLink        *string    `json:"external_link"`
	HasApplied          bool       `json:"has_applied"`
	IsSaved             bool       `json:"is_saved"`
	CreatedAt           time.Time  `json:"created_at"`

	Company *CompanyBasicResponse `json:"company,omitempty"`
}

// Search and filter models
type JobVacancySearchRequest struct {
	Search          string   `json:"search"`
	Location        string   `json:"location"`
	JobType         string   `json:"job_type"`
	ExperienceLevel string   `json:"experience_level"`
	WorkType        string   `json:"work_type"`
	MinSalary       *float64 `json:"min_salary"`
	MaxSalary       *float64 `json:"max_salary"`
	Skills          []string `json:"skills"`
	Page            int      `json:"page"`
	PageSize        int      `json:"page_size"`
}

type JobVacancyBriefResponse struct {
	Id         uuid.UUID             `json:"id"`
	Title      string                `json:"title"`
	JobType    string                `json:"job_type"`
	Location   string                `json:"location"`
	Company    *CompanyBriefResponse `json:"company,omitempty"`
	HasApplied bool                  `json:"has_applied"`
	IsSaved    bool                  `json:"is_saved"`
}
