package web

import "time"

type ExperienceCreateRequest struct {
	JobTitle    string  `json:"job_title" validate:"required,min=1,max=100"`
	CompanyName string  `json:"company_name" validate:"required,min=1,max=100"`
	StartMonth  string  `json:"start_month" validate:"required,min=1,max=20"`
	StartYear   string  `json:"start_year" validate:"required,min=4,max=4"`
	EndMonth    *string `json:"end_month"`
	EndYear     *string `json:"end_year"`
	Caption     *string `json:"caption"`
	Photo       *string `json:"photo"`
}

type ExperienceUpdateRequest struct {
	JobTitle    string  `json:"job_title" validate:"required,min=1,max=100"`
	CompanyName string  `json:"company_name" validate:"required,min=1,max=100"`
	StartMonth  string  `json:"start_month" validate:"required,min=1,max=20"`
	StartYear   string  `json:"start_year" validate:"required,min=4,max=4"`
	EndMonth    *string `json:"end_month"`
	EndYear     *string `json:"end_year"`
	Caption     *string `json:"caption"`
	Photo       *string `json:"photo"`
}

type ExperienceResponse struct {
	Id          string    `json:"id"`
	UserId      string    `json:"user_id"`
	JobTitle    string    `json:"job_title"`
	CompanyName string    `json:"company_name"`
	StartMonth  string    `json:"start_month"`
	StartYear   string    `json:"start_year"`
	EndMonth    *string   `json:"end_month"`
	EndYear     *string   `json:"end_year"`
	Caption     *string   `json:"caption"`
	Photo       *string   `json:"photo"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ExperienceListResponse struct {
	Experiences []ExperienceResponse `json:"experiences"`
	Total       int                  `json:"total"`
}
