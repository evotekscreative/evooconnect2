package repository

import (
	"context"
	"evoconnect/backend/model/domain"
)

type ReportRepository interface {
	Create(ctx context.Context, report domain.Report) (domain.Report, error)
	HasReported(ctx context.Context, reporterID, targetType, targetID string) (bool, error)
}