package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"time"
	"github.com/google/uuid"
)

type PostRepositoryImpl struct {
}

func NewPostRepository() PostRepository {
	return &PostRepositoryImpl{}
}

func (repository *PostRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, post domain.Post) domain.Post {
	// Generate a new UUID if not provided
	if post.Id == uuid.Nil {
		post.Id = uuid.New()
	}

	SQL := `INSERT INTO posts
        (id, user_id, content, images, visibility, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := tx.ExecContext(ctx, SQL,
		post.Id,
		post.UserId,
		post.Content,
		post.Images,
		post.Visibility,
		post.CreatedAt,
		post.UpdatedAt)
	helper.PanicIfError(err)

	return post
}

func (repository *PostRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, post domain.Post) domain.Post {
	SQL := `UPDATE posts SET 
        content = $1, 
        images = $2,
        visibility = $3,
        updated_at = $4
        WHERE id = $5`

	_, err := tx.ExecContext(ctx, SQL,
		post.Content,
		post.Images,
		post.Visibility,
		time.Now(),
		post.Id)
	helper.PanicIfError(err)

	return post
}

func (repository *PostRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, postId uuid.UUID) {
	SQL := "DELETE FROM posts WHERE id = $1"
	_, err := tx.ExecContext(ctx, SQL, postId)
	helper.PanicIfError(err)
}

func (repository *PostRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.Post, error) {
	SQL := `SELECT 
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, '')
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, postId)
	helper.PanicIfError(err)
	defer rows.Close()

	post := domain.Post{}
	user := domain.User{}

	if rows.Next() {
		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Images,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline)
		helper.PanicIfError(err)

		post.User = &user
		return post, nil
	} else {
		return post, errors.New("post not found")
	}
}

func (repository *PostRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, currentUserId uuid.UUID, limit, offset int) []domain.Post {
	SQL := `SELECT 
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at, p.group_id,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, ''),
        g.id, g.name, g.description, g.privacy_level, g.created_at, g.updated_at
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN groups g ON p.group_id = g.id
        LEFT JOIN connections c ON (c.user_id_1 = $3 AND c.user_id_2 = p.user_id) 
                                OR (c.user_id_1 = p.user_id AND c.user_id_2 = $3)
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = $3
        WHERE (p.group_id IS NULL 
               OR g.privacy_level = 'public'
               OR gm.user_id IS NOT NULL)
        AND (
            p.visibility = 'public' 
            OR p.user_id = $3
            OR (p.visibility = 'connections' AND c.id IS NOT NULL)
        )
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2`

	rows, err := tx.QueryContext(ctx, SQL, limit, offset, currentUserId)
	helper.PanicIfError(err)
	defer rows.Close()

	// Rest of the function remains the same
	var posts []domain.Post

	for rows.Next() {
		post := domain.Post{}
		user := domain.User{}

		// Add groupId from post table
		var postGroupId sql.NullString

		// Use nullable types for group fields
		var groupId sql.NullString
		var groupName sql.NullString
		var groupDescription sql.NullString
		var groupPrivacyLevel sql.NullString
		var groupCreatedAt sql.NullTime
		var groupUpdatedAt sql.NullTime

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Images,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&postGroupId, // Added this field
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline,
			&groupId,
			&groupName,
			&groupDescription,
			&groupPrivacyLevel,
			&groupCreatedAt,
			&groupUpdatedAt)
		helper.PanicIfError(err)

		post.User = &user

		// Set post.GroupId if not NULL
		if postGroupId.Valid {
			groupUUID, err := uuid.Parse(postGroupId.String)
			if err == nil {
				post.GroupId = &groupUUID
			}
		}

		// Create and populate the Group only if we have a valid group ID
		if groupId.Valid {
			group := domain.Group{}

			// Convert the string UUID to actual UUID
			groupUUID, err := uuid.Parse(groupId.String)
			if err == nil {
				group.Id = groupUUID
			}

			// Assign other group fields with proper null handling
			if groupName.Valid {
				group.Name = groupName.String
			}

			if groupDescription.Valid {
				group.Description = groupDescription.String
			}

			if groupPrivacyLevel.Valid {
				group.PrivacyLevel = groupPrivacyLevel.String
			}

			if groupCreatedAt.Valid {
				group.CreatedAt = groupCreatedAt.Time
			}

			if groupUpdatedAt.Valid {
				group.UpdatedAt = groupUpdatedAt.Time
			}

			post.Group = &group
		} else {
			post.Group = nil
		}

		posts = append(posts, post)
	}

	return posts
}

