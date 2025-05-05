package utils

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"

	"github.com/google/uuid"
)

func ToUserShortWithConnection(ctx context.Context, tx *sql.Tx, repo repository.ConnectionRepository, currentUserId uuid.UUID, user domain.User) web.UserShort {
	isConnected := repo.IsConnected(ctx, tx, currentUserId, user.Id)
	return web.UserShort{
		Id:          user.Id,
		Name:        user.Name,
		Username:    user.Username,
		Photo:       optionalStringPtr(user.Photo),
		IsConnected: isConnected,
	}
}

func optionalStringPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
