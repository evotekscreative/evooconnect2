package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"time"

	"github.com/google/uuid"
)

type SavedJobRepositoryImpl struct{}

func NewSavedJobRepository() SavedJobRepository {
	return &SavedJobRepositoryImpl{}
}

func (repository *SavedJobRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, savedJob domain.SavedJob) domain.SavedJob {
	// Generate UUID if not provided
	if savedJob.Id == uuid.Nil {
		savedJob.Id = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	savedJob.CreatedAt = now
	savedJob.UpdatedAt = now

	query := `
        INSERT INTO saved_jobs (
            id, user_id, job_vacancy_id, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5
        ) RETURNING id, created_at, updated_at`

	row := tx.QueryRowContext(ctx, query,
		savedJob.Id, savedJob.UserId, savedJob.JobVacancyId, savedJob.CreatedAt, savedJob.UpdatedAt)

	var id uuid.UUID
	var createdAt, updatedAt time.Time
	err := row.Scan(&id, &createdAt, &updatedAt)
	helper.PanicIfError(err)

	savedJob.Id = id
	savedJob.CreatedAt = createdAt
	savedJob.UpdatedAt = updatedAt

	return savedJob
}

func (repository *SavedJobRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, userId, jobVacancyId uuid.UUID) error {
	query := `DELETE FROM saved_jobs WHERE user_id = $1 AND job_vacancy_id = $2`
	_, err := tx.ExecContext(ctx, query, userId, jobVacancyId)
	return err
}

func (repository *SavedJobRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.SavedJob, error) {
	query := `
        SELECT s.id, s.user_id, s.job_vacancy_id, s.created_at, s.updated_at 
        FROM saved_jobs s
        WHERE s.id = $1`

	row := tx.QueryRowContext(ctx, query, id)

	var savedJob domain.SavedJob
	err := row.Scan(
		&savedJob.Id,
		&savedJob.UserId,
		&savedJob.JobVacancyId,
		&savedJob.CreatedAt,
		&savedJob.UpdatedAt,
	)

	if err != nil {
		return domain.SavedJob{}, err
	}

	return savedJob, nil
}

func (repository *SavedJobRepositoryImpl) FindByUserIdAndJobVacancyId(ctx context.Context, tx *sql.Tx, userId, jobVacancyId uuid.UUID) (domain.SavedJob, error) {
	query := `
        SELECT s.id, s.user_id, s.job_vacancy_id, s.created_at, s.updated_at 
        FROM saved_jobs s
        WHERE s.user_id = $1 AND s.job_vacancy_id = $2`

	row := tx.QueryRowContext(ctx, query, userId, jobVacancyId)

	var savedJob domain.SavedJob
	err := row.Scan(
		&savedJob.Id,
		&savedJob.UserId,
		&savedJob.JobVacancyId,
		&savedJob.CreatedAt,
		&savedJob.UpdatedAt,
	)

	if err != nil {
		return domain.SavedJob{}, errors.New("saved job not found")
	}

	return savedJob, nil
}

func (repository *SavedJobRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) []domain.SavedJob {
	query := `
        SELECT s.id, s.user_id, s.job_vacancy_id, s.created_at, s.updated_at,
               j.id, j.company_id, j.creator_id, j.title, j.description, j.requirements, 
               j.location, j.job_type, j.experience_level, j.min_salary, j.max_salary, 
               j.currency, j.skills, j.benefits, j.work_type, j.application_deadline, 
               j.status, j.type_apply, j.external_link, j.created_at, j.updated_at,
               c.id, c.name, c.logo
        FROM saved_jobs s
        JOIN job_vacancies j ON s.job_vacancy_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
        LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, query, userId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var savedJobs []domain.SavedJob
	for rows.Next() {
		var savedJob domain.SavedJob
		var jobVacancy domain.JobVacancy
		var company domain.Company

		// Nullable fields
		var minSalary, maxSalary sql.NullFloat64
		var applicationDeadline sql.NullTime
		var externalLink sql.NullString
		var creatorId sql.NullString
		var skills []byte

		err = rows.Scan(
			&savedJob.Id,
			&savedJob.UserId,
			&savedJob.JobVacancyId,
			&savedJob.CreatedAt,
			&savedJob.UpdatedAt,
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
			&skills,
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
			&company.Logo,
		)
		helper.PanicIfError(err)

		// Handle nullable fields
		if minSalary.Valid {
			value := minSalary.Float64
			jobVacancy.MinSalary = &value
		}

		if maxSalary.Valid {
			value := maxSalary.Float64
			jobVacancy.MaxSalary = &value
		}

		if applicationDeadline.Valid {
			value := applicationDeadline.Time
			jobVacancy.ApplicationDeadline = &value
		}

		if externalLink.Valid {
			value := externalLink.String
			jobVacancy.ExternalLink = &value
		}

		if creatorId.Valid {
			id, err := uuid.Parse(creatorId.String)
			if err == nil {
				jobVacancy.CreatorId = &id
			}
		}

		// Parse skills JSON
		err = jobVacancy.Skills.Scan(skills)
		helper.PanicIfError(err)

		// Set relations
		jobVacancy.Company = &company
		savedJob.JobVacancy = &jobVacancy

		savedJobs = append(savedJobs, savedJob)
	}

	return savedJobs
}

func (repository *SavedJobRepositoryImpl) CountByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) int {
	query := `SELECT COUNT(*) FROM saved_jobs WHERE user_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, query, userId).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *SavedJobRepositoryImpl) IsJobSaved(ctx context.Context, tx *sql.Tx, userId, jobVacancyId uuid.UUID) bool {
	query := `SELECT EXISTS(SELECT 1 FROM saved_jobs WHERE user_id = $1 AND job_vacancy_id = $2)`

	var exists bool
	err := tx.QueryRowContext(ctx, query, userId, jobVacancyId).Scan(&exists)
	helper.PanicIfError(err)

	return exists
}
