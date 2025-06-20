package repository

import (
    "context"
    "database/sql"
    "evoconnect/backend/model/domain"
    "github.com/google/uuid"
)

type AdminNotificationRepository interface {
    Save(ctx context.Context, tx *sql.Tx, notification domain.AdminNotification) domain.AdminNotification
    FindAll(ctx context.Context, tx *sql.Tx, category string, limit, offset int) []domain.AdminNotification
    CountAll(ctx context.Context, tx *sql.Tx, category string) int
    CountUnread(ctx context.Context, tx *sql.Tx, category string) int
    MarkAsRead(ctx context.Context, tx *sql.Tx, notificationIds []uuid.UUID) int
    MarkAllAsRead(ctx context.Context, tx *sql.Tx, category string) int
    DeleteByCategory(ctx context.Context, tx *sql.Tx, category string) int
}