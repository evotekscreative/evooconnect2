package web

import (
	"mime/multipart"
	"time"

	"github.com/google/uuid"
)

// Request models
type CreateJobApplicationRequest struct {
	ContactInfo        ContactInfoRequest    `json:"contact_info" validate:"required"`
	CvFile             *multipart.FileHeader `json:"-"`                // For new CV upload
	ExistingCvPath     *string               `json:"existing_cv_path"` // For using existing CV
	MotivationLetter   *string               `json:"motivation_letter" validate:"omitempty,min=50,max=2000"`
	CoverLetter        *string               `json:"cover_letter" validate:"omitempty,max=3000"`
	ExpectedSalary     *float64              `json:"expected_salary" validate:"omitempty,min=0"`
	AvailableStartDate *time.Time            `json:"available_start_date"`
}

type UpdateJobApplicationRequest struct {
	ContactInfo        ContactInfoRequest    `json:"contact_info" validate:"required"`
	CvFile             *multipart.FileHeader `json:"-"`                // For new CV upload
	ExistingCvPath     *string               `json:"existing_cv_path"` // For using existing CV
	MotivationLetter   *string               `json:"motivation_letter" validate:"omitempty,min=50,max=2000"`
	CoverLetter        *string               `json:"cover_letter" validate:"omitempty,max=3000"`
	ExpectedSalary     *float64              `json:"expected_salary" validate:"omitempty,min=0"`
	AvailableStartDate *time.Time            `json:"available_start_date"`
}

type ContactInfoRequest struct {
	Phone    string `json:"phone" validate:"required,min=10,max=20"`
	Email    string `json:"email" validate:"required,email"`
	Address  string `json:"address" validate:"required,min=10,max=500"`
	LinkedIn string `json:"linkedin" validate:"omitempty,url"`
}

type ReviewJobApplicationRequest struct {
	Status          string `json:"status" validate:"required,oneof=under_review shortlisted interview_scheduled accepted rejected"`
	RejectionReason string `json:"rejection_reason" validate:"required_if=Status rejected"`
	Notes           string `json:"notes" validate:"max=1000"`
}

type JobApplicationFilterRequest struct {
	JobVacancyId *uuid.UUID `json:"job_vacancy_id"`
	ApplicantId  *uuid.UUID `json:"applicant_id"`
	ReviewedBy   *uuid.UUID `json:"reviewed_by"`
	CompanyId    *uuid.UUID `json:"company_id"`
	Status       string     `json:"status"`
	Search       string     `json:"search"`
	Limit        int        `json:"limit" validate:"min=1,max=100"`
	Offset       int        `json:"offset" validate:"min=0"`
}

// Response models
type JobApplicationResponse struct {
	Id                   uuid.UUID                `json:"id"`
	JobVacancyId         uuid.UUID                `json:"job_vacancy_id"`
	ApplicantId          uuid.UUID                `json:"applicant_id"`
	CvFilePath           string                   `json:"cv_file_path"`
	ContactInfo          ContactInfoResponse      `json:"contact_info"`
	MotivationLetter     *string                  `json:"motivation_letter,omitempty"`
	CoverLetter          *string                  `json:"cover_letter,omitempty"`
	ExpectedSalary       *float64                 `json:"expected_salary,omitempty"`
	AvailableStartDate   *time.Time               `json:"available_start_date,omitempty"`
	Status               string                   `json:"status"`
	RejectionReason      *string                  `json:"rejection_reason,omitempty"`
	Notes                *string                  `json:"notes,omitempty"`
	ReviewedBy           *uuid.UUID               `json:"reviewed_by,omitempty"`
	ReviewedAt           *time.Time               `json:"reviewed_at,omitempty"`
	InterviewScheduledAt *time.Time               `json:"interview_scheduled_at,omitempty"`
	SubmittedAt          time.Time                `json:"submitted_at"`
	CreatedAt            time.Time                `json:"created_at"`
	UpdatedAt            time.Time                `json:"updated_at"`
	JobVacancy           *JobVacancyBriefResponse `json:"job_vacancy,omitempty"`
	Applicant            *UserBriefResponse       `json:"applicant,omitempty"`
	Reviewer             *UserBriefResponse       `json:"reviewer,omitempty"`
}

type ContactInfoResponse struct {
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Address  string `json:"address"`
	LinkedIn string `json:"linkedin,omitempty"`
}

type JobApplicationListResponse struct {
	Applications []JobApplicationResponse `json:"applications"`
	Total        int                      `json:"total"`
	Limit        int                      `json:"limit"`
	Offset       int                      `json:"offset"`
}

type JobApplicationStatsResponse struct {
	Submitted          int `json:"submitted"`
	UnderReview        int `json:"under_review"`
	Shortlisted        int `json:"shortlisted"`
	InterviewScheduled int `json:"interview_scheduled"`
	Accepted           int `json:"accepted"`
	Rejected           int `json:"rejected"`
	Total              int `json:"total"`
}

// CV Storage models
type UserCvStorageResponse struct {
	Id               uuid.UUID `json:"id"`
	UserId           uuid.UUID `json:"user_id"`
	CvFilePath       string    `json:"cv_file_path"`
	OriginalFilename string    `json:"original_filename"`
	FileSize         int64     `json:"file_size"`
	UploadedAt       time.Time `json:"uploaded_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type UploadCvRequest struct {
	CvFile *multipart.FileHeader `json:"-"`
}

type UploadCvResponse struct {
	Message  string `json:"message"`
	CvPath   string `json:"cv_path"`
	Filename string `json:"filename"`
	FileSize int64  `json:"file_size"`
}
