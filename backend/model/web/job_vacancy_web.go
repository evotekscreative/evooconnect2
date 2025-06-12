package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type CreateJobVacancyRequest struct {
	Title                string     `json:"title" validate:"required,min=3,max=200"`
	Department           string     `json:"department" validate:"max=100"`
	JobType              string     `json:"job_type" validate:"required,oneof=full_time part_time contract internship freelance"`
	Location             string     `json:"location" validate:"required,max=200"`
	SalaryMin            *float64   `json:"salary_min" validate:"omitempty,min=0"`
	SalaryMax            *float64   `json:"salary_max" validate:"omitempty,min=0"`
	Currency             string     `json:"currency" validate:"max=10"`
	ExperienceLevel      string     `json:"experience_level" validate:"required,oneof=entry_level mid_level senior_level executive"`
	EducationRequirement string     `json:"education_requirement" validate:"max=100"`
	JobDescription       string     `json:"job_description" validate:"required,min=50"`
	Requirements         string     `json:"requirements" validate:"required,min=20"`
	Benefits             string     `json:"benefits"`
	SkillsRequired       []string   `json:"skills_required"`
	ApplicationDeadline  *time.Time `json:"application_deadline"`
	IsUrgent             bool       `json:"is_urgent"`
	RemoteWorkAllowed    bool       `json:"remote_work_allowed"`
}

type UpdateJobVacancyRequest struct {
	Title                string     `json:"title" validate:"required,min=3,max=200"`
	Department           string     `json:"department" validate:"max=100"`
	JobType              string     `json:"job_type" validate:"required,oneof=full_time part_time contract internship freelance"`
	Location             string     `json:"location" validate:"required,max=200"`
	SalaryMin            *float64   `json:"salary_min" validate:"omitempty,min=0"`
	SalaryMax            *float64   `json:"salary_max" validate:"omitempty,min=0"`
	Currency             string     `json:"currency" validate:"max=10"`
	ExperienceLevel      string     `json:"experience_level" validate:"required,oneof=entry_level mid_level senior_level executive"`
	EducationRequirement string     `json:"education_requirement" validate:"max=100"`
	JobDescription       string     `json:"job_description" validate:"required,min=50"`
	Requirements         string     `json:"requirements" validate:"required,min=20"`
	Benefits             string     `json:"benefits"`
	SkillsRequired       []string   `json:"skills_required"`
	ApplicationDeadline  *time.Time `json:"application_deadline"`
	IsUrgent             bool       `json:"is_urgent"`
	RemoteWorkAllowed    bool       `json:"remote_work_allowed"`
}

type JobVacancyFilterRequest struct {
	CompanyId       *uuid.UUID `json:"company_id"`
	JobType         string     `json:"job_type"`
	ExperienceLevel string     `json:"experience_level"`
	Location        string     `json:"location"`
	Status          string     `json:"status"`
	Search          string     `json:"search"`
	RemoteWork      *bool      `json:"remote_work"`
	SalaryMin       *float64   `json:"salary_min"`
	SalaryMax       *float64   `json:"salary_max"`
	Limit           int        `json:"limit"`
	Offset          int        `json:"offset"`
}

type PublicJobSearchRequest struct {
	CompanyId       *uuid.UUID `json:"company_id"`
	JobType         string     `json:"job_type"`
	ExperienceLevel string     `json:"experience_level"`
	Location        string     `json:"location"`
	Search          string     `json:"search"`
	RemoteWork      *bool      `json:"remote_work"`
	SalaryMin       *float64   `json:"salary_min"`
	SalaryMax       *float64   `json:"salary_max"`
	Industry        string     `json:"industry"`
	IsUrgent        *bool      `json:"is_urgent"`
	PostedWithin    int        `json:"posted_within"` // days
	SortBy          string     `json:"sort_by"`       // date, salary, relevance
	SortOrder       string     `json:"sort_order"`    // asc, desc
	Limit           int        `json:"limit"`
	Offset          int        `json:"offset"`
}

type UpdateJobStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=draft published closed archived"`
}

// Response models
type JobVacancyResponse struct {
	Id                   string     `json:"id"`
	CompanyId            string     `json:"company_id"`
	CreatorId            string     `json:"creator_id"`
	Title                string     `json:"title"`
	Department           string     `json:"department"`
	JobType              string     `json:"job_type"`
	Location             string     `json:"location"`
	SalaryMin            *float64   `json:"salary_min"`
	SalaryMax            *float64   `json:"salary_max"`
	Currency             string     `json:"currency"`
	ExperienceLevel      string     `json:"experience_level"`
	EducationRequirement string     `json:"education_requirement"`
	JobDescription       string     `json:"job_description"`
	Requirements         string     `json:"requirements"`
	Benefits             string     `json:"benefits"`
	SkillsRequired       []string   `json:"skills_required"`
	ApplicationDeadline  *time.Time `json:"application_deadline"`
	IsUrgent             bool       `json:"is_urgent"`
	RemoteWorkAllowed    bool       `json:"remote_work_allowed"`
	Status               string     `json:"status"`
	ViewCount            int        `json:"view_count"`
	ApplicationCount     int        `json:"application_count"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`

	// Relations
	Company *CompanyBriefResponse `json:"company,omitempty"`
	Creator *UserMinimal          `json:"creator,omitempty"`
}

type JobVacancyListResponse struct {
	JobVacancies []JobVacancyResponse `json:"job_vacancies"`
	Total        int                  `json:"total"`
	Limit        int                  `json:"limit"`
	Offset       int                  `json:"offset"`
}

type JobVacancyStatsResponse struct {
	Published int `json:"published"`
	Draft     int `json:"draft"`
	Closed    int `json:"closed"`
	Archived  int `json:"archived"`
}

// Additional response models for public job listings
type PublicJobResponse struct {
	Id                  string     `json:"id"`
	Title               string     `json:"title"`
	Company             string     `json:"company"`
	CompanyLogo         *string    `json:"company_logo"`
	Location            string     `json:"location"`
	JobType             string     `json:"job_type"`
	ExperienceLevel     string     `json:"experience_level"`
	SalaryRange         string     `json:"salary_range"`
	IsUrgent            bool       `json:"is_urgent"`
	RemoteWorkAllowed   bool       `json:"remote_work_allowed"`
	ApplicationDeadline *time.Time `json:"application_deadline"`
	PostedAt            time.Time  `json:"posted_at"`
	ApplicationCount    int        `json:"application_count"`
	ViewCount           int        `json:"view_count"`
	SkillsRequired      []string   `json:"skills_required"`
}

type PublicJobListResponse struct {
	Jobs   []PublicJobResponse `json:"jobs"`
	Total  int                 `json:"total"`
	Limit  int                 `json:"limit"`
	Offset int                 `json:"offset"`
}
