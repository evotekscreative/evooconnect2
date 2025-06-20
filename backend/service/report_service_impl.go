package service

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

var validReasons = []string{
	"Harassment", "Fraud", "Spam", "Missinformation", "Hate Speech",
	"Threats or violence", "self-harm", "Graphic or violent content",
	"Dangerous or extremist organizations", "Sexual Content", "Fake Account",
	"Child Exploitation", "Illegal products and services", "Infringement", "Other",
}

type reportServiceImpl struct {
	reportRepository      repository.ReportRepository
	userRepository        repository.UserRepository
	postRepository        repository.PostRepository
	commentRepository     repository.CommentRepository
	blogRepository        repository.BlogRepository
	commentBlogRepository repository.CommentBlogRepository
	groupRepository       repository.GroupRepository
	notificationService   NotificationService // Tambahkan ini
	db                    *sql.DB
}

func NewReportService(
	reportRepo repository.ReportRepository,
	userRepo repository.UserRepository,
	postRepo repository.PostRepository,
	commentRepo repository.CommentRepository,
	blogRepo repository.BlogRepository,
	commentBlogRepo repository.CommentBlogRepository,
	groupRepo repository.GroupRepository,
	notificationService NotificationService, // Tambahkan ini
	db *sql.DB,
) ReportService {
	return &reportServiceImpl{
		reportRepository:      reportRepo,
		userRepository:        userRepo,
		postRepository:        postRepo,
		commentRepository:     commentRepo,
		blogRepository:        blogRepo,
		commentBlogRepository: commentBlogRepo,
		groupRepository:       groupRepo,
		notificationService:   notificationService, // Tambahkan ini
		db:                    db,
	}
}

func (s *reportServiceImpl) Create(request web.CreateReportRequest) (web.ReportResponse, error) {
	if !isValidReason(request.Reason) {
		return web.ReportResponse{}, errors.New("invalid report reason")
	}

	if strings.ToLower(request.Reason) == "Other" && strings.TrimSpace(request.OtherReason) == "" {
		return web.ReportResponse{}, errors.New("other reason must be filled")
	}
	ctx := context.Background()
	tx, err := s.db.Begin()
	if err != nil {
		return web.ReportResponse{}, err
	}
	defer tx.Rollback()

	var targetUUID uuid.UUID
	if request.TargetType != "blog" {
		targetUUID, err = uuid.Parse(request.TargetID)
		if err != nil {
			return web.ReportResponse{}, errors.New("invalid target ID (must be UUID)")
		}
	}

	switch request.TargetType {
	case "post":
		_, err = s.postRepository.FindById(ctx, tx, targetUUID)
	case "comment":
		_, err = s.commentRepository.FindById(ctx, tx, targetUUID)
	case "blog":
		_, err = s.blogRepository.FindByID(ctx, request.TargetID) // tetap string
	case "comment_blog":
		_, err = s.commentBlogRepository.FindById(ctx, tx, targetUUID)
	case "user":
		_, err = s.userRepository.FindById(ctx, tx, targetUUID)
	case "group":
		_, err = s.groupRepository.FindById(ctx, tx, targetUUID)
	default:
		return web.ReportResponse{}, errors.New("unknown content type")
	}

	if err != nil {
		return web.ReportResponse{}, fmt.Errorf("%s that was reported was not found", request.TargetType)
	}

	reported, err := s.reportRepository.HasReported(ctx, request.ReporterID, request.TargetType, request.TargetID)
	if err != nil {
		return web.ReportResponse{}, err
	}
	if reported {
		return web.ReportResponse{}, errors.New("You have already reported this content")
	}

	report := domain.Report{
		ID:          uuid.NewString(),
		ReporterID:  request.ReporterID,
		TargetType:  request.TargetType,
		TargetID:    request.TargetID,
		Reason:      request.Reason,
		OtherReason: request.OtherReason,
		Status:      "pending",
		CreatedAt:   time.Now(),
	}

	result, err := s.reportRepository.Create(ctx, report)
	if err != nil {
		return web.ReportResponse{}, err
	}

	tx.Commit()

	return web.ReportResponse{
		ID:         result.ID,
		ReporterID: result.ReporterID,
		TargetType: result.TargetType,
		TargetID:   result.TargetID,
		Reason:     result.Reason,
		Description: func() string {
			if strings.EqualFold(result.Reason, "Other") {
				return result.OtherReason
			}
			return ""
		}(),
		Status: result.Status,
	}, nil
}

