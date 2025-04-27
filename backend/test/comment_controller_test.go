package test

import (
	"context"
	"database/sql"
	"encoding/json"
	"evoconnect/backend/app"
	"evoconnect/backend/controller"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"evoconnect/backend/service"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func setupCommentTestDB() *sql.DB {
	db := app.NewDB()
	return db
}

func truncateComments(db *sql.DB) {
	db.Exec("DELETE FROM comments")
}

func createTestUser(db *sql.DB) domain.User {
	userId := uuid.New()
	user := domain.User{
		Id:         userId,
		Name:       "Test User",
		Email:      "test@example.com",
		Username:   "testuser",
		Password:   "$2a$10$abcd", // Hashed password
		IsVerified: true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err := db.Exec(`
        INSERT INTO users (id, name, email, username, password, is_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		user.Id, user.Name, user.Email, user.Username, user.Password,
		user.IsVerified, user.CreatedAt, user.UpdatedAt)
	helper.PanicIfError(err)

	return user
}

func createTestPost(db *sql.DB, userId uuid.UUID) domain.Post {
	postId := uuid.New()
	post := domain.Post{
		Id:         postId,
		UserId:     userId,
		Content:    "Test post content",
		Images:     []string{},
		Visibility: "public",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err := db.Exec(`
        INSERT INTO posts (id, user_id, content, visibility, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)`,
		post.Id, post.UserId, post.Content, post.Visibility,
		post.CreatedAt, post.UpdatedAt)
	helper.PanicIfError(err)

	return post
}

func createTestComment(db *sql.DB, postId uuid.UUID, userId uuid.UUID, parentId *uuid.UUID) domain.Comment {
	commentId := uuid.New()
	comment := domain.Comment{
		Id:        commentId,
		PostId:    postId,
		UserId:    userId,
		ParentId:  parentId,
		Content:   "Test comment content",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if parentId == nil {
		_, err := db.Exec(`
            INSERT INTO comments (id, post_id, user_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)`,
			comment.Id, comment.PostId, comment.UserId, comment.Content,
			comment.CreatedAt, comment.UpdatedAt)
		helper.PanicIfError(err)
	} else {
		_, err := db.Exec(`
            INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			comment.Id, comment.PostId, comment.UserId, comment.ParentId,
			comment.Content, comment.CreatedAt, comment.UpdatedAt)
		helper.PanicIfError(err)
	}

	return comment
}

func setupCommentRouter(db *sql.DB) http.Handler {
	validate := validator.New()

	commentRepository := repository.NewCommentRepository()
	postRepository := repository.NewPostRepository()
	userRepository := repository.NewUserRepository()

	commentService := service.NewCommentService(
		commentRepository,
		postRepository,
		userRepository,
		db,
		validate,
	)

	commentController := controller.NewCommentController(commentService)
	router := app.NewRouter(commentController)

	return router
}

// Test Create Comment
func TestCreateComment(t *testing.T) {
	db := setupCommentTestDB()
	defer db.Close()

	truncateComments(db)
	user := createTestUser(db)
	post := createTestPost(db, user.Id)
	router := setupCommentRouter(db)

	t.Run("Create Comment Success", func(t *testing.T) {
		requestBody := web.CreateCommentRequest{
			Content: "New comment content",
		}
		requestJson, _ := json.Marshal(requestBody)

		req := httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/posts/%s/comments", post.Id.String()),
			strings.NewReader(string(requestJson)))
		req.Header.Add("Content-Type", "application/json")

		// Add user context
		ctx := context.WithValue(req.Context(), "user_id", user.Id.String())
		req = req.WithContext(ctx)

		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, req)

		response := recorder.Result()
		assert.Equal(t, http.StatusCreated, response.StatusCode)

		body, _ := io.ReadAll(response.Body)
		var responseBody map[string]interface{}
		json.Unmarshal(body, &responseBody)

		assert.Equal(t, float64(201), responseBody["code"].(float64))
		assert.Equal(t, "CREATED", responseBody["status"])

		data := responseBody["data"].(map[string]interface{})
		assert.Equal(t, requestBody.Content, data["content"])
	})

	t.Run("Create Comment Empty Content", func(t *testing.T) {
		requestBody := web.CreateCommentRequest{
			Content: "",
		}
		requestJson, _ := json.Marshal(requestBody)

		req := httptest.NewRequest(http.MethodPost,
			fmt.Sprintf("/api/posts/%s/comments", post.Id.String()),
			strings.NewReader(string(requestJson)))
		req.Header.Add("Content-Type", "application/json")

		ctx := context.WithValue(req.Context(), "user_id", user.Id.String())
		req = req.WithContext(ctx)

		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, req)

		response := recorder.Result()
		assert.Equal(t, http.StatusBadRequest, response.StatusCode)
	})
}

// Test Get Comments by Post ID
func TestGetCommentsByPostId(t *testing.T) {
	db := setupCommentTestDB()
	defer db.Close()

	truncateComments(db)
	user := createTestUser(db)
	post := createTestPost(db, user.Id)
	createTestComment(db, post.Id, user.Id, nil)
	router := setupCommentRouter(db)

	t.Run("Get Comments Success", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet,
			fmt.Sprintf("/api/posts/%s/comments?limit=10&offset=0", post.Id.String()),
			nil)

		ctx := context.WithValue(req.Context(), "user_id", user.Id.String())
		req = req.WithContext(ctx)

		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, req)

		response := recorder.Result()
		assert.Equal(t, http.StatusOK, response.StatusCode)

		body, _ := io.ReadAll(response.Body)
		var responseBody map[string]interface{}
		json.Unmarshal(body, &responseBody)

		assert.Equal(t, float64(200), responseBody["code"].(float64))
		data := responseBody["data"].(map[string]interface{})
		comments := data["comments"].([]interface{})
		assert.Equal(t, 1, len(comments))
	})
}

// Additional test cases for other endpoints...
func TestUpdateComment(t *testing.T) {
	// Similar structure to TestCreateComment
}

func TestDeleteComment(t *testing.T) {
	// Similar structure to TestCreateComment
}

func TestReplyToComment(t *testing.T) {
	// Similar structure to TestCreateComment
}

func TestGetCommentReplies(t *testing.T) {
	// Similar structure to TestGetCommentsByPostId
}
