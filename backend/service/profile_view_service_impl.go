package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"github.com/google/uuid"
	"time"
)

type ProfileViewServiceImpl struct {
	DB                    *sql.DB
	ProfileViewRepository repository.ProfileViewRepository
	UserRepository        repository.UserRepository
	NotificationService   NotificationService
}

func NewProfileViewService(db *sql.DB, profileViewRepository repository.ProfileViewRepository, userRepository repository.UserRepository, notificationService NotificationService) ProfileViewService {
	return &ProfileViewServiceImpl{
		DB:                    db,
		ProfileViewRepository: profileViewRepository,
		UserRepository:        userRepository,
		NotificationService:   notificationService,
	}
}
func (service *ProfileViewServiceImpl) RecordView(ctx context.Context, profileUserId uuid.UUID, viewerId uuid.UUID) error {
	// Don't record if user views their own profile
	if profileUserId == viewerId {
		return nil
	}

	tx, err := service.DB.Begin()
	if err != nil {
		return err
	}
	defer helper.CommitOrRollback(tx)

	// Check if this user has already viewed the profile recently (e.g., in the last 24 hours)
	hasViewedRecently := service.ProfileViewRepository.HasViewedRecently(ctx, tx, profileUserId, viewerId, 24*time.Hour)
	if hasViewedRecently {
		// User already viewed this profile recently, don't create a new notification
		return nil
	}

	// Record new view
	view := domain.ProfileView{
		Id:            uuid.New(),
		ProfileUserId: profileUserId,
		ViewerId:      viewerId,
		ViewedAt:      time.Now(),
	}

	service.ProfileViewRepository.Save(ctx, tx, view)

	// Ambil data viewer terlebih dahulu
	viewer, err := service.UserRepository.FindById(ctx, tx, viewerId)
	if err == nil && service.NotificationService != nil {
		// Simpan data yang diperlukan
		viewerName := viewer.Name

		// Send notification to profile owner
		refType := "profile_visit"
		service.NotificationService.Create(
			ctx, // Gunakan context yang sama
			profileUserId,
			string(domain.NotificationCategoryProfile),
			string(domain.NotificationTypeProfileVisit),
			"Profile Visit",
			fmt.Sprintf("%s viewed your profile", viewerName),
			nil,
			&refType,
			&viewerId,
		)
	}

	return nil
}

func (service *ProfileViewServiceImpl) GetViewsThisWeek(ctx context.Context, userId uuid.UUID) web.ProfileViewsResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Calculate start of week (Monday as start of week)
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7 // Convert Sunday (0) to 7
	}
	startOfWeek := now.AddDate(0, 0, -(weekday - 1))
	startOfWeek = time.Date(startOfWeek.Year(), startOfWeek.Month(), startOfWeek.Day(), 0, 0, 0, 0, startOfWeek.Location())

	endOfWeek := startOfWeek.AddDate(0, 0, 7)

	views := service.ProfileViewRepository.FindByProfileUserId(ctx, tx, userId, startOfWeek, endOfWeek)
	count := service.ProfileViewRepository.CountByProfileUserId(ctx, tx, userId, startOfWeek, endOfWeek)

	// Map to response format
	viewerResponses := make([]web.ProfileViewerResponse, 0, len(views))
	for _, view := range views {
		viewerResponses = append(viewerResponses, web.ProfileViewerResponse{
			Id:          view.ViewerId,
			Name:        view.Viewer.Name,
			Username:    view.Viewer.Username,
			Photo:       view.Viewer.Photo,
			Headline:    view.Viewer.Headline,
			IsConnected: view.Viewer.IsConnected,
			ViewedAt:    view.ViewedAt,
		})
	}

	return web.ProfileViewsResponse{
		Count:       count,
		Viewers:     viewerResponses,
		PeriodStart: startOfWeek,
		PeriodEnd:   endOfWeek,
	}
}

func (service *ProfileViewServiceImpl) GetViewsLastWeek(ctx context.Context, userId uuid.UUID) web.ProfileViewsResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Calculate start of last week
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7 // Convert Sunday (0) to 7
	}
	startOfWeek := now.AddDate(0, 0, -(weekday - 1))
	startOfWeek = time.Date(startOfWeek.Year(), startOfWeek.Month(), startOfWeek.Day(), 0, 0, 0, 0, startOfWeek.Location())

	startOfLastWeek := startOfWeek.AddDate(0, 0, -7)
	endOfLastWeek := startOfWeek

	views := service.ProfileViewRepository.FindByProfileUserId(ctx, tx, userId, startOfLastWeek, endOfLastWeek)
	count := service.ProfileViewRepository.CountByProfileUserId(ctx, tx, userId, startOfLastWeek, endOfLastWeek)

	// Map to response format
	viewerResponses := make([]web.ProfileViewerResponse, 0, len(views))
	for _, view := range views {
		viewerResponses = append(viewerResponses, web.ProfileViewerResponse{
			Id:          view.ViewerId,
			Name:        view.Viewer.Name,
			Username:    view.Viewer.Username,
			Photo:       view.Viewer.Photo,
			Headline:    view.Viewer.Headline,
			IsConnected: view.Viewer.IsConnected,
			ViewedAt:    view.ViewedAt,
		})
	}

	return web.ProfileViewsResponse{
		Count:       count,
		Viewers:     viewerResponses,
		PeriodStart: startOfLastWeek,
		PeriodEnd:   endOfLastWeek,
	}
}
