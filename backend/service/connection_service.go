package service

import (
	"context"
	"evoconnect/backend/model/web"

	"github.com/google/uuid"
)

type ConnectionService interface {
	SendConnectionRequest(ctx context.Context, senderId uuid.UUID, receiverId uuid.UUID, request web.ConnectionRequestCreate) web.ConnectionRequestResponse
	GetConnectionRequests(ctx context.Context, userId uuid.UUID, limit, offset int) web.ConnectionRequestListResponse
	AcceptConnectionRequest(ctx context.Context, userId uuid.UUID, requestId uuid.UUID) web.ConnectionRequestResponse
	RejectConnectionRequest(ctx context.Context, userId uuid.UUID, requestId uuid.UUID) web.ConnectionRequestResponse
	GetConnections(ctx context.Context, userId uuid.UUID, limit, offset int) web.ConnectionListResponse
	Disconnect(ctx context.Context, userId, targetUserId uuid.UUID) web.DisconnectResponse
}
