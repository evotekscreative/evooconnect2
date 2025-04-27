// service/blog_service_impl.go
package service

import (
	"context"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"time"
	"github.com/google/uuid"
	// "evoconnect/backend/exception"
	"fmt"

)

type BlogServiceImpl struct {
	Repo repository.BlogRepository
}

func NewBlogService(repo repository.BlogRepository) BlogService {
	return &BlogServiceImpl{Repo: repo}
}

// Daftar kategori valid
var allowedCategories = []string{
	"Fashion", "Beauty", "Travel", "Lifestyle", "Personal", "Technology",
	"Health", "Fitness", "Healthcare", "SaaS Services", "Business",
	"Education", "Food & Recipes", "Love & Relationships", "Alternative Topics",
	"Eco-Friendly Living", "Music", "Automotive", "Marketing", "Internet Services",
	"Finance", "Sports", "Entertainment", "Productivity", "Hobbies",
	"Parenting", "Pets", "Photography", "Farming", "Art",
	"Homemade", "Science", "Games", "History", "Self-Development",
	"News & Current Affairs",
}

func isValidCategory(cat string) bool {
	for _, c := range allowedCategories {
		if c == cat {
			return true
		}
	}
	return false
}

func (s *BlogServiceImpl) Create(ctx context.Context, req web.BlogCreateRequest, userID string) web.BlogResponse {
	if !isValidCategory(req.Category) {
		panic("Invalid category: " + req.Category)
	}

	blog := domain.Blog{
		ID:        uuid.NewString(),
		Title:     req.Title,
		Slug:      helper.GenerateSlug(req.Title, uuid.NewString()[:6]),
		Category:  req.Category,
		Content:   req.Content,
		Image:     req.Image,
		UserID:    userID,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	saved := s.Repo.Save(ctx, blog)

	return web.BlogResponse{
		ID:        saved.ID,
		Title:     saved.Title,
		Slug:      saved.Slug,
		Category:  saved.Category,
		Content:   saved.Content,
		Image:     saved.Image,
		UserID:    saved.UserID,
		CreatedAt: saved.CreatedAt,
		UpdatedAt: saved.UpdatedAt,
		User: web.BlogUserResponse{
			ID:       saved.UserID,
			Name:     "Dummy Name",
			Username: "DummyUsername",
			Photo:    "DummyPhoto.png",
		},
	}
}

func (s *BlogServiceImpl) FindAll(ctx context.Context) ([]web.BlogResponse, error) {
	blogs := s.Repo.FindAll(ctx)

	var result []web.BlogResponse
	for _, blog := range blogs {
		result = append(result, web.BlogResponse{
			ID:        blog.ID,
			Title:     blog.Title,
			Slug:      blog.Slug, // ← pakai slug dari DB, bukan generate ulang
			Category:  blog.Category,
			Content:   blog.Content,
			Image:     blog.Image,
			UserID:    blog.UserID,
			CreatedAt: blog.CreatedAt,
			UpdatedAt: blog.UpdatedAt,
			User: web.BlogUserResponse{
				ID:       blog.UserID,
				Name:     "Dummy Name",
				Username: "DummyUsername",
				Photo:    "DummyPhoto.png",
			},
		})
	}
	return result, nil
}


func (s *BlogServiceImpl) Delete(ctx context.Context, blogID string) error {
    err := s.Repo.Delete(ctx, blogID)
    if err != nil {
        return fmt.Errorf("gagal menghapus blog dengan ID %s: %w", blogID, err)
    }
    return nil
}
func (s *BlogServiceImpl) FindBySlug(ctx context.Context, slug string) (web.BlogResponse, error) {
    blog, err := s.Repo.FindBySlug(ctx, slug)
    if err != nil {
        if err.Error() == "not found" {
            return web.BlogResponse{}, fmt.Errorf("Blog dengan slug %s tidak ditemukan", slug)
        }
        return web.BlogResponse{}, err
    }

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
        User: web.BlogUserResponse{
            ID:       blog.UserID,
            Name:     "Dummy Name",
            Username: "DummyUsername",
            Photo:    "DummyPhoto.png",
        },
    }, nil
}


