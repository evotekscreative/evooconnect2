package seeder

import (
	"database/sql"
	"evoconnect/backend/helper"
	"fmt"
	"log"
	"math/rand"
	"regexp"
	"strings"
	"time"

	"github.com/bxcodec/faker/v3"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// SeedAllData creates comprehensive dummy data
func SeedAllData(db *sql.DB) {
	log.Println("Starting comprehensive data seeding...")

	// Target user ID
	targetUserId := uuid.MustParse("f095b3b9-5f5f-42bc-b185-834719e898f3")

	// Check if target user exists
	if !checkUserExists(db, targetUserId) {
		log.Printf("Target user %s does not exist. Creating...", targetUserId)
		createTargetUser(db, targetUserId)
	}

	// Seed data in order
	userIds := seedUsers(db, 120)
	log.Printf("Created %d users", len(userIds))

	// Add target user to the list if not already there
	userIds = append(userIds, targetUserId)

	postIds := seedPosts(db, userIds, 30)
	log.Printf("Created %d posts", len(postIds))

	seedPostLikes(db, postIds, userIds, 1000)
	log.Printf("Created post likes")

	seedPostComments(db, postIds, userIds, 1000)
	log.Printf("Created post comments")

	blogIds := seedBlogs(db, userIds, 30)
	log.Printf("Created %d blogs", len(blogIds))

	seedBlogComments(db, blogIds, userIds, 1000)
	log.Printf("Created blog comments")

	groupIds := seedGroups(db, userIds, 30)
	log.Printf("Created %d groups", len(groupIds))

	seedGroupMembers(db, groupIds, userIds, 50)
	log.Printf("Created group members")

	seedConnectionRequests(db, userIds, targetUserId, 50)
	log.Printf("Created connection requests")

	seedConnections(db, userIds, targetUserId, 70)
	log.Printf("Created connections")

	seedProfileViews(db, userIds, targetUserId)
	log.Printf("Created profile views")

	seedChats(db, userIds, targetUserId, 50)
	log.Printf("Created chats")

	log.Println("Comprehensive data seeding completed!")
}

func checkUserExists(db *sql.DB, userId uuid.UUID) bool {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", userId).Scan(&exists)
	return err == nil && exists
}

func createTargetUser(db *sql.DB, userId uuid.UUID) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	query := `
        INSERT INTO users (id, name, username, email, password, headline, about, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `

	now := time.Now()
	_, err := db.Exec(query,
		userId,
		"Target User",
		"targetuser",
		"target@example.com",
		string(hashedPassword),
		"Target User for Testing",
		"This is the target user for seeding data",
		now,
		now,
	)
	helper.PanicIfError(err)
}

// seedUsers creates dummy users
func seedUsers(db *sql.DB, count int) []uuid.UUID {
	var userIds []uuid.UUID

	for i := 0; i < count; i++ {
		id := uuid.New()
		name := faker.Name()
		username := fmt.Sprintf("user_%d_%s", i, faker.Username())
		email := faker.Email()
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		headline := faker.Sentence()
		about := faker.Paragraph()

		// Random skills (JSON array)
		skills := fmt.Sprintf(`["%s", "%s", "%s"]`,
			faker.Word(), faker.Word(), faker.Word())

		// Random socials (JSON array)
		socials := fmt.Sprintf(`[{"platform": "linkedin", "username": "%s"}, {"platform": "github", "username": "%s"}]`,
			faker.Username(), faker.Username())

		now := time.Now()

		query := `
            INSERT INTO users (id, name, username, email, password, headline, about, skills, socials, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `

		_, err := db.Exec(query, id, name, username, email, string(hashedPassword),
			headline, about, skills, socials, now, now)

		if err != nil {
			log.Printf("Error creating user %d: %v", i, err)
			continue
		}

		userIds = append(userIds, id)
	}

	return userIds
}

// seedPosts creates dummy posts
func seedPosts(db *sql.DB, userIds []uuid.UUID, count int) []uuid.UUID {
	var postIds []uuid.UUID

	visibilities := []string{"public", "connections", "private"}

	for i := 0; i < count; i++ {
		id := uuid.New()
		userId := userIds[rand.Intn(len(userIds))]
		content := faker.Paragraph()
		visibility := visibilities[rand.Intn(len(visibilities))]

		// Random creation time within last 30 days
		createdAt := time.Now().AddDate(0, 0, -rand.Intn(30))

		query := `
            INSERT INTO posts (id, user_id, content, visibility, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        `

		_, err := db.Exec(query, id, userId, content, visibility, createdAt, createdAt)
		if err != nil {
			log.Printf("Error creating post %d: %v", i, err)
			continue
		}

		postIds = append(postIds, id)
	}

	return postIds
}

