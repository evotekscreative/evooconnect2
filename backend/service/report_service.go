package service

import (
	"context"
	"evoconnect/backend/model/web"
)

type ReportService interface {
	Create(request web.CreateReportRequest) (web.ReportResponse, error)
	FindAll(ctx context.Context, page, limit int, targetType string) ([]web.ReportResponse, int, error)
	FindById(ctx context.Context, id string) (web.DetailReportResponse, error)
	TakeAction(ctx context.Context, id string, request web.AdminActionRequest) (web.AdminActionResponse, error)
}