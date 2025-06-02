package helper

import (
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"net/http"
)

func ToCommentBlogResponse(comment domain.CommentBlog) web.CommentBlogResponse {
    var userResponse web.CommentBlogUserInfo
    if comment.User != nil {
        userResponse = web.CommentBlogUserInfo{
            Id:       comment.User.Id,
            Name:     comment.User.Name,
            Username: comment.User.Username,
            Photo:    comment.User.Photo,
        }
    }

    var repliesResponse []web.CommentBlogResponse
    if len(comment.Replies) > 0 {
        repliesResponse = ToCommentBlogResponses(comment.Replies)
    }

    return web.CommentBlogResponse{
        Id:           comment.Id,
        BlogId:       comment.BlogId,
        Content:      comment.Content,
        CreatedAt:    comment.CreatedAt,
        UpdatedAt:    comment.UpdatedAt,
        ParentId:     comment.ParentId,
        User:         userResponse,
        Replies:      repliesResponse,
        RepliesCount: len(comment.Replies), // Tambahkan ini untuk menghitung jumlah replies
    }
}

func ToCommentBlogResponses(comments []domain.CommentBlog) []web.CommentBlogResponse {
	var responses []web.CommentBlogResponse
	for _, comment := range comments {
		responses = append(responses, ToCommentBlogResponse(comment))
	}
	return responses
}

type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (e *AppError) Error() string {
	return e.Message
}

func NewBadRequestError(message string) *AppError {
	return &AppError{
		Code:    http.StatusBadRequest,
		Message: message,
	}
}

func NewUnauthorizedError(message string) *AppError {
	return &AppError{
		Code:    http.StatusUnauthorized,
		Message: message,
	}
}