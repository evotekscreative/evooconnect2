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
	SQL := `INSERT INTO job_vacancies (id, company_id, creator_id, title, department, job_type, location, 
            salary_min, salary_max, currency, experience_level, education_requirement, job_description, 
            requirements, benefits, skills_required, application_deadline, status, is_urgent, 
            remote_work_allowed, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`

	_, err := tx.ExecContext(ctx, SQL,
		jobVacancy.Id, jobVacancy.CompanyId, jobVacancy.CreatorId, jobVacancy.Title,
		jobVacancy.Department, jobVacancy.JobType, jobVacancy.Location,
		jobVacancy.SalaryMin, jobVacancy.SalaryMax, jobVacancy.Currency,
		jobVacancy.ExperienceLevel, jobVacancy.EducationRequirement,
		jobVacancy.JobDescription, jobVacancy.Requirements, jobVacancy.Benefits,
		jobVacancy.SkillsRequired, jobVacancy.ApplicationDeadline,
		jobVacancy.Status, jobVacancy.IsUrgent, jobVacancy.RemoteWorkAllowed,
		jobVacancy.CreatedAt, jobVacancy.UpdatedAt)
	helper.PanicIfError(err)

	return jobVacancy
}

func (repository *JobVacancyRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, jobVacancy domain.JobVacancy) domain.JobVacancy {
	SQL := `UPDATE job_vacancies SET title = $2, department = $3, job_type = $4, location = $5,
            salary_min = $6, salary_max = $7, currency = $8, experience_level = $9,
            education_requirement = $10, job_description = $11, requirements = $12,
            benefits = $13, skills_required = $14, application_deadline = $15,
            is_urgent = $16, remote_work_allowed = $17, updated_at = $18
            WHERE id = $1`

	_, err := tx.ExecContext(ctx, SQL,
		jobVacancy.Id, jobVacancy.Title, jobVacancy.Department, jobVacancy.JobType,
		jobVacancy.Location, jobVacancy.SalaryMin, jobVacancy.SalaryMax,
		jobVacancy.Currency, jobVacancy.ExperienceLevel, jobVacancy.EducationRequirement,
		jobVacancy.JobDescription, jobVacancy.Requirements, jobVacancy.Benefits,
		jobVacancy.SkillsRequired, jobVacancy.ApplicationDeadline,
		jobVacancy.IsUrgent, jobVacancy.RemoteWorkAllowed, time.Now())
	helper.PanicIfError(err)

	return jobVacancy
}

func (repository *JobVacancyRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) error {
	SQL := `DELETE FROM job_vacancies WHERE id = $1`
	_, err := tx.ExecContext(ctx, SQL, jobVacancyId)
	return err
}

func (repository *JobVacancyRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) (domain.JobVacancy, error) {
	SQL := `SELECT jv.id, jv.company_id, jv.creator_id, jv.title, jv.department, jv.job_type,
            jv.location, jv.salary_min, jv.salary_max, jv.currency, jv.experience_level,
            jv.education_requirement, jv.job_description, jv.requirements, jv.benefits,
            jv.skills_required, jv.application_deadline, jv.status, jv.is_urgent,
            jv.remote_work_allowed, jv.application_count, jv.view_count, jv.created_at, jv.updated_at,
            c.name as company_name, c.logo as company_logo, c.industry as company_industry,
            u.name as creator_name, u.username as creator_username, u.photo as creator_photo
            FROM job_vacancies jv
            LEFT JOIN companies c ON jv.company_id = c.id
            LEFT JOIN users u ON jv.creator_id = u.id
            WHERE jv.id = $1`

	var jobVacancy domain.JobVacancy
	var company domain.CompanyBriefResponse
	var creator domain.UserBriefResponse
	var companyLogo, creatorPhoto sql.NullString

	err := tx.QueryRowContext(ctx, SQL, jobVacancyId).Scan(
		&jobVacancy.Id, &jobVacancy.CompanyId, &jobVacancy.CreatorId,
		&jobVacancy.Title, &jobVacancy.Department, &jobVacancy.JobType,
		&jobVacancy.Location, &jobVacancy.SalaryMin, &jobVacancy.SalaryMax,
		&jobVacancy.Currency, &jobVacancy.ExperienceLevel, &jobVacancy.EducationRequirement,
		&jobVacancy.JobDescription, &jobVacancy.Requirements, &jobVacancy.Benefits,
		&jobVacancy.SkillsRequired, &jobVacancy.ApplicationDeadline,
		&jobVacancy.Status, &jobVacancy.IsUrgent, &jobVacancy.RemoteWorkAllowed,
		&jobVacancy.ApplicationCount, &jobVacancy.ViewCount,
		&jobVacancy.CreatedAt, &jobVacancy.UpdatedAt,
		&company.Name, &companyLogo, &company.Industry,
		&creator.Name, &creator.Username, &creatorPhoto)

	if err != nil {
		return jobVacancy, err
	}

	// Set company relation
	company.Id = jobVacancy.CompanyId
	if companyLogo.Valid {
		company.Logo = &companyLogo.String
	}
	jobVacancy.Company = &company

	// Set creator relation
	creator.Id = jobVacancy.CreatorId
	if creatorPhoto.Valid {
		creator.Photo = creatorPhoto.String
	}
	jobVacancy.Creator = &creator

	return jobVacancy, nil
}

