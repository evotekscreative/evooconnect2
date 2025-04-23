package domain

import (
	"time"

	"github.com/google/uuid"
)

type LoginUser struct {
	ID         uuid.UUID `json:"id"` // Changed from int to uuid.UUID
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
