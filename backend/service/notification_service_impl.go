package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"evoconnect/backend/utils"
	"fmt"
	"math/rand"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type NotificationServiceImpl struct {
	NotificationRepository repository.NotificationRepository
	UserRepository         repository.UserRepository
	DB                     *sql.DB
	Validate               *validator.Validate
}

func NewNotificationService(
	notificationRepository repository.NotificationRepository,
	userRepository repository.UserRepository,
	DB *sql.DB,
	validate *validator.Validate,
) NotificationService {
	return &NotificationServiceImpl{
		NotificationRepository: notificationRepository,
		UserRepository:         userRepository,
		DB:                     DB,
		Validate:               validate,
	}
}

func (service *NotificationServiceImpl) Create(
	ctx context.Context,
	userId uuid.UUID,
	category string,
	notificationType string,
	title string,
	message string,
	referenceId *uuid.UUID,
	referenceType *string,
	actorId *uuid.UUID,
) uuid.UUID {
	fmt.Printf("Creating notification: userId=%s, category=%s, type=%s\n", 
		userId, category, notificationType)
		
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// For post notifications from followed users, limit to random 5 if there are many
	if category == string(domain.NotificationCategoryPost) && notificationType == string(domain.NotificationTypePostNew) {
		// Check if we should send this notification (random selection for followed users)
		if rand.Intn(100) > 20 { // 20% chance to send notification
			// Create a dummy response without actually saving
			return uuid.New()
		}
	}

	notification := domain.Notification{
		Id:            uuid.New(),
		UserId:        userId,
		Category:      domain.NotificationCategory(category),
		Type:          domain.NotificationType(notificationType),
		Title:         title,
		Message:       message,
		Status:        domain.NotificationStatusUnread,
		ReferenceId:   referenceId,
		ReferenceType: referenceType,
		ActorId:       actorId,
	}

	notification = service.NotificationRepository.Save(ctx, tx, notification)
	fmt.Printf("Notification saved with ID: %s\n", notification.Id)

	// Get actor details if actorId is provided
	if actorId != nil {
		actor, err := service.UserRepository.FindById(ctx, tx, *actorId)
		if err == nil {
			notification.Actor = &actor
		}
	}

	// Trigger Pusher event
	notificationResponse := service.toNotificationResponse(notification)
	channelName := fmt.Sprintf("private-user-%s", userId)
	fmt.Printf("Triggering Pusher: channel=%s, event=new-notification\n", channelName)
	
	go func() {
		err := utils.PusherClient.Trigger(channelName, "new-notification", notificationResponse)
		if err != nil {
			fmt.Printf("Error triggering Pusher: %v\n", err)
		} else {
			fmt.Printf("Successfully triggered Pusher notification\n")
		}
	}()

	return notification.Id
}

func (service *NotificationServiceImpl) GetNotifications(ctx context.Context, userId uuid.UUID, category string, limit, offset int) web.NotificationListResponse {
    fmt.Printf("Getting notifications for user: %s, category: %s, limit: %d, offset: %d\n", 
        userId, category, limit, offset)
        
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Gunakan kategori untuk memfilter notifikasi
    notifications := service.NotificationRepository.FindByUserId(ctx, tx, userId, category, limit, offset)
    total := service.NotificationRepository.CountByUserId(ctx, tx, userId, category)
    unreadCount := service.NotificationRepository.CountUnreadByUserId(ctx, tx, userId, category)

    fmt.Printf("Found %d notifications, total: %d, unread: %d\n", 
        len(notifications), total, unreadCount)

    var notificationResponses []web.NotificationResponse
    for _, notification := range notifications {
        notificationResponses = append(notificationResponses, service.toNotificationResponse(notification))
    }

    return web.NotificationListResponse{
        Notifications: notificationResponses,
        Total:         total,
        UnreadCount:   unreadCount,
    }
}

