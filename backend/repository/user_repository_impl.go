package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"time"
	"github.com/google/uuid"
)

type UserRepositoryImpl struct {
}

func NewUserRepository() UserRepository {
	return &UserRepositoryImpl{}
}

func (repository *UserRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, user domain.User) domain.User {
	if user.Id == uuid.Nil {
		user.Id = uuid.New()
	}

	SQL := "INSERT INTO users(id, name, email, username, password, is_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
	_, err := tx.ExecContext(ctx, SQL,
		user.Id,
		user.Name,
		user.Email,
		user.Username,
		user.Password,
		user.IsVerified,
		user.CreatedAt,
		user.UpdatedAt)
	helper.PanicIfError(err)

	return user
}

func (repository *UserRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, user domain.User) domain.User {
	SQL := `UPDATE users SET 
        name = $1, email = $2, username = $3, birthdate = $4, 
        gender = $5, location = $6, organization = $7, 
        website = $8, phone = $9, headline = $10, about = $11, 
        skills = $12, socials = $13, photo = $14, 
        updated_at = $15 WHERE id = $16`

	// fmt.Printf("User: %+v\n", user)

	var skillsValue, socialsValue interface{}

	if user.Skills.Valid {
		skillsValue = user.Skills.String
	} else {
		skillsValue = nil
	}

	if user.Socials.Valid {
		socialsValue = user.Socials.String
	} else {
		socialsValue = nil
	}

	_, err := tx.ExecContext(ctx, SQL,
		user.Name,
		user.Email,
		user.Username,
		user.Birthdate,
		user.Gender,
		user.Location,
		user.Organization,
		user.Website,
		user.Phone,
		user.Headline,
		user.About,
		skillsValue,
		socialsValue,
		user.Photo,
		time.Now(),
		user.Id)
	helper.PanicIfError(err)

	return user
}

func (repository *UserRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, userId uuid.UUID) {
	SQL := "DELETE FROM users WHERE id = $1"
	_, err := tx.ExecContext(ctx, SQL, userId)
	helper.PanicIfError(err)
}

// Perbarui definisi struct domain.User di model/domain/user.go
// untuk menggunakan pointer pada kolom yang bisa NULL

func (repository *UserRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, userId uuid.UUID) (domain.User, error) {
	SQL := `SELECT id, name, email, password, is_verified, 
           COALESCE(username, '') as username, 
           COALESCE(birthdate, '0001-01-01') as birthdate, 
           COALESCE(gender, '') as gender,
           COALESCE(location, '') as location, 
           COALESCE(organization, '') as organization, 
           COALESCE(website, '') as website, 
           COALESCE(phone, '') as phone, 
           COALESCE(headline, '') as headline, 
           COALESCE(about, '') as about, 
           skills, socials, 
           COALESCE(photo, '') as photo, 
           created_at, updated_at 
           FROM users WHERE id = $1`

	rows, err := tx.QueryContext(ctx, SQL, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	user := domain.User{}
	if rows.Next() {
		err := rows.Scan(
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Password,
			&user.IsVerified,
			&user.Username,
			&user.Birthdate,
			&user.Gender,
			&user.Location,
			&user.Organization,
			&user.Website,
			&user.Phone,
			&user.Headline,
			&user.About,
			&user.Skills,
			&user.Socials,
			&user.Photo,
			&user.CreatedAt,
			&user.UpdatedAt)
		helper.PanicIfError(err)
		return user, nil
	} else {
		return user, errors.New("user not found")
	}
}

func (repository *UserRepositoryImpl) FindByEmail(ctx context.Context, tx *sql.Tx, email string) (domain.User, error) {
	SQL := "SELECT id, name, email, password, is_verified, created_at, updated_at FROM users WHERE email = $1"
	rows, err := tx.QueryContext(ctx, SQL, email)
	helper.PanicIfError(err)
	defer rows.Close()

	user := domain.User{}
	if rows.Next() {
		err := rows.Scan(&user.Id, &user.Name, &user.Email, &user.Password, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt)
		helper.PanicIfError(err)
		return user, nil
	} else {
		return user, errors.New("user not found")
	}
}

func (repository *UserRepositoryImpl) FindByUsername(ctx context.Context, tx *sql.Tx, username string) (domain.User, error) {
	SQL := `SELECT id, name, email, 
		   COALESCE(username, '') as username, 
		   COALESCE(birthdate, '0001-01-01') as birthdate, 
		   COALESCE(gender, '') as gender,
		   COALESCE(location, '') as location, 
		   COALESCE(organization, '') as organization, 
		   COALESCE(website, '') as website, 
		   COALESCE(phone, '') as phone, 
		   COALESCE(headline, '') as headline, 
		   COALESCE(about, '') as about, 
		   skills, socials, 
		   COALESCE(photo, '') as photo, 
		   created_at, updated_at 
		   FROM users WHERE username = $1`
	rows, err := tx.QueryContext(ctx, SQL, username)
	helper.PanicIfError(err)
	defer rows.Close()

	user := domain.User{}
	if rows.Next() {
		err := rows.Scan(
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Birthdate,
			&user.Gender,
			&user.Location,
			&user.Organization,
			&user.Website,
			&user.Phone,
			&user.Headline,
			&user.About,
			&user.Skills,
			&user.Socials,
			&user.Photo,
			&user.CreatedAt,
			&user.UpdatedAt)
		helper.PanicIfError(err)
		return user, nil
	} else {
		return user, errors.New("user not found")
	}
}

func (repository *UserRepositoryImpl) SaveVerificationToken(ctx context.Context, tx *sql.Tx, userId uuid.UUID, token string, expires time.Time) error {
	SQL := "UPDATE users SET verification_token = $1, verification_expires = $2 WHERE id = $3"
	_, err := tx.ExecContext(ctx, SQL, token, expires, userId)
	return err
}

func (repository *UserRepositoryImpl) VerifyEmail(ctx context.Context, tx *sql.Tx, token string) (domain.User, error) {
	SQL := "UPDATE users SET is_verified = true, verification_token = NULL, verification_expires = NULL WHERE verification_token = $1 AND verification_expires > $2 RETURNING id, name, email, password, is_verified, created_at, updated_at"

	row := tx.QueryRowContext(ctx, SQL, token, time.Now())

	var user domain.User
	err := row.Scan(&user.Id, &user.Name, &user.Email, &user.Password, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return user, errors.New("invalid or expired verification token")
	}

	return user, nil
}

func (repository *UserRepositoryImpl) SaveResetToken(ctx context.Context, tx *sql.Tx, email string, token string, expires time.Time) error {
	SQL := "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3"
	result, err := tx.ExecContext(ctx, SQL, token, expires, email)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("user not found")
	}

	return nil
}

