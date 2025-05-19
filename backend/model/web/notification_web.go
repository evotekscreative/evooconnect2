package web

import (
	"time"

	"github.com/google/uuid"
)

type NotificationResponse struct {
	Id           uuid.UUID  `json:"id"`
	Category     string     `json:"category"`
	Type         string     `json:"type"`
	Title        string     `json:"title"`
	Message      string     `json:"message"`
	Status       string     `json:"status"`
	ReferenceId  *uuid.UUID `json:"reference_id,omitempty"`
	ReferenceType *string   `json:"reference_type,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	Actor        *UserShort `json:"actor,omitempty"`
}

type NotificationListResponse struct {
	Notifications []NotificationResponse `json:"notifications"`
	Total         int                    `json:"total"`
	UnreadCount   int                    `json:"unread_count"`
}

type MarkNotificationReadRequest struct {
	NotificationIds []uuid.UUID `json:"notification_ids" validate:"required"`
}

type DeleteNotificationsRequest struct {
	NotificationIds []uuid.UUID `json:"notification_ids"`
}