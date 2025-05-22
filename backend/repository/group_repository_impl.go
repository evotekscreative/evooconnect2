package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"
	"fmt"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"github.com/google/uuid"
)

type GroupRepositoryImpl struct {
}

func NewGroupRepository() GroupRepository {
	return &GroupRepositoryImpl{}
}

func (repository *GroupRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, group domain.Group) domain.Group {
	// Set timestamps
	now := time.Now()
	group.CreatedAt = now
	group.UpdatedAt = now

	// Generate UUID if not provided
	if group.Id == uuid.Nil {
		group.Id = uuid.New()
	}

	SQL := `INSERT INTO groups(id, name, description, rule, creator_id, image, privacy_level, invite_policy, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := tx.ExecContext(ctx, SQL,
		group.Id,
		group.Name,
		group.Description,
		group.Rule,
		group.CreatorId,
		group.Image,
		group.PrivacyLevel,
		group.InvitePolicy,
		group.CreatedAt,
		group.UpdatedAt,
	)
	helper.PanicIfError(err)

	// Add creator as admin member
	memberSQL := `INSERT INTO group_members(group_id, user_id, role, joined_at, is_active) 
                  VALUES($1, $2, $3, $4, $5)`
	_, err = tx.ExecContext(ctx, memberSQL,
		group.Id,
		group.CreatorId,
		"admin",
		now,
		true,
	)
	helper.PanicIfError(err)

	return group
}
func (repository *GroupRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, group domain.Group) domain.Group {
	group.UpdatedAt = time.Now()

	SQL := `UPDATE groups SET 
			name = $1, 
			description = $2, 
			rule = $3, 
			image = $4, 
			privacy_level = $5, 
			invite_policy = $6, 
			updated_at = $7
			WHERE id = $8`

	_, err := tx.ExecContext(ctx, SQL,
		group.Name,
		group.Description,
		group.Rule,
		group.Image,
		group.PrivacyLevel,
		group.InvitePolicy,
		group.UpdatedAt,
		group.Id,
	)
	helper.PanicIfError(err)

	return group
}

func (repository *GroupRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) {
	SQL := "DELETE FROM groups WHERE id = $1"
	_, err := tx.ExecContext(ctx, SQL, groupId)
	helper.PanicIfError(err)
}

func (repository *GroupRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) (domain.Group, error) {
	SQL := `SELECT id, name, description, rule, creator_id, privacy_level, invite_policy, image, created_at, updated_at 
			FROM groups 
			WHERE id = $1`
	
	fmt.Printf("DEBUG SQL: %s with param: %s\n", SQL, groupId)
	
	rows, err := tx.QueryContext(ctx, SQL, groupId)
	if err != nil {
		return domain.Group{}, err
	}
	defer rows.Close()

	group := domain.Group{}
	if rows.Next() {
		err := rows.Scan(
			&group.Id,
			&group.Name,
			&group.Description,
			&group.Rule,
			&group.CreatorId,
			&group.PrivacyLevel,
			&group.InvitePolicy,
			&group.Image,
			&group.CreatedAt,
			&group.UpdatedAt,
		)
		if err != nil {
			return domain.Group{}, err
		}
		return group, nil
	} else {
		return domain.Group{}, errors.New("group not found")
	}
}

func (repository *GroupRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, limit, offset int) []domain.Group {
	SQL := `SELECT id, name, description, rule, creator_id, image, privacy_level, invite_policy, created_at, updated_at 
			FROM groups 
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, SQL, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var groups []domain.Group
	for rows.Next() {
		group := domain.Group{}
		err := rows.Scan(
			&group.Id,
			&group.Name,
			&group.Description,
			&group.Rule,
			&group.CreatorId,
			&group.Image,
			&group.PrivacyLevel,
			&group.InvitePolicy,
			&group.CreatedAt,
			&group.UpdatedAt,
		)
		helper.PanicIfError(err)
		groups = append(groups, group)
	}
	return groups
}

