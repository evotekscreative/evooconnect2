package web

import "time"

type DetailReportResponse struct {
	ID           string    `json:"id"`
	ReporterID   string    `json:"reporter_id"`
	ReporterName string    `json:"reporter_name"`
	TargetType   string    `json:"target_type"`
	TargetID     string    `json:"target_id"`
	TargetDetail interface{} `json:"target_detail"`
	Reason       string    `json:"reason"`
	Description  string    `json:"description,omitempty"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}

type AdminActionRequest struct {
    Status      string `json:"status" validate:"required,oneof=accepted rejected"`
    Action      string `json:"action,omitempty" validate:"omitempty,oneof=take_down suspend ban"`
    Reason      string `json:"reason" validate:"required"`
    Duration    int    `json:"duration,omitempty"` // Dalam hari, untuk suspend
}

type AdminActionResponse struct {
	ReportID    string    `json:"report_id"`
	Action      string    `json:"action"`
	TargetType  string    `json:"target_type"`
	TargetID    string    `json:"target_id"`
	Reason      string    `json:"reason"`
	Status      string    `json:"status"`
	ExecutedAt  time.Time `json:"executed_at"`
	SuspendedUntil *time.Time `json:"suspended_until,omitempty"`
}