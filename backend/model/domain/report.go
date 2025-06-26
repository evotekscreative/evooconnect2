package domain

import "time"

type Report struct {
	ID          string
	ReporterID  string
	TargetType  string
	TargetID    string
	Reason      string
	Description string
	Status      string
	CreatedAt   time.Time
}