// seedPostLikes creates dummy post likes
func seedPostLikes(db *sql.DB, postIds []uuid.UUID, userIds []uuid.UUID, count int) {
	for i := 0; i < count; i++ {
		postId := postIds[rand.Intn(len(postIds))]
		userId := userIds[rand.Intn(len(userIds))]

		// Check if like already exists
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2)",
			postId, userId).Scan(&exists)

		if err != nil || exists {
			continue
		}

		query := `INSERT INTO post_likes (post_id, user_id, created_at) VALUES ($1, $2, $3)`
		_, err = db.Exec(query, postId, userId, time.Now())
		if err != nil {
			log.Printf("Error creating post like %d: %v", i, err)
		}
	}
}

// seedPostComments creates dummy post comments
func seedPostComments(db *sql.DB, postIds []uuid.UUID, userIds []uuid.UUID, count int) {
	for i := 0; i < count; i++ {
		id := uuid.New()
		postId := postIds[rand.Intn(len(postIds))]
		userId := userIds[rand.Intn(len(userIds))]
		content := faker.Sentence()

		createdAt := time.Now().AddDate(0, 0, -rand.Intn(7))

		query := `
            INSERT INTO comments (id, post_id, user_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        `

		_, err := db.Exec(query, id, postId, userId, content, createdAt, createdAt)
		if err != nil {
			log.Printf("Error creating comment %d: %v", i, err)
		}
	}
}

// seedBlogs creates dummy blogs
func seedBlogs(db *sql.DB, userIds []uuid.UUID, count int) []uuid.UUID {
	var blogIds []uuid.UUID

	categories := []string{"Technology", "Programming", "Design", "Business", "Career", "Lifestyle"}

	for i := 0; i < count; i++ {
		id := uuid.New()
		userId := userIds[rand.Intn(len(userIds))]
		title := faker.Sentence()
		// Convert title to slug format (lowercase, replace spaces with hyphens, remove special chars)
		slug := strings.ToLower(title)
		slug = strings.ReplaceAll(slug, " ", "-")
		// Remove special characters, keeping only alphanumeric and hyphens
		reg := regexp.MustCompile("[^a-z0-9-]")
		slug = reg.ReplaceAllString(slug, "")
		// Append random number to ensure uniqueness
		slug = fmt.Sprintf("%s-%d", slug, rand.Intn(1000))
		content := fmt.Sprintf("<h1>%s</h1><p>%s</p><p>%s</p><p>%s</p>",
			faker.Sentence(), faker.Paragraph(), faker.Paragraph(), faker.Paragraph())
		category := categories[rand.Intn(len(categories))]

		createdAt := time.Now().AddDate(0, 0, -rand.Intn(30))

		query := `
			INSERT INTO tb_blog (id, user_id, title, slug, content, category, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`

		_, err := db.Exec(query, id, userId, title, slug, content, category, createdAt, createdAt)
		if err != nil {
			log.Printf("Error creating blog %d: %v", i, err)
			continue
		}

		blogIds = append(blogIds, id)
	}

	return blogIds
}

// seedBlogComments creates dummy blog comments
func seedBlogComments(db *sql.DB, blogIds []uuid.UUID, userIds []uuid.UUID, count int) {
	for i := 0; i < count; i++ {
		id := uuid.New()
		blogId := blogIds[rand.Intn(len(blogIds))]
		userId := userIds[rand.Intn(len(userIds))]
		content := faker.Sentence()

		createdAt := time.Now().AddDate(0, 0, -rand.Intn(7))

		query := `
            INSERT INTO comment_blog (id, blog_id, user_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        `

		_, err := db.Exec(query, id, blogId, userId, content, createdAt, createdAt)
		if err != nil {
			log.Printf("Error creating blog comment %d: %v", i, err)
		}
	}
}

// seedGroups creates dummy groups
func seedGroups(db *sql.DB, userIds []uuid.UUID, count int) []uuid.UUID {
	var groupIds []uuid.UUID

	privacyLevels := []string{"public", "private"}
	invitePolicies := []string{"admin", "all_members"}

	for i := 0; i < count; i++ {
		id := uuid.New()
		creatorId := userIds[rand.Intn(len(userIds))]
		name := fmt.Sprintf("%s Group", faker.Word())
		description := faker.Paragraph()
		privacy := privacyLevels[rand.Intn(len(privacyLevels))]
		invitePolicy := invitePolicies[rand.Intn(len(invitePolicies))]

		createdAt := time.Now().AddDate(0, 0, -rand.Intn(60))

		query := `
            INSERT INTO groups (id, creator_id, name, description, privacy_level, invite_policy, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `

		_, err := db.Exec(query, id, creatorId, name, description, privacy, invitePolicy, createdAt, createdAt)
		if err != nil {
			log.Printf("Error creating group %d: %v", i, err)
			continue
		}

		groupIds = append(groupIds, id)

		// Add creator as admin member - Fix: Remove id column from INSERT
		memberQuery := `
            INSERT INTO group_members (group_id, user_id, role, joined_at)
            VALUES ($1, $2, $3, $4)
        `
		_, err = db.Exec(memberQuery, id, creatorId, "admin", createdAt)
		if err != nil {
			log.Printf("Error adding group creator as member: %v", err)
		}
	}

	return groupIds
}