func (repository *GroupRepositoryImpl) FindByCreator(ctx context.Context, tx *sql.Tx, creatorId uuid.UUID) []domain.Group {
	SQL := `SELECT id, name, description, rule, creator_id, image, privacy_level, invite_policy, created_at, updated_at 
			FROM groups 
			WHERE creator_id = $1
			ORDER BY created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, creatorId)
	helper.PanicIfError(err)
	defer rows.Close()

	var groups []domain.Group
	for rows.Next() {
		group := domain.Group{}
		err := rows.Scan(
			&group.Id,
			&group.Name,
			&group.Description,
			&group.Rule,
			&group.CreatorId,
			&group.Image,
			&group.PrivacyLevel,
			&group.InvitePolicy,
			&group.CreatedAt,
			&group.UpdatedAt,
		)
		helper.PanicIfError(err)
		groups = append(groups, group)
	}
	return groups
}

// Member management
func (repository *GroupRepositoryImpl) AddMember(ctx context.Context, tx *sql.Tx, member domain.GroupMember) domain.GroupMember {
	if member.JoinedAt.IsZero() {
		member.JoinedAt = time.Now()
	}

	if !member.IsActive {
		member.IsActive = true
	}

	SQL := `INSERT INTO group_members(group_id, user_id, role, joined_at, is_active) 
			VALUES($1, $2, $3, $4, $5)`
	_, err := tx.ExecContext(ctx, SQL,
		member.GroupId,
		member.UserId,
		member.Role,
		member.JoinedAt,
		member.IsActive,
	)
	helper.PanicIfError(err)

	return member
}

func (repository *GroupRepositoryImpl) RemoveMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) {
	SQL := "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2"
	_, err := tx.ExecContext(ctx, SQL, groupId, userId)
	helper.PanicIfError(err)
}

func (repository *GroupRepositoryImpl) UpdateMemberRole(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID, role string) domain.GroupMember {
	SQL := "UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3"
	_, err := tx.ExecContext(ctx, SQL, role, groupId, userId)
	helper.PanicIfError(err)

	SQL = "SELECT group_id, user_id, role, joined_at, is_active FROM group_members WHERE group_id = $1 AND user_id = $2"
	row := tx.QueryRowContext(ctx, SQL, groupId, userId)

	var member domain.GroupMember
	err = row.Scan(
		&member.GroupId,
		&member.UserId,
		&member.Role,
		&member.JoinedAt,
		&member.IsActive,
	)
	helper.PanicIfError(err)

	return member
}

func (repository *GroupRepositoryImpl) FindMembers(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupMember {
	SQL := `SELECT group_id, user_id, role, joined_at, is_active 
			FROM group_members 
			WHERE group_id = $1`

	rows, err := tx.QueryContext(ctx, SQL, groupId)
	helper.PanicIfError(err)
	defer rows.Close()

	var members []domain.GroupMember
	for rows.Next() {
		member := domain.GroupMember{}
		err := rows.Scan(
			&member.GroupId,
			&member.UserId,
			&member.Role,
			&member.JoinedAt,
			&member.IsActive,
		)
		helper.PanicIfError(err)
		members = append(members, member)
	}
	return members
}

func (repository *GroupRepositoryImpl) IsMember(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) bool {
	SQL := "SELECT COUNT(*) FROM group_members WHERE group_id = $1 AND user_id = $2 AND is_active = true"
	row := tx.QueryRowContext(ctx, SQL, groupId, userId)

	var count int
	err := row.Scan(&count)
	helper.PanicIfError(err)

	return count > 0
}

// Invitation management
func (repository *GroupRepositoryImpl) CreateInvitation(ctx context.Context, tx *sql.Tx, invitation domain.GroupInvitation) domain.GroupInvitation {
	if invitation.Id == uuid.Nil {
		invitation.Id = uuid.New()
	}

	invitation.CreatedAt = time.Now()

	if invitation.Status == "" {
		invitation.Status = "pending"
	}

	SQL := `INSERT INTO group_invitations(id, group_id, user_id, inviter_id, status, created_at) 
			VALUES($1, $2, $3, $4, $5, $6)`
	_, err := tx.ExecContext(ctx, SQL,
		invitation.Id,
		invitation.GroupId,
		invitation.InviteeId,
		invitation.InviterId,
		invitation.Status,
		invitation.CreatedAt,
	)
	helper.PanicIfError(err)

	return invitation
}

func (repository *GroupRepositoryImpl) UpdateInvitationStatus(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID, status string) domain.GroupInvitation {
	SQL := "UPDATE group_invitations SET status = $1 WHERE id = $2"
	_, err := tx.ExecContext(ctx, SQL, status, invitationId)
	helper.PanicIfError(err)

	invitation, err := repository.FindInvitationById(ctx, tx, invitationId)
	helper.PanicIfError(err)

	return invitation
}

func (repository *GroupRepositoryImpl) FindInvitationById(ctx context.Context, tx *sql.Tx, invitationId uuid.UUID) (domain.GroupInvitation, error) {
	SQL := `SELECT id, group_id, user_id, inviter_id, status, created_at 
			FROM group_invitations 
			WHERE id = $1`

	row := tx.QueryRowContext(ctx, SQL, invitationId)

	var invitation domain.GroupInvitation
	err := row.Scan(
		&invitation.Id,
		&invitation.GroupId,
		&invitation.InviteeId,
		&invitation.InviterId,
		&invitation.Status,
		&invitation.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return invitation, errors.New("invitation not found")
	}
	helper.PanicIfError(err)

	return invitation, nil
}

func (repository *GroupRepositoryImpl) FindInvitationsByUser(ctx context.Context, tx *sql.Tx, userId uuid.UUID) []domain.GroupInvitation {
	SQL := `SELECT id, group_id, user_id, inviter_id, status, created_at 
			FROM group_invitations 
			WHERE user_id = $1
			ORDER BY created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, userId)
	helper.PanicIfError(err)
	defer rows.Close()

	var invitations []domain.GroupInvitation
	for rows.Next() {
		invitation := domain.GroupInvitation{}
		err := rows.Scan(
			&invitation.Id,
			&invitation.GroupId,
			&invitation.InviteeId,
			&invitation.InviterId,
			&invitation.Status,
			&invitation.CreatedAt,
		)
		helper.PanicIfError(err)
		invitations = append(invitations, invitation)
	}
	return invitations
}

