package domain

import (
	"github.com/google/uuid"
	"time"
)

type ProfileView struct {
	Id            uuid.UUID `json:"id"`
	ProfileUserId uuid.UUID `json:"profile_user_id"`
	ViewerId      uuid.UUID `json:"viewer_id"`
	ViewedAt      time.Time `json:"viewed_at"`
	// Including user information
	Viewer *UserShort `json:"viewer,omitempty"`
}
