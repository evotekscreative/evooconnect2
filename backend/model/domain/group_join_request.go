package domain

import (
	"time"
	"github.com/google/uuid"
)

type GroupJoinRequest struct {
	Id        uuid.UUID `json:"id"`
	GroupId   uuid.UUID `json:"group_id"`
	UserId    uuid.UUID `json:"user_id"`
	Status    string    `json:"status"` // pending, accepted, rejected
	Message   string    `json:"message,omitempty"` // Pesan dari user yang ingin bergabung
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	User      *User     `json:"user,omitempty"`
	Group     *Group    `json:"group,omitempty"`
}