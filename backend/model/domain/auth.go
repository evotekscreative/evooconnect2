package domain

import (
	"github.com/google/uuid"
)

type LoginUser struct {
	ID         uuid.UUID `json:"id"` // Changed from int to uuid.UUID
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  string    `json:"created_at"`
	UpdatedAt  string    `json:"updated_at"`
}
