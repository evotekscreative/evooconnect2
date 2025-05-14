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

type ExperienceRepositoryImpl struct {
}

func NewExperienceRepository() ExperienceRepository {
	return &ExperienceRepositoryImpl{}
}

func (repository *ExperienceRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, experience domain.UserExperience) domain.UserExperience {
	SQL := `INSERT INTO user_experiences (
        id, user_id, job_title, company_name, 
        start_month, start_year, end_month, end_year, 
        caption, photo, created_at, updated_at
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    )`

	_, err := tx.ExecContext(
		ctx, SQL,
		experience.Id, experience.UserId, experience.JobTitle, experience.CompanyName,
		experience.StartMonth, experience.StartYear, experience.EndMonth, experience.EndYear,
		experience.Caption, experience.Photo, experience.CreatedAt, experience.UpdatedAt,
	)
	helper.PanicIfError(err)

	return experience
}

func (repository *ExperienceRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, experience domain.UserExperience) domain.UserExperience {
	now := time.Now()
	experience.UpdatedAt = now

	SQL := `UPDATE user_experiences SET 
        job_title = $1, 
        company_name = $2, 
        start_month = $3, 
        start_year = $4, 
        end_month = $5, 
        end_year = $6, 
        caption = $7, 
        photo = $8, 
        updated_at = $9
    WHERE id = $10`

	_, err := tx.ExecContext(
		ctx, SQL,
		experience.JobTitle, experience.CompanyName,
		experience.StartMonth, experience.StartYear,
		experience.EndMonth, experience.EndYear,
		experience.Caption, experience.Photo,
		experience.UpdatedAt, experience.Id,
	)
	helper.PanicIfError(err)

	return experience
}

func (repository *ExperienceRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, experienceId uuid.UUID) {
	SQL := `DELETE FROM user_experiences WHERE id = $1`
	_, err := tx.ExecContext(ctx, SQL, experienceId)
	helper.PanicIfError(err)
}

func (repository *ExperienceRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, experienceId uuid.UUID) (domain.UserExperience, error) {
	SQL := `SELECT 
        id, user_id, job_title, company_name, 
        start_month, start_year, end_month, end_year, 
        caption, photo, created_at, updated_at
    FROM user_experiences WHERE id = $1`

	rows, err := tx.QueryContext(ctx, SQL, experienceId)
	helper.PanicIfError(err)
	defer rows.Close()

	var experience domain.UserExperience
	if rows.Next() {
		err := rows.Scan(
			&experience.Id, &experience.UserId, &experience.JobTitle, &experience.CompanyName,
			&experience.StartMonth, &experience.StartYear, &experience.EndMonth, &experience.EndYear,
			&experience.Caption, &experience.Photo, &experience.CreatedAt, &experience.UpdatedAt,
		)
		helper.PanicIfError(err)
		return experience, nil
	} else {
		return experience, errors.New("experience not found")
	}
}

func (repository *ExperienceRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.UserExperience, int) {
	// First get the total count
	countSQL := `SELECT COUNT(*) FROM user_experiences WHERE user_id = $1`
	row := tx.QueryRowContext(ctx, countSQL, userId)

	var count int
	err := row.Scan(&count)
	helper.PanicIfError(err)

	if count == 0 {
		return []domain.UserExperience{}, 0
	}

	// Then get the data with pagination
	SQL := `SELECT 
        id, user_id, job_title, company_name, 
        start_month, start_year, end_month, end_year, 
        caption, photo, created_at, updated_at
    FROM user_experiences 
    WHERE user_id = $1
    ORDER BY start_year DESC, start_month DESC
    LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var experiences []domain.UserExperience
	for rows.Next() {
		var experience domain.UserExperience
		err := rows.Scan(
			&experience.Id, &experience.UserId, &experience.JobTitle, &experience.CompanyName,
			&experience.StartMonth, &experience.StartYear, &experience.EndMonth, &experience.EndYear,
			&experience.Caption, &experience.Photo, &experience.CreatedAt, &experience.UpdatedAt,
		)
		helper.PanicIfError(err)
		experiences = append(experiences, experience)
	}

	return experiences, count
}
