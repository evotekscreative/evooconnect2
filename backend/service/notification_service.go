package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type NotificationService interface {
	Create(ctx context.Context, userId uuid.UUID, category string, notificationType string, title string, message string, referenceId *uuid.UUID, referenceType *string, actorId *uuid.UUID) uuid.UUID
	GetNotifications(ctx context.Context, userId uuid.UUID, category string, limit, offset int) web.NotificationListResponse
	MarkAsRead(ctx context.Context, userId uuid.UUID, request web.MarkNotificationReadRequest) int
	MarkAllAsRead(ctx context.Context, userId uuid.UUID, category string) int
	DeleteNotifications(ctx context.Context, userId uuid.UUID, category string) int
	DeleteSelectedNotifications(ctx context.Context, userId uuid.UUID, notificationIds []string) web.DeleteNotificationsResponse
}
