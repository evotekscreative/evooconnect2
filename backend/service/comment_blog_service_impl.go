package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"time"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CommentBlogServiceImpl struct {
	CommentBlogRepository repository.CommentBlogRepository
	BlogRepository        repository.BlogRepository
	UserRepository        repository.UserRepository
	NotificationService   NotificationService // Tambahkan NotificationService
	DB                    *sql.DB
	Validate              *validator.Validate
}

func NewCommentBlogService(
	commentBlogRepository repository.CommentBlogRepository,
	blogRepository repository.BlogRepository,
	userRepository repository.UserRepository,
	notificationService NotificationService, // Tambahkan parameter
	db *sql.DB,
	validate *validator.Validate) CommentBlogService {
	return &CommentBlogServiceImpl{
		CommentBlogRepository: commentBlogRepository,
		BlogRepository:        blogRepository,
		UserRepository:        userRepository,
		NotificationService:   notificationService, // Inisialisasi field
		DB:                    db,
		Validate:              validate,
	}
}

func (service *CommentBlogServiceImpl) Create(ctx context.Context, blogId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse {
    // Validasi request
    err := service.Validate.Struct(request)
    helper.PanicIfError(err)

    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Periksa apakah blog ada
    blog, err := service.BlogRepository.FindByID(ctx, blogId.String()) // Gunakan FindByID bukan FindById
    if err != nil {
        panic(exception.NewNotFoundError("Blog not found"))
    }

    // Create comment
    comment := domain.CommentBlog{
        Id:        uuid.New(),
        BlogId:    blogId,
        UserId:    userId,
        Content:   request.Content,
        ParentId:  request.ParentId, // Null untuk komentar utama
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    newComment := service.CommentBlogRepository.Save(ctx, tx, comment)

    // Get user info
    user, err := service.UserRepository.FindById(ctx, tx, userId)
    if err != nil {
        panic(exception.NewNotFoundError("User not found"))
    }
    newComment.User = &user

    // Kirim notifikasi ke pemilik blog jika bukan diri sendiri
    blogUserID, err := uuid.Parse(blog.UserID) // Parse string ke UUID
    if err == nil && blogUserID != userId && service.NotificationService != nil {
        // Ambil data yang diperlukan
        userName := user.Name
        blogTitle := blog.Title
        
        fmt.Printf("DEBUG: Sending blog comment notification. From: %s, To: %s, BlogID: %s\n", 
            userId, blogUserID, blogId)
        
        refType := "blog_comment"
        go func() {
            service.NotificationService.Create(
                context.Background(),
                blogUserID,
                "blog", // Gunakan string literal karena konstanta belum didefinisikan
                "blog_comment", // Gunakan string literal karena konstanta belum didefinisikan
                "Blog Comment",
                fmt.Sprintf("%s commented on your blog '%s'", userName, blogTitle),
                &blogId,
                &refType,
                &userId,
            )
        }()
    }

    return helper.ToCommentBlogResponse(newComment)
}

func (service *CommentBlogServiceImpl) GetByBlogId(ctx context.Context, blogId uuid.UUID, limit, offset int) web.CommentBlogListResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    _, err = service.BlogRepository.FindByID(ctx, blogId.String())
    if err != nil {
        panic(exception.NewNotFoundError("Blog not found"))
    }

    var nilParentId *uuid.UUID = nil
    comments, err := service.CommentBlogRepository.FindByBlogId(ctx, tx, blogId, nilParentId, limit, offset)
    helper.PanicIfError(err)
    total, err := service.CommentBlogRepository.CountByBlogId(ctx, tx, blogId)
    helper.PanicIfError(err)

    // Hitung jumlah replies untuk setiap komentar
    commentResponses := make([]web.CommentBlogResponse, 0)
    for _, comment := range comments {
        // Konversi ke response
        commentResponse := helper.ToCommentBlogResponse(comment)
        
        // Hitung jumlah replies secara eksplisit
        repliesCount, err := service.CommentBlogRepository.CountRepliesByParentId(ctx, tx, comment.Id)
        if err == nil {
            commentResponse.RepliesCount = repliesCount
        }
        
        commentResponses = append(commentResponses, commentResponse)
    }

    return web.CommentBlogListResponse{
        Comments: commentResponses,
        Total:    total,
    }
}

func (service *CommentBlogServiceImpl) GetById(ctx context.Context, commentId uuid.UUID) web.CommentBlogResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	return helper.ToCommentBlogResponse(comment)
}

func (service *CommentBlogServiceImpl) Update(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	if comment.UserId != userId {
		panic(exception.NewForbiddenError("You can only edit your own comments"))
	}

	comment.Content = request.Content
	updatedComment, err := service.CommentBlogRepository.Update(ctx, tx, comment)
	helper.PanicIfError(err)

	return helper.ToCommentBlogResponse(updatedComment)
}

func (service *CommentBlogServiceImpl) Delete(ctx context.Context, commentId uuid.UUID, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	comment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewNotFoundError("Comment not found"))
	}

	blog, err := service.BlogRepository.FindByID(ctx, comment.BlogId.String())
	if err != nil {
		panic(exception.NewNotFoundError("Blog not found"))
	}

	// Perbaiki tipe data string vs UUID
	if comment.UserId != userId && blog.UserID != userId.String() {
		panic(exception.NewForbiddenError("You don't have permission to delete this comment"))
	}

	err = service.CommentBlogRepository.Delete(ctx, tx, commentId)
	if err != nil {
		panic(exception.NewInternalServerError(err.Error()))
	}
}

