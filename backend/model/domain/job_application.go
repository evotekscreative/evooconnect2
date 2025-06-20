package domain

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type JobApplicationStatus string

const (
	ApplicationStatusSubmitted          JobApplicationStatus = "submitted"
	ApplicationStatusUnderReview        JobApplicationStatus = "under_review"
	ApplicationStatusShortlisted        JobApplicationStatus = "shortlisted"
	ApplicationStatusInterviewScheduled JobApplicationStatus = "interview_scheduled"
	ApplicationStatusAccepted           JobApplicationStatus = "accepted"
	ApplicationStatusRejected           JobApplicationStatus = "rejected"
)

type ContactInfo struct {
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	LinkedIn string `json:"linkedin,omitempty"`
	Address  string `json:"address,omitempty"`
}

// Value implements the driver.Valuer interface for ContactInfo
func (ci ContactInfo) Value() (driver.Value, error) {
	return json.Marshal(ci)
}

// Scan implements the sql.Scanner interface for ContactInfo
func (ci *ContactInfo) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, ci)
}

type JobApplication struct {
	Id                   uuid.UUID            `json:"id"`
	JobVacancyId         uuid.UUID            `json:"job_vacancy_id"`
	ApplicantId          uuid.UUID            `json:"applicant_id"`
	CvFilePath           string               `json:"cv_file_path"`
	ContactInfo          ContactInfo          `json:"contact_info"`
	MotivationLetter     string               `json:"motivation_letter"`
	CoverLetter          string               `json:"cover_letter"`
	ExpectedSalary       *float64             `json:"expected_salary"`
	AvailableStartDate   *time.Time           `json:"available_start_date"`
	Status               JobApplicationStatus `json:"status"`
	RejectionReason      string               `json:"rejection_reason"`
	Notes                string               `json:"notes"`
	ReviewedBy           *uuid.UUID           `json:"reviewed_by"`
	ReviewedAt           *time.Time           `json:"reviewed_at"`
	InterviewScheduledAt *time.Time           `json:"interview_scheduled_at"`
	SubmittedAt          time.Time            `json:"submitted_at"`
	CreatedAt            time.Time            `json:"created_at"`
	UpdatedAt            time.Time            `json:"updated_at"`

	// Relations
	JobVacancy *JobVacancy `json:"job_vacancy,omitempty"`
	Applicant  *User       `json:"applicant,omitempty"`
	Reviewer   *User       `json:"reviewer,omitempty"`
}
