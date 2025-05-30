package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type NotificationRepository interface {
	Save(ctx context.Context, tx *sql.Tx, notification domain.Notification) domain.Notification
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string, limit, offset int) []domain.Notification
	CountByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int
	CountUnreadByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int
	MarkAsRead(ctx context.Context, tx *sql.Tx, userId uuid.UUID, notificationIds []uuid.UUID) int
	MarkAllAsRead(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int
	DeleteByUserIdAndCategory(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int
	DeleteSelected(ctx context.Context, tx *sql.Tx, userId uuid.UUID, notificationIds []uuid.UUID) (int64, error)
	FindSimilarNotification(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string, notificationType string, referenceId *uuid.UUID, actorId *uuid.UUID) (domain.Notification, error)
}


