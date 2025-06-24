package repository

import (
	"context"
	"evoconnect/backend/model/domain"
)

type ReportRepository interface {
	Create(ctx context.Context, report domain.Report) (domain.Report, error)
	HasReported(ctx context.Context, reporterID, targetType, targetID string) (bool, error)
	FindAll(ctx context.Context, page, limit int, targetType string) ([]domain.Report, int, error)
	FindById(ctx context.Context, id string) (domain.Report, error)
	UpdateStatus(ctx context.Context, id string, status string) (domain.Report, error)
}