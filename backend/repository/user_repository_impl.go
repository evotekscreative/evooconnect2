package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"time"
)

type UserRepositoryImpl struct {
}

func NewUserRepository() UserRepository {
	return &UserRepositoryImpl{}
}

func (repository *UserRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, user domain.User) domain.User {
	SQL := "INSERT INTO users(name, email, password, is_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
	var id int
	err := tx.QueryRowContext(ctx, SQL, user.Name, user.Email, user.Password, user.IsVerified, user.CreatedAt, user.UpdatedAt).Scan(&id)
	helper.PanicIfError(err)

	user.Id = id
	return user
}

func (repository *UserRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, user domain.User) domain.User {
	SQL := "UPDATE users SET name = $1, email = $2, updated_at = $3 WHERE id = $4"
	_, err := tx.ExecContext(ctx, SQL, user.Name, user.Email, time.Now(), user.Id)
	helper.PanicIfError(err)

	return user
}

func (repository *UserRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, userId int) {
	SQL := "DELETE FROM users WHERE id = $1"
	_, err := tx.ExecContext(ctx, SQL, userId)
	helper.PanicIfError(err)
}

func (repository *UserRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, userId int) (domain.User, error) {
	SQL := "SELECT id, name, email, password, is_verified, created_at, updated_at FROM users WHERE id = $1"
	rows, err := tx.QueryContext(ctx, SQL, userId)
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

func (repository *UserRepositoryImpl) SaveVerificationToken(ctx context.Context, tx *sql.Tx, userId int, token string, expires time.Time) error {
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

func (repository *UserRepositoryImpl) UpdatePassword(ctx context.Context, tx *sql.Tx, userId int, hashedPassword string) error {
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
func (repository *UserRepositoryImpl) ClearFailedAttempts(ctx context.Context, tx *sql.Tx, userID int, actionType string) error {
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