func (repository *PostRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, currentUserId uuid.UUID, limit, offset int) []domain.Post {
	SQL := `SELECT 
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at, p.group_id,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, ''),
        g.id, g.name, g.description, g.privacy_level, g.created_at, g.updated_at
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN groups g ON p.group_id = g.id
        LEFT JOIN connections c ON (c.user_id_1 = $4 AND c.user_id_2 = p.user_id) 
                                OR (c.user_id_1 = p.user_id AND c.user_id_2 = $4)
        WHERE p.user_id = $1
        AND (
            p.visibility = 'public' 
            OR $4 = $1  -- currentUserId = userId (viewing own posts)
            OR (p.visibility = 'connections' AND c.id IS NOT NULL)
        )
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset, currentUserId)
	helper.PanicIfError(err)
	defer rows.Close()

	var posts []domain.Post

	for rows.Next() {
		post := domain.Post{}
		user := domain.User{}

		// Add groupId from post table
		var postGroupId sql.NullString

		// Use nullable types for group fields
		var groupId sql.NullString
		var groupName sql.NullString
		var groupDescription sql.NullString
		var groupPrivacyLevel sql.NullString
		var groupCreatedAt sql.NullTime
		var groupUpdatedAt sql.NullTime

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Images,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&postGroupId,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline,
			&groupId,
			&groupName,
			&groupDescription,
			&groupPrivacyLevel,
			&groupCreatedAt,
			&groupUpdatedAt)
		helper.PanicIfError(err)

		post.User = &user

		// Set post.GroupId if not NULL
		if postGroupId.Valid {
			groupUUID, err := uuid.Parse(postGroupId.String)
			if err == nil {
				post.GroupId = &groupUUID
			}
		}

		// Create and populate the Group only if we have a valid group ID
		if groupId.Valid {
			group := domain.Group{}

			// Convert the string UUID to actual UUID
			groupUUID, err := uuid.Parse(groupId.String)
			if err == nil {
				group.Id = groupUUID
			}

			// Assign other group fields with proper null handling
			if groupName.Valid {
				group.Name = groupName.String
			}

			if groupDescription.Valid {
				group.Description = groupDescription.String
			}

			if groupPrivacyLevel.Valid {
				group.PrivacyLevel = groupPrivacyLevel.String
			}

			if groupCreatedAt.Valid {
				group.CreatedAt = groupCreatedAt.Time
			}

			if groupUpdatedAt.Valid {
				group.UpdatedAt = groupUpdatedAt.Time
			}

			post.Group = &group
		} else {
			post.Group = nil
		}

		posts = append(posts, post)
	}

	return posts
}

func (repository *PostRepositoryImpl) LikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error {
	// Check if the like already exists
	if repository.IsLiked(ctx, tx, postId, userId) {
		return errors.New("post already liked")
	}

	// Insert the like
	SQL := `INSERT INTO post_likes (id, post_id, user_id, created_at) VALUES ($1, $2, $3, $4)`
	_, err := tx.ExecContext(ctx, SQL, uuid.New(), postId, userId, time.Now())
	helper.PanicIfError(err)

	return nil
}

func (repository *PostRepositoryImpl) UnlikePost(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) error {
	// Check if the like exists
	if !repository.IsLiked(ctx, tx, postId, userId) {
		return errors.New("post not liked yet")
	}

	// Delete the like
	SQL := `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`
	_, err := tx.ExecContext(ctx, SQL, postId, userId)
	helper.PanicIfError(err)

	return nil
}

func (repository *PostRepositoryImpl) IsLiked(ctx context.Context, tx *sql.Tx, postId uuid.UUID, userId uuid.UUID) bool {
	SQL := `SELECT COUNT(*) FROM post_likes WHERE post_id = $1 AND user_id = $2`

	var count int
	err := tx.QueryRowContext(ctx, SQL, postId, userId).Scan(&count)
	helper.PanicIfError(err)

	return count > 0
}

func (repository *PostRepositoryImpl) GetLikesCount(ctx context.Context, tx *sql.Tx, postId uuid.UUID) int {
	SQL := `SELECT COUNT(*) FROM post_likes WHERE post_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, postId).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *PostRepositoryImpl) FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, currentUserId uuid.UUID, limit, offset int) []domain.Post {
	SQL := `SELECT p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at, p.group_id,
            u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, ''),
            g.id, g.name, g.description, g.privacy_level, g.created_at, g.updated_at
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN groups g ON p.group_id = g.id
            LEFT JOIN connections c ON (c.user_id_1 = $4 AND c.user_id_2 = p.user_id) 
                                    OR (c.user_id_1 = p.user_id AND c.user_id_2 = $4)
            LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = $4
            WHERE p.group_id = $1
            AND (
                p.visibility = 'public' 
                OR p.user_id = $4
                OR (p.visibility = 'connections' AND c.id IS NOT NULL)
            )
            AND (
                g.privacy_level = 'public'
                OR gm.user_id IS NOT NULL
            )
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, groupId, limit, offset, currentUserId)
	helper.PanicIfError(err)
	defer rows.Close()

	var posts []domain.Post
	for rows.Next() {
		post := domain.Post{}
		user := domain.User{}
		group := domain.Group{}

		// Add variables for scanning
		var postGroupId sql.NullString
		var imageJson sql.NullString

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&imageJson,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&postGroupId,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline,
			&group.Id,
			&group.Name,
			&group.Description,
			&group.PrivacyLevel,
			&group.CreatedAt,
			&group.UpdatedAt,
		)
		helper.PanicIfError(err)

		// Parse images JSON
		if imageJson.Valid {
			err = json.Unmarshal([]byte(imageJson.String), &post.Images)
			if err != nil {
				post.Images = []string{}
			}
		} else {
			post.Images = []string{}
		}

		// Set post.GroupId if not NULL
		if postGroupId.Valid {
			groupUUID, err := uuid.Parse(postGroupId.String)
			if err == nil {
				post.GroupId = &groupUUID
			}
		}

		post.User = &user
		post.Group = &group
		posts = append(posts, post)
	}

	return posts
}

func (repository *PostRepositoryImpl) CreatePostGroup(ctx context.Context, tx *sql.Tx, post domain.Post, groupId uuid.UUID) domain.Post {
	// Generate a new UUID if not provided
	if post.Id == uuid.Nil {
		post.Id = uuid.New()
	}

	SQL := `INSERT INTO posts
		(id, user_id, content, images, visibility, created_at, updated_at, group_id) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := tx.ExecContext(ctx, SQL,
		post.Id,
		post.UserId,
		post.Content,
		post.Images,
		post.Visibility,
		post.CreatedAt,
		post.UpdatedAt,
		groupId)
	helper.PanicIfError(err)

	return post
}

func (repository *PostRepositoryImpl) Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.Post {
	SQL := `SELECT
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, '')
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE LOWER(p.content) LIKE LOWER($1) OR LOWER(u.name) LIKE LOWER($1) OR LOWER(u.username) LIKE LOWER($1)
        AND p.visibility = 'public'
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3`

	searchPattern := "%" + query + "%"
	fmt.Printf("Executing SQL: %s with pattern: %s\n", SQL, searchPattern)

	rows, err := tx.QueryContext(ctx, SQL, searchPattern, limit, offset)
	if err != nil {
		fmt.Printf("Error executing search query: %v\n", err)
		return []domain.Post{}
	}
	defer rows.Close()

	var posts []domain.Post
	for rows.Next() {
		post := domain.Post{}
		user := domain.User{}

		err := rows.Scan(
			&post.Id,
			&post.UserId,
			&post.Content,
			&post.Images,
			&post.LikesCount,
			&post.Visibility,
			&post.CreatedAt,
			&post.UpdatedAt,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline,
		)

		if err != nil {
			fmt.Printf("Error scanning post: %v\n", err)
			continue
		}

		post.User = &user
		posts = append(posts, post)
		fmt.Printf("Found post: %s by %s\n", post.Id, user.Name)
	}

	return posts
}
