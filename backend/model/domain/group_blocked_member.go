package domain

import (
	"time"

	"github.com/google/uuid"
)

type GroupBlockedMember struct {
	Id         uuid.UUID `json:"id"`
	GroupId    uuid.UUID `json:"group_id"`
	UserId     uuid.UUID `json:"user_id"`
	Reason     string    `json:"reason"`
	BlockedBy  uuid.UUID `json:"blocked_by"`
	BlockedAt  time.Time `json:"blocked_at"`
	Visibility string    `json:"visibility"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}