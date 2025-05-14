package service

import (
	
	"evoconnect/backend/model/web"
)

type ReportService interface {
	Create(request web.CreateReportRequest) (web.ReportResponse, error)
}