package web

type CreateReportRequest struct {
	ReporterID   string `json:"reporter_id"`  // diisi dari path
	TargetType   string `json:"target_type"`  // diisi dari path
	TargetID     string `json:"target_id"`    // diisi dari path
	Reason       string `json:"reason"`       // pilihan alasan
	Description  string `json:"description"`  // Ganti dari OtherReason ke Description
}

type ReportResponse struct {
	ID              string    `json:"id"`
	ReporterID      string    `json:"reporter_id"`
	ReporterName    string    `json:"reporter_name,omitempty"`
	TargetType      string    `json:"target_type"`
	TargetID        string    `json:"target_id"`
	Reason          string    `json:"reason"`
	Description     string    `json:"description,omitempty"`
	Status          string    `json:"status"`
	TargetTitle     string    `json:"target_title,omitempty"`
	TargetContent   string    `json:"target_content,omitempty"`
	TargetPhoto     string    `json:"target_photo,omitempty"`
	TargetUsername  string    `json:"target_username,omitempty"`
	TargetAuthorName string   `json:"target_author_name,omitempty"`
	IsReported      bool      `json:"is_reported,omitempty"`
}

type APIResponse struct {
	Code   int         `json:"code"`
	Status string      `json:"status"`
	Error  string      `json:"error,omitempty"`
	Data   interface{} `json:"data,omitempty"`
}