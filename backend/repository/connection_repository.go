package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"

	"github.com/google/uuid"
)

type ConnectionRepository interface {
	SaveConnectionRequest(ctx context.Context, tx *sql.Tx, request domain.ConnectionRequest) domain.ConnectionRequest
	UpdateConnectionRequest(ctx context.Context, tx *sql.Tx, request domain.ConnectionRequest) domain.ConnectionRequest
	FindConnectionRequestById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.ConnectionRequest, error)
	FindConnectionRequestsByReceiverId(ctx context.Context, tx *sql.Tx, receiverId uuid.UUID, limit, offset int) ([]domain.ConnectionRequest, int)
	FindConnectionRequestBySenderIdAndReceiverId(ctx context.Context, tx *sql.Tx, senderId, receiverId uuid.UUID) (domain.ConnectionRequest, error)
	DeleteConnectionRequest(ctx context.Context, tx *sql.Tx, requestId uuid.UUID) error

	SaveConnection(ctx context.Context, tx *sql.Tx, connection domain.Connection) domain.Connection
	CheckConnectionExists(ctx context.Context, tx *sql.Tx, userId1, userId2 uuid.UUID) bool
	FindConnectionsByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.Connection, int)
	IsConnected(ctx context.Context, tx *sql.Tx, currentUserId, userId uuid.UUID) bool
	UpdateRequest(ctx context.Context, tx *sql.Tx, request domain.ConnectionRequest) domain.ConnectionRequest
	FindRequest(ctx context.Context, tx *sql.Tx, senderId, receiverId uuid.UUID) (domain.ConnectionRequest, error)
	Disconnect(ctx context.Context, tx *sql.Tx, userId1, userId2 uuid.UUID) error
}
