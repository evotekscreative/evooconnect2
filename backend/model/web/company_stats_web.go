package web

type CompanyStatsResponse struct {
	TotalPosts        int `json:"total_posts"`
	TotalJobVacancies int `json:"total_job_vacancies"`
	TotalMembers      int `json:"total_members"`
	TotalApplicants   int `json:"total_applicants"`
}
