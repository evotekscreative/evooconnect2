package domain

import (
    "time"
    "github.com/google/uuid"
)

// AdminNotification menggunakan tabel notifications yang sama
type AdminNotification struct {
    Id            uuid.UUID  `json:"id" db:"id"`
    UserId        *uuid.UUID `json:"user_id" db:"user_id"`        // Null untuk admin notifications
    Category      string     `json:"category" db:"category"`
    Type          string     `json:"type" db:"type"`
    Title         string     `json:"title" db:"title"`
    Message       string     `json:"message" db:"message"`
    Status        string     `json:"status" db:"status"`
    ReferenceId   *uuid.UUID `json:"reference_id" db:"reference_id"`
    ReferenceType *string    `json:"reference_type" db:"reference_type"`
    ActorId       *uuid.UUID `json:"actor_id" db:"actor_id"`
    CreatedAt     time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}
