package web

import (
	"time"

	"github.com/google/uuid"
)

// Request models
type CreateJobApplicationRequest struct {
	ContactInfo        ContactInfoRequest `json:"contact_info" validate:"required"`
	MotivationLetter   string             `json:"motivation_letter" validate:"required,min=50,max=2000"`
	CoverLetter        string             `json:"cover_letter" validate:"max=3000"`
	ExpectedSalary     *float64           `json:"expected_salary" validate:"omitempty,min=0"`
	AvailableStartDate *time.Time         `json:"available_start_date"`
}

type UpdateJobApplicationRequest struct {
	ContactInfo        ContactInfoRequest `json:"contact_info" validate:"required"`
	MotivationLetter   string             `json:"motivation_letter" validate:"required,min=50,max=2000"`
	CoverLetter        string             `json:"cover_letter" validate:"max=3000"`
	ExpectedSalary     *float64           `json:"expected_salary" validate:"omitempty,min=0"`
	AvailableStartDate *time.Time         `json:"available_start_date"`
}

type ContactInfoRequest struct {
	Phone    string `json:"phone" validate:"required,min=10,max=20"`
	Email    string `json:"email" validate:"required,email"`
	LinkedIn string `json:"linkedin" validate:"omitempty,url"`
	Address  string `json:"address" validate:"max=500"`
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
	Limit        int        `json:"limit"`
	Offset       int        `json:"offset"`
}

// Response models
type JobApplicationResponse struct {
	Id                 string              `json:"id"`
	JobVacancyId       string              `json:"job_vacancy_id"`
	ApplicantId        string              `json:"applicant_id"`
	ContactInfo        ContactInfoResponse `json:"contact_info"`
	CvFilePath         string              `json:"cv_file_path"`
	MotivationLetter   string              `json:"motivation_letter"`
	CoverLetter        string              `json:"cover_letter"`
	ExpectedSalary     *float64            `json:"expected_salary"`
	AvailableStartDate *time.Time          `json:"available_start_date"`
	Status             string              `json:"status"`
	ReviewedBy         *string             `json:"reviewed_by"`
	ReviewedAt         *time.Time          `json:"reviewed_at"`
	RejectionReason    string              `json:"rejection_reason"`
	Notes              string              `json:"notes"`
	SubmittedAt        time.Time           `json:"submitted_at"`
	CreatedAt          time.Time           `json:"created_at"`
	UpdatedAt          time.Time           `json:"updated_at"`

	// Relations
	JobVacancy *JobVacancyBriefResponse `json:"job_vacancy,omitempty"`
	Applicant  *UserProfileResponse     `json:"applicant,omitempty"`
	Reviewer   *UserMinimal             `json:"reviewer,omitempty"`
}

type ContactInfoResponse struct {
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	LinkedIn string `json:"linkedin,omitempty"`
	Address  string `json:"address,omitempty"`
}

type JobVacancyBriefResponse struct {
	Id       string `json:"id"`
	Title    string `json:"title"`
	Company  string `json:"company"`
	Location string `json:"location"`
	JobType  string `json:"job_type"`
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
}
