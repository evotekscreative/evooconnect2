package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type CommentRepositoryImpl struct {
}

func NewCommentRepository() CommentRepository {
	return &CommentRepositoryImpl{}
}

func (repository *CommentRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, comment domain.Comment) domain.Comment {
	// Generate UUID jika belum ada
	if comment.Id == uuid.Nil {
		comment.Id = uuid.New()
	}

	// Set created_at dan updated_at ke waktu saat ini
	now := time.Now()
	comment.CreatedAt = now
	comment.UpdatedAt = now

	// Query untuk menyimpan komentar
	var SQL string
	var args []interface{}

	if comment.ParentId != nil {
		SQL = `INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`
		args = []interface{}{
			comment.Id,
			comment.PostId,
			comment.UserId,
			comment.ParentId,
			comment.Content,
			comment.CreatedAt,
			comment.UpdatedAt,
		}
	} else {
		SQL = `INSERT INTO comments (id, post_id, user_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)`
		args = []interface{}{
			comment.Id,
			comment.PostId,
			comment.UserId,
			comment.Content,
			comment.CreatedAt,
			comment.UpdatedAt,
		}
	}

	_, err := tx.ExecContext(ctx, SQL, args...)
	if err != nil {
		helper.PanicIfError(err)
	}

	return comment
}

func (repository *CommentRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) (domain.Comment, error) {
	SQL := `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
           u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1`

	var comment domain.Comment
	var user domain.User
	var parentId sql.NullString

	row := tx.QueryRowContext(ctx, SQL, commentId)
	err := row.Scan(
		&comment.Id,
		&comment.PostId,
		&comment.UserId,
		&parentId,
		&comment.Content,
		&comment.CreatedAt,
		&comment.UpdatedAt,
		&user.Id,
		&user.Name,
		&user.Username,
		&user.Photo,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return comment, errors.New("comment not found")
		}
		return comment, err
	}

	// Convert parentId from sql.NullString to *uuid.UUID
	if parentId.Valid {
		parentUUID, err := uuid.Parse(parentId.String)
		if err == nil {
			comment.ParentId = &parentUUID
		}
	}

	comment.User = &user

	// Get comment replies
	if comment.ParentId == nil { // Only load replies for main comments
		comment.Replies = repository.FindRepliesByParentId(ctx, tx, comment.Id)
	}

	return comment, nil
}