func isValidReason(reason string) bool {
	for _, r := range validReasons {
		if strings.EqualFold(r, reason) {
			return true
		}
	}
	return false
}

func (s *reportServiceImpl) FindAll(ctx context.Context, page, limit int, targetType string) ([]web.ReportResponse, int, error) {
	// Validasi parameter
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	// Panggil repository untuk mendapatkan data
	reports, totalCount, err := s.reportRepository.FindAll(ctx, page, limit, targetType)
	if err != nil {
		return nil, 0, err
	}

	// Konversi domain ke response
	var reportResponses []web.ReportResponse
	for _, report := range reports {
		// Ambil informasi tambahan untuk setiap report
		reportResponse, err := s.enrichReportResponse(ctx, report)
		if err != nil {
			// Log error tapi tetap lanjutkan
			fmt.Printf("Error enriching report data: %v\n", err)

			// Tambahkan response dasar jika gagal mendapatkan info tambahan
			reportResponse = web.ReportResponse{
				ID:         report.ID,
				ReporterID: report.ReporterID,
				TargetType: report.TargetType,
				TargetID:   report.TargetID,
				Reason:     report.Reason,
				Description: func() string {
					if strings.EqualFold(report.Reason, "Other") {
						return report.OtherReason
					}
					return ""
				}(),
				Status: report.Status,
			}
		}

		reportResponses = append(reportResponses, reportResponse)
	}

	return reportResponses, totalCount, nil
}

// Fungsi helper untuk memperkaya data report dengan informasi tambahan
func (s *reportServiceImpl) enrichReportResponse(ctx context.Context, report domain.Report) (web.ReportResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return web.ReportResponse{}, err
	}
	defer tx.Rollback()

	// Ambil data reporter
	var reporterName string
	reporterUUID, err := uuid.Parse(report.ReporterID)
	if err == nil {
		reporter, err := s.userRepository.FindById(ctx, tx, reporterUUID)
		if err == nil {
			reporterName = reporter.Name
		}
	}

	// Buat response dasar
	response := web.ReportResponse{
		ID:           report.ID,
		ReporterID:   report.ReporterID,
		ReporterName: reporterName,
		TargetType:   report.TargetType,
		TargetID:     report.TargetID,
		Reason:       report.Reason,
		Description: func() string {
			if strings.EqualFold(report.Reason, "Other") {
				return report.OtherReason
			}
			return ""
		}(),
		Status: report.Status,
	}

	// Tambahkan informasi tambahan berdasarkan tipe target
	switch report.TargetType {
	case "user":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			user, err := s.userRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				response.TargetTitle = user.Name
				response.TargetUsername = user.Username
				response.TargetPhoto = user.Photo
			}
		}
	case "post":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			post, err := s.postRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				// Ambil data user pemilik post
				user, _ := s.userRepository.FindById(ctx, tx, post.UserId)

				response.TargetContent = truncateText(post.Content, 100)
				response.TargetAuthorName = user.Name

				// Periksa apakah post memiliki gambar
				// Karena Images adalah array, kita perlu memeriksa panjangnya
				if len(post.Images) > 0 {
					response.TargetPhoto = post.Images[0] // Ambil gambar pertama
				}
			}
		}
	case "blog":
		blog, err := s.blogRepository.FindByID(ctx, report.TargetID)
		if err == nil {
			// Ambil data user pemilik blog
			userUUID, err := uuid.Parse(blog.UserID)
			if err == nil {
				user, err := s.userRepository.FindById(ctx, tx, userUUID)
				if err == nil {
					response.TargetAuthorName = user.Name
				}
			}

			response.TargetTitle = blog.Title
			response.TargetContent = truncateText(blog.Content, 100)
			response.TargetPhoto = blog.ImagePath
		}
	case "comment":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			comment, err := s.commentRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				// Ambil data user pemilik komentar
				user, _ := s.userRepository.FindById(ctx, tx, comment.UserId)

				response.TargetContent = truncateText(comment.Content, 100)
				response.TargetAuthorName = user.Name
			}
		}
	case "comment_blog":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			comment, err := s.commentBlogRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				// Ambil data user pemilik komentar
				// Karena comment.UserId sudah bertipe uuid.UUID, tidak perlu di-parse lagi
				user, err := s.userRepository.FindById(ctx, tx, comment.UserId)
				if err == nil {
					response.TargetAuthorName = user.Name
				}

				response.TargetContent = truncateText(comment.Content, 100)
			}
		}
	case "group":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			group, err := s.groupRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				response.TargetTitle = group.Name
				response.TargetContent = truncateText(group.Description, 100)
				if group.Image != nil {
					response.TargetPhoto = *group.Image
				}

				// Ambil data creator grup
				creator, err := s.userRepository.FindById(ctx, tx, group.CreatorId)
				if err == nil {
					response.TargetAuthorName = creator.Name
				}
			}
		}
	}
	return response, nil
}

