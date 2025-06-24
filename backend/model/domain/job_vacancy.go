package domain

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type ExperienceLevel string
type JobVacancyStatus string
type WorkType string
type JobApplyType string

const (
	// Job Types
	JobTypeFullTime   string = "full-time"
	JobTypePartTime   string = "part-time"
	JobTypeContract   string = "contract"
	JobTypeInternship string = "internship"
	JobTypeFreelance  string = "freelance"

	// Experience Levels
	ExperienceLevelEntry     ExperienceLevel = "entry"
	ExperienceLevelMid       ExperienceLevel = "mid"
	ExperienceLevelSenior    ExperienceLevel = "senior"
	ExperienceLevelLead      ExperienceLevel = "lead"
	ExperienceLevelExecutive ExperienceLevel = "executive"

	// Job Vacancy Status
	JobVacancyStatusDraft    JobVacancyStatus = "draft"
	JobVacancyStatusActive   JobVacancyStatus = "active"
	JobVacancyStatusClosed   JobVacancyStatus = "closed"
	JobVacancyStatusArchived JobVacancyStatus = "archived"

	// Work Types
	WorkTypeRemote   WorkType = "remote"
	WorkTypeHybrid   WorkType = "hybrid"
	WorkTypeInOffice WorkType = "in-office"

	// Job Apply Types
	JobApplyTypeSimple   JobApplyType = "simple_apply"
	JobApplyTypeExternal JobApplyType = "external_apply"
)

type JobVacancy struct {
	Id                  uuid.UUID        `json:"id"`
	CompanyId           uuid.UUID        `json:"company_id"`
	CreatorId           *uuid.UUID       `json:"creator_id"`
	Title               string           `json:"title"`
	Description         string           `json:"description"`
	Requirements        string           `json:"requirements"`
	Location            string           `json:"location"`
	JobType             string           `json:"job_type"`
	ExperienceLevel     ExperienceLevel  `json:"experience_level"`
	MinSalary           *float64         `json:"min_salary"`
	MaxSalary           *float64         `json:"max_salary"`
	Currency            string           `json:"currency"`
	Skills              SkillsArray      `json:"skills"`
	Benefits            string           `json:"benefits"`
	WorkType            WorkType         `json:"work_type"`
	ApplicationDeadline *time.Time       `json:"application_deadline"`
	Status              JobVacancyStatus `json:"status"`
	TypeApply           JobApplyType     `json:"type_apply"`
	ExternalLink        *string          `json:"external_link"`
	HasApplied          bool             `json:"has_applied"`
	CreatedAt           time.Time        `json:"created_at"`
	UpdatedAt           time.Time        `json:"updated_at"`
	TakenDownAt     *time.Time `json:"taken_down_at,omitempty"`

	// Relations
	Company *Company `json:"company,omitempty"`
	Creator *User    `json:"creator,omitempty"`
}

type SkillsArray []string

// Value implements the driver.Valuer interface for SkillsArray
func (s SkillsArray) Value() (driver.Value, error) {
	if len(s) == 0 {
		return nil, nil
	}
	return json.Marshal(s)
}

// Scan implements the sql.Scanner interface for SkillsArray
func (s *SkillsArray) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, s)
	case string:
		return json.Unmarshal([]byte(v), s)
	default:
		return nil
	}
}