func (repository *UserRepositoryImpl) FindByResetToken(ctx context.Context, tx *sql.Tx, token string) (domain.User, error) {
	SQL := "SELECT id, name, email, password, is_verified, created_at, updated_at FROM users WHERE reset_token = $1 AND reset_expires > $2"
	rows, err := tx.QueryContext(ctx, SQL, token, time.Now())
	helper.PanicIfError(err)
	defer rows.Close()

	user := domain.User{}
	if rows.Next() {
		err := rows.Scan(&user.Id, &user.Name, &user.Email, &user.Password, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt)
		helper.PanicIfError(err)
		return user, nil
	} else {
		return user, errors.New("invalid or expired reset token")
	}
}

func (repository *UserRepositoryImpl) FindByVerificationToken(ctx context.Context, tx *sql.Tx, token string) (domain.User, error) {
	SQL := "SELECT id, name, email, password, is_verified, verification_token, verification_expires, created_at, updated_at FROM users WHERE verification_token = $1 AND verification_expires > $2"
	rows, err := tx.QueryContext(ctx, SQL, token, time.Now())
	helper.PanicIfError(err)
	defer rows.Close()

	user := domain.User{}
	if rows.Next() {
		err := rows.Scan(&user.Id, &user.Name, &user.Email, &user.Password, &user.IsVerified, &user.VerificationToken, &user.VerificationExpires, &user.CreatedAt, &user.UpdatedAt)
		helper.PanicIfError(err)
		return user, nil
	} else {
		return user, errors.New("invalid or expired verification token")
	}
}

func (repository *UserRepositoryImpl) UpdatePassword(ctx context.Context, tx *sql.Tx, userId uuid.UUID, hashedPassword string) error {
	SQL := "UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL, updated_at = $2 WHERE id = $3"
	_, err := tx.ExecContext(ctx, SQL, hashedPassword, time.Now(), userId)
	return err
}