// Helper function untuk memotong teks yang terlalu panjang
func truncateText(text string, maxLength int) string {
	if len(text) <= maxLength {
		return text
	}
	return text[:maxLength] + "..."
}

func (s *reportServiceImpl) FindById(ctx context.Context, id string) (web.DetailReportResponse, error) {
	// Ambil report dari repository
	report, err := s.reportRepository.FindById(ctx, id)
	if err != nil {
		return web.DetailReportResponse{}, err
	}

	// Mulai transaksi untuk operasi database lainnya
	tx, err := s.db.Begin()
	if err != nil {
		return web.DetailReportResponse{}, err
	}
	defer tx.Rollback()

	// Ambil data reporter
	var reporterName string
	reporterUUID, err := uuid.Parse(report.ReporterID)
	if err == nil {
		reporter, err := s.userRepository.FindById(ctx, tx, reporterUUID)
		if err == nil {
			reporterName = reporter.Name
		}
	}

	// Ambil detail target berdasarkan tipe
	var targetDetail interface{}

	switch report.TargetType {
	case "user":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			user, err := s.userRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				targetDetail = map[string]interface{}{
					"id":       user.Id,
					"name":     user.Name,
					"username": user.Username,
					"email":    user.Email,
					"about":    user.About,
					"photo":    user.Photo,
				}
			}
		}
	case "post":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			post, err := s.postRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				// Ambil data user pemilik post
				user, _ := s.userRepository.FindById(ctx, tx, post.UserId)
				var userName string
				if user.Name != "" {
					userName = user.Name
				}

				targetDetail = map[string]interface{}{
					"id":         post.Id,
					"user_id":    post.UserId,
					"user_name":  userName,
					"content":    post.Content,
					"created_at": post.CreatedAt,
				}
			}
		}
	case "blog":
		blog, err := s.blogRepository.FindByID(ctx, report.TargetID)
		if err == nil {
			targetDetail = map[string]interface{}{
				"id":      blog.ID,
				"title":   blog.Title,
				"content": blog.Content,
			}
		}
	case "comment":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			comment, err := s.commentRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				// Ambil data user pemilik komentar
				user, _ := s.userRepository.FindById(ctx, tx, comment.UserId)
				var userName string
				if user.Name != "" {
					userName = user.Name
				}

				targetDetail = map[string]interface{}{
					"id":         comment.Id,
					"post_id":    comment.PostId,
					"user_id":    comment.UserId,
					"user_name":  userName,
					"content":    comment.Content,
					"created_at": comment.CreatedAt,
				}
			}
		}
	case "comment_blog":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			comment, err := s.commentBlogRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				targetDetail = map[string]interface{}{
					"id":         comment.Id,
					"blog_id":    comment.BlogId,
					"user_id":    comment.UserId,
					"content":    comment.Content,
					"created_at": comment.CreatedAt,
				}
			}
		}
	case "group":
		targetUUID, err := uuid.Parse(report.TargetID)
		if err == nil {
			group, err := s.groupRepository.FindById(ctx, tx, targetUUID)
			if err == nil {
				// Ambil data creator grup
				creator, _ := s.userRepository.FindById(ctx, tx, group.CreatorId)
				var creatorName string
				if creator.Name != "" {
					creatorName = creator.Name
				}

				targetDetail = map[string]interface{}{
					"id":           group.Id,
					"name":         group.Name,
					"description":  group.Description,
					"creator_id":   group.CreatorId,
					"creator_name": creatorName,
					"PrivacyLevel": group.PrivacyLevel,
					"created_at":   group.CreatedAt,
				}
			}
		}
	}

	// Buat response
	description := report.OtherReason
	if strings.ToLower(report.Reason) != "other" {
		description = ""
	}

	return web.DetailReportResponse{
		ID:           report.ID,
		ReporterID:   report.ReporterID,
		ReporterName: reporterName,
		TargetType:   report.TargetType,
		TargetID:     report.TargetID,
		TargetDetail: targetDetail,
		Reason:       report.Reason,
		Description:  description,
		Status:       report.Status,
		CreatedAt:    report.CreatedAt,
	}, nil
}

