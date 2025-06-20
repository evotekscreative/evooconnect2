// Tambahkan di repository/pending_post_repository_impl.go
package repository

import (
    "context"
    "database/sql"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/domain"
    "github.com/google/uuid"
    "time"
)

type PendingPostRepositoryImpl struct {
}

func NewPendingPostRepository() PendingPostRepository {
    return &PendingPostRepositoryImpl{}
}

func (repository *PendingPostRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, pendingPost domain.PendingPost) domain.PendingPost {
    SQL := `INSERT INTO pending_posts(id, post_id, group_id, status, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6)`
    
    _, err := tx.ExecContext(ctx, SQL,
        pendingPost.Id,
        pendingPost.PostId,
        pendingPost.GroupId,
        pendingPost.Status,
        pendingPost.CreatedAt,
        pendingPost.UpdatedAt,
    )
    helper.PanicIfError(err)
    
    return pendingPost
}

func (repository *PendingPostRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.PendingPost, error) {
    SQL := `SELECT id, post_id, group_id, status, created_at, updated_at 
            FROM pending_posts WHERE id = $1`
    
    rows, err := tx.QueryContext(ctx, SQL, id)
    helper.PanicIfError(err)
    defer rows.Close()
    
    pendingPost := domain.PendingPost{}
    if rows.Next() {
        err := rows.Scan(
            &pendingPost.Id,
            &pendingPost.PostId,
            &pendingPost.GroupId,
            &pendingPost.Status,
            &pendingPost.CreatedAt,
            &pendingPost.UpdatedAt,
        )
        helper.PanicIfError(err)
        return pendingPost, nil
    }
    
    return pendingPost, sql.ErrNoRows
}

func (repository *PendingPostRepositoryImpl) FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, limit, offset int) []domain.PendingPost {
    SQL := `SELECT id, post_id, group_id, status, created_at, updated_at 
            FROM pending_posts 
            WHERE group_id = $1 AND status = 'pending'
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3`
    
    rows, err := tx.QueryContext(ctx, SQL, groupId, limit, offset)
    helper.PanicIfError(err)
    defer rows.Close()
    
    var pendingPosts []domain.PendingPost
    for rows.Next() {
        pendingPost := domain.PendingPost{}
        err := rows.Scan(
            &pendingPost.Id,
            &pendingPost.PostId,
            &pendingPost.GroupId,
            &pendingPost.Status,
            &pendingPost.CreatedAt,
            &pendingPost.UpdatedAt,
        )
        helper.PanicIfError(err)
        pendingPosts = append(pendingPosts, pendingPost)
    }
    
    return pendingPosts
}

func (repository *PendingPostRepositoryImpl) UpdateStatus(ctx context.Context, tx *sql.Tx, id uuid.UUID, status string) domain.PendingPost {
    SQL := `UPDATE pending_posts SET status = $1, updated_at = $2 WHERE id = $3`
    
    now := time.Now()
    _, err := tx.ExecContext(ctx, SQL, status, now, id)
    helper.PanicIfError(err)
    
    pendingPost, err := repository.FindById(ctx, tx, id)
    helper.PanicIfError(err)
    
    return pendingPost
}

func (repository *PendingPostRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, id uuid.UUID) {
    SQL := `DELETE FROM pending_posts WHERE id = $1`
    
    _, err := tx.ExecContext(ctx, SQL, id)
    helper.PanicIfError(err)
}
