package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"time"

	"github.com/google/uuid"
)

type ProfileViewRepositoryImpl struct{}

func NewProfileViewRepository() ProfileViewRepository {
	return &ProfileViewRepositoryImpl{}
}

func (repository *ProfileViewRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, profileView domain.ProfileView) domain.ProfileView {
	SQL := "INSERT INTO profile_views(id, profile_user_id, viewer_id, viewed_at) VALUES ($1, $2, $3, $4)"
	_, err := tx.ExecContext(ctx, SQL, profileView.Id, profileView.ProfileUserId, profileView.ViewerId, profileView.ViewedAt)
	helper.PanicIfError(err)

	return profileView
}

func (repository *ProfileViewRepositoryImpl) FindByProfileUserId(ctx context.Context, tx *sql.Tx, profileUserId uuid.UUID, fromTime time.Time, toTime time.Time) []domain.ProfileView {
	SQL := `
		SELECT v.id, v.profile_user_id, v.viewer_id, v.viewed_at, u.name, COALESCE(u.photo, ''), COALESCE(u.username, ''), COALESCE(u.headline, ''),
		(SELECT EXISTS(SELECT 1 FROM connections WHERE 
			(user_id_1 = v.profile_user_id AND user_id_2 = v.viewer_id) OR 
			(user_id_1 = v.viewer_id AND user_id_2 = v.profile_user_id)
		))
		FROM profile_views v
		JOIN users u ON v.viewer_id = u.id
		WHERE v.profile_user_id = $1 AND v.viewed_at >= $2 AND v.viewed_at < $3
		ORDER BY v.viewed_at DESC
	`
	rows, err := tx.QueryContext(ctx, SQL, profileUserId, fromTime, toTime)
	helper.PanicIfError(err)
	defer rows.Close()

	var profileViews []domain.ProfileView
	for rows.Next() {
		var profileView domain.ProfileView
		var User domain.UserShort
		err := rows.Scan(
			&profileView.Id,
			&profileView.ProfileUserId,
			&profileView.ViewerId,
			&profileView.ViewedAt,
			&User.Name,
			&User.Photo,
			&User.Username,
			&User.Headline,
			&User.IsConnected,
		)
		profileView.Viewer = &User
		helper.PanicIfError(err)
		profileViews = append(profileViews, profileView)
	}

	return profileViews
}

func (repository *ProfileViewRepositoryImpl) CountByProfileUserId(ctx context.Context, tx *sql.Tx, profileUserId uuid.UUID, fromTime time.Time, toTime time.Time) int {
	SQL := `
        SELECT COUNT(DISTINCT viewer_id) 
        FROM profile_views 
        WHERE profile_user_id = $1 AND viewed_at >= $2 AND viewed_at < $3
    `
	var count int
	err := tx.QueryRowContext(ctx, SQL, profileUserId, fromTime, toTime).Scan(&count)
	helper.PanicIfError(err)
	return count
}

func (repository *ProfileViewRepositoryImpl) HasViewedRecently(ctx context.Context, tx *sql.Tx, profileUserId uuid.UUID, viewerId uuid.UUID, duration time.Duration) bool {
	cutoffTime := time.Now().Add(-duration)
	SQL := `
        SELECT EXISTS(
            SELECT 1 FROM profile_views 
            WHERE profile_user_id = $1 AND viewer_id = $2 AND viewed_at > $3
        )
    `
	var exists bool
	err := tx.QueryRowContext(ctx, SQL, profileUserId, viewerId, cutoffTime).Scan(&exists)
	helper.PanicIfError(err)
	return exists
}
