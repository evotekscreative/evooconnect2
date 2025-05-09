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

type CommentBlogRepositoryImpl struct {
}

func NewCommentBlogRepository() CommentBlogRepository {
	return &CommentBlogRepositoryImpl{}
}

func (repository *CommentBlogRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, comment domain.CommentBlog) domain.CommentBlog {
	if comment.Id == uuid.Nil {
		comment.Id = uuid.New()
	}

	now := time.Now()
	comment.CreatedAt = now
	comment.UpdatedAt = now

	var SQL string
	var args []interface{}

	if comment.ParentId != nil {
		SQL = `INSERT INTO comment_blog (id, blog_id, user_id, parent_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`
		args = []interface{}{
			comment.Id,
			comment.BlogId,
			comment.UserId,
			comment.ParentId,
			comment.Content,
			comment.CreatedAt,
			comment.UpdatedAt,
		}
	} else {
		SQL = `INSERT INTO comment_blog (id, blog_id, user_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)`
		args = []interface{}{
			comment.Id,
			comment.BlogId,
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

func (repository *CommentBlogRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) (domain.CommentBlog, error) {
	SQL := `SELECT c.id, c.blog_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
           u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
        FROM comment_blog c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1`

	var comment domain.CommentBlog
	var user domain.User
	var parentId sql.NullString

	row := tx.QueryRowContext(ctx, SQL, commentId)
	err := row.Scan(
		&comment.Id,
		&comment.BlogId,
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

	if parentId.Valid {
		parentUUID, err := uuid.Parse(parentId.String)
		if err == nil {
			comment.ParentId = &parentUUID
		}
	}

	comment.User = &user

	if comment.ParentId == nil {
		comment.Replies = repository.FindRepliesByParentId(ctx, tx, comment.Id)
	}

	return comment, nil
}

func (repository *CommentBlogRepositoryImpl) FindByBlogId(ctx context.Context, tx *sql.Tx, blogId uuid.UUID, parentIdFilter *uuid.UUID, limit, offset int) ([]domain.CommentBlog, error) {
	var SQL string
	var args []interface{}

	baseSQL := `SELECT c.id, c.blog_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
               u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
            FROM comment_blog c
            JOIN users u ON c.user_id = u.id
            WHERE c.blog_id = $1`

	if parentIdFilter == nil {
		SQL = baseSQL + ` AND c.parent_id IS NULL
                ORDER BY c.created_at DESC
                LIMIT $2 OFFSET $3`
		args = []interface{}{blogId, limit, offset}
	} else {
		SQL = baseSQL + ` AND c.parent_id = $2
                ORDER BY c.created_at ASC
                LIMIT $3 OFFSET $4`
		args = []interface{}{blogId, parentIdFilter, limit, offset}
	}

	rows, err := tx.QueryContext(ctx, SQL, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []domain.CommentBlog
	commentMap := make(map[uuid.UUID]*domain.CommentBlog)

	for rows.Next() {
		var comment domain.CommentBlog
		var user domain.User
		var parentId sql.NullString

		err := rows.Scan(
			&comment.Id,
			&comment.BlogId,
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

		if parentId.Valid {
			parentUUID, err := uuid.Parse(parentId.String)
			if err == nil {
				comment.ParentId = &parentUUID
			}
		}

		comment.User = &user
		comment.Replies = []domain.CommentBlog{}

		commentMap[comment.Id] = &comment
		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	if parentIdFilter == nil && len(comments) > 0 {
		var commentIds []interface{}
		for i := range comments {
			commentIds = append(commentIds, comments[i].Id)
		}

		placeholders := make([]string, len(commentIds))
		for i := range placeholders {
			placeholders[i] = fmt.Sprintf("$%d", i+1)
		}

		if len(commentIds) > 0 {
			repliesSQL := fmt.Sprintf(`SELECT c.id, c.blog_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
                          u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
                       FROM comment_blog c
                       JOIN users u ON c.user_id = u.id
                       WHERE c.parent_id IN (%s)
                       ORDER BY c.parent_id, c.created_at ASC`,
				strings.Join(placeholders, ", "))

			repliesRows, err := tx.QueryContext(ctx, repliesSQL, commentIds...)
			if err != nil {
				fmt.Printf("Error fetching replies: %v\n", err)
			} else {
				defer repliesRows.Close()

				for repliesRows.Next() {
					var reply domain.CommentBlog
					var user domain.User
					var parentId sql.NullString

					err := repliesRows.Scan(
						&reply.Id,
						&reply.BlogId,
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
						fmt.Printf("Error scanning reply: %v\n", err)
						continue
					}

					if parentId.Valid {
						parentUUID, err := uuid.Parse(parentId.String)
						if err == nil {
							reply.ParentId = &parentUUID

							if parent, exists := commentMap[parentUUID]; exists {
								reply.User = &user
								parent.Replies = append(parent.Replies, reply)
							}
						}
					}
				}

				if err = repliesRows.Err(); err != nil {
					fmt.Printf("Error in replies rows: %v\n", err)
				}
			}
		}
	}

	return comments, nil
}

func (repository *CommentBlogRepositoryImpl) CountByBlogId(ctx context.Context, tx *sql.Tx, blogId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM comment_blog WHERE blog_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, blogId).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (repository *CommentBlogRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, comment domain.CommentBlog) (domain.CommentBlog, error) {
	SQL := `UPDATE comment_blog SET
        content = $1,
        updated_at = $2
        WHERE id = $3`

	_, err := tx.ExecContext(ctx, SQL, comment.Content, time.Now(), comment.Id)
	if err != nil {
		return comment, err
	}

	return comment, nil
}

func (repository *CommentBlogRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) error {
	SQL := "DELETE FROM comment_blog WHERE id = $1 OR parent_id = $1"

	_, err := tx.ExecContext(ctx, SQL, commentId)
	return err
}

func (repository *CommentBlogRepositoryImpl) FindRepliesByParentIdSafe(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) ([]domain.CommentBlog, error) {
	SQL := `SELECT c.id, c.blog_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
           u.id, u.name, COALESCE(u.username, '') as username, COALESCE(u.photo, '') as photo
        FROM comment_blog c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = $1
        ORDER BY c.created_at ASC`

	rows, err := tx.QueryContext(ctx, SQL, parentId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var replies []domain.CommentBlog
	for rows.Next() {
		var reply domain.CommentBlog
		var user domain.User
		var replyParentId sql.NullString

		err := rows.Scan(
			&reply.Id,
			&reply.BlogId,
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

func (repository *CommentBlogRepositoryImpl) FindRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) []domain.CommentBlog {
	replies, err := repository.FindRepliesByParentIdSafe(ctx, tx, parentId)
	if err != nil {
		return []domain.CommentBlog{}
	}
	return replies
}

func (repository *CommentBlogRepositoryImpl) CountRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM comment_blog WHERE parent_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, parentId).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}