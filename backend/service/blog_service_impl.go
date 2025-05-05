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
	"strings"
	"io"
	"os"
	"path/filepath"
	"mime/multipart"


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

func (service *BlogServiceImpl) Create(ctx context.Context, req web.BlogCreateRequest, userID string) (web.BlogResponse, error) {
    // Validasi input
    if err := helper.ValidateBlogInput(req.Title, req.Content, req.Category); err != nil {
        return web.BlogResponse{}, err
    }

    // Buat slug dari title
    baseSlug := strings.ToLower(strings.ReplaceAll(req.Title, " ", "-"))
    uniqueID := uuid.New().String()[:8] // Ambil 8 karakter pertama dari UUID
    slug := fmt.Sprintf("%s-%s", baseSlug, uniqueID)

    // Buat objek blog
    blog := domain.Blog{
        ID:        uuid.New().String(),
        Title:     req.Title,
        Slug:      slug,
        Content:   req.Content,
        Category:  req.Category,
		ImagePath: req.Image, // Ubah dari Image ke ImagePath
        UserID:    userID,
        CreatedAt: time.Now().Format(time.RFC3339),
        UpdatedAt: time.Now().Format(time.RFC3339),
    }

    // Simpan ke database melalui repository
    blog, err := service.Repo.Save(ctx, blog)
    if err != nil {
        return web.BlogResponse{}, err
    }

    // Ambil data user dari repository
    user, err := service.Repo.FindUserByID(ctx, uuid.MustParse(userID))
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
    }

    // Kembalikan response dengan data user
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
    }, nil
}

func (s *BlogServiceImpl) FindAll(ctx context.Context) ([]web.BlogResponse, error) {
    // Tangkap kedua nilai yang dikembalikan oleh s.Repo.FindAll
    blogs, err := s.Repo.FindAll(ctx)
    if err != nil {
        return nil, fmt.Errorf("gagal mengambil semua blog: %w", err)
    }

    var result []web.BlogResponse
    for _, blog := range blogs {
        // Konversi blog.UserID dari string ke uuid.UUID
        userID, err := uuid.Parse(blog.UserID)
        if err != nil {
            // Jika gagal mengonversi, gunakan nilai default
            result = append(result, web.BlogResponse{
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
                    ID:       blog.UserID,
                    Name:     "Anonymous",
                    Username: "Unknown",
                    Photo:    "default-profile.png",
                },
            })
            continue
        }

        // Ambil data user berdasarkan UserID
        user, err := s.Repo.FindUserByID(ctx, userID)
        if err != nil {
            // Jika user tidak ditemukan, gunakan nilai default
            user = domain.User{
                Id:       userID,
                Name:     "Anonymous",
                Username: "Unknown",
                Photo:    "default-profile.png",
            }
        }

        // Tambahkan blog ke hasil dengan data user
        result = append(result, web.BlogResponse{
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
        return web.BlogResponse{}, fmt.Errorf("blog dengan slug %s tidak ditemukan: %w", slug, err)
    }

    // Ambil data user dari repository
    user, err := s.Repo.FindUserByID(ctx, uuid.MustParse(blog.UserID))
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
    }

    // Kembalikan response dengan data user
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
    }, nil
}

func (s *BlogServiceImpl) Update(ctx context.Context, blogID string, req web.BlogCreateRequest) (web.BlogResponse, error) {
    // Validasi input
    if err := helper.ValidateBlogInput(req.Title, req.Content, req.Category); err != nil {
        return web.BlogResponse{}, err
    }

    // Ambil blog dari repository
    blog, err := s.Repo.FindByID(ctx, blogID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("blog dengan ID %s tidak ditemukan: %w", blogID, err)
    }

    // Perbarui slug jika title diubah
    var slug string
    if req.Title != blog.Title {
        baseSlug := strings.ToLower(strings.ReplaceAll(req.Title, " ", "-"))
        uniqueID := uuid.New().String()[:8] // Ambil 8 karakter pertama dari UUID
        slug = fmt.Sprintf("%s-%s", baseSlug, uniqueID)
    } else {
        slug = blog.Slug
    }

    // Perbarui data blog
    blog.Title = req.Title
    blog.Slug = slug
    blog.Content = req.Content
    blog.Category = req.Category
	blog.ImagePath = req.Image
    blog.UpdatedAt = time.Now().Format(time.RFC3339)

    // Simpan perubahan ke repository
    err = s.Repo.Update(ctx, blog)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("gagal mengupdate blog: %w", err)
    }

    // Ambil data user dari repository
    user, err := s.Repo.FindUserByID(ctx, uuid.MustParse(blog.UserID))
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
    }

    // Kembalikan response dengan data user
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
    }, nil
}

func generateSlug(title string) string {
    return strings.ToLower(strings.ReplaceAll(title, " ", "-"))
}


func (s *BlogServiceImpl) UploadPhoto(ctx context.Context, blogId string, userId string, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
    // Validasi blog ID
    blog, err := s.Repo.FindByID(ctx, blogId)
    if err != nil {
        return "", fmt.Errorf("blog dengan ID %s tidak ditemukan", blogId)
    }

    // Pastikan user adalah pemilik blog
    if blog.UserID != userId {
        return "", fmt.Errorf("anda tidak memiliki izin untuk mengupload photo untuk blog ini")
    }

    // Buat direktori penyimpanan
    uploadDir := fmt.Sprintf("uploads/blogs/%s", userId)
    if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
        return "", fmt.Errorf("gagal membuat direktori upload: %w", err)
    }

    // Simpan file
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

    // Kembalikan path file
    return filePath, nil
}

func (s *BlogServiceImpl) GetRandomBlogs(ctx context.Context, limit int) ([]web.BlogResponse, error) {
    blogs, err := s.Repo.GetRandomBlogs(ctx, limit)
    if err != nil {
        return nil, fmt.Errorf("gagal mengambil blog random: %w", err)
    }

    var blogResponses []web.BlogResponse
    for _, blog := range blogs {
        // Ambil data user berdasarkan user_id
        userID, err := uuid.Parse(blog.UserID)
        if err != nil {
            return nil, fmt.Errorf("gagal mengonversi user_id: %w", err)
        }

        user, err := s.Repo.FindUserByID(ctx, userID)
        if err != nil {
            // Jika user tidak ditemukan, gunakan nilai default
            user = domain.User{
                Id:       userID,
                Name:     "Anonymous",
                Username: "Unknown",
                Photo:    "default-profile.png",
            }
        }

        // Tambahkan blog ke hasil dengan data user
        blogResponses = append(blogResponses, web.BlogResponse{
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
        })
    }

    return blogResponses, nil
}