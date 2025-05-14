package domain

import (
	"time"

	"github.com/google/uuid"
)

// ConnectionStatus represents the status of a connection request
type ConnectionStatus string

const (
	ConnectionStatusPending   ConnectionStatus = "pending"
	ConnectionStatusAccepted  ConnectionStatus = "accepted"
	ConnectionStatusRejected  ConnectionStatus = "rejected"
	ConnectionStatusCancelled ConnectionStatus = "cancelled"
)

// ConnectionRequest represents a connection request between users
type ConnectionRequest struct {
	Id         uuid.UUID        `json:"id" db:"id"`
	SenderId   uuid.UUID        `json:"sender_id" db:"sender_id"`
	ReceiverId uuid.UUID        `json:"receiver_id" db:"receiver_id"`
	Message    *string          `json:"message" db:"message"`
	Status     ConnectionStatus `json:"status" db:"status"`
	CreatedAt  time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time        `json:"updated_at" db:"updated_at"`
	Sender     *User            `json:"sender,omitempty" db:"-"`
	Receiver   *User            `json:"receiver,omitempty" db:"-"`
}

// Connection represents an established connection between users
type Connection struct {
	Id        uuid.UUID `json:"id" db:"id"`
	UserId1   uuid.UUID `json:"user_id_1" db:"user_id_1"`
	UserId2   uuid.UUID `json:"user_id_2" db:"user_id_2"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	User1     *User     `json:"user_1,omitempty" db:"-"`
	User2     *User     `json:"user_2,omitempty" db:"-"`
}
