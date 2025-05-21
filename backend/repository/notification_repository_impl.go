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

type NotificationRepositoryImpl struct {
}

func NewNotificationRepository() NotificationRepository {
	return &NotificationRepositoryImpl{}
}

func (repository *NotificationRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, notification domain.Notification) domain.Notification {
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
		notification.UserId,
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

func (repository *NotificationRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Notification, error) {
	query := `
		SELECT 
			n.id, n.user_id, n.category, n.type, n.title, n.message, n.status, n.reference_id, n.reference_type, n.actor_id, n.created_at, n.updated_at,
			u.id, u.name, u.username, u.email, u.headline, u.photo
		FROM notifications n
		LEFT JOIN users u ON n.actor_id = u.id
		WHERE n.id = $1
	`

	var notification domain.Notification
	var user domain.User
	var headline, photo sql.NullString
	var referenceId, actorId sql.NullString
	var referenceType sql.NullString

	err := tx.QueryRowContext(ctx, query, id).Scan(
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
		&user.Id,
		&user.Name,
		&user.Username,
		&user.Email,
		&headline,
		&photo,
	)

	if err != nil {
		return notification, err
	}

	if referenceId.Valid {
		refId, _ := uuid.Parse(referenceId.String)
		notification.ReferenceId = &refId
	}
	
	if referenceType.Valid {
		notification.ReferenceType = &referenceType.String
	}
	
	if actorId.Valid {
		aId, _ := uuid.Parse(actorId.String)
		notification.ActorId = &aId
	}

	if headline.Valid {
		headlineStr := headline.String
		user.Headline = headlineStr
	}
	if photo.Valid {
		photoStr := photo.String
		user.Photo = photoStr
	}

	notification.Actor = &user

	return notification, nil
}

func (repository *NotificationRepositoryImpl) FindByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string, limit, offset int) []domain.Notification {
	var query string
	var args []interface{}
	
	if category != "" {
		query = `
			SELECT 
				n.id, n.user_id, n.category, n.type, n.title, n.message, n.status, n.reference_id, n.reference_type, n.actor_id, n.created_at, n.updated_at,
				u.id, u.name, u.username, u.email, u.headline, u.photo
			FROM notifications n
			LEFT JOIN users u ON n.actor_id = u.id
			WHERE n.user_id = $1 AND n.category = $2
			ORDER BY n.created_at DESC
			LIMIT $3 OFFSET $4
		`
		args = []interface{}{userId, category, limit, offset}
	} else {
		query = `
			SELECT 
				n.id, n.user_id, n.category, n.type, n.title, n.message, n.status, n.reference_id, n.reference_type, n.actor_id, n.created_at, n.updated_at,
				u.id, u.name, u.username, u.email, u.headline, u.photo
			FROM notifications n
			LEFT JOIN users u ON n.actor_id = u.id
			WHERE n.user_id = $1
			ORDER BY n.created_at DESC
			LIMIT $2 OFFSET $3
		`
		args = []interface{}{userId, limit, offset}
	}

	rows, err := tx.QueryContext(ctx, query, args...)
	helper.PanicIfError(err)
	defer rows.Close()

	var notifications []domain.Notification
	for rows.Next() {
		var notification domain.Notification
		var user domain.User
		var headline, photo sql.NullString
		var referenceId, actorId sql.NullString
		var referenceType sql.NullString

		var scanArgs []interface{}
		scanArgs = []interface{}{
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
			&user.Id,
			&user.Name,
			&user.Username,
			&user.Email,
			&headline,
			&photo,
		}

		err := rows.Scan(scanArgs...)
		helper.PanicIfError(err)

		if referenceId.Valid {
			refId, _ := uuid.Parse(referenceId.String)
			notification.ReferenceId = &refId
		}
		
		if referenceType.Valid {
			notification.ReferenceType = &referenceType.String
		}
		
		if actorId.Valid {
			aId, _ := uuid.Parse(actorId.String)
			notification.ActorId = &aId
		}

		if headline.Valid {
			headlineStr := headline.String
			user.Headline = headlineStr
		}
		if photo.Valid {
			photoStr := photo.String
			user.Photo = photoStr
		}

		notification.Actor = &user
		notifications = append(notifications, notification)
	}

	return notifications
}

