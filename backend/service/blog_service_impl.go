package service

import (
	"context"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"github.com/google/uuid"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
	"errors"
)

type BlogServiceImpl struct {
	Repo repository.BlogRepository
}

func NewBlogService(repo repository.BlogRepository) BlogService {
	return &BlogServiceImpl{Repo: repo}
}

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

func (s *BlogServiceImpl) Create(ctx context.Context, req web.BlogCreateRequest, userID string) (web.BlogResponse, error) {
	if err := helper.ValidateBlogInput(req.Title, req.Content, req.Category); err != nil {
		return web.BlogResponse{}, err
	}
	if !isValidCategory(req.Category) {
		return web.BlogResponse{}, fmt.Errorf("kategori %s tidak valid", req.Category)
	}

	slug := generateSlug(req.Title)

	blog := domain.Blog{
		ID:        uuid.New().String(),
		Title:     req.Title,
		Slug:      slug,
		Content:   req.Content,
		Category:  req.Category,
		ImagePath: req.Image,
		UserID:    userID,
		CreatedAt: nowISO8601(),
		UpdatedAt: nowISO8601(),
	}

	blog, err := s.Repo.Save(ctx, blog)
	if err != nil {
		return web.BlogResponse{}, err
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return web.BlogResponse{}, fmt.Errorf("user ID tidak valid: %w", err)
	}
	user, err := s.Repo.FindUserByID(ctx, userUUID)
	if err != nil {
		return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
	}

	return buildBlogResponse(blog, user), nil
}

func (s *BlogServiceImpl) FindAll(ctx context.Context) ([]web.BlogResponse, error) {
	blogs, err := s.Repo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil semua blog: %w", err)
	}

	var result []web.BlogResponse
	for _, blog := range blogs {
		userID, err := uuid.Parse(blog.UserID)
		if err != nil {
			result = append(result, buildBlogResponse(blog, domain.User{
				Id:       uuid.Nil,
				Name:     "Anonymous",
				Username: "Unknown",
				Photo:    "default-profile.png",
			}))
			continue
		}

		user, err := s.Repo.FindUserByID(ctx, userID)
		if err != nil {
			user = domain.User{
				Id:       userID,
				Name:     "Anonymous",
				Username: "Unknown",
				Photo:    "default-profile.png",
			}
		}

		result = append(result, buildBlogResponse(blog, user))
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
		return web.BlogResponse{}, fmt.Errorf("blog dengan slug %s tidak ditemukan: %w", slug, err)
	}

	userUUID, err := uuid.Parse(blog.UserID)
	if err != nil {
		return web.BlogResponse{}, fmt.Errorf("user ID tidak valid: %w", err)
	}
	user, err := s.Repo.FindUserByID(ctx, userUUID)
	if err != nil {
		return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
	}

	return buildBlogResponse(blog, user), nil
}

func (s *BlogServiceImpl) UpdateWithImagePath(ctx context.Context, blogID string, request web.BlogCreateRequest, userID string, imagePath string) (web.BlogResponse, error) {
    // Dapatkan blog yang ada
    existingBlog, err := s.Repo.FindByID(ctx, blogID)
    if err != nil {
        return web.BlogResponse{}, err
    }

    // Periksa apakah user yang melakukan update adalah pemilik blog
    if existingBlog.UserID != userID {
        return web.BlogResponse{}, errors.New("unauthorized: you are not the owner of this blog")
    }

    // Update data blog
    existingBlog.Title = request.Title
    existingBlog.Category = request.Category
    existingBlog.Content = request.Content
    
    // Update image path jika ada gambar baru
    if imagePath != "" && imagePath != existingBlog.ImagePath {
        existingBlog.ImagePath = imagePath
    }

    // Generate slug baru jika judul berubah
    if existingBlog.Title != request.Title {
        existingBlog.Slug = generateSlug(request.Title)
    }

    // Simpan perubahan ke database
    err = s.Repo.Update(ctx, existingBlog) // Hanya menerima error, tidak ada blog yang dikembalikan
    if err != nil {
        return web.BlogResponse{}, err
    }

    // Ambil data user untuk response
    userUUID, err := uuid.Parse(userID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("user ID tidak valid: %w", err)
    }
    user, err := s.Repo.FindUserByID(ctx, userUUID)
    if err != nil {
        user = domain.User{
            Id:       userUUID,
            Name:     "Anonymous",
            Username: "Unknown",
            Photo:    "default-profile.png",
        }
    }

    // Karena Update tidak mengembalikan blog yang diupdate, kita gunakan existingBlog yang sudah dimodifikasi
    return buildBlogResponse(existingBlog, user), nil
}