func (s *reportServiceImpl) TakeAction(ctx context.Context, id string, request web.AdminActionRequest) (web.AdminActionResponse, error) {
	// Validasi request
	if request.Status != "accepted" && request.Status != "rejected" {
		return web.AdminActionResponse{}, errors.New("invalid status value")
	}

	if request.Status == "accepted" {
		if request.Action == "" {
			return web.AdminActionResponse{}, errors.New("action is required when status is accepted")
		}

		if request.Action == "suspend" && request.Duration <= 0 {
			return web.AdminActionResponse{}, errors.New("suspension duration must be greater than 0")
		}
	} else if request.Status == "rejected" {
		// Untuk rejected, action harus kosong
		request.Action = ""
	}

	// Ambil report dari repository
	report, err := s.reportRepository.FindById(ctx, id)
	if err != nil {
		return web.AdminActionResponse{}, err
	}

	// Mulai transaksi
	tx, err := s.db.Begin()
	if err != nil {
		return web.AdminActionResponse{}, err
	}
	defer tx.Rollback()

	// Update status report
	report, err = s.reportRepository.UpdateStatus(ctx, id, request.Status)
	if err != nil {
		return web.AdminActionResponse{}, err
	}

	var suspendedUntil *time.Time

	// Jika status accepted, lakukan aksi berdasarkan tipe target dan aksi yang diminta
	if request.Status == "accepted" {
		switch report.TargetType {
		case "user":
			targetUUID, err := uuid.Parse(report.TargetID)
			if err != nil {
				return web.AdminActionResponse{}, err
			}

			switch request.Action {
			case "suspend":
				// Suspend user
				suspendUntil := time.Now().AddDate(0, 0, request.Duration)
				suspendedUntil = &suspendUntil

				query := "UPDATE users SET status = 'suspended', suspended_until = $1 WHERE id = $2"
				_, err = tx.ExecContext(ctx, query, suspendUntil, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

			case "ban":
				// Ban user permanen
				query := "UPDATE users SET status = 'banned' WHERE id = $1"
				_, err = tx.ExecContext(ctx, query, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}
			}

		case "post":
			if request.Action == "take_down" {
				targetUUID, err := uuid.Parse(report.TargetID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Ambil informasi post sebelum di-take down untuk notifikasi
				post, err := s.postRepository.FindById(ctx, tx, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Take down post
				query := "UPDATE posts SET status = 'taken_down' WHERE id = $1"
				_, err = tx.ExecContext(ctx, query, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Kirim notifikasi ke pemilik post
				if s.notificationService != nil {
					refType := "post_taken_down"
					s.notificationService.Create(
						ctx,
						post.UserId,
						string(domain.NotificationCategoryPost),
						"post_taken_down",
						"Post Taken Down",
						fmt.Sprintf("Admin Evoconnect has taken down your post: %s", request.Reason),
						&targetUUID,
						&refType,
						nil, // actorId nil untuk admin
					)
				}
			}

		case "blog":
			if request.Action == "take_down" {
				// Ambil informasi blog sebelum di-take down untuk notifikasi
				blog, err := s.blogRepository.FindByID(ctx, report.TargetID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Take down blog
				query := "UPDATE tb_blog SET status = 'taken_down' WHERE id = $1"
				_, err = tx.ExecContext(ctx, query, report.TargetID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Kirim notifikasi ke pemilik blog
				if s.notificationService != nil {
					// Parse userID dari string ke UUID
					userUUID, err := uuid.Parse(blog.UserID)
					if err == nil {
						refType := "blog_taken_down"
						s.notificationService.Create(
							ctx,
							userUUID,
							string(domain.NotificationCategoryPost), // Atau bisa pakai category "blog" jika ada
							"blog_taken_down",
							"Blog Taken Down",
							fmt.Sprintf("Admin Evoconnect has taken down your blog '%s': %s", blog.Title, request.Reason),
							nil,
							&refType,
							nil, // actorId nil untuk admin
						)
					}
				}
			}

		case "comment":
			if request.Action == "take_down" {
				targetUUID, err := uuid.Parse(report.TargetID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Ambil informasi comment sebelum di-take down untuk notifikasi
				comment, err := s.commentRepository.FindById(ctx, tx, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Take down comment
				query := "UPDATE comments SET status = 'taken_down' WHERE id = $1"
				_, err = tx.ExecContext(ctx, query, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Kirim notifikasi ke pemilik comment
				if s.notificationService != nil {
					refType := "comment_taken_down"
					s.notificationService.Create(
						ctx,
						comment.UserId,
						string(domain.NotificationCategoryPost),
						"comment_taken_down",
						"Comment Taken Down",
						fmt.Sprintf("Admin Evoconnect has taken down your comment: %s", request.Reason),
						&targetUUID,
						&refType,
						nil, // actorId nil untuk admin
					)
				}
			}

		case "comment_blog":
			if request.Action == "take_down" {
				targetUUID, err := uuid.Parse(report.TargetID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Ambil informasi comment blog sebelum di-take down untuk notifikasi
				comment, err := s.commentBlogRepository.FindById(ctx, tx, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Take down comment blog
				query := "UPDATE comment_blog SET status = 'taken_down' WHERE id = $1"
				_, err = tx.ExecContext(ctx, query, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Kirim notifikasi ke pemilik comment blog
				if s.notificationService != nil {
					refType := "comment_blog_taken_down"
					s.notificationService.Create(
						ctx,
						comment.UserId,
						string(domain.NotificationCategoryPost),
						"comment_blog_taken_down",
						"Blog Comment Taken Down",
						fmt.Sprintf("Admin Evoconnect has taken down your blog comment: %s", request.Reason),
						&targetUUID,
						&refType,
						nil, // actorId nil untuk admin
					)
				}
			}

		case "group":
			targetUUID, err := uuid.Parse(report.TargetID)
			if err != nil {
				return web.AdminActionResponse{}, err
			}

			// Ambil informasi grup sebelum dihapus untuk notifikasi
			group, err := s.groupRepository.FindById(ctx, tx, targetUUID)
			if err != nil {
				return web.AdminActionResponse{}, err
			}

			switch request.Action {
			case "take_down":
				// Take down group
				query := "UPDATE groups SET status = 'taken_down' WHERE id = $1"
				_, err = tx.ExecContext(ctx, query, targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// Kirim notifikasi ke creator grup
				if s.notificationService != nil {
					refType := "group_taken_down"
					s.notificationService.Create(
						ctx,
						group.CreatorId,
						string(domain.NotificationCategoryGroup),
						"group_taken_down",
						"Group Taken Down",
						fmt.Sprintf("Admin Evoconnect has taken down your group '%s': %s", group.Name, request.Reason),
						&targetUUID,
						&refType,
						nil,
					)
				}

			case "ban":
				// Kirim notifikasi ke creator grup sebelum menghapus data
				if s.notificationService != nil {
					refType := "group_banned"
					s.notificationService.Create(
						ctx,
						group.CreatorId,
						string(domain.NotificationCategoryGroup),
						"group_banned",
						"Group Banned",
						fmt.Sprintf("Admin Evoconnect has banned your group '%s': %s", group.Name, request.Reason),
						nil,
						&refType,
						nil,
					)

					// Kirim notifikasi ke admin/moderator grup
					query := "SELECT user_id FROM group_members WHERE group_id = $1 AND role IN ('admin', 'moderator') AND user_id != $2"
					rows, err := tx.QueryContext(ctx, query, targetUUID, group.CreatorId)
					if err == nil {
						defer rows.Close()
						for rows.Next() {
							var memberId uuid.UUID
							if err := rows.Scan(&memberId); err == nil {
								s.notificationService.Create(
									ctx,
									memberId,
									string(domain.NotificationCategoryGroup),
									"group_banned",
									"Group Banned",
									fmt.Sprintf("Admin Evoconnect has banned group '%s': %s", group.Name, request.Reason),
									nil,
									&refType,
									nil,
								)
							}
						}
					}
				}

				// Ban group - hapus semua data terkait
				// 1. Hapus semua post grup
				_, err = tx.ExecContext(ctx, "DELETE FROM posts WHERE group_id = $1", targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// 2. Hapus semua pending post grup
				_, err = tx.ExecContext(ctx, "DELETE FROM pending_posts WHERE group_id = $1", targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// 3. Hapus semua join request grup
				_, err = tx.ExecContext(ctx, "DELETE FROM group_join_requests WHERE group_id = $1", targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// 4. Hapus semua invitation grup
				_, err = tx.ExecContext(ctx, "DELETE FROM group_invitations WHERE group_id = $1", targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// 5. Hapus semua member grup
				_, err = tx.ExecContext(ctx, "DELETE FROM group_members WHERE group_id = $1", targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}

				// 6. Hapus grup itu sendiri
				_, err = tx.ExecContext(ctx, "DELETE FROM groups WHERE id = $1", targetUUID)
				if err != nil {
					return web.AdminActionResponse{}, err
				}
			}
		}
	}

	// Commit transaksi
	if err := tx.Commit(); err != nil {
		return web.AdminActionResponse{}, err
	}

	// Buat response
	return web.AdminActionResponse{
		ReportID:       report.ID,
		Status:         report.Status,
		Action:         request.Action,
		TargetType:     report.TargetType,
		TargetID:       report.TargetID,
		Reason:         request.Reason,
		ExecutedAt:     time.Now(),
		SuspendedUntil: suspendedUntil,
	}, nil
}

// Helper function untuk mengirim notifikasi - dinonaktifkan karena tidak ada implementasi yang sesuai
// func (s *reportServiceImpl) sendNotification(ctx context.Context, tx *sql.Tx, userId, title, content string) error {
//     // Implementasi notifikasi akan ditambahkan nanti
//     return nil
// }
