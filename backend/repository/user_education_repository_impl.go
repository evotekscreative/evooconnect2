package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"time"

	"github.com/google/uuid"
)

type UserEducationRepositoryImpl struct {
}

func NewEducationRepository() UserEducationRepository {
	return &UserEducationRepositoryImpl{}
}

func (repository *UserEducationRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, education domain.UserEducation) domain.UserEducation {
	// Generate UUID if not provided
	if education.Id == uuid.Nil {
		education.Id = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	education.CreatedAt = now
	education.UpdatedAt = now

	// SQL query to insert education data
	SQL := `INSERT INTO user_education (
        id, user_id, institute_name, major, start_month, start_year, 
        end_month, end_year, caption, photo, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id`

	_, err := tx.ExecContext(
		ctx,
		SQL,
		education.Id,
		education.UserId,
		education.InstituteName,
		education.Major,
		education.StartMonth,
		education.StartYear,
		education.EndMonth,
		education.EndYear,
		education.Caption,
		education.Photo,
		education.CreatedAt,
		education.UpdatedAt,
	)
	helper.PanicIfError(err)

	return education
}

func (repository *UserEducationRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, education domain.UserEducation) domain.UserEducation {
	// Update timestamp
	education.UpdatedAt = time.Now()

	// SQL query to update education data
	SQL := `UPDATE user_education SET
        institute_name = $1,
        major = $2,
        start_month = $3,
        start_year = $4,
        end_month = $5,
        end_year = $6,
        caption = $7,
        photo = $8,
        updated_at = $9
    WHERE id = $10`

	_, err := tx.ExecContext(
		ctx,
		SQL,
		education.InstituteName,
		education.Major,
		education.StartMonth,
		education.StartYear,
		education.EndMonth,
		education.EndYear,
		education.Caption,
		education.Photo,
		education.UpdatedAt,
		education.Id,
	)
	helper.PanicIfError(err)

	return education
}

func (repository *UserEducationRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, educationId uuid.UUID) error {
	SQL := "DELETE FROM user_education WHERE id = $1"

	_, err := tx.ExecContext(ctx, SQL, educationId)
	return err
}

func (repository *UserEducationRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, educationId uuid.UUID) (domain.UserEducation, error) {
	SQL := `SELECT 
        e.id, e.user_id, e.institute_name, e.major, e.start_month, e.start_year,
        e.end_month, e.end_year, e.caption, e.photo, e.created_at, e.updated_at,
        u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
    FROM user_education e
    JOIN users u ON e.user_id = u.id
    WHERE e.id = $1`

	var education domain.UserEducation
	var user domain.User

	// Nullable fields
	var endMonth, endYear, caption, photo sql.NullString

	row := tx.QueryRowContext(ctx, SQL, educationId)
	err := row.Scan(
		&education.Id,
		&education.UserId,
		&education.InstituteName,
		&education.Major,
		&education.StartMonth,
		&education.StartYear,
		&endMonth,
		&endYear,
		&caption,
		&photo,
		&education.CreatedAt,
		&education.UpdatedAt,
		&user.Id,
		&user.Name,
		&user.Username,
		&user.Photo,
	)

	if err != nil {
		return education, err
	}

	// Handle nullable fields
	if endMonth.Valid {
		education.EndMonth = &endMonth.String
	}

	if endYear.Valid {
		education.EndYear = &endYear.String
	}

	if caption.Valid {
		education.Caption = &caption.String
	}

	if photo.Valid {
		education.Photo = &photo.String
	}

	education.User = &user

	return education, nil
}

func (repository *UserEducationRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.UserEducation, error) {
	SQL := `SELECT 
        e.id, e.user_id, e.institute_name, e.major, e.start_month, e.start_year,
        e.end_month, e.end_year, e.caption, e.photo, e.created_at, e.updated_at
    FROM user_education e
    WHERE e.user_id = $1
    ORDER BY e.start_year DESC, e.start_month DESC
    LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var educations []domain.UserEducation

	for rows.Next() {
		var education domain.UserEducation
		var endMonth, endYear, caption, photo sql.NullString

		err := rows.Scan(
			&education.Id,
			&education.UserId,
			&education.InstituteName,
			&education.Major,
			&education.StartMonth,
			&education.StartYear,
			&endMonth,
			&endYear,
			&caption,
			&photo,
			&education.CreatedAt,
			&education.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Handle nullable fields
		if endMonth.Valid {
			education.EndMonth = &endMonth.String
		}

		if endYear.Valid {
			education.EndYear = &endYear.String
		}

		if caption.Valid {
			education.Caption = &caption.String
		}

		if photo.Valid {
			education.Photo = &photo.String
		}

		educations = append(educations, education)
	}

	return educations, nil
}

func (repository *UserEducationRepositoryImpl) CountByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM user_education WHERE user_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, userId).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
