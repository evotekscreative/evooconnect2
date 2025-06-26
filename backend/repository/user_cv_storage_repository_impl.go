package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"time"

	"github.com/google/uuid"
)

type UserCvStorageRepositoryImpl struct{}

func NewUserCvStorageRepository() UserCvStorageRepository {
	return &UserCvStorageRepositoryImpl{}
}

func (repository *UserCvStorageRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, cvStorage domain.UserCvStorage) domain.UserCvStorage {
	SQL := `INSERT INTO user_cv_storage (id, user_id, cv_file_path, original_filename, file_size, uploaded_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := tx.ExecContext(ctx, SQL,
		cvStorage.Id, cvStorage.UserId, cvStorage.CvFilePath, cvStorage.OriginalFilename,
		cvStorage.FileSize, cvStorage.UploadedAt, cvStorage.UpdatedAt)
	helper.PanicIfError(err)

	return cvStorage
}

func (repository *UserCvStorageRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, cvStorage domain.UserCvStorage) domain.UserCvStorage {
	SQL := `UPDATE user_cv_storage SET cv_file_path = $2, original_filename = $3, file_size = $4, updated_at = $5
            WHERE user_id = $1`

	_, err := tx.ExecContext(ctx, SQL,
		cvStorage.UserId, cvStorage.CvFilePath, cvStorage.OriginalFilename,
		cvStorage.FileSize, time.Now())
	helper.PanicIfError(err)

	return cvStorage
}

func (repository *UserCvStorageRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, userId uuid.UUID) error {
	SQL := `DELETE FROM user_cv_storage WHERE user_id = $1`

	_, err := tx.ExecContext(ctx, SQL, userId)
	return err
}

func (repository *UserCvStorageRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) (domain.UserCvStorage, error) {
	SQL := `SELECT id, user_id, cv_file_path, original_filename, file_size, uploaded_at, updated_at
            FROM user_cv_storage WHERE user_id = $1`

	var cvStorage domain.UserCvStorage
	err := tx.QueryRowContext(ctx, SQL, userId).Scan(
		&cvStorage.Id, &cvStorage.UserId, &cvStorage.CvFilePath, &cvStorage.OriginalFilename,
		&cvStorage.FileSize, &cvStorage.UploadedAt, &cvStorage.UpdatedAt)

	if err != nil {
		return cvStorage, err
	}

	return cvStorage, nil
}

func (repository *UserCvStorageRepositoryImpl) ExistsByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID) bool {
	SQL := `SELECT EXISTS(SELECT 1 FROM user_cv_storage WHERE user_id = $1)`

	var exists bool
	err := tx.QueryRowContext(ctx, SQL, userId).Scan(&exists)
	if err != nil {
		return false
	}

	return exists
}
