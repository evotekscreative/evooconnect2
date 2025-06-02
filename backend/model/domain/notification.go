package domain

import (
	"time"

	"github.com/google/uuid"
)

// NotificationCategory represents the category of notification
type NotificationCategory string

const (
	NotificationCategoryConnection NotificationCategory = "connection"
	NotificationCategoryGroup      NotificationCategory = "group"
	NotificationCategoryPost       NotificationCategory = "post"
	NotificationCategoryProfile    NotificationCategory = "profile"
	NotificationCategoryCompany    NotificationCategory = "company"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	// Post notifications
	NotificationTypePostNew      NotificationType = "post_new"
	NotificationTypePostLike     NotificationType = "post_like"
	NotificationTypePostComment  NotificationType = "post_comment"
	NotificationTypeCommentReply NotificationType = "comment_reply"

	// Connection notifications
	NotificationTypeConnectionRequest NotificationType = "connection_request"
	NotificationTypeConnectionAccept  NotificationType = "connection_accept"

	// Profile notifications
	NotificationTypeProfileVisit NotificationType = "profile_visit"

	// Group notifications
	NotificationTypeGroupInvite      NotificationType = "group_invite"
	NotificationTypeGroupJoinRequest NotificationType = "group_join_request"
	NotificationTypeGroupPost        NotificationType = "group_post"

	// Blog notifications
	NotificationTypeBlogNew          NotificationType = "blog_new"
	NotificationTypeBlogComment      NotificationType = "blog_comment"
	NotificationTypeBlogCommentReply NotificationType = "blog_comment_reply"
)

// NotificationStatus represents the status of a notification
type NotificationStatus string

const (
	NotificationStatusUnread NotificationStatus = "unread"
	NotificationStatusRead   NotificationStatus = "read"
)

// Notification represents a notification entity
type Notification struct {
	Id            uuid.UUID            `json:"id" db:"id"`
	UserId        uuid.UUID            `json:"user_id" db:"user_id"`
	Category      NotificationCategory `json:"category" db:"category"`
	Type          NotificationType     `json:"type" db:"type"`
	Title         string               `json:"title" db:"title"`
	Message       string               `json:"message" db:"message"`
	Status        NotificationStatus   `json:"status" db:"status"`
	ReferenceId   *uuid.UUID           `json:"reference_id" db:"reference_id"`
	ReferenceType *string              `json:"reference_type" db:"reference_type"`
	ActorId       *uuid.UUID           `json:"actor_id" db:"actor_id"`
	CreatedAt     time.Time            `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at" db:"updated_at"`
	Actor         *User                `json:"actor,omitempty" db:"-"`
}
