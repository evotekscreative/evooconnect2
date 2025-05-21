package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"time"

	"github.com/google/uuid"
)

type UserRepository interface {
	Save(ctx context.Context, tx *sql.Tx, user domain.User) domain.User
	Update(ctx context.Context, tx *sql.Tx, user domain.User) domain.User
	Delete(ctx context.Context, tx *sql.Tx, userId uuid.UUID)
	FindById(ctx context.Context, tx *sql.Tx, userId uuid.UUID) (domain.User, error)
	FindByEmail(ctx context.Context, tx *sql.Tx, email string) (domain.User, error)
	FindByUsername(ctx context.Context, tx *sql.Tx, username string) (domain.User, error)
	SaveVerificationToken(ctx context.Context, tx *sql.Tx, userId uuid.UUID, token string, expires time.Time) error
	VerifyEmail(ctx context.Context, tx *sql.Tx, token string) (domain.User, error)
	SaveResetToken(ctx context.Context, tx *sql.Tx, email string, token string, expires time.Time) error
	FindByResetToken(ctx context.Context, tx *sql.Tx, token string) (domain.User, error)
	FindByVerificationToken(ctx context.Context, tx *sql.Tx, token string) (domain.User, error)
	UpdatePassword(ctx context.Context, tx *sql.Tx, userId uuid.UUID, hashedPassword string) error
	GetFailedAttempts(ctx context.Context, tx *sql.Tx, clientIP string, actionType string, window time.Duration) (int, error)
	LogFailedAttempt(ctx context.Context, tx *sql.Tx, clientIP string, actionType string, token string) error
	ClearFailedAttempts(ctx context.Context, tx *sql.Tx, userID uuid.UUID, actionType string) error
	IsRateLimited(ctx context.Context, tx *sql.Tx, clientIP string, actionType string, maxAttempts int, window time.Duration) (bool, error)
	UpdateVerificationStatus(ctx context.Context, tx *sql.Tx, userId uuid.UUID, isVerified bool) error
	FindUsersNotConnectedWith(ctx context.Context, tx *sql.Tx, currentUserId uuid.UUID, limit int, offset int) ([]domain.User, error)
	Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.User
}