// seedGroupMembers adds random members to groups
func seedGroupMembers(db *sql.DB, groupIds []uuid.UUID, userIds []uuid.UUID, totalMembers int) {
	for i := 0; i < totalMembers; i++ {
		groupId := groupIds[rand.Intn(len(groupIds))]
		userId := userIds[rand.Intn(len(userIds))]

		// Check if user is already a member
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2)",
			groupId, userId).Scan(&exists)

		if err != nil || exists {
			continue
		}

		role := "member" // Default role
		joinedAt := time.Now().AddDate(0, 0, -rand.Intn(30))

		// Fix: Remove id column from INSERT
		query := `
            INSERT INTO group_members (group_id, user_id, role, joined_at)
            VALUES ($1, $2, $3, $4)
        `

		_, err = db.Exec(query, groupId, userId, role, joinedAt)
		if err != nil {
			log.Printf("Error adding group member %d: %v", i, err)
		}
	}
}

// seedConnectionRequests creates connection requests to target user
func seedConnectionRequests(db *sql.DB, userIds []uuid.UUID, targetUserId uuid.UUID, count int) {
	for i := 0; i < count; i++ {
		senderId := userIds[rand.Intn(len(userIds))]

		// Skip if sender is target user
		if senderId == targetUserId {
			continue
		}

		// Check if request already exists
		var exists bool
		err := db.QueryRow(`
            SELECT EXISTS(SELECT 1 FROM connections 
            WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1))`,
			senderId, targetUserId).Scan(&exists)

		if err != nil || exists {
			continue
		}

		message := faker.Sentence()
		createdAt := time.Now().AddDate(0, 0, -rand.Intn(7))

		query := `
            INSERT INTO connections (id, user_id1, user_id2, status, message, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `

		_, err = db.Exec(query, uuid.New(), senderId, targetUserId, "pending", message, createdAt, createdAt)
		if err != nil {
			log.Printf("Error creating connection request %d: %v", i, err)
		}
	}
}

// seedConnections creates accepted connections to target user
func seedConnections(db *sql.DB, userIds []uuid.UUID, targetUserId uuid.UUID, count int) {
	for i := 0; i < count; i++ {
		userId := userIds[rand.Intn(len(userIds))]

		// Skip if user is target user
		if userId == targetUserId {
			continue
		}

		// Check if connection already exists
		var exists bool
		err := db.QueryRow(`
            SELECT EXISTS(SELECT 1 FROM connections 
            WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1))`,
			userId, targetUserId).Scan(&exists)

		if err != nil || exists {
			continue
		}

		createdAt := time.Now().AddDate(0, 0, -rand.Intn(30))
		acceptedAt := createdAt.Add(time.Duration(rand.Intn(24)) * time.Hour)

		query := `
            INSERT INTO connections (id, user_id1, user_id2, status, created_at, updated_at, accepted_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `

		_, err = db.Exec(query, uuid.New(), userId, targetUserId, "connected", createdAt, acceptedAt, acceptedAt)
		if err != nil {
			log.Printf("Error creating connection %d: %v", i, err)
		}
	}
}

// seedProfileViews creates profile views for target user
func seedProfileViews(db *sql.DB, userIds []uuid.UUID, targetUserId uuid.UUID) {
	// Create views for the last 30 days
	for i := 0; i < 30; i++ {
		viewDate := time.Now().AddDate(0, 0, -i)

		// Random number of views per day (0-5)
		viewsPerDay := rand.Intn(6)

		for j := 0; j < viewsPerDay; j++ {
			viewerId := userIds[rand.Intn(len(userIds))]

			// Skip if viewer is target user
			if viewerId == targetUserId {
				continue
			}

			// Random time within the day
			viewTime := viewDate.Add(time.Duration(rand.Intn(24)) * time.Hour)

			query := `
                INSERT INTO profile_views (id, viewer_id, viewed_user_id, viewed_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (viewer_id, viewed_user_id, DATE(viewed_at)) DO NOTHING
            `

			_, err := db.Exec(query, uuid.New(), viewerId, targetUserId, viewTime)
			if err != nil {
				log.Printf("Error creating profile view: %v", err)
			}
		}
	}
}

