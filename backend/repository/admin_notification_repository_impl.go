package repository

import (
    "context"
    "database/sql"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/domain"
    "fmt"
    "strings"
    "time"
    "github.com/google/uuid"
)

type AdminNotificationRepositoryImpl struct{}

func NewAdminNotificationRepository() AdminNotificationRepository {
    return &AdminNotificationRepositoryImpl{}
}

func (repository *AdminNotificationRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, notification domain.AdminNotification) domain.AdminNotification {
    id := uuid.New()
    now := time.Now()

    query := `
        INSERT INTO notifications (
            id, user_id, category, type, title, message, status, reference_id, reference_type, actor_id, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING id, created_at, updated_at
    `

    err := tx.QueryRowContext(
        ctx,
        query,
        id,
        nil, // user_id null untuk admin notifications
        notification.Category,
        notification.Type,
        notification.Title,
        notification.Message,
        notification.Status,
        notification.ReferenceId,
        notification.ReferenceType,
        notification.ActorId,
        now,
        now,
    ).Scan(&notification.Id, &notification.CreatedAt, &notification.UpdatedAt)

    helper.PanicIfError(err)
    return notification
}

func (repository *AdminNotificationRepositoryImpl) FindAll(ctx context.Context, tx *sql.Tx, category string, limit, offset int) []domain.AdminNotification {
    var query string
    var args []interface{}
    
    if category != "" {
        query = `
            SELECT id, user_id, category, type, title, message, status, reference_id, reference_type, actor_id, created_at, updated_at
            FROM notifications 
            WHERE user_id IS NULL AND category = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `
        args = []interface{}{category, limit, offset}
    } else {
        query = `
            SELECT id, user_id, category, type, title, message, status, reference_id, reference_type, actor_id, created_at, updated_at
            FROM notifications 
            WHERE user_id IS NULL
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `
        args = []interface{}{limit, offset}
    }

    rows, err := tx.QueryContext(ctx, query, args...)
    helper.PanicIfError(err)
    defer rows.Close()

    var notifications []domain.AdminNotification
    for rows.Next() {
        var notification domain.AdminNotification
        var referenceId, actorId sql.NullString
        var referenceType sql.NullString

        err := rows.Scan(
            &notification.Id,
            &notification.UserId,
            &notification.Category,
            &notification.Type,
            &notification.Title,
            &notification.Message,
            &notification.Status,
            &referenceId,
            &referenceType,
            &actorId,
            &notification.CreatedAt,
            &notification.UpdatedAt,
        )
        helper.PanicIfError(err)

        if referenceId.Valid {
            refId, _ := uuid.Parse(referenceId.String)
            notification.ReferenceId = &refId
        }
        
        if referenceType.Valid {
            notification.ReferenceType = &referenceType.String
        }
        
        if actorId.Valid {
            aId, err := uuid.Parse(actorId.String)
            if err == nil {
                notification.ActorId = &aId
            }
        }

        notifications = append(notifications, notification)
    }

    return notifications
}

func (repository *AdminNotificationRepositoryImpl) CountAll(ctx context.Context, tx *sql.Tx, category string) int {
    var query string
    var args []interface{}
    
    if category != "" {
        query = `SELECT COUNT(*) FROM notifications WHERE user_id IS NULL AND category = $1`
        args = []interface{}{category}
    } else {
        query = `SELECT COUNT(*) FROM notifications WHERE user_id IS NULL`
        args = []interface{}{}
    }

    var count int
    err := tx.QueryRowContext(ctx, query, args...).Scan(&count)
    helper.PanicIfError(err)

    return count
}

func (repository *AdminNotificationRepositoryImpl) CountUnread(ctx context.Context, tx *sql.Tx, category string) int {
    var query string
    var args []interface{}
    
    if category != "" {
        query = `SELECT COUNT(*) FROM notifications WHERE user_id IS NULL AND status = 'unread' AND category = $1`
        args = []interface{}{category}
    } else {
        query = `SELECT COUNT(*) FROM notifications WHERE user_id IS NULL AND status = 'unread'`
        args = []interface{}{}
    }

    var count int
    err := tx.QueryRowContext(ctx, query, args...).Scan(&count)
    helper.PanicIfError(err)

    return count
}

func (repository *AdminNotificationRepositoryImpl) MarkAsRead(ctx context.Context, tx *sql.Tx, notificationIds []uuid.UUID) int {
    if len(notificationIds) == 0 {
        return 0
    }

    placeholders := make([]string, len(notificationIds))
    args := make([]interface{}, len(notificationIds))

    for i, id := range notificationIds {
        placeholders[i] = fmt.Sprintf("$%d", i+1)
        args[i] = id
    }

    query := fmt.Sprintf(`
        UPDATE notifications 
        SET status = 'read', updated_at = NOW() 
        WHERE user_id IS NULL AND id IN (%s)
    `, strings.Join(placeholders, ", "))

    result, err := tx.ExecContext(ctx, query, args...)
    helper.PanicIfError(err)
    
    rowsAffected, err := result.RowsAffected()
    helper.PanicIfError(err)
    
    return int(rowsAffected)
}

func (repository *AdminNotificationRepositoryImpl) MarkAllAsRead(ctx context.Context, tx *sql.Tx, category string) int {
    var query string
    var args []interface{}
    
    if category != "" {
        query = `
            UPDATE notifications 
            SET status = 'read', updated_at = NOW() 
            WHERE user_id IS NULL AND status = 'unread' AND category = $1
        `
        args = []interface{}{category}
    } else {
        query = `
            UPDATE notifications 
            SET status = 'read', updated_at = NOW() 
            WHERE user_id IS NULL AND status = 'unread'
        `
        args = []interface{}{}
    }

    result, err := tx.ExecContext(ctx, query, args...)
    helper.PanicIfError(err)
    
    rowsAffected, err := result.RowsAffected()
    helper.PanicIfError(err)
    
    return int(rowsAffected)
}

func (repository *AdminNotificationRepositoryImpl) DeleteByCategory(ctx context.Context, tx *sql.Tx, category string) int {
    var query string
    var args []interface{}
    
    if category == "" {
        query = "DELETE FROM notifications WHERE user_id IS NULL"
        args = []interface{}{}
    } else {
        query = "DELETE FROM notifications WHERE user_id IS NULL AND category = $1"
        args = []interface{}{category}
    }
    
    result, err := tx.ExecContext(ctx, query, args...)
    helper.PanicIfError(err)
    
    rowsAffected, err := result.RowsAffected()
    helper.PanicIfError(err)
    
    return int(rowsAffected)
}