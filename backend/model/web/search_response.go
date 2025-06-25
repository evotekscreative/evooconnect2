package web

import (
	"time"
)

type SearchResponse struct {
	Users        []UserSearchResult        `json:"users,omitempty"`
	Posts        []PostSearchResult        `json:"posts,omitempty"`
	Blogs        []BlogSearchResult        `json:"blogs,omitempty"`
	Groups       []GroupSearchResult       `json:"groups,omitempty"`
	Companies    []CompanySearchResult     `json:"companies,omitempty"`     
	CompanyPosts []CompanyPostSearchResult `json:"company_posts,omitempty"`
	JobVacancies []JobVacancySearchResult  `json:"job_vacancies,omitempty"` 
}

type UserSearchResult struct {
	Id                 string  `json:"id"`
	Name               string  `json:"name"`
	Username           string  `json:"username"`
	Photo              string  `json:"photo"`
	Headline           *string `json:"headline,omitempty"`
	IsConnected        bool    `json:"is_connected"`
	IsConnectedRequest string  `json:"is_connected_request,omitempty"`
	Highlight          string  `json:"highlight,omitempty"`
}

type PostSearchResult struct {
	Id        string           `json:"id"`
	Content   string           `json:"content"`
	CreatedAt time.Time        `json:"created_at"`
	User      UserSearchResult `json:"user"`
	Highlight string           `json:"highlight,omitempty"`
}

type BlogSearchResult struct {
	Id        string           `json:"id"`
	Title     string           `json:"title"`
	Content   string           `json:"content"`
	Slug      string           `json:"slug"`
	Image     string           `json:"image"`
	CreatedAt string           `json:"created_at"`
	User      UserSearchResult `json:"user"`
	Highlight string           `json:"highlight,omitempty"`
}

type GroupSearchResult struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Image        string `json:"image"`
	MemberCount  int    `json:"member_count"`
	IsMember     bool   `json:"is_member"`
	IsJoined     string `json:"is_joined"`
	PrivacyLevel string `json:"privacy_level"`
}

type CompanySearchResult struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Industry    string    `json:"industry"`
	Size        string    `json:"size"`
	Type        string    `json:"type"`
	Logo        string    `json:"logo"`
	Tagline     string    `json:"tagline"`
	IsVerified  bool      `json:"is_verified"`
	IsFollowing bool      `json:"is_following"`
	CreatedAt   time.Time `json:"created_at"`
}

type CompanyPostSearchResult struct {
	Id              string    `json:"id"`
	CompanyId       string    `json:"company_id"`
	CreatorId       *string   `json:"creator_id"`
	Content         string    `json:"content"`
	CompanyName     string    `json:"company_name"`
	CompanyLogo     string    `json:"company_logo"`
	CreatorName     string    `json:"creator_name"`
	CreatorUsername string    `json:"creator_username"`
	CreatedAt       time.Time `json:"created_at"`
}

type JobVacancySearchResult struct {
	Id              string    `json:"id"`
	CompanyId       string    `json:"company_id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Location        string    `json:"location"`
	JobType         string    `json:"job_type"`
	ExperienceLevel string    `json:"experience_level"`
	MinSalary       *int64    `json:"min_salary"`
	MaxSalary       *int64    `json:"max_salary"`
	Currency        *string   `json:"currency"`
	WorkType        string    `json:"work_type"`
	CompanyName     string    `json:"company_name"`
	CompanyLogo     string    `json:"company_logo"`
	CreatedAt       time.Time `json:"created_at"`
}