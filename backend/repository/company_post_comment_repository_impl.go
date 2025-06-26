package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/model/domain"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type CompanyPostCommentRepositoryImpl struct{}

func NewCompanyPostCommentRepository() CompanyPostCommentRepository {
	return &CompanyPostCommentRepositoryImpl{}
}

// Create new comment
func (repository *CompanyPostCommentRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, comment domain.CompanyPostComment) (domain.CompanyPostComment, error) {
	// Generate UUID if not provided
	if comment.Id == uuid.Nil {
		comment.Id = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	comment.CreatedAt = now
	comment.UpdatedAt = now

	SQL := `INSERT INTO company_post_comments (id, post_id, user_id, parent_id, comment_to_id, content, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := tx.ExecContext(ctx, SQL, comment.Id, comment.PostId, comment.UserId, comment.ParentId, comment.CommentToId, comment.Content, comment.CreatedAt, comment.UpdatedAt)
	if err != nil {
		return comment, err
	}

	return comment, nil
}

func (repository *CompanyPostCommentRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) (domain.CompanyPostComment, error) {
	// First get basic comment with user info
	SQL := `SELECT 
                c.id, c.post_id, c.user_id, c.parent_id, c.comment_to_id, c.content, c.created_at, c.updated_at,
                u.id, u.name, u.username, u.photo
            FROM company_post_comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = $1`

	var comment domain.CompanyPostComment

	// Variables for nullable user fields
	var userId, userName, userUsername, userPhoto sql.NullString

	row := tx.QueryRowContext(ctx, SQL, commentId)
	err := row.Scan(
		// Main comment fields (8 columns)
		&comment.Id, &comment.PostId, &comment.UserId, &comment.ParentId, &comment.CommentToId, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt,
		// User fields (4 columns)
		&userId, &userName, &userUsername, &userPhoto,
	)

	if err != nil {
		return comment, err
	}

	// Set user info if available
	if userId.Valid && userId.String != "" {
		userUUID, parseErr := uuid.Parse(userId.String)
		if parseErr == nil {
			user := &domain.User{
				Id:       userUUID,
				Name:     userName.String,
				Username: userUsername.String,
			}
			if userPhoto.Valid {
				user.Photo = userPhoto.String
			}
			comment.User = user
		}
	}

	// Get comment-to-comment info separately if comment_to_id exists
	if comment.CommentToId != nil {
		commentToSQL := `SELECT 
                            cc.id, cc.content, cc.user_id,
                            ccu.id, ccu.name, ccu.username, ccu.photo
                        FROM company_post_comments cc
                        LEFT JOIN users ccu ON cc.user_id = ccu.id
                        WHERE cc.id = $1`

		var commentToCommentId, commentToCommentContent, commentToCommentUserId sql.NullString
		var commentToUserIdFromUser, commentToCommentUserName, commentToCommentUserUsername, commentToCommentUserPhoto sql.NullString

		commentToRow := tx.QueryRowContext(ctx, commentToSQL, *comment.CommentToId)
		commentToErr := commentToRow.Scan(
			// Comment-to-comment fields (3 columns) - cc.id, cc.content, cc.user_id
			&commentToCommentId, &commentToCommentContent, &commentToCommentUserId,
			// Comment-to-comment user fields (4 columns) - ccu.id, ccu.name, ccu.username, ccu.photo
			&commentToUserIdFromUser, &commentToCommentUserName, &commentToCommentUserUsername, &commentToCommentUserPhoto,
		)

		if commentToErr == nil && commentToCommentId.Valid {
			commentToCommentUUID, parseErr := uuid.Parse(commentToCommentId.String)
			if parseErr == nil {
				commentToComment := &domain.CompanyPostComment{
					Id:      commentToCommentUUID,
					Content: commentToCommentContent.String,
				}

				// Set user info for comment-to-comment
				if commentToUserIdFromUser.Valid && commentToUserIdFromUser.String != "" {
					commentToCommentUserUUID, userParseErr := uuid.Parse(commentToUserIdFromUser.String)
					if userParseErr == nil {
						commentToCommentUser := &domain.User{
							Id:       commentToCommentUserUUID,
							Name:     commentToCommentUserName.String,
							Username: commentToCommentUserUsername.String,
						}
						if commentToCommentUserPhoto.Valid {
							commentToCommentUser.Photo = commentToCommentUserPhoto.String
						}
						commentToComment.User = commentToCommentUser
					}
				}

				comment.CommentToComment = commentToComment
			}
		}
	}

	return comment, nil
}

// Find main comments by post ID (parent_id IS NULL)
func (repository *CompanyPostCommentRepositoryImpl) FindMainCommentsByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID, limit, offset int) ([]domain.CompanyPostComment, int, error) {
	var comments []domain.CompanyPostComment

	// Get total count of main comments
	countSQL := "SELECT COUNT(*) FROM company_post_comments WHERE post_id = $1 AND parent_id IS NULL"
	var total int
	err := tx.QueryRowContext(ctx, countSQL, postId).Scan(&total)
	if err != nil {
		return comments, 0, err
	}

	// Get main comments with pagination
	SQL := `SELECT 
                c.id, c.post_id, c.user_id, c.parent_id, c.comment_to_id, c.content, c.created_at, c.updated_at,
                u.id, u.name, u.username, u.photo
            FROM company_post_comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1 AND c.parent_id IS NULL
            ORDER BY c.created_at ASC
            LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, postId, limit, offset)
	if err != nil {
		return comments, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment domain.CompanyPostComment

		// Variables for nullable user fields
		var userId, userName, userUsername, userPhoto sql.NullString

		err := rows.Scan(
			// Main comment fields (8 columns)
			&comment.Id, &comment.PostId, &comment.UserId, &comment.ParentId, &comment.CommentToId, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt,
			// User fields (4 columns)
			&userId, &userName, &userUsername, &userPhoto,
		)
		if err != nil {
			return comments, 0, err
		}

		// Set user info if available
		if userId.Valid && userId.String != "" {
			userUUID, parseErr := uuid.Parse(userId.String)
			if parseErr == nil {
				user := &domain.User{
					Id:       userUUID,
					Name:     userName.String,
					Username: userUsername.String,
				}
				if userPhoto.Valid {
					user.Photo = userPhoto.String
				}
				comment.User = user
			}
		}

		comments = append(comments, comment)
	}

	return comments, total, nil
}

