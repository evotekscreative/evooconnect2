package service

import (
    "context"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/domain"
    "evoconnect/backend/model/web"
    "evoconnect/backend/repository"
    "github.com/google/uuid"
    "database/sql"
)

type AdminNotificationServiceImpl struct {
    AdminNotificationRepository repository.AdminNotificationRepository
    DB                         *sql.DB
}

func NewAdminNotificationService(
    adminNotificationRepository repository.AdminNotificationRepository,
    DB *sql.DB,
) AdminNotificationService {
    return &AdminNotificationServiceImpl{
        AdminNotificationRepository: adminNotificationRepository,
        DB:                         DB,
    }
}

func (service *AdminNotificationServiceImpl) Create(
    ctx context.Context,
    category string,
    notificationType string,
    title string,
    message string,
    referenceId *uuid.UUID,
    referenceType *string,
) uuid.UUID {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    notification := domain.AdminNotification{
        Id:            uuid.New(),
        Category:      category,
        Type:          notificationType,
        Title:         title,
        Message:       message,
        Status:        "unread",
        ReferenceId:   referenceId,
        ReferenceType: referenceType,
    }

    notification = service.AdminNotificationRepository.Save(ctx, tx, notification)
    return notification.Id
}

func (service *AdminNotificationServiceImpl) GetNotifications(ctx context.Context, category string, limit, offset int) web.NotificationListResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    notifications := service.AdminNotificationRepository.FindAll(ctx, tx, category, limit, offset)
    total := service.AdminNotificationRepository.CountAll(ctx, tx, category)
    unreadCount := service.AdminNotificationRepository.CountUnread(ctx, tx, category)

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

func (service *AdminNotificationServiceImpl) MarkAsRead(ctx context.Context, request web.MarkNotificationReadRequest) int {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    service.AdminNotificationRepository.MarkAsRead(ctx, tx, request.NotificationIds)
    unreadCount := service.AdminNotificationRepository.CountUnread(ctx, tx, "")

    return unreadCount
}

func (service *AdminNotificationServiceImpl) MarkAllAsRead(ctx context.Context, category string) int {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    service.AdminNotificationRepository.MarkAllAsRead(ctx, tx, category)
    unreadCount := service.AdminNotificationRepository.CountUnread(ctx, tx, "")

    return unreadCount
}

func (service *AdminNotificationServiceImpl) DeleteNotifications(ctx context.Context, category string) int {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    deletedCount := service.AdminNotificationRepository.DeleteByCategory(ctx, tx, category)
    return deletedCount
}

func (service *AdminNotificationServiceImpl) toNotificationResponse(notification domain.AdminNotification) web.NotificationResponse {
    return web.NotificationResponse{
        Id:           notification.Id,
        Category:     notification.Category,
        Type:         notification.Type,
        Title:        notification.Title,
        Message:      notification.Message,
        Status:       notification.Status,
        ReferenceId:  notification.ReferenceId,
        ReferenceType: notification.ReferenceType,
        CreatedAt:    notification.CreatedAt,
        UpdatedAt:    notification.UpdatedAt,
        Actor:        nil,
    }
}
