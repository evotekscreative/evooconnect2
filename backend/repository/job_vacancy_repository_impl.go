package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type JobVacancyRepositoryImpl struct{}

func NewJobVacancyRepository() JobVacancyRepository {
	return &JobVacancyRepositoryImpl{}
}

func (repository *JobVacancyRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, jobVacancy domain.JobVacancy) domain.JobVacancy {
	// Generate UUID if not provided
	if jobVacancy.Id == uuid.Nil {
		jobVacancy.Id = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	jobVacancy.CreatedAt = now
	jobVacancy.UpdatedAt = now

	// Set default status if not provided
	if string(jobVacancy.Status) == "" {
		jobVacancy.Status = domain.JobVacancyStatusDraft
	}

	// Set default work type if not provided
	if string(jobVacancy.WorkType) == "" {
		jobVacancy.WorkType = domain.WorkTypeInOffice
	}

	// Set default type apply if not provided
	if string(jobVacancy.TypeApply) == "" {
		jobVacancy.TypeApply = domain.JobApplyTypeSimple
	}

	// Set default currency if not provided
	if jobVacancy.Currency == "" {
		jobVacancy.Currency = "IDR"
	}

	query := `
        INSERT INTO job_vacancies (
            id, company_id, creator_id, title, description, requirements, 
            location, job_type, experience_level, min_salary, max_salary, 
            currency, skills, benefits, work_type, application_deadline, 
            status, type_apply, external_link, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
            $15, $16, $17, $18, $19, $20, $21
        ) RETURNING id, created_at, updated_at`

	err := tx.QueryRowContext(ctx, query,
		jobVacancy.Id,
		jobVacancy.CompanyId,
		jobVacancy.CreatorId,
		jobVacancy.Title,
		jobVacancy.Description,
		jobVacancy.Requirements,
		jobVacancy.Location,
		jobVacancy.JobType,
		jobVacancy.ExperienceLevel,
		jobVacancy.MinSalary,
		jobVacancy.MaxSalary,
		jobVacancy.Currency,
		jobVacancy.Skills,
		jobVacancy.Benefits,
		jobVacancy.WorkType,
		jobVacancy.ApplicationDeadline,
		jobVacancy.Status,
		jobVacancy.TypeApply,
		jobVacancy.ExternalLink,
		jobVacancy.CreatedAt,
		jobVacancy.UpdatedAt,
	).Scan(&jobVacancy.Id, &jobVacancy.CreatedAt, &jobVacancy.UpdatedAt)

	helper.PanicIfError(err)

	return jobVacancy
}

func (repository *JobVacancyRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, jobVacancy domain.JobVacancy) domain.JobVacancy {
	jobVacancy.UpdatedAt = time.Now()

	query := `
        UPDATE job_vacancies SET 
            title = $2, description = $3, requirements = $4, location = $5, 
            job_type = $6, experience_level = $7, min_salary = $8, max_salary = $9, 
            currency = $10, skills = $11, benefits = $12, work_type = $13, 
            application_deadline = $14, status = $15, type_apply = $16, 
            external_link = $17, updated_at = $18
        WHERE id = $1
        RETURNING updated_at`

	err := tx.QueryRowContext(ctx, query,
		jobVacancy.Id,
		jobVacancy.Title,
		jobVacancy.Description,
		jobVacancy.Requirements,
		jobVacancy.Location,
		jobVacancy.JobType,
		jobVacancy.ExperienceLevel,
		jobVacancy.MinSalary,
		jobVacancy.MaxSalary,
		jobVacancy.Currency,
		jobVacancy.Skills,
		jobVacancy.Benefits,
		jobVacancy.WorkType,
		jobVacancy.ApplicationDeadline,
		jobVacancy.Status,
		jobVacancy.TypeApply,
		jobVacancy.ExternalLink,
		jobVacancy.UpdatedAt,
	).Scan(&jobVacancy.UpdatedAt)

	helper.PanicIfError(err)

	return jobVacancy
}

func (repository *JobVacancyRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) error {
	query := `DELETE FROM job_vacancies WHERE id = $1`

	result, err := tx.ExecContext(ctx, query, jobVacancyId)
	if err != nil {
		return fmt.Errorf("failed to delete job vacancy: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("job vacancy with id %s not found", jobVacancyId)
	}

	return nil
}

func (repository *JobVacancyRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) (domain.JobVacancy, error) {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.job_description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.salary_min, jv.salary_max, jv.currency, jv.skills_required, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry, 
            u.id, u.name, u.email, u.username, u.photo
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        LEFT JOIN users u ON jv.creator_id = u.id
        WHERE jv.id = $1`

	var jobVacancy domain.JobVacancy
	var company domain.Company
	var creator domain.User

	err := tx.QueryRowContext(ctx, query, jobVacancyId).Scan(
		&jobVacancy.Id,
		&jobVacancy.CompanyId,
		&jobVacancy.CreatorId,
		&jobVacancy.Title,
		&jobVacancy.Description,
		&jobVacancy.Requirements,
		&jobVacancy.Location,
		&jobVacancy.JobType,
		&jobVacancy.ExperienceLevel,
		&jobVacancy.MinSalary,
		&jobVacancy.MaxSalary,
		&jobVacancy.Currency,
		&jobVacancy.Skills,
		&jobVacancy.Benefits,
		&jobVacancy.WorkType,
		&jobVacancy.ApplicationDeadline,
		&jobVacancy.Status,
		&jobVacancy.TypeApply,
		&jobVacancy.ExternalLink,
		&jobVacancy.CreatedAt,
		&jobVacancy.UpdatedAt,
		&company.Id,
		&company.Name,
		&company.Logo,
		&company.Industry,
		&creator.Id,
		&creator.Name,
		&creator.Email,
		&creator.Username,
		&creator.Photo,
	)

	if err != nil {
		return jobVacancy, fmt.Errorf("job vacancy not found: %w", err)
	}

	// Set relations
	jobVacancy.Company = &company
	if jobVacancy.CreatorId != nil {
		jobVacancy.Creator = &creator
	}

	return jobVacancy, nil
}

func (repository *JobVacancyRepositoryImpl) FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, limit, offset int) []domain.JobVacancy {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.job_description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.salary_min, jv.salary_max, jv.currency, jv.skills_required, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry,  
            u.id, u.name, u.email, u.username, u.photo
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        LEFT JOIN users u ON jv.creator_id = u.id
        WHERE jv.company_id = $1
        ORDER BY jv.created_at DESC
        LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, query, companyId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.Company
		var creator domain.User

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&jobVacancy.CreatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary,
			&jobVacancy.MaxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&jobVacancy.ExternalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&company.Logo,
			&company.Industry,
			&creator.Id,
			&creator.Name,
			&creator.Email,
			&creator.Username,
			&creator.Photo,
		)
		helper.PanicIfError(err)

		// Set relations
		jobVacancy.Company = &company
		if jobVacancy.CreatorId != nil {
			jobVacancy.Creator = &creator
		}

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) FindByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID, limit, offset int) []domain.JobVacancy {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.job_description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.salary_min, jv.salary_max, jv.currency, jv.skills_required, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        WHERE jv.creator_id = $1
        ORDER BY jv.created_at DESC
        LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, query, creatorId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.Company

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&jobVacancy.CreatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary,
			&jobVacancy.MaxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&jobVacancy.ExternalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&company.Logo,
			&company.Industry,
		)
		helper.PanicIfError(err)

		// Set relations
		jobVacancy.Company = &company

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.JobVacancy {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.job_description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.salary_min, jv.salary_max, jv.currency, jv.skills_required, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        ORDER BY jv.created_at DESC
        LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, query, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.Company

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&jobVacancy.CreatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary,
			&jobVacancy.MaxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&jobVacancy.ExternalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&company.Logo,
			&company.Industry,
		)
		helper.PanicIfError(err)

		// Set relations
		jobVacancy.Company = &company

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) FindActiveJobs(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.JobVacancy {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.job_description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.salary_min, jv.salary_max, jv.currency, jv.skills_required, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        WHERE jv.status = 'active' 
        AND (jv.application_deadline IS NULL OR jv.application_deadline > NOW())
        ORDER BY jv.created_at DESC
        LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, query, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.Company

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&jobVacancy.CreatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary,
			&jobVacancy.MaxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&jobVacancy.ExternalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&company.Logo,
			&company.Industry,
		)
		helper.PanicIfError(err)

		// Set relations
		jobVacancy.Company = &company

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) SearchJobs(ctx context.Context, tx *sql.Tx, filters map[string]interface{}, limit, offset int) []domain.JobVacancy {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.job_description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.salary_min, jv.salary_max, jv.currency, jv.skills_required, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        WHERE jv.status = 'active'`

	args := []interface{}{}
	argIndex := 1

	// Add search filters
	if query_text, ok := filters["query"]; ok && query_text != "" {
		query += fmt.Sprintf(" AND (jv.title ILIKE $%d OR jv.job_description ILIKE $%d)", argIndex, argIndex+1)
		searchTerm := fmt.Sprintf("%%%s%%", query_text)
		args = append(args, searchTerm, searchTerm)
		argIndex += 2
	}

	if location, ok := filters["location"]; ok && location != "" {
		query += fmt.Sprintf(" AND jv.location ILIKE $%d", argIndex)
		args = append(args, fmt.Sprintf("%%%s%%", location))
		argIndex++
	}

	if jobTypes, ok := filters["job_type"]; ok {
		if jobTypeSlice, ok := jobTypes.([]string); ok && len(jobTypeSlice) > 0 {
			placeholders := make([]string, len(jobTypeSlice))
			for i, jobType := range jobTypeSlice {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, jobType)
				argIndex++
			}
			query += fmt.Sprintf(" AND jv.job_type IN (%s)", strings.Join(placeholders, ","))
		}
	}

	if workTypes, ok := filters["work_type"]; ok {
		if workTypeSlice, ok := workTypes.([]string); ok && len(workTypeSlice) > 0 {
			placeholders := make([]string, len(workTypeSlice))
			for i, workType := range workTypeSlice {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, workType)
				argIndex++
			}
			query += fmt.Sprintf(" AND jv.work_type IN (%s)", strings.Join(placeholders, ","))
		}
	}

	if minSalary, ok := filters["min_salary"]; ok && minSalary != nil {
		query += fmt.Sprintf(" AND jv.salary_min >= $%d", argIndex)
		args = append(args, minSalary)
		argIndex++
	}

	if maxSalary, ok := filters["max_salary"]; ok && maxSalary != nil {
		query += fmt.Sprintf(" AND jv.salary_max <= $%d", argIndex)
		args = append(args, maxSalary)
		argIndex++
	}

	if companyId, ok := filters["company_id"]; ok && companyId != "" {
		query += fmt.Sprintf(" AND jv.company_id = $%d", argIndex)
		args = append(args, companyId)
		argIndex++
	}

	query += fmt.Sprintf(" ORDER BY jv.created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	rows, err := tx.QueryContext(ctx, query, args...)
	helper.PanicIfError(err)
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.Company

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&jobVacancy.CreatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary,
			&jobVacancy.MaxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&jobVacancy.ExternalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&company.Logo,
			&company.Industry,
		)
		helper.PanicIfError(err)

		// Set relations
		jobVacancy.Company = &company

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) CountByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) int {
	query := `SELECT COUNT(*) FROM job_vacancies WHERE company_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, query, companyId).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *JobVacancyRepositoryImpl) CountByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID) int {
	query := `SELECT COUNT(*) FROM job_vacancies WHERE creator_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, query, creatorId).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *JobVacancyRepositoryImpl) CountAll(ctx context.Context, tx *sql.Tx) int {
	query := `SELECT COUNT(*) FROM job_vacancies`

	var count int
	err := tx.QueryRowContext(ctx, query).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *JobVacancyRepositoryImpl) CountActiveJobs(ctx context.Context, tx *sql.Tx) int {
	query := `SELECT COUNT(*) FROM job_vacancies WHERE status = 'active' AND (application_deadline IS NULL OR application_deadline > NOW())`

	var count int
	err := tx.QueryRowContext(ctx, query).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *JobVacancyRepositoryImpl) CountSearchResults(ctx context.Context, tx *sql.Tx, filters map[string]interface{}) int {
	query := `SELECT COUNT(*) FROM job_vacancies jv WHERE jv.status = 'active'`

	args := []interface{}{}
	argIndex := 1

	// Add the same filters as in SearchJobs
	if query_text, ok := filters["query"]; ok && query_text != "" {
		query += fmt.Sprintf(" AND (jv.title ILIKE $%d OR jv.job_description ILIKE $%d)", argIndex, argIndex+1)
		searchTerm := fmt.Sprintf("%%%s%%", query_text)
		args = append(args, searchTerm, searchTerm)
		argIndex += 2
	}

	if location, ok := filters["location"]; ok && location != "" {
		query += fmt.Sprintf(" AND jv.location ILIKE $%d", argIndex)
		args = append(args, fmt.Sprintf("%%%s%%", location))
		argIndex++
	}

	if jobTypes, ok := filters["job_type"]; ok {
		if jobTypeSlice, ok := jobTypes.([]string); ok && len(jobTypeSlice) > 0 {
			placeholders := make([]string, len(jobTypeSlice))
			for i, jobType := range jobTypeSlice {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, jobType)
				argIndex++
			}
			query += fmt.Sprintf(" AND jv.job_type IN (%s)", strings.Join(placeholders, ","))
		}
	}

	if workTypes, ok := filters["work_type"]; ok {
		if workTypeSlice, ok := workTypes.([]string); ok && len(workTypeSlice) > 0 {
			placeholders := make([]string, len(workTypeSlice))
			for i, workType := range workTypeSlice {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, workType)
				argIndex++
			}
			query += fmt.Sprintf(" AND jv.work_type IN (%s)", strings.Join(placeholders, ","))
		}
	}

	if minSalary, ok := filters["min_salary"]; ok && minSalary != nil {
		query += fmt.Sprintf(" AND jv.salary_min >= $%d", argIndex)
		args = append(args, minSalary)
		argIndex++
	}

	if maxSalary, ok := filters["max_salary"]; ok && maxSalary != nil {
		query += fmt.Sprintf(" AND jv.salary_max <= $%d", argIndex)
		args = append(args, maxSalary)
		argIndex++
	}

	if companyId, ok := filters["company_id"]; ok && companyId != "" {
		query += fmt.Sprintf(" AND jv.company_id = $%d", argIndex)
		args = append(args, companyId)
		argIndex++
	}

	var count int
	err := tx.QueryRowContext(ctx, query, args...).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *JobVacancyRepositoryImpl) UpdateStatus(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID, status domain.JobVacancyStatus) error {
	query := `UPDATE job_vacancies SET status = $1, updated_at = $2 WHERE id = $3`

	result, err := tx.ExecContext(ctx, query, status, time.Now(), jobVacancyId)
	if err != nil {
		return fmt.Errorf("failed to update job vacancy status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("job vacancy with id %s not found", jobVacancyId)
	}

	return nil
}
