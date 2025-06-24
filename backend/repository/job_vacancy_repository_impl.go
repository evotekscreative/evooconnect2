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
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.description, jv.requirements, 
            jv.location, jv.job_type, jv.experience_level, jv.min_salary, jv.max_salary, 
            jv.currency, jv.skills, jv.benefits, jv.work_type, jv.application_deadline, 
            jv.status, jv.type_apply, jv.external_link, jv.created_at, jv.updated_at, jv.taken_down_at,
            c.id as company_id, c.name as company_name, c.logo as company_logo, 
            c.industry as company_industry,
            u.id as creator_id, u.name as creator_name, u.email as creator_email, 
            u.photo as creator_photo, u.username as creator_username
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        LEFT JOIN users u ON jv.creator_id = u.id
        WHERE jv.id = $1`

	var jobVacancy domain.JobVacancy
	var company domain.Company
	var creator domain.User
	var companyLogo, creatorPhoto sql.NullString
	var creatorId sql.NullString
	var minSalary, maxSalary sql.NullFloat64
	var applicationDeadline sql.NullTime
	var externalLink sql.NullString
	var takenDownAt sql.NullTime

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
		&minSalary,
		&maxSalary,
		&jobVacancy.Currency,
		&jobVacancy.Skills,
		&jobVacancy.Benefits,
		&jobVacancy.WorkType,
		&applicationDeadline,
		&jobVacancy.Status,
		&jobVacancy.TypeApply,
		&externalLink,
		&jobVacancy.CreatedAt,
		&jobVacancy.UpdatedAt,
		&takenDownAt,
		&company.Id,
		&company.Name,
		&companyLogo,
		&company.Industry,
		&creatorId,
		&creator.Name,
		&creator.Email,
		&creatorPhoto,
		&creator.Username,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return jobVacancy, fmt.Errorf("job vacancy not found")
		}
		return jobVacancy, err
	}

	// Set company fields with NULL handling
	if companyLogo.Valid {
		company.Logo = companyLogo.String
	}

	// Set creator fields with NULL handling
	if creatorId.Valid {
		creatorUUID, _ := uuid.Parse(creatorId.String)
		creator.Id = creatorUUID
		if creatorPhoto.Valid {
			creator.Photo = creatorPhoto.String
		}
	}

	// Handle nullable fields
	if minSalary.Valid {
		jobVacancy.MinSalary = &minSalary.Float64
	}
	if maxSalary.Valid {
		jobVacancy.MaxSalary = &maxSalary.Float64
	}
	if applicationDeadline.Valid {
		jobVacancy.ApplicationDeadline = &applicationDeadline.Time
	}
	if externalLink.Valid {
		jobVacancy.ExternalLink = &externalLink.String
	}
	if takenDownAt.Valid {
		jobVacancy.TakenDownAt = &takenDownAt.Time
	}

	// Set relations
	jobVacancy.Company = &company
	if creatorId.Valid {
		jobVacancy.Creator = &creator
	}

	return jobVacancy, nil
}
func (repository *JobVacancyRepositoryImpl) FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, limit, offset int) []domain.JobVacancy {
	query := `
		SELECT 
			jv.id, jv.company_id, jv.creator_id, jv.title, jv.description, 
			jv.requirements, jv.location, jv.job_type, jv.experience_level, 
			jv.min_salary, jv.max_salary, jv.currency, jv.skills, jv.benefits, 
			jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
			jv.external_link, jv.created_at, jv.updated_at,
			c.id, c.name, c.logo, c.industry
		FROM job_vacancies jv
		LEFT JOIN companies c ON jv.company_id = c.id
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
		var minSalary, maxSalary sql.NullFloat64
		var applicationDeadline sql.NullTime
		var externalLink sql.NullString
		var creatorId sql.NullString
		var companyLogo, companyIndustry sql.NullString

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&creatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&minSalary,
			&maxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&applicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&externalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&companyLogo,
			&companyIndustry,
		)
		helper.PanicIfError(err)

		// Handle nullable fields
		if creatorId.Valid {
			creatorUUID, _ := uuid.Parse(creatorId.String)
			jobVacancy.CreatorId = &creatorUUID
		}
		if minSalary.Valid {
			jobVacancy.MinSalary = &minSalary.Float64
		}
		if maxSalary.Valid {
			jobVacancy.MaxSalary = &maxSalary.Float64
		}
		if applicationDeadline.Valid {
			jobVacancy.ApplicationDeadline = &applicationDeadline.Time
		}
		if externalLink.Valid {
			jobVacancy.ExternalLink = &externalLink.String
		}

		// Handle nullable company fields
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		if companyIndustry.Valid {
			company.Industry = companyIndustry.String
		}

		jobVacancy.Company = &company
		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) FindByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID, limit, offset int) []domain.JobVacancy {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.min_salary, jv.max_salary, jv.currency, jv.skills, jv.benefits, 
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
		var companyLogo, companyIndustry sql.NullString

		err := rows.Scan(
			&jobVacancy.Id, &jobVacancy.CompanyId, &jobVacancy.CreatorId,
			&jobVacancy.Title, &jobVacancy.Description, &jobVacancy.Requirements,
			&jobVacancy.Location, &jobVacancy.JobType, &jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary, &jobVacancy.MaxSalary, &jobVacancy.Currency,
			&jobVacancy.Skills, &jobVacancy.Benefits, &jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline, &jobVacancy.Status, &jobVacancy.TypeApply,
			&jobVacancy.ExternalLink, &jobVacancy.CreatedAt, &jobVacancy.UpdatedAt,
			&company.Id, &company.Name, &companyLogo, &companyIndustry,
		)
		helper.PanicIfError(err)

		// Handle nullable company fields
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		if companyIndustry.Valid {
			company.Industry = companyIndustry.String
		}

		jobVacancy.Company = &company
		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) CountByCreatorId(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID) int {
	query := `SELECT COUNT(*) FROM job_vacancies WHERE creator_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, query, creatorId).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *JobVacancyRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.JobVacancy {
	query := `
		SELECT 
			jv.id, jv.company_id, jv.creator_id, jv.title, jv.description, 
			jv.requirements, jv.location, jv.job_type, jv.experience_level, 
			jv.min_salary, jv.max_salary, jv.currency, jv.skills, jv.benefits, 
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
		var minSalary, maxSalary sql.NullFloat64
		var applicationDeadline sql.NullTime
		var externalLink sql.NullString
		var creatorId sql.NullString
		var companyLogo, companyIndustry sql.NullString

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&creatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&minSalary,
			&maxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&applicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&externalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&companyLogo,
			&companyIndustry,
		)
		helper.PanicIfError(err)

		// Handle nullable fields
		if creatorId.Valid {
			creatorUUID, _ := uuid.Parse(creatorId.String)
			jobVacancy.CreatorId = &creatorUUID
		}
		if minSalary.Valid {
			jobVacancy.MinSalary = &minSalary.Float64
		}
		if maxSalary.Valid {
			jobVacancy.MaxSalary = &maxSalary.Float64
		}
		if applicationDeadline.Valid {
			jobVacancy.ApplicationDeadline = &applicationDeadline.Time
		}
		if externalLink.Valid {
			jobVacancy.ExternalLink = &externalLink.String
		}

		// Handle nullable company fields
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		if companyIndustry.Valid {
			company.Industry = companyIndustry.String
		}

		jobVacancy.Company = &company
		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) FindActiveJobs(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.JobVacancy {
	query := `
		SELECT 
			jv.id, jv.company_id, jv.creator_id, jv.title, jv.description, 
			jv.requirements, jv.location, jv.job_type, jv.experience_level, 
			jv.min_salary, jv.max_salary, jv.currency, jv.skills, jv.benefits, 
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
		var minSalary, maxSalary sql.NullFloat64
		var applicationDeadline sql.NullTime
		var externalLink sql.NullString
		var creatorId sql.NullString
		var companyLogo, companyIndustry sql.NullString

		err := rows.Scan(
			&jobVacancy.Id,
			&jobVacancy.CompanyId,
			&creatorId,
			&jobVacancy.Title,
			&jobVacancy.Description,
			&jobVacancy.Requirements,
			&jobVacancy.Location,
			&jobVacancy.JobType,
			&jobVacancy.ExperienceLevel,
			&minSalary,
			&maxSalary,
			&jobVacancy.Currency,
			&jobVacancy.Skills,
			&jobVacancy.Benefits,
			&jobVacancy.WorkType,
			&applicationDeadline,
			&jobVacancy.Status,
			&jobVacancy.TypeApply,
			&externalLink,
			&jobVacancy.CreatedAt,
			&jobVacancy.UpdatedAt,
			&company.Id,
			&company.Name,
			&companyLogo,
			&companyIndustry,
		)
		helper.PanicIfError(err)

		// Handle nullable fields
		if creatorId.Valid {
			creatorUUID, _ := uuid.Parse(creatorId.String)
			jobVacancy.CreatorId = &creatorUUID
		}
		if minSalary.Valid {
			jobVacancy.MinSalary = &minSalary.Float64
		}
		if maxSalary.Valid {
			jobVacancy.MaxSalary = &maxSalary.Float64
		}
		if applicationDeadline.Valid {
			jobVacancy.ApplicationDeadline = &applicationDeadline.Time
		}
		if externalLink.Valid {
			jobVacancy.ExternalLink = &externalLink.String
		}

		// Handle nullable company fields
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		if companyIndustry.Valid {
			company.Industry = companyIndustry.String
		}

		jobVacancy.Company = &company
		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) SearchJobs(ctx context.Context, tx *sql.Tx, filters map[string]interface{}, limit, offset int) []domain.JobVacancy {
	baseQuery := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.min_salary, jv.max_salary, jv.currency, jv.skills, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        WHERE jv.status = 'active'`

	var conditions []string
	var args []interface{}
	argIndex := 1

	// Add search filters
	if query, exists := filters["query"]; exists && query != "" {
		conditions = append(conditions, fmt.Sprintf("(jv.title ILIKE $%d OR jv.description ILIKE $%d)", argIndex, argIndex))
		args = append(args, "%"+query.(string)+"%")
		argIndex++
	}

	if location, exists := filters["location"]; exists && location != "" {
		if locations, ok := location.([]string); ok && len(locations) > 0 {
			placeholders := make([]string, len(locations))
			for i, loc := range locations {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, "%"+loc+"%")
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("(%s)", strings.Join(func() []string {
				var locConditions []string
				for _, placeholder := range placeholders {
					locConditions = append(locConditions, fmt.Sprintf("jv.location ILIKE %s", placeholder))
				}
				return locConditions
			}(), " OR ")))
		} else if loc, ok := location.(string); ok && loc != "" {
			conditions = append(conditions, fmt.Sprintf("jv.location ILIKE $%d", argIndex))
			args = append(args, "%"+loc+"%")
			argIndex++
		}
	}

	if jobTypes, exists := filters["job_type"]; exists {
		if types, ok := jobTypes.([]string); ok && len(types) > 0 {
			placeholders := make([]string, len(types))
			for i, jt := range types {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, jt)
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("jv.job_type IN (%s)", strings.Join(placeholders, ",")))
		}
	}

	if experienceLevels, exists := filters["experience_level"]; exists {
		if levels, ok := experienceLevels.([]string); ok && len(levels) > 0 {
			placeholders := make([]string, len(levels))
			for i, el := range levels {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, el)
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("jv.experience_level IN (%s)", strings.Join(placeholders, ",")))
		}
	}

	if workTypes, exists := filters["work_type"]; exists {
		if types, ok := workTypes.([]string); ok && len(types) > 0 {
			placeholders := make([]string, len(types))
			for i, wt := range types {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, wt)
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("jv.work_type IN (%s)", strings.Join(placeholders, ",")))
		}
	}

	if minSalary, exists := filters["min_salary"]; exists && minSalary != nil {
		conditions = append(conditions, fmt.Sprintf("(jv.min_salary IS NULL OR jv.min_salary >= $%d)", argIndex))
		args = append(args, minSalary)
		argIndex++
	}

	if maxSalary, exists := filters["max_salary"]; exists && maxSalary != nil {
		conditions = append(conditions, fmt.Sprintf("(jv.max_salary IS NULL OR jv.max_salary <= $%d)", argIndex))
		args = append(args, maxSalary)
		argIndex++
	}

	if skills, exists := filters["skills"]; exists {
		if skillList, ok := skills.([]string); ok && len(skillList) > 0 {
			var skillConditions []string
			for _, skill := range skillList {
				skillConditions = append(skillConditions, fmt.Sprintf("jv.skills::text ILIKE $%d", argIndex))
				args = append(args, "%\""+skill+"\"%")
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("(%s)", strings.Join(skillConditions, " OR ")))
		}
	}

	if companyId, exists := filters["company_id"]; exists && companyId != "" {
		conditions = append(conditions, fmt.Sprintf("jv.company_id = $%d", argIndex))
		args = append(args, companyId)
		argIndex++
	}

	// Build final query
	if len(conditions) > 0 {
		baseQuery += " AND " + strings.Join(conditions, " AND ")
	}

	baseQuery += fmt.Sprintf(" ORDER BY jv.created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	rows, err := tx.QueryContext(ctx, baseQuery, args...)
	helper.PanicIfError(err)
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.Company
		var companyLogo, companyIndustry sql.NullString

		err := rows.Scan(
			&jobVacancy.Id, &jobVacancy.CompanyId, &jobVacancy.CreatorId,
			&jobVacancy.Title, &jobVacancy.Description, &jobVacancy.Requirements,
			&jobVacancy.Location, &jobVacancy.JobType, &jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary, &jobVacancy.MaxSalary, &jobVacancy.Currency,
			&jobVacancy.Skills, &jobVacancy.Benefits, &jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline, &jobVacancy.Status, &jobVacancy.TypeApply,
			&jobVacancy.ExternalLink, &jobVacancy.CreatedAt, &jobVacancy.UpdatedAt,
			&company.Id, &company.Name, &companyLogo, &companyIndustry,
		)
		helper.PanicIfError(err)

		// Handle nullable company fields
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		if companyIndustry.Valid {
			company.Industry = companyIndustry.String
		}

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
	baseQuery := `
        SELECT COUNT(*)
        FROM job_vacancies jv
        WHERE jv.status = 'active'`

	var conditions []string
	var args []interface{}
	argIndex := 1

	// Add the same filters as in SearchJobs
	if query, exists := filters["query"]; exists && query != "" {
		conditions = append(conditions, fmt.Sprintf("(jv.title ILIKE $%d OR jv.description ILIKE $%d)", argIndex, argIndex))
		args = append(args, "%"+query.(string)+"%")
		argIndex++
	}

	if location, exists := filters["location"]; exists && location != "" {
		if locations, ok := location.([]string); ok && len(locations) > 0 {
			placeholders := make([]string, len(locations))
			for i, loc := range locations {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, "%"+loc+"%")
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("(%s)", strings.Join(func() []string {
				var locConditions []string
				for _, placeholder := range placeholders {
					locConditions = append(locConditions, fmt.Sprintf("jv.location ILIKE %s", placeholder))
				}
				return locConditions
			}(), " OR ")))
		} else if loc, ok := location.(string); ok && loc != "" {
			conditions = append(conditions, fmt.Sprintf("jv.location ILIKE $%d", argIndex))
			args = append(args, "%"+loc+"%")
			argIndex++
		}
	}

	if jobTypes, exists := filters["job_type"]; exists {
		if types, ok := jobTypes.([]string); ok && len(types) > 0 {
			placeholders := make([]string, len(types))
			for i, jt := range types {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, jt)
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("jv.job_type IN (%s)", strings.Join(placeholders, ",")))
		}
	}

	if experienceLevels, exists := filters["experience_level"]; exists {
		if levels, ok := experienceLevels.([]string); ok && len(levels) > 0 {
			placeholders := make([]string, len(levels))
			for i, el := range levels {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, el)
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("jv.experience_level IN (%s)", strings.Join(placeholders, ",")))
		}
	}

	if workTypes, exists := filters["work_type"]; exists {
		if types, ok := workTypes.([]string); ok && len(types) > 0 {
			placeholders := make([]string, len(types))
			for i, wt := range types {
				placeholders[i] = fmt.Sprintf("$%d", argIndex)
				args = append(args, wt)
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("jv.work_type IN (%s)", strings.Join(placeholders, ",")))
		}
	}

	if minSalary, exists := filters["min_salary"]; exists && minSalary != nil {
		conditions = append(conditions, fmt.Sprintf("(jv.min_salary IS NULL OR jv.min_salary >= $%d)", argIndex))
		args = append(args, minSalary)
		argIndex++
	}

	if maxSalary, exists := filters["max_salary"]; exists && maxSalary != nil {
		conditions = append(conditions, fmt.Sprintf("(jv.max_salary IS NULL OR jv.max_salary <= $%d)", argIndex))
		args = append(args, maxSalary)
		argIndex++
	}

	if skills, exists := filters["skills"]; exists {
		if skillList, ok := skills.([]string); ok && len(skillList) > 0 {
			var skillConditions []string
			for _, skill := range skillList {
				skillConditions = append(skillConditions, fmt.Sprintf("jv.skills::text ILIKE $%d", argIndex))
				args = append(args, "%\""+skill+"\"%")
				argIndex++
			}
			conditions = append(conditions, fmt.Sprintf("(%s)", strings.Join(skillConditions, " OR ")))
		}
	}

	if companyId, exists := filters["company_id"]; exists && companyId != "" {
		conditions = append(conditions, fmt.Sprintf("jv.company_id = $%d", argIndex))
		args = append(args, companyId)
		argIndex++
	}

	// Build final query
	if len(conditions) > 0 {
		baseQuery += " AND " + strings.Join(conditions, " AND ")
	}

	var count int
	err := tx.QueryRowContext(ctx, baseQuery, args...).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *JobVacancyRepositoryImpl) UpdateStatus(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID, status domain.JobVacancyStatus) error {
    var query string
    var args []interface{}
    now := time.Now()

    if status == domain.JobVacancyStatusClosed {
        // Jika status closed, atur taken_down_at ke waktu saat ini
        query = `UPDATE job_vacancies SET status = $1, updated_at = $2, taken_down_at = $3 WHERE id = $4`
        args = []interface{}{status, now, now, jobVacancyId}
    } else {
        // Untuk status lain, tidak perlu mengatur taken_down_at
        query = `UPDATE job_vacancies SET status = $1, updated_at = $2 WHERE id = $3`
        args = []interface{}{status, now, jobVacancyId}
    }

    result, err := tx.ExecContext(ctx, query, args...)
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

func (repository *JobVacancyRepositoryImpl) FindByCompanyIdWithStatus(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status domain.JobVacancyStatus, limit, offset int) []domain.JobVacancy {
	query := `
        SELECT 
            jv.id, jv.company_id, jv.creator_id, jv.title, jv.description, 
            jv.requirements, jv.location, jv.job_type, jv.experience_level, 
            jv.min_salary, jv.max_salary, jv.currency, jv.skills, jv.benefits, 
            jv.work_type, jv.application_deadline, jv.status, jv.type_apply, 
            jv.external_link, jv.created_at, jv.updated_at,
            c.id, c.name, c.logo, c.industry
        FROM job_vacancies jv
        LEFT JOIN companies c ON jv.company_id = c.id
        WHERE jv.company_id = $1 AND jv.status = $2
        ORDER BY jv.created_at DESC
        LIMIT $3 OFFSET $4`

	rows, err := tx.QueryContext(ctx, query, companyId, status, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var jobVacancies []domain.JobVacancy
	for rows.Next() {
		var jobVacancy domain.JobVacancy
		var company domain.Company
		var companyLogo, companyIndustry sql.NullString

		err := rows.Scan(
			&jobVacancy.Id, &jobVacancy.CompanyId, &jobVacancy.CreatorId,
			&jobVacancy.Title, &jobVacancy.Description, &jobVacancy.Requirements,
			&jobVacancy.Location, &jobVacancy.JobType, &jobVacancy.ExperienceLevel,
			&jobVacancy.MinSalary, &jobVacancy.MaxSalary, &jobVacancy.Currency,
			&jobVacancy.Skills, &jobVacancy.Benefits, &jobVacancy.WorkType,
			&jobVacancy.ApplicationDeadline, &jobVacancy.Status, &jobVacancy.TypeApply,
			&jobVacancy.ExternalLink, &jobVacancy.CreatedAt, &jobVacancy.UpdatedAt,
			&company.Id, &company.Name, &companyLogo, &companyIndustry,
		)
		helper.PanicIfError(err)

		// Handle nullable company fields
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		if companyIndustry.Valid {
			company.Industry = companyIndustry.String
		}

		jobVacancy.Company = &company
		jobVacancies = append(jobVacancies, jobVacancy)
	}

	return jobVacancies
}

func (repository *JobVacancyRepositoryImpl) CountByCompanyIdWithStatus(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status domain.JobVacancyStatus) int {
	query := `SELECT COUNT(*) FROM job_vacancies WHERE company_id = $1 AND status = $2`

	var count int
	err := tx.QueryRowContext(ctx, query, companyId, status).Scan(&count)
	helper.PanicIfError(err)

	return count
}
