package domain

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type JobType string
type ExperienceLevel string
type JobVacancyStatus string

const (
	// Job Types
	JobTypeFullTime   JobType = "full_time"
	JobTypePartTime   JobType = "part_time"
	JobTypeContract   JobType = "contract"
	JobTypeInternship JobType = "internship"
	JobTypeFreelance  JobType = "freelance"

	// Experience Levels
	ExperienceLevelEntry     ExperienceLevel = "entry_level"
	ExperienceLevelMid       ExperienceLevel = "mid_level"
	ExperienceLevelSenior    ExperienceLevel = "senior_level"
	ExperienceLevelExecutive ExperienceLevel = "executive"

	// Job Vacancy Status
	JobVacancyStatusDraft     JobVacancyStatus = "draft"
	JobVacancyStatusPublished JobVacancyStatus = "published"
	JobVacancyStatusClosed    JobVacancyStatus = "closed"
	JobVacancyStatusArchived  JobVacancyStatus = "archived"
)

type SkillsArray []string

// Value implements the driver.Valuer interface for SkillsArray
func (sa SkillsArray) Value() (driver.Value, error) {
	if sa == nil {
		return nil, nil
	}
	return json.Marshal(sa)
}

// Scan implements the sql.Scanner interface for SkillsArray
func (sa *SkillsArray) Scan(value interface{}) error {
	if value == nil {
		*sa = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, sa)
}

type JobVacancy struct {
	Id                   uuid.UUID        `json:"id"`
	CompanyId            uuid.UUID        `json:"company_id"`
	CreatorId            uuid.UUID        `json:"creator_id"`
	Title                string           `json:"title"`
	Department           string           `json:"department"`
	JobType              JobType          `json:"job_type"`
	Location             string           `json:"location"`
	SalaryMin            *float64         `json:"salary_min"`
	SalaryMax            *float64         `json:"salary_max"`
	Currency             string           `json:"currency"`
	ExperienceLevel      ExperienceLevel  `json:"experience_level"`
	EducationRequirement string           `json:"education_requirement"`
	JobDescription       string           `json:"job_description"`
	Requirements         string           `json:"requirements"`
	Benefits             string           `json:"benefits"`
	SkillsRequired       SkillsArray      `json:"skills_required"`
	ApplicationDeadline  *time.Time       `json:"application_deadline"`
	Status               JobVacancyStatus `json:"status"`
	IsUrgent             bool             `json:"is_urgent"`
	RemoteWorkAllowed    bool             `json:"remote_work_allowed"`
	ApplicationCount     int              `json:"application_count"`
	ViewCount            int              `json:"view_count"`
	CreatedAt            time.Time        `json:"created_at"`
	UpdatedAt            time.Time        `json:"updated_at"`

	// Relations
	Company *CompanyBriefResponse `json:"company,omitempty"`
	Creator *UserBriefResponse    `json:"creator,omitempty"`
}

type CompanyBriefResponse struct {
	Id       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Logo     *string   `json:"logo"`
	Industry string    `json:"industry"`
	Website  *string   `json:"website"`
}
