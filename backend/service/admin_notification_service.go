package service

import (
    "context"
    "evoconnect/backend/model/web"
    "github.com/google/uuid"
)

type AdminNotificationService interface {
    Create(ctx context.Context, category string, notificationType string, title string, message string, referenceId *uuid.UUID, referenceType *string) uuid.UUID
    GetNotifications(ctx context.Context, category string, limit, offset int) web.NotificationListResponse
    MarkAsRead(ctx context.Context, request web.MarkNotificationReadRequest) int
    MarkAllAsRead(ctx context.Context, category string) int
    DeleteNotifications(ctx context.Context, category string) int
}