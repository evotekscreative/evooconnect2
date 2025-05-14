package web

type CreateReportRequest struct {
	ReporterID   string `json:"reporter_id"`  // diisi dari path
	TargetType   string `json:"target_type"`  // diisi dari path
	TargetID     string `json:"target_id"`    // diisi dari path
	Reason       string `json:"reason"`       // pilihan alasan
	OtherReason  string `json:"other_reason"` // isi kalau Reason == "lainnya"
}

type ReportResponse struct {
	ID         string `json:"id"`
	ReporterID string `json:"reporter_id"`
	TargetType string `json:"target_type"`
	TargetID   string `json:"target_id"`
	Reason     string `json:"reason"`
	Status     string `json:"status"`
}

type APIResponse struct {
	Code   int         `json:"code"`
	Status string      `json:"status"`
	Error  string      `json:"error,omitempty"`
	Data   interface{} `json:"data,omitempty"`
}