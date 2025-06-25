package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"fmt"
)

type reportRepositoryImpl struct  {
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
		INSERT INTO reports (id, reporter_id, target_type, target_id, reason, description, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(ctx, query,
		report.ID,
		report.ReporterID,
		report.TargetType,
		report.TargetID,
		report.Reason,
		report.Description, // Ganti dari other_reason ke description
		report.Status,
		report.CreatedAt,
	)
	return report, err
}

func (r *reportRepositoryImpl) FindAll(ctx context.Context, page, limit int, targetType string) ([]domain.Report, int, error) {
	offset := (page - 1) * limit
	
	// Query dasar - ganti other_reason ke description
	baseQuery := "SELECT id, reporter_id, target_type, target_id, reason, description, status, created_at FROM reports"
	countQuery := "SELECT COUNT(*) FROM reports"
	
	// Tambahkan filter jika targetType tidak kosong
	var params []interface{}
	var whereClause string
	
	if targetType != "" {
		whereClause = " WHERE target_type = $1"
		params = append(params, targetType)
	}
	
	// Hitung total records
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery+whereClause, params...).Scan(&totalCount)
	if err != nil {
		return nil, 0, err
	}
	
	// Query untuk mendapatkan reports dengan pagination
	query := baseQuery + whereClause + " ORDER BY created_at DESC LIMIT $" + fmt.Sprintf("%d", len(params)+1) + " OFFSET $" + fmt.Sprintf("%d", len(params)+2)
	
	// Tambahkan parameter untuk LIMIT dan OFFSET
	params = append(params, limit, offset)
	
	rows, err := r.db.QueryContext(ctx, query, params...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	
	var reports []domain.Report
	for rows.Next() {
		var report domain.Report
		err := rows.Scan(
			&report.ID,
			&report.ReporterID,
			&report.TargetType,
			&report.TargetID,
			&report.Reason,
			&report.Description, // Ganti dari OtherReason ke Description
			&report.Status,
			&report.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		reports = append(reports, report)
	}
	
	return reports, totalCount, nil
}

func (r *reportRepositoryImpl) FindById(ctx context.Context, id string) (domain.Report, error) {
	query := `
		SELECT id, reporter_id, target_type, target_id, reason, description, status, created_at
		FROM reports
		WHERE id = $1
	`
	
	var report domain.Report
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&report.ID,
		&report.ReporterID,
		&report.TargetType,
		&report.TargetID,
		&report.Reason,
		&report.Description, // Ganti dari OtherReason ke Description
		&report.Status,
		&report.CreatedAt,
	)
	
	if err != nil {
		return domain.Report{}, err
	}
	
	return report, nil
}

func (r *reportRepositoryImpl) UpdateStatus(ctx context.Context, id string, status string) (domain.Report, error) {
	query := `
		UPDATE reports
		SET status = $1
		WHERE id = $2
		RETURNING id, reporter_id, target_type, target_id, reason, description, status, created_at
	`
	
	var report domain.Report
	err := r.db.QueryRowContext(ctx, query, status, id).Scan(
		&report.ID,
		&report.ReporterID,
		&report.TargetType,
		&report.TargetID,
		&report.Reason,
		&report.Description, // Ganti dari OtherReason ke Description
		&report.Status,
		&report.CreatedAt,
	)
	
	if err != nil {
		return domain.Report{}, err
	}
	
	return report, nil
}
