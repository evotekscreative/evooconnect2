package helper

import (
    "evoconnect/backend/model/domain"
    "evoconnect/backend/model/web"
)

func ToBlogResponse(blog domain.Blog) web.BlogResponse {
    return web.BlogResponse{
        ID:        blog.ID,
        Title:     blog.Title,
        Slug:      blog.Slug,
        Category:  blog.Category,
        Content:   blog.Content,
        Image:     blog.Image,
        UserID:    blog.UserID,
        CreatedAt: blog.CreatedAt,
        UpdatedAt: blog.UpdatedAt,
    }
}