// Find replies by parent ID
func (repository *CompanyPostCommentRepositoryImpl) FindRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID, limit, offset int) ([]domain.CompanyPostComment, int, error) {
	var replies []domain.CompanyPostComment

	// Check if transaction is still valid
	if tx == nil {
		return replies, 0, fmt.Errorf("transaction is nil")
	}

	// Get total count of replies with error handling
	countSQL := "SELECT COUNT(*) FROM company_post_comments WHERE parent_id = $1"
	var total int
	err := tx.QueryRowContext(ctx, countSQL, parentId).Scan(&total)
	if err != nil {
		fmt.Printf("Count query error: %v\n", err)
		return replies, 0, fmt.Errorf("failed to count replies: %w", err)
	}

	// Use a more comprehensive query to get all needed data in one go
	SQL := `SELECT 
                c.id, c.post_id, c.user_id, c.parent_id, c.comment_to_id, c.content, c.created_at, c.updated_at,
                u.id, u.name, u.username, u.photo,
                cc.id, cc.content,
                ccu.id, ccu.name, ccu.username, ccu.photo
            FROM company_post_comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN company_post_comments cc ON c.comment_to_id = cc.id
            LEFT JOIN users ccu ON cc.user_id = ccu.id
            WHERE c.parent_id = $1
            ORDER BY c.created_at ASC
            LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, parentId, limit, offset)
	if err != nil {
		fmt.Printf("Query error: %v\n", err)
		return replies, 0, fmt.Errorf("failed to query replies: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var comment domain.CompanyPostComment

		// Variables for all nullable fields (16 total variables for 16 columns)
		var userId, userName, userUsername, userPhoto sql.NullString
		var commentToCommentId, commentToCommentContent sql.NullString
		var commentToCommentUserId, commentToCommentUserName, commentToCommentUserUsername, commentToCommentUserPhoto sql.NullString

		err := rows.Scan(
			// Main comment fields (8 columns)
			&comment.Id, &comment.PostId, &comment.UserId, &comment.ParentId, &comment.CommentToId, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt,
			// User fields (4 columns)
			&userId, &userName, &userUsername, &userPhoto,
			// Comment-to-comment fields (2 columns)
			&commentToCommentId, &commentToCommentContent,
			// Comment-to-comment user fields (4 columns)
			&commentToCommentUserId, &commentToCommentUserName, &commentToCommentUserUsername, &commentToCommentUserPhoto,
		)
		if err != nil {
			fmt.Printf("Scan error: %v\n", err)
			return replies, 0, fmt.Errorf("failed to scan reply: %w", err)
		}

		// Set user info if available
		if userId.Valid && userId.String != "" {
			userUUID, parseErr := uuid.Parse(userId.String)
			if parseErr == nil {
				user := &domain.User{
					Id:       userUUID,
					Name:     userName.String,
					Username: userUsername.String,
				}
				if userPhoto.Valid {
					user.Photo = userPhoto.String
				}
				comment.User = user
			}
		}

		// Set comment-to-comment info if available (without recursive calls)
		if commentToCommentId.Valid && commentToCommentId.String != "" {
			commentToCommentUUID, parseErr := uuid.Parse(commentToCommentId.String)
			if parseErr == nil {
				commentToComment := &domain.CompanyPostComment{
					Id:      commentToCommentUUID,
					Content: commentToCommentContent.String,
				}

				// Set user info for comment-to-comment
				if commentToCommentUserId.Valid && commentToCommentUserId.String != "" {
					commentToCommentUserUUID, userParseErr := uuid.Parse(commentToCommentUserId.String)
					if userParseErr == nil {
						commentToCommentUser := &domain.User{
							Id:       commentToCommentUserUUID,
							Name:     commentToCommentUserName.String,
							Username: commentToCommentUserUsername.String,
						}
						if commentToCommentUserPhoto.Valid {
							commentToCommentUser.Photo = commentToCommentUserPhoto.String
						}
						commentToComment.User = commentToCommentUser
					}
				}

				comment.CommentToComment = commentToComment
			}
		}

		replies = append(replies, comment)
	}

	// Check for any errors that occurred during iteration
	if err = rows.Err(); err != nil {
		fmt.Printf("Rows iteration error: %v\n", err)
		return replies, 0, fmt.Errorf("error during rows iteration: %w", err)
	}

	return replies, total, nil
}

// Update comment content
func (repository *CompanyPostCommentRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, comment domain.CompanyPostComment) (domain.CompanyPostComment, error) {
	comment.UpdatedAt = time.Now()

	SQL := "UPDATE company_post_comments SET content = $1, updated_at = $2 WHERE id = $3"
	_, err := tx.ExecContext(ctx, SQL, comment.Content, comment.UpdatedAt, comment.Id)
	if err != nil {
		return comment, err
	}

	return comment, nil
}

// Delete comment and its replies
func (repository *CompanyPostCommentRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, commentId uuid.UUID) error {
	// Delete replies first (if not using CASCADE)
	SQL := "DELETE FROM company_post_comments WHERE parent_id = $1"
	_, err := tx.ExecContext(ctx, SQL, commentId)
	if err != nil {
		return err
	}

	// Delete the comment itself
	SQL = "DELETE FROM company_post_comments WHERE id = $1"
	_, err = tx.ExecContext(ctx, SQL, commentId)
	return err
}

// Count main comments by post ID
func (repository *CompanyPostCommentRepositoryImpl) CountMainCommentsByPostId(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (int, error) {
	SQL := "SELECT COUNT(*) FROM company_post_comments WHERE post_id = $1 AND parent_id IS NULL"
	var count int
	err := tx.QueryRowContext(ctx, SQL, postId).Scan(&count)
	return count, err
}

// Count replies by parent ID
func (repository *CompanyPostCommentRepositoryImpl) CountRepliesByParentId(ctx context.Context, tx *sql.Tx, parentId uuid.UUID) (int, error) {
	SQL := "SELECT COUNT(*) FROM company_post_comments WHERE parent_id = $1"
	var count int
	err := tx.QueryRowContext(ctx, SQL, parentId).Scan(&count)
	return count, err
}