func (service *CommentBlogServiceImpl) Reply(ctx context.Context, commentId uuid.UUID, userId uuid.UUID, request web.CreateCommentBlogRequest) web.CommentBlogResponse {
    // Validasi request
    err := service.Validate.Struct(request)
    helper.PanicIfError(err)

    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Periksa apakah komentar yang akan dibalas ada
    parentComment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
    if err != nil {
        panic(exception.NewNotFoundError("Comment not found"))
    }

    // Tentukan parent_id yang benar
    // Jika komentar yang dibalas adalah komentar utama, gunakan ID-nya sebagai parent_id
    // Jika komentar yang dibalas adalah balasan, gunakan parent_id dari komentar tersebut
    var parentId *uuid.UUID
    if parentComment.ParentId == nil {
        // Ini adalah komentar utama, jadi gunakan ID-nya sebagai parent_id
        parentId = &commentId
    } else {
        // Ini adalah balasan, jadi gunakan parent_id dari komentar tersebut
        parentId = parentComment.ParentId
    }

    // Buat komentar baru sebagai balasan
    reply := domain.CommentBlog{
        Id:        uuid.New(),
        BlogId:    parentComment.BlogId,
        UserId:    userId,
        ParentId:  parentId,         // Set parent ID ke ID komentar utama
        ReplyToId: &commentId,       // Set reply_to_id ke ID komentar yang dibalas langsung
        Content:   request.Content,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    newReply := service.CommentBlogRepository.Save(ctx, tx, reply)

    // Get user info
    user, err := service.UserRepository.FindById(ctx, tx, userId)
    if err != nil {
        panic(exception.NewNotFoundError("User not found"))
    }
    newReply.User = &user

    // Get parent comment user info
    parentUser, err := service.UserRepository.FindById(ctx, tx, parentComment.UserId)
    if err != nil {
        panic(exception.NewNotFoundError("Parent comment user not found"))
    }

    // Kirim notifikasi ke pemilik komentar jika bukan diri sendiri
    if parentComment.UserId != userId && service.NotificationService != nil {
        // Ambil data yang diperlukan
        userName := user.Name
        parentUserId := parentComment.UserId
        blogId := parentComment.BlogId
        
        // Ambil data blog untuk judul
        blog, err := service.BlogRepository.FindByID(ctx, blogId.String())
        blogTitle := "a blog"
        if err == nil {
            blogTitle = blog.Title
        }
        
        fmt.Printf("DEBUG: Sending blog comment reply notification. From: %s, To: %s, CommentID: %s\n", 
            userId, parentUserId, commentId)
        
        refType := "blog_comment_reply"
        go func() {
            service.NotificationService.Create(
                context.Background(),
                parentUserId,
                "blog",
                "blog_comment_reply",
                "Blog Comment Reply",
                fmt.Sprintf("%s replied to your comment on '%s'", userName, blogTitle),
                &blogId,
                &refType,
                &userId,
            )
        }()
    }

    // Buat response dengan ReplyTo
    response := helper.ToCommentBlogResponse(newReply)
    response.ReplyTo = &web.ReplyToInfo{
        Id:           parentComment.Id,
        Content:      parentComment.Content,
        Username:     parentUser.Username,
        Name:         parentUser.Name,
        ProfilePhoto: parentUser.Photo,
    }

    return response
}

func (service *CommentBlogServiceImpl) GetReplies(ctx context.Context, commentId uuid.UUID, limit, offset int) web.CommentBlogListResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Cari komentar yang akan diambil balasannya
    parentComment, err := service.CommentBlogRepository.FindById(ctx, tx, commentId)
    if err != nil {
        panic(exception.NewNotFoundError("Parent comment not found"))
    }

    // Ambil balasan komentar
    replies := service.CommentBlogRepository.FindRepliesByParentId(ctx, tx, commentId)
    
    // Hitung total balasan
    total, err := service.CommentBlogRepository.CountRepliesByParentId(ctx, tx, commentId)
    helper.PanicIfError(err)

    // Ambil informasi user untuk komentar yang dibalas
    parentUser, err := service.UserRepository.FindById(ctx, tx, parentComment.UserId)
    if err != nil {
        panic(exception.NewNotFoundError("Parent comment user not found"))
    }

    // Buat response
    var replyResponses []web.CommentBlogResponse
    for _, reply := range replies {
        // Ambil informasi user untuk balasan
        user, err := service.UserRepository.FindById(ctx, tx, reply.UserId)
        if err != nil {
            continue // Skip jika user tidak ditemukan
        }
        reply.User = &user

        // Konversi ke response
        replyResponse := helper.ToCommentBlogResponse(reply)
        
        // Tambahkan informasi ReplyTo
        replyResponse.ReplyTo = &web.ReplyToInfo{
            Id:           parentComment.Id,
            Content:      parentComment.Content,
            Username:     parentUser.Username,
            ProfilePhoto: parentUser.Photo,
        }
        
        replyResponses = append(replyResponses, replyResponse)
    }

    return web.CommentBlogListResponse{
        Comments: replyResponses,
        Total:    total,
    }
}
