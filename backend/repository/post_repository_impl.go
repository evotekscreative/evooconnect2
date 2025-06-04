package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"time"
	"github.com/google/uuid"
	"encoding/json"
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
    SQL := `SELECT p.id, p.user_id, p.content, p.images, p.visibility, p.created_at, p.updated_at, p.group_id
            FROM posts p
            WHERE p.id = $1`
    
    var post domain.Post
    var images sql.NullString
    var groupId sql.NullString // Pastikan ini dihandle dengan benar
    
    err := tx.QueryRowContext(ctx, SQL, postId).Scan(
        &post.Id,
        &post.UserId,
        &post.Content,
        &images,
        &post.Visibility,
        &post.CreatedAt,
        &post.UpdatedAt,
        &groupId, // Scan group_id ke variabel ini
    )
    
    if err != nil {
        if err == sql.ErrNoRows {
            return post, errors.New("post not found")
        }
        return post, err
    }
    
    // Handle images
    if images.Valid {
        err = json.Unmarshal([]byte(images.String), &post.Images)
        if err != nil {
            post.Images = []string{}
        }
    } else {
        post.Images = []string{}
    }
    
    // Handle group_id - pastikan ini diimplementasikan dengan benar
    if groupId.Valid {
        groupUUID, err := uuid.Parse(groupId.String)
        if err == nil {
            post.GroupId = &groupUUID // Set pointer ke UUID yang valid
        }
    }
    
    return post, nil
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
        p.id, p.user_id, p.content, p.images, p.likes_count, p.visibility, p.created_at, p.updated_at, p.group_id, COALESCE(p.status, '') as status,
        u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, ''),
        g.id, g.name, g.description, g.rule, g.image, g.privacy_level, g.invite_policy, g.post_approval, g.creator_id, g.created_at, g.updated_at
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
            OR p.visibility = 'group'  -- Tambahkan kondisi untuk post grup
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
		var status sql.NullString

		// Add groupId from post table
		var postGroupId sql.NullString

		// Use nullable types for group fields
		var groupId sql.NullString
		var groupName sql.NullString
		var groupDescription sql.NullString
		var groupRule sql.NullString
		var groupImage sql.NullString
		var groupPrivacyLevel sql.NullString
		var groupInvitePolicy sql.NullString
		var groupPostApproval sql.NullBool
		var groupCreatorId sql.NullString
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
			&status,
			&user.Id,
			&user.Name,
			&user.Email,
			&user.Username,
			&user.Photo,
			&user.Headline,
			&groupId,
			&groupName,
			&groupDescription,
			&groupRule,
			&groupImage,
			&groupPrivacyLevel,
			&groupInvitePolicy,
			&groupPostApproval,
			&groupCreatorId,
			&groupCreatedAt,
			&groupUpdatedAt)
		helper.PanicIfError(err)

		// Set status if not null
		if status.Valid {
			post.Status = status.String
		}

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

			if groupRule.Valid {
				group.Rule = groupRule.String
			}

			if groupImage.Valid {
				imageStr := groupImage.String
				group.Image = &imageStr
			}

			if groupPrivacyLevel.Valid {
				group.PrivacyLevel = groupPrivacyLevel.String
			}

			if groupInvitePolicy.Valid {
				group.InvitePolicy = groupInvitePolicy.String
			}

			if groupPostApproval.Valid {
				group.PostApproval = groupPostApproval.Bool
			}

			if groupCreatorId.Valid {
				creatorUUID, err := uuid.Parse(groupCreatorId.String)
				if err == nil {
					group.CreatorId = creatorUUID
				}
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

// Di repository/post_repository_impl.go
func (repository *PostRepositoryImpl) FindByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID, currentUserId uuid.UUID, limit, offset int) []domain.Post {
    SQL := `SELECT p.id, p.user_id, p.content, p.images, p.visibility, p.created_at, p.updated_at, p.group_id,
            u.id, u.name, u.email, u.username, COALESCE(u.photo, ''), COALESCE(u.headline, ''),
            gpp.id IS NOT NULL as is_pinned, gpp.pinned_at
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN group_pinned_posts gpp ON p.id = gpp.post_id AND p.group_id = gpp.group_id
            WHERE p.group_id = $1 AND p.status = 'approved'
            ORDER BY gpp.id IS NOT NULL DESC, p.created_at DESC
            LIMIT $2 OFFSET $3`
    
    rows, err := tx.QueryContext(ctx, SQL, groupId, limit, offset)
    helper.PanicIfError(err)
    defer rows.Close()
    
    var posts []domain.Post
    for rows.Next() {
        post := domain.Post{}
        user := domain.User{}
        var images sql.NullString
        var groupIdStr string
        var isPinned bool
        var pinnedAt sql.NullTime
        
        err := rows.Scan(
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
            &user.Email,
            &user.Username,
            &user.Photo,
            &user.Headline,
            &isPinned,
            &pinnedAt,
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
        groupUUID, err := uuid.Parse(groupIdStr)
        if err == nil {
            post.GroupId = &groupUUID
        }
        
        // Set pinned status
        post.IsPinned = isPinned
        if pinnedAt.Valid {
            post.PinnedAt = &pinnedAt.Time
        }
        
        post.User = &user
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


func (repository *PostRepositoryImpl) PinPost(ctx context.Context, tx *sql.Tx, postId uuid.UUID) (domain.Post, error) {
    // Dapatkan informasi post terlebih dahulu
    post, err := repository.FindById(ctx, tx, postId)
    if err != nil {
        return domain.Post{}, err
    }
    
    // Pastikan post memiliki group_id
    if post.GroupId == nil {
        return domain.Post{}, errors.New("post is not associated with any group")
    }
    
    // Dapatkan user_id dari context
    userIdStr, ok := ctx.Value("user_id").(string)
    if !ok {
        return domain.Post{}, errors.New("user_id not found in context")
    }
    userId, err := uuid.Parse(userIdStr)
    if err != nil {
        return domain.Post{}, err
    }
    
    // Insert ke tabel group_pinned_posts
    now := time.Now()
    SQL := `INSERT INTO group_pinned_posts (id, group_id, post_id, pinned_by, pinned_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (group_id, post_id) DO NOTHING`
            
    _, err = tx.ExecContext(ctx, SQL, 
        uuid.New(),
        *post.GroupId,
        postId,
        userId,
        now,
        now,
        now)
    
    if err != nil {
        return domain.Post{}, err
    }
    
    // Set flag di post object untuk response
    post.IsPinned = true
    pinnedAt := now
    post.PinnedAt = &pinnedAt
    
    return post, nil
}

func (repository *PostRepositoryImpl) UnpinPost(ctx context.Context, tx *sql.Tx, postId uuid.UUID) error {
    // Dapatkan informasi post terlebih dahulu
    post, err := repository.FindById(ctx, tx, postId)
    if err != nil {
        return err
    }
    
    // Pastikan post memiliki group_id
    if post.GroupId == nil {
        return errors.New("post is not associated with any group")
    }
    
    // Delete dari tabel group_pinned_posts
    SQL := `DELETE FROM group_pinned_posts WHERE post_id = $1`
    _, err = tx.ExecContext(ctx, SQL, postId)
    
    return err
}



func (repository *PostRepositoryImpl) CountPinnedPostsByGroupId(ctx context.Context, tx *sql.Tx, groupId uuid.UUID) (int, error) {
    SQL := `SELECT COUNT(*) FROM group_pinned_posts WHERE group_id = $1`
    var count int
    err := tx.QueryRowContext(ctx, SQL, groupId).Scan(&count)
    return count, err
}