func (s *BlogServiceImpl) UploadPhoto(ctx context.Context, blogId string, userId string, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	blog, err := s.Repo.FindByID(ctx, blogId)
	if err != nil {
		return "", fmt.Errorf("blog dengan ID %s tidak ditemukan", blogId)
	}

	if blog.UserID != userId {
		return "", fmt.Errorf("anda tidak memiliki izin untuk mengupload photo untuk blog ini")
	}

	uploadDir := fmt.Sprintf("uploads/blogs/%s", userId)
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("gagal membuat direktori upload: %w", err)
	}

	fileName := fmt.Sprintf("blog-%d%s", time.Now().Unix(), filepath.Ext(fileHeader.Filename))
	filePath := fmt.Sprintf("%s/%s", uploadDir, fileName)
	outFile, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("gagal menyimpan file: %w", err)
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, file)
	if err != nil {
		return "", fmt.Errorf("gagal menyimpan file: %w", err)
	}

	publicPath := fmt.Sprintf("/static/blogs/%s/%s", userId, fileName)
	return publicPath, nil
}

func (s *BlogServiceImpl) GetRandomBlogs(ctx context.Context, limit int) ([]web.BlogResponse, error) {
	blogs, err := s.Repo.GetRandomBlogs(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil blog random: %w", err)
	}

	var blogResponses []web.BlogResponse
	for _, blog := range blogs {
		userID, err := uuid.Parse(blog.UserID)
		if err != nil {
			return nil, fmt.Errorf("gagal mengonversi user_id: %w", err)
		}

		user, err := s.Repo.FindUserByID(ctx, userID)
		if err != nil {
			user = domain.User{
				Id:       userID,
				Name:     "Anonymous",
				Username: "Unknown",
				Photo:    "default-profile.png",
			}
		}

		blogResponses = append(blogResponses, buildBlogResponse(blog, user))
	}
	return blogResponses, nil
}

// Utility

func generateSlug(title string) string {
	baseSlug := strings.ToLower(strings.ReplaceAll(title, " ", "-"))
	uniqueID := uuid.New().String()[:8]
	return fmt.Sprintf("%s-%s", baseSlug, uniqueID)
}

func nowISO8601() string {
	return time.Now().Format(time.RFC3339)
}

func buildBlogResponse(blog domain.Blog, user domain.User) web.BlogResponse {
	return web.BlogResponse{
		ID:        blog.ID,
		Title:     blog.Title,
		Slug:      blog.Slug,
		Category:  blog.Category,
		Content:   blog.Content,
		Photo:     blog.ImagePath,
		UserID:    blog.UserID,
		CreatedAt: blog.CreatedAt,
		UpdatedAt: blog.UpdatedAt,
		User: web.BlogUserResponse{
			ID:       user.Id.String(),
			Name:     user.Name,
			Username: user.Username,
			Photo:    user.Photo,
		},
	}
}

func (service *BlogServiceImpl) CreateWithImagePath(ctx context.Context, req web.BlogCreateRequest, userID string, imagePath string) (web.BlogResponse, error) {
    // Validasi
    if err := helper.ValidateBlogInput(req.Title, req.Content, req.Category); err != nil {
        return web.BlogResponse{}, err
    }

    // Slug unik
    slug := generateSlug(req.Title)

    // Buat blog
    blog := domain.Blog{
        ID:        uuid.New().String(),
        Title:     req.Title,
        Slug:      slug,
        Content:   req.Content,
        Category:  req.Category,
        ImagePath: imagePath, // Gunakan imagePath yang diberikan, bukan req.Image
        UserID:    userID,
        CreatedAt: nowISO8601(),
        UpdatedAt: nowISO8601(),
    }

    blog, err := service.Repo.Save(ctx, blog)
    if err != nil {
        return web.BlogResponse{}, err
    }

    user, err := service.Repo.FindUserByID(ctx, uuid.MustParse(userID))
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
    }

    return buildBlogResponse(blog, user), nil // Gunakan fungsi buildBlogResponse untuk konsistensi
}


func (s *BlogServiceImpl) FindById(ctx context.Context, blogID string) (web.BlogResponse, error) {
    blog, err := s.Repo.FindByID(ctx, blogID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("blog dengan ID %s tidak ditemukan: %w", blogID, err)
    }

    userUUID, err := uuid.Parse(blog.UserID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("user ID tidak valid: %w", err)
    }
    user, err := s.Repo.FindUserByID(ctx, userUUID)
    if err != nil {
        user = domain.User{
            Id:       userUUID,
            Name:     "Anonymous",
            Username: "Unknown",
            Photo:    "default-profile.png",
        }
    }

    return buildBlogResponse(blog, user), nil
}