// GetFailedAttempts retrieves the count of failed attempts for a specific IP and action type
func (repository *UserRepositoryImpl) GetFailedAttempts(ctx context.Context, tx *sql.Tx, clientIP string, actionType string, window time.Duration) (int, error) {
	SQL := "SELECT COUNT(*) FROM failed_attempts WHERE ip_address = $1 AND action_type = $2 AND attempt_time > $3"
	windowStart := time.Now().Add(-window)

	var count int
	err := tx.QueryRowContext(ctx, SQL, clientIP, actionType, windowStart).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// LogFailedAttempt records a failed attempt for rate limiting
func (repository *UserRepositoryImpl) LogFailedAttempt(ctx context.Context, tx *sql.Tx, clientIP string, actionType string, token string) error {
	SQL := "INSERT INTO failed_attempts(ip_address, action_type, token, attempt_time) VALUES ($1, $2, $3, $4)"
	_, err := tx.ExecContext(ctx, SQL, clientIP, actionType, token, time.Now())
	return err
}

// ClearFailedAttempts removes rate limiting entries for a user
func (repository *UserRepositoryImpl) ClearFailedAttempts(ctx context.Context, tx *sql.Tx, userID uuid.UUID, actionType string) error {
	// First, find the user's associated attempts (by getting their email)
	userSQL := "SELECT email FROM users WHERE id = $1"
	var email string
	err := tx.QueryRowContext(ctx, userSQL, userID).Scan(&email)
	if err != nil {
		return err
	}

	// Then clear any attempts related to this user's email
	SQL := "DELETE FROM failed_attempts WHERE (ip_address = $1 OR token IN (SELECT reset_token FROM users WHERE id = $2) OR token IN (SELECT verification_token FROM users WHERE id = $2))"
	_, err = tx.ExecContext(ctx, SQL, email, userID)
	return err
}

// IsRateLimited checks if a user is rate-limited based on their IP and action type
func (repository *UserRepositoryImpl) IsRateLimited(ctx context.Context, tx *sql.Tx, clientIP string, actionType string, maxAttempts int, window time.Duration) (bool, error) {
	count, err := repository.GetFailedAttempts(ctx, tx, clientIP, actionType, window)
	if err != nil {
		return false, err
	}

	return count >= maxAttempts, nil
}

func (repository *UserRepositoryImpl) UpdateVerificationStatus(ctx context.Context, tx *sql.Tx, userId uuid.UUID, isVerified bool) error {
	SQL := "UPDATE users SET is_verified = $1, verification_token = NULL, verification_expires = NULL WHERE id = $2"
	_, err := tx.ExecContext(ctx, SQL, isVerified, userId)
	return err
}

func (repository *UserRepositoryImpl) FindUsersNotConnectedWith(ctx context.Context, tx *sql.Tx, currentUserId uuid.UUID, limit int, offset int) ([]domain.User, error) {
	query := `
        SELECT u.id, u.name, u.email, 
               COALESCE(u.username, '') as username, 
               COALESCE(u.birthdate, '0001-01-01') as birthdate, 
               COALESCE(u.gender, '') as gender,
               COALESCE(u.location, '') as location, 
               COALESCE(u.organization, '') as organization, 
               COALESCE(u.website, '') as website, 
               COALESCE(u.phone, '') as phone, 
               COALESCE(u.headline, '') as headline, 
               COALESCE(u.about, '') as about, 
               u.skills, u.socials, 
               COALESCE(u.photo, '') as photo, 
               u.created_at, u.updated_at
        FROM users u
        WHERE u.id != $1
        AND NOT EXISTS (
            SELECT 1 FROM connections c 
            WHERE (c.user_id_1 = $2 AND c.user_id_2 = u.id)
            OR (c.user_id_1 = u.id AND c.user_id_2 = $3)
        )
        ORDER BY u.created_at DESC
        LIMIT $4 OFFSET $5
    `

	rows, err := tx.QueryContext(ctx, query, currentUserId, currentUserId, currentUserId, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var user domain.User
		err := rows.Scan(
			&user.Id, &user.Name, &user.Email, &user.Username, &user.Birthdate, &user.Gender,
			&user.Location, &user.Organization, &user.Website, &user.Phone, &user.Headline,
			&user.About, &user.Skills, &user.Socials, &user.Photo, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (repository *UserRepositoryImpl) Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.User {
    SQL := `SELECT id, name, username, email, COALESCE(headline, ''), COALESCE(photo, ''), created_at, updated_at
            FROM users
            WHERE LOWER(name) LIKE LOWER($1) OR LOWER(username) LIKE LOWER($1) OR LOWER(COALESCE(headline, '')) LIKE LOWER($1)
            ORDER BY name
            LIMIT $2 OFFSET $3`
   
    fmt.Printf("User search params: query=%s, limit=%d, offset=%d\n", query, limit, offset)
    searchPattern := "%" + query + "%"
    fmt.Printf("Search pattern: %s\n", searchPattern)
   
    rows, err := tx.QueryContext(ctx, SQL, searchPattern, limit, offset)
    if err != nil {
        fmt.Printf("Error in user search: %v\n", err)
        return []domain.User{}
    }
    defer rows.Close()
   
    var users []domain.User
    for rows.Next() {
        user := domain.User{}
        err := rows.Scan(&user.Id, &user.Name, &user.Username, &user.Email, &user.Headline, &user.Photo, &user.CreatedAt, &user.UpdatedAt)
        if err != nil {
            fmt.Printf("Error scanning user: %v\n", err)
            continue
        }
        users = append(users, user)
        fmt.Printf("Found user: %s (%s)\n", user.Name, user.Username)
    }
   
    return users
}


