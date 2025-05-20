package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
	"time"
)

type ProfileViewRepository interface {
	Save(ctx context.Context, tx *sql.Tx, profileView domain.ProfileView) domain.ProfileView
	FindByProfileUserId(ctx context.Context, tx *sql.Tx, profileUserId uuid.UUID, fromTime time.Time, toTime time.Time) []domain.ProfileView
	CountByProfileUserId(ctx context.Context, tx *sql.Tx, profileUserId uuid.UUID, fromTime time.Time, toTime time.Time) int
	HasViewedRecently(ctx context.Context, tx *sql.Tx, profileUserId uuid.UUID, viewerId uuid.UUID, duration time.Duration) bool
}
