package repository

import (
	"context"
	"database/sql"

	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupInvitationRepository interface {
	Save(ctx context.Context, tx *sql.Tx, invitation domain.GroupInvitation) domain.GroupInvitation
	Update(ctx context.Context, tx *sql.Tx, invitation domain.GroupInvitation) domain.GroupInvitation
	FindById(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID) domain.GroupInvitation
	FindByInviteeId(ctx context.Context, tx *sql.Tx, inviteeId uuid.UUID) []domain.GroupInvitation
	FindByGroupIdAndInviteeId(ctx context.Context, tx *sql.Tx, groupId, inviteeId uuid.UUID) domain.GroupInvitation
	CancelRequest(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID) error
}