func (repository *NotificationRepositoryImpl) CountByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int {
	var query string
	var args []interface{}
	
	if category != "" {
		query = `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND category = $2`
		args = []interface{}{userId, category}
	} else {
		query = `SELECT COUNT(*) FROM notifications WHERE user_id = $1`
		args = []interface{}{userId}
	}

	var count int
	err := tx.QueryRowContext(ctx, query, args...).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *NotificationRepositoryImpl) CountUnreadByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int {
	var query string
	var args []interface{}
	
	if category != "" {
		query = `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND status = 'unread' AND category = $2`
		args = []interface{}{userId, category}
	} else {
		query = `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND status = 'unread'`
		args = []interface{}{userId}
	}

	var count int
	err := tx.QueryRowContext(ctx, query, args...).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *NotificationRepositoryImpl) MarkAsRead(ctx context.Context, tx *sql.Tx, userId uuid.UUID, notificationIds []uuid.UUID) int {
	if len(notificationIds) == 0 {
		return 0
	}

	placeholders := make([]string, len(notificationIds))
	args := make([]interface{}, len(notificationIds)+1)
	args[0] = userId

	for i, id := range notificationIds {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args[i+1] = id
	}

	query := fmt.Sprintf(`
		UPDATE notifications 
		SET status = 'read', updated_at = NOW() 
		WHERE user_id = $1 AND id IN (%s)
	`, strings.Join(placeholders, ", "))

	result, err := tx.ExecContext(ctx, query, args...)
	helper.PanicIfError(err)
	
	rowsAffected, err := result.RowsAffected()
	helper.PanicIfError(err)
	
	return int(rowsAffected)
}

func (repository *NotificationRepositoryImpl) MarkAllAsRead(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int {
	var query string
	var args []interface{}
	
	if category != "" {
		query = `
			UPDATE notifications 
			SET status = 'read', updated_at = NOW() 
			WHERE user_id = $1 AND status = 'unread' AND category = $2
		`
		args = []interface{}{userId, category}
	} else {
		query = `
			UPDATE notifications 
			SET status = 'read', updated_at = NOW() 
			WHERE user_id = $1 AND status = 'unread'
		`
		args = []interface{}{userId}
	}

	result, err := tx.ExecContext(ctx, query, args...)
	helper.PanicIfError(err)
	
	rowsAffected, err := result.RowsAffected()
	helper.PanicIfError(err)
	
	return int(rowsAffected)
}

func (repository *NotificationRepositoryImpl) DeleteByUserIdAndCategory(ctx context.Context, tx *sql.Tx, userId uuid.UUID, category string) int {
	var query string
	var args []interface{}
	
	if category == "" {
		// Hapus semua notifikasi pengguna jika kategori tidak ditentukan
		query = "DELETE FROM notifications WHERE user_id = $1"
		args = []interface{}{userId}
	} else {
		// Hapus notifikasi berdasarkan kategori
		query = "DELETE FROM notifications WHERE user_id = $1 AND category = $2"
		args = []interface{}{userId, category}
	}
	
	result, err := tx.ExecContext(ctx, query, args...)
	helper.PanicIfError(err)
	
	rowsAffected, err := result.RowsAffected()
	helper.PanicIfError(err)
	
	return int(rowsAffected)
}

func (repository *NotificationRepositoryImpl) DeleteSelectedByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, notificationIds []uuid.UUID, category string) int {
	// Buat placeholder untuk query IN
	placeholders := make([]string, len(notificationIds))
	args := make([]interface{}, len(notificationIds)+1)
	args[0] = userId
	
	for i := 0; i < len(notificationIds); i++ {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args[i+1] = notificationIds[i]
	}
	
	// Buat query dasar
	var query string
	if category == "" {
		// Tanpa filter kategori
		query = fmt.Sprintf("DELETE FROM notifications WHERE user_id = $1 AND id IN (%s)", strings.Join(placeholders, ", "))
	} else {
		// Dengan filter kategori
		query = fmt.Sprintf("DELETE FROM notifications WHERE user_id = $1 AND id IN (%s) AND category = $%d", 
			strings.Join(placeholders, ", "), len(notificationIds)+2)
		args = append(args, category)
	}
	
	result, err := tx.ExecContext(ctx, query, args...)
	helper.PanicIfError(err)
	
	rowsAffected, err := result.RowsAffected()
	helper.PanicIfError(err)
	
	return int(rowsAffected)
}

func (repository *NotificationRepositoryImpl) DeleteSelected(ctx context.Context, tx *sql.Tx, userId uuid.UUID, notificationIds []uuid.UUID) (int64, error) {
    if len(notificationIds) == 0 {
        return 0, nil
    }
    
    // Buat placeholder untuk query IN
    placeholders := make([]string, len(notificationIds))
    args := make([]interface{}, len(notificationIds)+1)
    args[0] = userId
    
    for i, id := range notificationIds {
        placeholders[i] = fmt.Sprintf("$%d", i+2)
        args[i+1] = id
    }
    
    // Buat query dengan placeholder
    query := fmt.Sprintf(
        "DELETE FROM notifications WHERE user_id = $1 AND id IN (%s)",
        strings.Join(placeholders, ","),
    )
    
    // Eksekusi query
    result, err := tx.ExecContext(ctx, query, args...)
    if err != nil {
        return 0, err
    }
    
    // Dapatkan jumlah baris yang dihapus
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return 0, err
    }
    
    return rowsAffected, nil
}
