package web

import (
	"time"
	"github.com/google/uuid"
)

type CreateJoinRequestRequest struct {
	Message string `json:"message" validate:"max=500"`
}

type JoinRequestResponse struct {
	Id        uuid.UUID   `json:"id"`
	GroupId   uuid.UUID   `json:"group_id"`
	UserId    uuid.UUID   `json:"user_id"`
	Status    string      `json:"status"`
	Message   string      `json:"message,omitempty"`
	User      UserShort   `json:"user"`
	Group     *GroupResponse `json:"group,omitempty"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}