func (repository *GroupRepositoryImpl) FindInvitationsByGroup(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupInvitation {
	SQL := `SELECT id, group_id, user_id, inviter_id, status, created_at 
			FROM group_invitations 
			WHERE group_id = $1
			ORDER BY created_at DESC`

	rows, err := tx.QueryContext(ctx, SQL, groupId)
	helper.PanicIfError(err)
	defer rows.Close()

	var invitations []domain.GroupInvitation
	for rows.Next() {
		invitation := domain.GroupInvitation{}
		err := rows.Scan(
			&invitation.Id,
			&invitation.GroupId,
			&invitation.InviteeId,
			&invitation.InviterId,
			&invitation.Status,
			&invitation.CreatedAt,
		)
		helper.PanicIfError(err)
		invitations = append(invitations, invitation)
	}
	return invitations
}


func (repository *GroupRepositoryImpl) Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.Group {
    SQL := `SELECT id, name, description, rule, creator_id, image, privacy_level, invite_policy, created_at, updated_at
            FROM groups
            WHERE LOWER(name) LIKE LOWER($1) OR LOWER(description) LIKE LOWER($1)
            ORDER BY name
            LIMIT $2 OFFSET $3`
   
    searchPattern := "%" + query + "%"
    fmt.Printf("Executing group search SQL with pattern: %s\n", searchPattern)
   
    rows, err := tx.QueryContext(ctx, SQL, searchPattern, limit, offset)
    if err != nil {
        fmt.Printf("Error executing group search: %v\n", err)
        return []domain.Group{}
    }
    defer rows.Close()
   
    var groups []domain.Group
    for rows.Next() {
        group := domain.Group{}
        err := rows.Scan(
            &group.Id,
            &group.Name,
            &group.Description,
            &group.Rule,
            &group.CreatorId,
            &group.Image,
            &group.PrivacyLevel,
            &group.InvitePolicy,
            &group.CreatedAt,
            &group.UpdatedAt,
        )
        if err != nil {
            fmt.Printf("Error scanning group: %v\n", err)
            continue
        }
        groups = append(groups, group)
        fmt.Printf("Found group: %s\n", group.Name)
    }
   
    return groups
}


func (repository *GroupRepositoryImpl) CountMembers(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) int {
    SQL := `SELECT COUNT(*) FROM group_members WHERE group_id = $1 AND is_active = true`
   
    var count int
    err := tx.QueryRowContext(ctx, SQL, groupId).Scan(&count)
    if err != nil {
        fmt.Printf("Error counting members: %v\n", err)
        return 0
    }
   
    return count
}


