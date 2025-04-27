package domain

import (
	"time"

	"github.com/google/uuid"
)

type UserEducation struct {
	Id            uuid.UUID `json:"id"`
	UserId        uuid.UUID `json:"user_id"`
	InstituteName string    `json:"institute_name"`
	Major         string    `json:"major"`
	StartMonth    string    `json:"start_month"`
	StartYear     string    `json:"start_year"`
	EndMonth      *string   `json:"end_month"`
	EndYear       *string   `json:"end_year"`
	Caption       *string   `json:"caption"`
	Photo         *string   `json:"photo"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	User          *User     `json:"user,omitempty"`
}