// seedChats creates chat conversations with target user
func seedChats(db *sql.DB, userIds []uuid.UUID, targetUserId uuid.UUID, count int) {
	for i := 0; i < count; i++ {
		userId := userIds[rand.Intn(len(userIds))]

		// Skip if user is target user
		if userId == targetUserId {
			continue
		}

		// Check if conversation already exists
		var conversationId uuid.UUID
		err := db.QueryRow(`
			SELECT id FROM conversations 
			WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)
			LIMIT 1
		`, userId, targetUserId).Scan(&conversationId)

		// Create conversation if doesn't exist
		if err == sql.ErrNoRows {
			conversationId = uuid.New()
			createdAt := time.Now().AddDate(0, 0, -rand.Intn(30))

			convQuery := `
				INSERT INTO conversations (id, user_id_1, user_id_2, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5)
			`

			_, err = db.Exec(convQuery, conversationId, userId, targetUserId, createdAt, createdAt)
			if err != nil {
				log.Printf("Error creating conversation %d: %v", i, err)
				continue
			}
		} else if err != nil {
			log.Printf("Error checking conversation existence: %v", err)
			continue
		}

		// Create random messages in this conversation
		messageCount := rand.Intn(10) + 1 // 1-10 messages

		// Keep track of messages for potential replies
		messageIds := []uuid.UUID{}

		for j := 0; j < messageCount; j++ {
			messageId := uuid.New()
			messageIds = append(messageIds, messageId)

			// Randomly choose sender (either user or target)
			var senderId uuid.UUID
			if rand.Intn(2) == 0 {
				senderId = userId
			} else {
				senderId = targetUserId
			}

			// Determine message type
			messageTypes := []string{"text", "image", "file"}
			messageTypeWeights := []int{80, 15, 5} // 80% text, 15% image, 5% file

			messageTypeRand := rand.Intn(100)
			messageType := "text"

			if messageTypeRand < messageTypeWeights[0] {
				messageType = messageTypes[0]
			} else if messageTypeRand < messageTypeWeights[0]+messageTypeWeights[1] {
				messageType = messageTypes[1]
			} else {
				messageType = messageTypes[2]
			}

			content := faker.Sentence()
			createdAt := time.Now().AddDate(0, 0, -rand.Intn(7)).
				Add(time.Duration(j) * time.Hour) // Space out messages
			updatedAt := createdAt

			// Determine if message is read (80% chance)
			isRead := rand.Intn(100) < 80

			// File fields (only used for file/image messages)
			var filePath, fileName, fileType sql.NullString
			var fileSize sql.NullInt32

			if messageType != "text" {
				if messageType == "image" {
					filePath = sql.NullString{String: fmt.Sprintf("/uploads/images/img_%d.jpg", rand.Intn(1000)), Valid: true}
					fileName = sql.NullString{String: fmt.Sprintf("img_%d.jpg", rand.Intn(1000)), Valid: true}
					fileType = sql.NullString{String: "image/jpeg", Valid: true}
					fileSize = sql.NullInt32{Int32: int32(rand.Intn(5000000) + 100000), Valid: true} // 100KB-5MB
				} else {
					fileTypes := []string{"application/pdf", "application/docx", "text/plain"}
					fileExts := []string{"pdf", "docx", "txt"}
					idx := rand.Intn(len(fileTypes))

					filePath = sql.NullString{String: fmt.Sprintf("/uploads/files/file_%d.%s", rand.Intn(1000), fileExts[idx]), Valid: true}
					fileName = sql.NullString{String: fmt.Sprintf("document_%d.%s", rand.Intn(1000), fileExts[idx]), Valid: true}
					fileType = sql.NullString{String: fileTypes[idx], Valid: true}
					fileSize = sql.NullInt32{Int32: int32(rand.Intn(10000000) + 1000), Valid: true} // 1KB-10MB
				}
			}

			// Determine if this is a reply (20% chance, only if we have previous messages)
			var replyToId sql.NullString
			if j > 0 && rand.Intn(100) < 20 {
				// Reply to a random previous message
				replyIdx := rand.Intn(len(messageIds))
				replyToId = sql.NullString{String: messageIds[replyIdx].String(), Valid: true}
			}

			// Determine if message is deleted (5% chance)
			var deletedAt sql.NullTime
			if rand.Intn(100) < 5 {
				deletedTime := createdAt.Add(time.Duration(rand.Intn(48)) * time.Hour)
				deletedAt = sql.NullTime{Time: deletedTime, Valid: true}
			}

			msgQuery := `
				INSERT INTO messages (
					id, conversation_id, sender_id, message_type, content, 
					file_path, file_name, file_size, file_type, 
					created_at, updated_at, is_read, reply_to_id, deleted_at
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
			`

			_, err = db.Exec(
				msgQuery,
				messageId, conversationId, senderId, messageType, content,
				filePath, fileName, fileSize, fileType,
				createdAt, updatedAt, isRead, replyToId, deletedAt,
			)
			if err != nil {
				log.Printf("Error creating message: %v", err)
			}
		}
	}
}
