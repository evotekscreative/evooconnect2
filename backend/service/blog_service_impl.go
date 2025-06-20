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
	"unicode"
	"math/rand"
)

type BlogServiceImpl struct {
	Repo                repository.BlogRepository
	UserRepository      repository.UserRepository
	ConnectionRepository repository.ConnectionRepository
	NotificationService NotificationService
}

func NewBlogService(
	repo repository.BlogRepository,
	userRepository repository.UserRepository,
	connectionRepository repository.ConnectionRepository,
	notificationService NotificationService) BlogService {
	return &BlogServiceImpl{
		Repo:                repo,
		UserRepository:      userRepository,
		ConnectionRepository: connectionRepository,
		NotificationService: notificationService,
	}
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

func validateContent(content string) error {
	if len(content) > 1500 {
		return fmt.Errorf("konten blog tidak boleh lebih dari 1500 karakter")
	}
	return nil
}

func (s *BlogServiceImpl) Create(ctx context.Context, req web.BlogCreateRequest, userID string) (web.BlogResponse, error) {
    // Validasi input dasar
    if err := helper.ValidateBlogInput(req.Title, req.Content, req.Category); err != nil {
        return web.BlogResponse{}, err
    }
    
    // Validasi panjang konten
    if err := validateContent(req.Content); err != nil {
        return web.BlogResponse{}, err
    }
    
    // Validasi kategori
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

    // Ambil ID user yang sedang login dari context
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var currentUserId uuid.UUID
    if ok {
        currentUserId, _ = uuid.Parse(currentUserIdStr)
    }

    // Periksa apakah current user terhubung dengan penulis blog
    isConnected := false
    if currentUserId != uuid.Nil && userUUID != currentUserId {
        isConnected = s.ConnectionRepository.IsConnected(ctx, nil, currentUserId, userUUID)
    }

    // Kirim notifikasi ke koneksi pengguna dengan penanganan error yang lebih baik
    go s.sendBlogNotifications(ctx, blog, user)

    return buildBlogResponse(blog, user, isConnected), nil
}
// Fungsi helper untuk mengirim notifikasi blog
func (s *BlogServiceImpl) sendBlogNotifications(ctx context.Context, blog domain.Blog, user domain.User) {
    // Cek apakah service tersedia
    if s.NotificationService == nil {
        fmt.Println("DEBUG: NotificationService is nil")
        return
    }

    userUUID, err := uuid.Parse(blog.UserID)
    if err != nil {
        fmt.Printf("DEBUG: Failed to parse user ID: %v\n", err)
        return
    }

    blogId, err := uuid.Parse(blog.ID)
    if err != nil {
        fmt.Printf("DEBUG: Failed to parse blog ID: %v\n", err)
        return
    }

    userName := user.Name
    blogTitle := blog.Title
    
    // Hanya kirim notifikasi dengan probabilitas tertentu (70%)
    if rand.Intn(100) > 70 {
        fmt.Println("DEBUG: Skipping notifications for this blog (random)")
        return
    }
    
    // Kirim notifikasi ke koneksi pengguna
    refType := "blog_new"
    
    // Kirim notifikasi langsung tanpa menggunakan koneksi database
    s.NotificationService.Create(
        context.Background(),
        userUUID, // Kirim ke diri sendiri untuk testing
        "blog",
        "blog_new",
        "New Blog",
        fmt.Sprintf("%s published a new blog: '%s'", userName, blogTitle),
        &blogId,
        &refType,
        &userUUID,
    )
}

func (s *BlogServiceImpl) FindAll(ctx context.Context) ([]web.BlogResponse, error) {
    // Ambil ID user yang sedang login dari context
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var currentUserId uuid.UUID
    if ok {
        currentUserId, _ = uuid.Parse(currentUserIdStr)
    }

    // Ambil semua blog
    blogs, err := s.Repo.FindAll(ctx)
    if err != nil {
        return nil, fmt.Errorf("gagal mengambil semua blog: %w", err)
    }

    var result []web.BlogResponse
    for _, blog := range blogs {
        // Skip blog yang di-take down kecuali untuk pemiliknya
        if blog.Status == "taken_down" && blog.UserID != currentUserIdStr {
            continue
        }

        userID, err := uuid.Parse(blog.UserID)
        if err != nil {
            result = append(result, helper.ToBlogResponseWithUser(blog, domain.User{
                Id:       uuid.Nil,
                Name:     "Anonymous",
                Username: "Unknown",
                Photo:    "default-profile.png",
            }, false))
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

        // Periksa apakah current user terhubung dengan penulis blog
        isConnected := false
        if currentUserId != uuid.Nil && userID != currentUserId {
            isConnected = s.ConnectionRepository.IsConnected(ctx, nil, currentUserId, userID)
        }

        blogResponse := helper.ToBlogResponseWithUser(blog, user, isConnected)
        
        // Tambahkan peringatan jika blog di-take down dan user adalah pemiliknya
        if blog.Status == "taken_down" && blog.UserID == currentUserIdStr {
            blogResponse.Warning = "This blog has been removed for violating our community guidelines. Only you can view this content."
        }
        
        result = append(result, blogResponse)
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
    
    // Debug untuk melihat nilai status
    fmt.Printf("DEBUG: Blog status: '%s'\n", blog.Status)
    
    // Cek status blog terlebih dahulu
    if blog.Status == "taken_down" {
        // Ambil ID user yang sedang login dari context
        currentUserIdStr, ok := ctx.Value("user_id").(string)
        fmt.Printf("DEBUG: Current user ID: '%s', ok: %v\n", currentUserIdStr, ok)
        
        // Jika tidak ada user yang login atau user bukan pemilik blog, kembalikan error not found
        if !ok || currentUserIdStr != blog.UserID {
            return web.BlogResponse{}, errors.New("Blog Not Found")
        }
        
        // Jika sampai di sini, berarti user adalah pemilik blog
        fmt.Printf("DEBUG: User is owner, showing blog with warning\n")
    }

    userUUID, err := uuid.Parse(blog.UserID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("user ID tidak valid: %w", err)
    }
    user, err := s.Repo.FindUserByID(ctx, userUUID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
    }

    // Ambil ID user yang sedang login dari context
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var currentUserId uuid.UUID
    if ok {
        currentUserId, _ = uuid.Parse(currentUserIdStr)
    }

    // Periksa apakah current user terhubung dengan penulis blog
    isConnected := false
    if currentUserId != uuid.Nil && userUUID != currentUserId {
        isConnected = s.ConnectionRepository.IsConnected(ctx, nil, currentUserId, userUUID)
    }

    // Buat response
    response := buildBlogResponse(blog, user, isConnected)
    
    // Tambahkan warning jika blog di-take down dan user adalah pemiliknya
    if blog.Status == "taken_down" && currentUserIdStr == blog.UserID {
        response.Warning = "This blog has been removed for violating our community guidelines. Only you can view this content."
        fmt.Printf("DEBUG: Added warning to response\n")
    }
    
    return response, nil
}

func (s *BlogServiceImpl) UpdateWithImagePath(ctx context.Context, blogID string, request web.BlogCreateRequest, userID string, imagePath string) (web.BlogResponse, error) {
    // Validasi panjang konten
    if err := validateContent(request.Content); err != nil {
        return web.BlogResponse{}, err
    }
    
    // Dapatkan blog yang ada
    existingBlog, err := s.Repo.FindByID(ctx, blogID)
    if err != nil {
        return web.BlogResponse{}, err
    }

    // Periksa apakah user yang melakukan update adalah pemilik blog
    if existingBlog.UserID != userID {
        return web.BlogResponse{}, errors.New("unauthorized: you are not the owner of this blog")
    }

    // Simpan judul lama untuk perbandingan
    oldTitle := existingBlog.Title
    
    // Update data blog
    existingBlog.Title = request.Title
    existingBlog.Category = request.Category
    existingBlog.Content = request.Content
    existingBlog.UpdatedAt = nowISO8601()
    
    // Update image path jika ada gambar baru
    if imagePath != "" && imagePath != existingBlog.ImagePath {
        existingBlog.ImagePath = imagePath
    }

    // Generate slug baru jika judul berubah
    if oldTitle != request.Title {
        existingBlog.Slug = generateSlug(request.Title)
    }

    // Simpan perubahan ke database
    err = s.Repo.Update(ctx, existingBlog)
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

    // Ambil ID user yang sedang login dari context
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var currentUserId uuid.UUID
    if ok {
        currentUserId, _ = uuid.Parse(currentUserIdStr)
    }

    // Periksa apakah current user terhubung dengan penulis blog
    isConnected := false
    if currentUserId != uuid.Nil && userUUID != currentUserId {
        isConnected = s.ConnectionRepository.IsConnected(ctx, nil, currentUserId, userUUID)
    }

    return buildBlogResponse(existingBlog, user, isConnected), nil
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

    // Ambil ID user yang sedang login dari context
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var currentUserId uuid.UUID
    if ok {
        currentUserId, _ = uuid.Parse(currentUserIdStr)
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

        // Periksa apakah current user terhubung dengan penulis blog
        isConnected := false
        if currentUserId != uuid.Nil && userID != currentUserId {
            isConnected = s.ConnectionRepository.IsConnected(ctx, nil, currentUserId, userID)
        }

        blogResponses = append(blogResponses, buildBlogResponse(blog, user, isConnected))
    }
    return blogResponses, nil
}

func (service *BlogServiceImpl) CreateWithImagePath(ctx context.Context, req web.BlogCreateRequest, userID string, imagePath string) (web.BlogResponse, error) {
    // Validasi
    if err := helper.ValidateBlogInput(req.Title, req.Content, req.Category); err != nil {
        return web.BlogResponse{}, err
    }
    
    // Validasi panjang konten
    if err := validateContent(req.Content); err != nil {
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
        ImagePath: imagePath,
        UserID:    userID,
        CreatedAt: nowISO8601(),
        UpdatedAt: nowISO8601(),
    }

    blog, err := service.Repo.Save(ctx, blog)
    if err != nil {
        return web.BlogResponse{}, err
    }

    userUUID, err := uuid.Parse(userID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("user ID tidak valid: %w", err)
    }
    
    user, err := service.Repo.FindUserByID(ctx, userUUID)
    if err != nil {
        return web.BlogResponse{}, fmt.Errorf("gagal mengambil data user: %w", err)
    }

    // Ambil ID user yang sedang login dari context
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var currentUserId uuid.UUID
    if ok {
        currentUserId, _ = uuid.Parse(currentUserIdStr)
    }

    // Periksa apakah current user terhubung dengan penulis blog
    isConnected := false
    if currentUserId != uuid.Nil && userUUID != currentUserId {
        isConnected = service.ConnectionRepository.IsConnected(ctx, nil, currentUserId, userUUID)
    }

    // Kirim notifikasi ke koneksi pengguna
    go service.sendBlogNotifications(ctx, blog, user)

    return buildBlogResponse(blog, user, isConnected), nil
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

    // Ambil ID user yang sedang login dari context
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var currentUserId uuid.UUID
    if ok {
        currentUserId, _ = uuid.Parse(currentUserIdStr)
    }

    // Periksa apakah current user terhubung dengan penulis blog
    isConnected := false
    if currentUserId != uuid.Nil && userUUID != currentUserId {
        isConnected = s.ConnectionRepository.IsConnected(ctx, nil, currentUserId, userUUID)
    }

    return buildBlogResponse(blog, user, isConnected), nil
}

func generateSlug(title string) string {
    // Ubah ke lowercase
    slug := strings.ToLower(title)
    
    // Hapus karakter spesial, hanya biarkan huruf, angka, dan spasi
    slug = strings.Map(func(r rune) rune {
        if unicode.IsLetter(r) || unicode.IsNumber(r) || unicode.IsSpace(r) {
            return r
        }
        return -1
    }, slug)
    
    // Ganti spasi dengan tanda hubung
    slug = strings.ReplaceAll(slug, " ", "-")
    
    // Hapus tanda hubung berlebih
    for strings.Contains(slug, "--") {
        slug = strings.ReplaceAll(slug, "--", "-")
    }
    
    // Tambahkan ID unik
    uniqueID := uuid.New().String()[:8]
    return fmt.Sprintf("%s-%s", strings.Trim(slug, "-"), uniqueID)
}

func nowISO8601() string {
	return time.Now().Format(time.RFC3339)
}

func buildBlogResponse(blog domain.Blog, user domain.User, isConnected ...bool) web.BlogResponse {
    connected := false
    if len(isConnected) > 0 {
        connected = isConnected[0]
    }
    
    return web.BlogResponse{
        ID:        blog.ID,
        Title:     blog.Title,
        Slug:      blog.Slug,
        Category:  blog.Category,
        Content:   blog.Content,
        Photo:     blog.ImagePath,
        UserID:    blog.UserID,
        Warning:   "", // Default kosong, akan diisi di fungsi yang memanggil
        CreatedAt: blog.CreatedAt,
        UpdatedAt: blog.UpdatedAt,
        User: web.BlogUserResponse{
            ID:          user.Id.String(),
            Name:        user.Name,
            Username:    user.Username,
            Photo:       user.Photo,
            IsConnected: connected,
        },
    }
}