func (service *NotificationServiceImpl) MarkAsRead(ctx context.Context, userId uuid.UUID, request web.MarkNotificationReadRequest) int {
	fmt.Printf("Marking notifications as read for user: %s, count: %d\n", 
		userId, len(request.NotificationIds))
		
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Panggil repository untuk menandai notifikasi sebagai dibaca
	service.NotificationRepository.MarkAsRead(ctx, tx, userId, request.NotificationIds)

	unreadCount := service.NotificationRepository.CountUnreadByUserId(ctx, tx, userId, "")
	fmt.Printf("Remaining unread notifications: %d\n", unreadCount)

	// Trigger Pusher event to update unread count
	channelName := fmt.Sprintf("private-user-%s", userId)
	fmt.Printf("Triggering Pusher: channel=%s, event=notifications-read\n", channelName)
	
	go func() {
		err := utils.PusherClient.Trigger(channelName, "notifications-read", map[string]interface{}{
			"unread_count": unreadCount,
		})
		if err != nil {
			fmt.Printf("Error triggering Pusher: %v\n", err)
		} else {
			fmt.Printf("Successfully triggered Pusher notification\n")
		}
	}()

	return unreadCount
}

func (service *NotificationServiceImpl) MarkAllAsRead(ctx context.Context, userId uuid.UUID, category string) int {
    fmt.Printf("Marking all notifications as read for user: %s, category: %s\n", 
        userId, category)
        
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Gunakan kategori untuk memfilter notifikasi yang akan ditandai sebagai dibaca
    service.NotificationRepository.MarkAllAsRead(ctx, tx, userId, category)

    // Hitung jumlah notifikasi yang belum dibaca (semua kategori)
    unreadCount := service.NotificationRepository.CountUnreadByUserId(ctx, tx, userId, "")
    fmt.Printf("Remaining unread notifications: %d\n", unreadCount)

    // Trigger Pusher event to update unread count
    channelName := fmt.Sprintf("private-user-%s", userId)
    fmt.Printf("Triggering Pusher: channel=%s, event=notifications-read\n", channelName)
    
    go func() {
        err := utils.PusherClient.Trigger(channelName, "notifications-read", map[string]interface{}{
            "unread_count": unreadCount,
        })
        if err != nil {
            fmt.Printf("Error triggering Pusher: %v\n", err)
        } else {
            fmt.Printf("Successfully triggered Pusher notification\n")
        }
    }()

    return unreadCount
}

func (service *NotificationServiceImpl) DeleteNotifications(ctx context.Context, userId uuid.UUID, category string) int {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)
	
	// Hapus notifikasi berdasarkan kategori
	deletedCount := service.NotificationRepository.DeleteByUserIdAndCategory(ctx, tx, userId, category)
	
	return deletedCount
}

func (service *NotificationServiceImpl) DeleteSelectedNotifications(ctx context.Context, userId uuid.UUID, notificationIds []uuid.UUID, category string) int {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)
	
	// Hapus notifikasi yang dipilih dengan filter kategori jika ada
	deletedCount := service.NotificationRepository.DeleteSelectedByUserId(ctx, tx, userId, notificationIds, category)
	
	return deletedCount
}

func (service *NotificationServiceImpl) toNotificationResponse(notification domain.Notification) web.NotificationResponse {
	response := web.NotificationResponse{
		Id:           notification.Id,
		Category:     string(notification.Category),
		Type:         string(notification.Type),
		Title:        notification.Title,
		Message:      notification.Message,
		Status:       string(notification.Status),
		ReferenceId:  notification.ReferenceId,
		ReferenceType: notification.ReferenceType,
		CreatedAt:    notification.CreatedAt,
		UpdatedAt:    notification.UpdatedAt,
	}

	if notification.Actor != nil {
		response.Actor = &web.UserShort{
			Id:       notification.Actor.Id,
			Name:     notification.Actor.Name,
			Username: notification.Actor.Username,
			Headline: &notification.Actor.Headline,
			Photo:    &notification.Actor.Photo,
		}
	}

	return response
}
