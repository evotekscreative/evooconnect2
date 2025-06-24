package repository

import (
    "context"
    "database/sql"
    "errors"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/domain"
    "time"
    "github.com/google/uuid"
    "encoding/json"
)

type GroupPinnedPostRepositoryImpl struct {
}

func NewGroupPinnedPostRepository() GroupPinnedPostRepository {
    return &GroupPinnedPostRepositoryImpl{}
}

func (repository *GroupPinnedPostRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, pinnedPost domain.GroupPinnedPost) domain.GroupPinnedPost {
    if pinnedPost.Id == uuid.Nil {
        pinnedPost.Id = uuid.New()
    }
    
    now := time.Now()
    pinnedPost.CreatedAt = now
    pinnedPost.UpdatedAt = now
    pinnedPost.PinnedAt = now
    
    SQL := `INSERT INTO group_pinned_posts (id, group_id, post_id, pinned_by, pinned_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (group_id, post_id) DO UPDATE
            SET pinned_by = $4, pinned_at = $5, updated_at = $7`
            
    _, err := tx.ExecContext(ctx, SQL, 
        pinnedPost.Id, 
        pinnedPost.GroupId, 
        pinnedPost.PostId, 
        pinnedPost.PinnedBy, 
        pinnedPost.PinnedAt, 
        pinnedPost.CreatedAt, 
        pinnedPost.UpdatedAt)
    
    helper.PanicIfError(err)
    return pinnedPost
}

func (repository *GroupPinnedPostRepositoryImpl) FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) []domain.GroupPinnedPost {
    SQL := `SELECT gpp.id, gpp.group_id, gpp.post_id, gpp.pinned_by, gpp.pinned_at, gpp.created_at, gpp.updated_at,
                  p.id, p.user_id, p.content, p.images, p.visibility, p.created_at, p.updated_at, p.group_id,
                  u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
           FROM group_pinned_posts gpp
           JOIN posts p ON gpp.post_id = p.id
           JOIN users u ON p.user_id = u.id
           WHERE gpp.group_id = $1
           ORDER BY gpp.pinned_at DESC`
           
    rows, err := tx.QueryContext(ctx, SQL, groupId)
    helper.PanicIfError(err)
    defer rows.Close()
    
    var pinnedPosts []domain.GroupPinnedPost
    for rows.Next() {
        pinnedPost := domain.GroupPinnedPost{}
        post := domain.Post{}
        user := domain.User{}
        var images sql.NullString
        var groupIdStr sql.NullString
        
        err := rows.Scan(
            &pinnedPost.Id,
            &pinnedPost.GroupId,
            &pinnedPost.PostId,
            &pinnedPost.PinnedBy,
            &pinnedPost.PinnedAt,
            &pinnedPost.CreatedAt,
            &pinnedPost.UpdatedAt,
            &post.Id,
            &post.UserId,
            &post.Content,
            &images,
            &post.Visibility,
            &post.CreatedAt,
            &post.UpdatedAt,
            &groupIdStr,
            &user.Id,
            &user.Name,
            &user.Username,
            &user.Photo,
        )
        helper.PanicIfError(err)
        
        // Handle images
        if images.Valid {
            err = json.Unmarshal([]byte(images.String), &post.Images)
            if err != nil {
                post.Images = []string{}
            }
        } else {
            post.Images = []string{}
        }
        
        // Handle group_id
        if groupIdStr.Valid {
            groupUUID, err := uuid.Parse(groupIdStr.String)
            if err == nil {
                post.GroupId = &groupUUID
            }
        }
        
        post.User = &user
        pinnedPost.Post = &post
        
        pinnedPosts = append(pinnedPosts, pinnedPost)
    }
    
    return pinnedPosts
}

func (repository *GroupPinnedPostRepositoryImpl) FindByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.GroupPinnedPost, error) {
    SQL := `SELECT id, group_id, post_id, pinned_by, pinned_at, created_at, updated_at
            FROM group_pinned_posts
            WHERE post_id = $1`
            
    var pinnedPost domain.GroupPinnedPost
    err := tx.QueryRowContext(ctx, SQL, postId).Scan(
        &pinnedPost.Id,
        &pinnedPost.GroupId,
        &pinnedPost.PostId,
        &pinnedPost.PinnedBy,
        &pinnedPost.PinnedAt,
        &pinnedPost.CreatedAt,
        &pinnedPost.UpdatedAt,
    )
    
    if err != nil {
        if err == sql.ErrNoRows {
            return pinnedPost, errors.New("pinned post not found")
        }
        return pinnedPost, err
    }
    
    return pinnedPost, nil
}

func (repository *GroupPinnedPostRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, postId uuid.UUID) error {
    SQL := `DELETE FROM group_pinned_posts WHERE group_id = $1 AND post_id = $2`
    _, err := tx.ExecContext(ctx, SQL, groupId, postId)
    return err
}

func (repository *GroupPinnedPostRepositoryImpl) CountByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) (int, error) {
    SQL := `SELECT COUNT(*) FROM group_pinned_posts WHERE group_id = $1`
    var count int
    err := tx.QueryRowContext(ctx, SQL, groupId).Scan(&count)
    return count, err
}