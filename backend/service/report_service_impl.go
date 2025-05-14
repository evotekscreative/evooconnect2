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
	"Child Exploitation", "Illegal products and services", "Infringement","Other",
}

type reportServiceImpl struct {
	reportRepository      repository.ReportRepository
	userRepository        repository.UserRepository
	postRepository        repository.PostRepository
	commentRepository     repository.CommentRepository
	blogRepository        repository.BlogRepository
	commentBlogRepository repository.CommentBlogRepository
	db                    *sql.DB
}

func NewReportService(
	reportRepo repository.ReportRepository,
	userRepo repository.UserRepository,
	postRepo repository.PostRepository,
	commentRepo repository.CommentRepository,
	blogRepo repository.BlogRepository,
	commentBlogRepo repository.CommentBlogRepository,
	db *sql.DB,
) ReportService {
	return &reportServiceImpl{
		reportRepository:      reportRepo,
		userRepository:        userRepo,
		postRepository:        postRepo,
		commentRepository:     commentRepo,
		blogRepository:        blogRepo,
		commentBlogRepository: commentBlogRepo,
		db:                    db,
	}
}

func (s *reportServiceImpl) Create(request web.CreateReportRequest) (web.ReportResponse, error) {
	if !isValidReason(request.Reason) {
		return web.ReportResponse{}, errors.New("invalid report reason")
	}

	if strings.ToLower(request.Reason) == "other" && strings.TrimSpace(request.OtherReason) == "" {
		return web.ReportResponse{}, errors.New("other reason must be provided")
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
	default:
		return web.ReportResponse{}, errors.New("unrecognized content type")
	}

	if err != nil {
		return web.ReportResponse{}, fmt.Errorf("%s The reported content was not found", request.TargetType)
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
		Status:     result.Status,
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
