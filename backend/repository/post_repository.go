package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type PostRepository interface {
	Save(ctx context.Context, tx *sql.Tx, post domain.Post) domain.Post
	Update(ctx context.Context, tx *sql.Tx, post domain.Post) domain.Post
	Delete(ctx context.Context, tx *sql.Tx, postId uuid.UUID)
	FindById(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.Post, error)
	FindAll(ctx context.Context, tx *sql.Tx, currentUserId uuid.UUID, limit, offset int) []domain.Post
	FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, currentUserId uuid.UUID, limit, offset int) []domain.Post
	FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, currentUserId uuid.UUID, limit, offset int) []domain.Post
	LikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error
	UnlikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error
	IsLiked(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) bool
	GetLikesCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) int
	CreatePostGroup(ctx context.Context, tx *sql.Tx, post domain.Post, groupId uuid.UUID) domain.Post
	Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.Post
	PinPost(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.Post, error)
    UnpinPost(ctx context.Context, tx *sql.Tx, postId uuid.UUID) error
    CountPinnedPostsByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) (int, error)	
}