func (repository *JobVacancyRepositoryImpl) FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status string, limit, offset int) ([]domain.JobVacancy, int, error) {
	// Count query
	countSQL := `SELECT COUNT(*) FROM job_vacancies WHERE company_id = $1`
	args := []interface{}{companyId}

	if status != "" {
		countSQL += ` AND status = $2`
		args = append(args, status)
	}

	var total int
	err := tx.QueryRowContext(ctx, countSQL, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query
	dataSQL := `SELECT jv.id, jv.company_id, jv.creator_id, jv.title, jv.department, jv.job_type,
                jv.location, jv.salary_min, jv.salary_max, jv.currency, jv.experience_level,
                jv.education_requirement, jv.job_description, jv.requirements, jv.benefits,
                jv.skills_required, jv.application_deadline, jv.status, jv.is_urgent,
                jv.remote_work_allowed, jv.application_count, jv.view_count, jv.created_at, jv.updated_at,
                c.name as company_name, c.logo as company_logo, c.industry as company_industry,
                u.name as creator_name, u.username as creator_username, u.photo as creator_photo
                FROM job_vacancies jv
                LEFT JOIN companies c ON jv.company_id = c.id
                LEFT JOIN users u ON jv.creator_id = u.id
                WHERE jv.company_id = $1`

	if status != "" {
		dataSQL += ` AND jv.status = $2`
	}
	dataSQL += ` ORDER BY jv.created_at DESC LIMIT $` + fmt.Sprintf("%d", len(args)+1) + ` OFFSET $` + fmt.Sprintf("%d", len(args)+2)

	args = append(args, limit, offset)

	rows, err := tx.QueryContext(ctx, dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.CompanyBriefResponse
		var creator domain.UserBriefResponse
		var companyLogo, creatorPhoto sql.NullString

		err := rows.Scan(
			&jobVacancy.Id, &jobVacancy.CompanyId, &jobVacancy.CreatorId,
			&jobVacancy.Title, &jobVacancy.Department, &jobVacancy.JobType,
			&jobVacancy.Location, &jobVacancy.SalaryMin, &jobVacancy.SalaryMax,
			&jobVacancy.Currency, &jobVacancy.ExperienceLevel, &jobVacancy.EducationRequirement,
			&jobVacancy.JobDescription, &jobVacancy.Requirements, &jobVacancy.Benefits,
			&jobVacancy.SkillsRequired, &jobVacancy.ApplicationDeadline,
			&jobVacancy.Status, &jobVacancy.IsUrgent, &jobVacancy.RemoteWorkAllowed,
			&jobVacancy.ApplicationCount, &jobVacancy.ViewCount,
			&jobVacancy.CreatedAt, &jobVacancy.UpdatedAt,
			&company.Name, &companyLogo, &company.Industry,
			&creator.Name, &creator.Username, &creatorPhoto)

		if err != nil {
			return nil, 0, err
		}

		// Set relations
		company.Id = jobVacancy.CompanyId
		if companyLogo.Valid {
			company.Logo = &companyLogo.String
		}
		jobVacancy.Company = &company

		creator.Id = jobVacancy.CreatorId
		if creatorPhoto.Valid {
			creator.Photo = creatorPhoto.String
		}
		jobVacancy.Creator = &creator

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies, total, nil
}

func (repository *JobVacancyRepositoryImpl) FindByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID, limit, offset int) ([]domain.JobVacancy, int, error) {
	// Count query
	countSQL := `SELECT COUNT(*) FROM job_vacancies WHERE creator_id = $1`
	var total int
	err := tx.QueryRowContext(ctx, countSQL, creatorId).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query with same structure as FindByCompanyId
	dataSQL := `SELECT jv.id, jv.company_id, jv.creator_id, jv.title, jv.department, jv.job_type,
                jv.location, jv.salary_min, jv.salary_max, jv.currency, jv.experience_level,
                jv.education_requirement, jv.job_description, jv.requirements, jv.benefits,
                jv.skills_required, jv.application_deadline, jv.status, jv.is_urgent,
                jv.remote_work_allowed, jv.application_count, jv.view_count, jv.created_at, jv.updated_at,
                c.name as company_name, c.logo as company_logo, c.industry as company_industry,
                u.name as creator_name, u.username as creator_username, u.photo as creator_photo
                FROM job_vacancies jv
                LEFT JOIN companies c ON jv.company_id = c.id
                LEFT JOIN users u ON jv.creator_id = u.id
                WHERE jv.creator_id = $1
                ORDER BY jv.created_at DESC LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, dataSQL, creatorId, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.CompanyBriefResponse
		var creator domain.UserBriefResponse
		var companyLogo, creatorPhoto sql.NullString

		err := rows.Scan(
			&jobVacancy.Id, &jobVacancy.CompanyId, &jobVacancy.CreatorId,
			&jobVacancy.Title, &jobVacancy.Department, &jobVacancy.JobType,
			&jobVacancy.Location, &jobVacancy.SalaryMin, &jobVacancy.SalaryMax,
			&jobVacancy.Currency, &jobVacancy.ExperienceLevel, &jobVacancy.EducationRequirement,
			&jobVacancy.JobDescription, &jobVacancy.Requirements, &jobVacancy.Benefits,
			&jobVacancy.SkillsRequired, &jobVacancy.ApplicationDeadline,
			&jobVacancy.Status, &jobVacancy.IsUrgent, &jobVacancy.RemoteWorkAllowed,
			&jobVacancy.ApplicationCount, &jobVacancy.ViewCount,
			&jobVacancy.CreatedAt, &jobVacancy.UpdatedAt,
			&company.Name, &companyLogo, &company.Industry,
			&creator.Name, &creator.Username, &creatorPhoto)

		if err != nil {
			return nil, 0, err
		}

		// Set relations (same as above)
		company.Id = jobVacancy.CompanyId
		if companyLogo.Valid {
			company.Logo = &companyLogo.String
		}
		jobVacancy.Company = &company

		creator.Id = jobVacancy.CreatorId
		if creatorPhoto.Valid {
			creator.Photo = creatorPhoto.String
		}
		jobVacancy.Creator = &creator

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies, total, nil
}

func (repository *JobVacancyRepositoryImpl) FindWithFilters(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID, jobType, experienceLevel, location, status, search string, remoteWork *bool, salaryMin, salaryMax *float64, limit, offset int) ([]domain.JobVacancy, int, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Build WHERE conditions
	if companyId != nil {
		conditions = append(conditions, fmt.Sprintf("jv.company_id = $%d", argIndex))
		args = append(args, *companyId)
		argIndex++
	}

	if jobType != "" {
		conditions = append(conditions, fmt.Sprintf("jv.job_type = $%d", argIndex))
		args = append(args, jobType)
		argIndex++
	}

	if experienceLevel != "" {
		conditions = append(conditions, fmt.Sprintf("jv.experience_level = $%d", argIndex))
		args = append(args, experienceLevel)
		argIndex++
	}

	if location != "" {
		conditions = append(conditions, fmt.Sprintf("jv.location ILIKE $%d", argIndex))
		args = append(args, "%"+location+"%")
		argIndex++
	}

	if status != "" {
		conditions = append(conditions, fmt.Sprintf("jv.status = $%d", argIndex))
		args = append(args, status)
		argIndex++
	}

	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(jv.title ILIKE $%d OR jv.job_description ILIKE $%d OR c.name ILIKE $%d)", argIndex, argIndex, argIndex))
		args = append(args, "%"+search+"%")
		argIndex++
	}

	if remoteWork != nil {
		conditions = append(conditions, fmt.Sprintf("jv.remote_work_allowed = $%d", argIndex))
		args = append(args, *remoteWork)
		argIndex++
	}

	if salaryMin != nil {
		conditions = append(conditions, fmt.Sprintf("jv.salary_max >= $%d", argIndex))
		args = append(args, *salaryMin)
		argIndex++
	}

	if salaryMax != nil {
		conditions = append(conditions, fmt.Sprintf("jv.salary_min <= $%d", argIndex))
		args = append(args, *salaryMax)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count query
	countSQL := fmt.Sprintf(`SELECT COUNT(*) FROM job_vacancies jv 
                             LEFT JOIN companies c ON jv.company_id = c.id %s`, whereClause)

	var total int
	err := tx.QueryRowContext(ctx, countSQL, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query
	dataSQL := fmt.Sprintf(`SELECT jv.id, jv.company_id, jv.creator_id, jv.title, jv.department, jv.job_type,
                            jv.location, jv.salary_min, jv.salary_max, jv.currency, jv.experience_level,
                            jv.education_requirement, jv.job_description, jv.requirements, jv.benefits,
                            jv.skills_required, jv.application_deadline, jv.status, jv.is_urgent,
                            jv.remote_work_allowed, jv.application_count, jv.view_count, jv.created_at, jv.updated_at,
                            c.name as company_name, c.logo as company_logo, c.industry as company_industry,
                            u.name as creator_name, u.username as creator_username, u.photo as creator_photo
                            FROM job_vacancies jv
                            LEFT JOIN companies c ON jv.company_id = c.id
                            LEFT JOIN users u ON jv.creator_id = u.id
                            %s ORDER BY jv.created_at DESC LIMIT $%d OFFSET $%d`,
		whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := tx.QueryContext(ctx, dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.CompanyBriefResponse
		var creator domain.UserBriefResponse
		var companyLogo, creatorPhoto sql.NullString

		err := rows.Scan(
			&jobVacancy.Id, &jobVacancy.CompanyId, &jobVacancy.CreatorId,
			&jobVacancy.Title, &jobVacancy.Department, &jobVacancy.JobType,
			&jobVacancy.Location, &jobVacancy.SalaryMin, &jobVacancy.SalaryMax,
			&jobVacancy.Currency, &jobVacancy.ExperienceLevel, &jobVacancy.EducationRequirement,
			&jobVacancy.JobDescription, &jobVacancy.Requirements, &jobVacancy.Benefits,
			&jobVacancy.SkillsRequired, &jobVacancy.ApplicationDeadline,
			&jobVacancy.Status, &jobVacancy.IsUrgent, &jobVacancy.RemoteWorkAllowed,
			&jobVacancy.ApplicationCount, &jobVacancy.ViewCount,
			&jobVacancy.CreatedAt, &jobVacancy.UpdatedAt,
			&company.Name, &companyLogo, &company.Industry,
			&creator.Name, &creator.Username, &creatorPhoto)

		if err != nil {
			return nil, 0, err
		}

		// Set relations
		company.Id = jobVacancy.CompanyId
		if companyLogo.Valid {
			company.Logo = &companyLogo.String
		}
		jobVacancy.Company = &company

		creator.Id = jobVacancy.CreatorId
		if creatorPhoto.Valid {
			creator.Photo = creatorPhoto.String
		}
		jobVacancy.Creator = &creator

		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies, total, nil
}

func (repository *JobVacancyRepositoryImpl) UpdateStatus(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID, status domain.JobVacancyStatus) error {
	SQL := `UPDATE job_vacancies SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := tx.ExecContext(ctx, SQL, status, time.Now(), jobVacancyId)
	return err
}

func (repository *JobVacancyRepositoryImpl) UpdateViewCount(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) error {
	SQL := `UPDATE job_vacancies SET view_count = view_count + 1 WHERE id = $1`
	_, err := tx.ExecContext(ctx, SQL, jobVacancyId)
	return err
}

func (repository *JobVacancyRepositoryImpl) CountByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM job_vacancies WHERE company_id = $1`
	var count int
	err := tx.QueryRowContext(ctx, SQL, companyId).Scan(&count)
	return count, err
}

func (repository *JobVacancyRepositoryImpl) CountByStatus(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status domain.JobVacancyStatus) (int, error) {
	SQL := `SELECT COUNT(*) FROM job_vacancies WHERE company_id = $1 AND status = $2`
	var count int
	err := tx.QueryRowContext(ctx, SQL, companyId, status).Scan(&count)
	return count, err
}

func (repository *JobVacancyRepositoryImpl) GetStats(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID) (map[string]int, error) {
	baseSQL := `SELECT 
                    COUNT(*) as total_vacancies,
                    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_vacancies,
                    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_vacancies,
                    COALESCE(SUM(application_count), 0) as total_applications
                FROM job_vacancies`

	var args []interface{}
	if companyId != nil {
		baseSQL += ` WHERE company_id = $1`
		args = append(args, *companyId)
	}

	var totalVacancies, publishedVacancies, closedVacancies, totalApplications int
	err := tx.QueryRowContext(ctx, baseSQL, args...).Scan(
		&totalVacancies, &publishedVacancies, &closedVacancies, &totalApplications)

	if err != nil {
		return nil, err
	}

	stats := map[string]int{
		"total_vacancies":     totalVacancies,
		"published_vacancies": publishedVacancies,
		"closed_vacancies":    closedVacancies,
		"total_applications":  totalApplications,
	}

	return stats, nil
}
