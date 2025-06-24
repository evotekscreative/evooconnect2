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
	Phone    string `json:"phone" validate:"required,min=10,max=20"`
	Email    string `json:"email" validate:"required,email"`
	Address  string `json:"address" validate:"required,min=10,max=500"`
	LinkedIn string `json:"linkedin,omitempty" validate:"omitempty,url"`
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
	CvFilePath           string               `json:"cv_file_path"`                   // Changed to string (required)
	ContactInfo          ContactInfo          `json:"contact_info"`                   // Required
	MotivationLetter     *string              `json:"motivation_letter,omitempty"`    // Now optional
	CoverLetter          *string              `json:"cover_letter,omitempty"`         // Now optional
	ExpectedSalary       *float64             `json:"expected_salary,omitempty"`      // Now optional
	AvailableStartDate   *time.Time           `json:"available_start_date,omitempty"` // Now optional
	Status               JobApplicationStatus `json:"status"`
	RejectionReason      *string              `json:"rejection_reason,omitempty"`
	Notes                *string              `json:"notes,omitempty"`
	ReviewedBy           *uuid.UUID           `json:"reviewed_by,omitempty"`
	ReviewedAt           *time.Time           `json:"reviewed_at,omitempty"`
	InterviewScheduledAt *time.Time           `json:"interview_scheduled_at,omitempty"`
	SubmittedAt          time.Time            `json:"submitted_at"`
	CreatedAt            time.Time            `json:"created_at"`
	UpdatedAt            time.Time            `json:"updated_at"`

	// Relations
	JobVacancy *JobVacancy `json:"job_vacancy,omitempty"`
	Applicant  *User       `json:"applicant,omitempty"`
	Reviewer   *User       `json:"reviewer,omitempty"`
}

// New domain for CV storage
type UserCvStorage struct {
	Id               uuid.UUID `json:"id"`
	UserId           uuid.UUID `json:"user_id"`
	CvFilePath       string    `json:"cv_file_path"`
	OriginalFilename string    `json:"original_filename"`
	FileSize         int64     `json:"file_size"`
	UploadedAt       time.Time `json:"uploaded_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