func (repository *CommentRepositoryImpl) FindByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID, parentIdFilter *uuid.UUID, limit, offset int) ([]domain.Comment, error) {
	var SQL string
	var args []interface{}

	// Base SQL untuk mengambil komentar
	baseSQL := `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
               u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1`

	// Filter berdasarkan parentId
	if parentIdFilter == nil {
		// Ambil komentar utama (bukan balasan)
		SQL = baseSQL + ` AND c.parent_id IS NULL
                ORDER BY c.created_at DESC
                LIMIT $2 OFFSET $3`
		args = []interface{}{postId, limit, offset}
	} else {
		// Ambil balasan untuk komentar tertentu
		SQL = baseSQL + ` AND c.parent_id = $2
                ORDER BY c.created_at ASC
                LIMIT $3 OFFSET $4`
		args = []interface{}{postId, parentIdFilter, limit, offset}
	}

	rows, err := tx.QueryContext(ctx, SQL, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []domain.Comment
	commentMap := make(map[uuid.UUID]*domain.Comment)

	for rows.Next() {
		var comment domain.Comment
		var user domain.User
		var parentId sql.NullString

		err := rows.Scan(
			&comment.Id,
			&comment.PostId,
			&comment.UserId,
			&parentId,
			&comment.Content,
			&comment.CreatedAt,
			&comment.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Username,
			&user.Photo,
		)
		if err != nil {
			return nil, err
		}

		// Convert parentId from sql.NullString to *uuid.UUID
		if parentId.Valid {
			parentUUID, err := uuid.Parse(parentId.String)
			if err == nil {
				comment.ParentId = &parentUUID
			}
		}

		comment.User = &user
		comment.Replies = []domain.Comment{} // Initialize empty replies array

		commentMap[comment.Id] = &comment
		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// If we're getting main comments, fetch all replies in a single batch query
	if parentIdFilter == nil && len(comments) > 0 {
		// Extract all comment IDs
		var commentIds []interface{}
		for i := range comments {
			commentIds = append(commentIds, comments[i].Id)
		}

		// Build placeholder string for IN clause (e.g., $1, $2, $3)
		placeholders := make([]string, len(commentIds))
		for i := range placeholders {
			placeholders[i] = fmt.Sprintf("$%d", i+1)
		}

		// Don't attempt to fetch replies if no comments were found
		if len(commentIds) > 0 {
			// Query to get all replies for all comments in one go
			repliesSQL := fmt.Sprintf(`SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
                          u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
                       FROM comments c
                       JOIN users u ON c.user_id = u.id
                       WHERE c.parent_id IN (%s)
                       ORDER BY c.parent_id, c.created_at ASC`,
				strings.Join(placeholders, ", "))

			repliesRows, err := tx.QueryContext(ctx, repliesSQL, commentIds...)
			if err != nil {
				// Log error but continue without replies
				fmt.Printf("Error fetching replies: %v\n", err)
			} else {
				defer repliesRows.Close()

				for repliesRows.Next() {
					var reply domain.Comment
					var user domain.User
					var parentId sql.NullString

					err := repliesRows.Scan(
						&reply.Id,
						&reply.PostId,
						&reply.UserId,
						&parentId,
						&reply.Content,
						&reply.CreatedAt,
						&reply.UpdatedAt,
						&user.Id,
						&user.Name,
						&user.Username,
						&user.Photo,
					)
					if err != nil {
						// Log error but continue
						fmt.Printf("Error scanning reply: %v\n", err)
						continue
					}

					// Convert parentId from sql.NullString to *uuid.UUID
					if parentId.Valid {
						parentUUID, err := uuid.Parse(parentId.String)
						if err == nil {
							reply.ParentId = &parentUUID

							// Add reply to parent comment
							if parent, exists := commentMap[parentUUID]; exists {
								reply.User = &user
								parent.Replies = append(parent.Replies, reply)
							}
						}
					}
				}

				if err = repliesRows.Err(); err != nil {
					// Log error but continue
					fmt.Printf("Error in replies rows: %v\n", err)
				}
			}
		}
	}

	return comments, nil
}

func (repository *CommentRepositoryImpl) CountByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM comments WHERE post_id = $1`
	var count int
	err := tx.QueryRowContext(ctx, SQL, postId).Scan(&count)
	return count, err
}

func (repository *CommentRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, comment domain.Comment) (domain.Comment, error) {
	SQL := `UPDATE comments SET
        content = $1,
        updated_at = $2
        WHERE id = $3`

	_, err := tx.ExecContext(ctx, SQL, comment.Content, time.Now(), comment.Id)
	if err != nil {
		return comment, err
	}

	return comment, nil
}

func (repository *CommentRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) error {
	SQL := "DELETE FROM comments WHERE id = $1 OR parent_id = $1"

	_, err := tx.ExecContext(ctx, SQL, commentId)
	return err
}

// Fungsi yang sama dengan FindRepliesByParentId tetapi dengan penanganan error yang lebih baik
func (repository *CommentRepositoryImpl) FindRepliesByParentIdSafe(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) ([]domain.Comment, error) {
	SQL := `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
           u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = $1
        ORDER BY c.created_at ASC`

	rows, err := tx.QueryContext(ctx, SQL, parentId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var replies []domain.Comment
	for rows.Next() {
		var reply domain.Comment
		var user domain.User
		var replyParentId sql.NullString

		err := rows.Scan(
			&reply.Id,
			&reply.PostId,
			&reply.UserId,
			&replyParentId,
			&reply.Content,
			&reply.CreatedAt,
			&reply.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Username,
			&user.Photo,
		)
		if err != nil {
			return nil, err
		}

		// Convert parentId from sql.NullString to *uuid.UUID
		if replyParentId.Valid {
			parentUUID, err := uuid.Parse(replyParentId.String)
			if err == nil {
				reply.ParentId = &parentUUID
			}
		}

		reply.User = &user
		replies = append(replies, reply)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return replies, nil
}

// Tetap mempertahankan fungsi lama untuk kompatibilitas
func (repository *CommentRepositoryImpl) FindRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) []domain.Comment {
	replies, err := repository.FindRepliesByParentIdSafe(ctx, tx, parentId)
	if err != nil {
		return []domain.Comment{}
	}
	return replies
}

func (repository *CommentRepositoryImpl) CountRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM comments WHERE parent_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, parentId).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
