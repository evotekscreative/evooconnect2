package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"fmt"
)

type reportRepositoryImpl struct {
	db *sql.DB
}

func NewReportRepository(db *sql.DB) ReportRepository {
	return &reportRepositoryImpl{db: db}
}

func (r *reportRepositoryImpl) HasReported(ctx context.Context, reporterID, targetType, targetID string) (bool, error) {
	var count int
	fmt.Printf("sedang mencari report dengan reporterID: %s, targetType: %s, targetID: %s\n", reporterID, targetType, targetID)
	query := `SELECT COUNT(*) FROM reports WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3`
	err := r.db.QueryRowContext(ctx, query, reporterID, targetType, targetID).Scan(&count)
	return count > 0, err
}

func (r *reportRepositoryImpl) Create(ctx context.Context, report domain.Report) (domain.Report, error) {
	query := `
		INSERT INTO reports (id, reporter_id, target_type, target_id, reason, other_reason, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(ctx, query,
		report.ID,
		report.ReporterID,
		report.TargetType,
		report.TargetID,
		report.Reason,
		report.OtherReason,
		report.Status,
		report.CreatedAt,
	)
	return report, err
}
