package repository

import (
	"context"
	"database/sql"
	"errors"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"sort"
	"time"

	"github.com/google/uuid"
)

type ConnectionRepositoryImpl struct {
}

func NewConnectionRepository() ConnectionRepository {
	return &ConnectionRepositoryImpl{}
}

func (repository *ConnectionRepositoryImpl) SaveConnectionRequest(ctx context.Context, tx *sql.Tx, request domain.ConnectionRequest) domain.ConnectionRequest {
	id := uuid.New()
	now := time.Now()

	request.Id = id
	request.Status = domain.ConnectionStatusPending
	request.CreatedAt = now
	request.UpdatedAt = now

	SQL := `INSERT INTO connection_requests (id, sender_id, receiver_id, message, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := tx.ExecContext(
		ctx, SQL,
		request.Id, request.SenderId, request.ReceiverId, request.Message,
		request.Status, request.CreatedAt, request.UpdatedAt,
	)
	helper.PanicIfError(err)

	return request
}

func (repository *ConnectionRepositoryImpl) UpdateConnectionRequest(ctx context.Context, tx *sql.Tx, request domain.ConnectionRequest) domain.ConnectionRequest {
	now := time.Now()
	request.UpdatedAt = now

	SQL := `UPDATE connection_requests 
            SET status = $1, updated_at = $2
            WHERE id = $3`

	_, err := tx.ExecContext(
		ctx, SQL,
		request.Status, request.UpdatedAt, request.Id,
	)
	helper.PanicIfError(err)

	return request
}

func (repository *ConnectionRepositoryImpl) FindConnectionRequestById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.ConnectionRequest, error) {
	SQL := `SELECT cr.id, cr.sender_id, cr.receiver_id, cr.message, cr.status, cr.created_at, cr.updated_at,
               s.id AS s_id, s.name AS s_name, s.username AS s_username, s.headline AS s_headline, s.photo AS s_photo,
               r.id AS r_id, r.name AS r_name, r.username AS r_username, r.headline AS r_headline, r.photo AS r_photo
            FROM connection_requests cr
            JOIN users s ON cr.sender_id = s.id
            JOIN users r ON cr.receiver_id = r.id
            WHERE cr.id = $1`

	rows, err := tx.QueryContext(ctx, SQL, id)
	helper.PanicIfError(err)
	defer rows.Close()

	var request domain.ConnectionRequest
	if rows.Next() {
		var senderHeadline, senderPhoto, receiverHeadline, receiverPhoto, message sql.NullString
		var senderId, receiverId uuid.UUID
		var senderName, senderUsername, receiverName, receiverUsername string

		err := rows.Scan(
			&request.Id, &senderId, &receiverId, &message, &request.Status, &request.CreatedAt, &request.UpdatedAt,
			&senderId, &senderName, &senderUsername, &senderHeadline, &senderPhoto,
			&receiverId, &receiverName, &receiverUsername, &receiverHeadline, &receiverPhoto,
		)
		helper.PanicIfError(err)

		// Create sender with required fields
		sender := &domain.User{
			Id:       senderId,
			Name:     senderName,
			Username: senderUsername,
		}

		// Set optional fields if they exist
		if senderHeadline.Valid {
			sender.Headline = senderHeadline.String // Direct assignment instead of pointer
		}

		if senderPhoto.Valid {
			sender.Photo = senderPhoto.String // Direct assignment instead of pointer
		}

		// Create receiver with required fields
		receiver := &domain.User{
			Id:       receiverId,
			Name:     receiverName,
			Username: receiverUsername,
		}

		// Set optional fields if they exist
		if receiverHeadline.Valid {
			receiver.Headline = receiverHeadline.String // Direct assignment instead of pointer
		}

		if receiverPhoto.Valid {
			receiver.Photo = receiverPhoto.String // Direct assignment instead of pointer
		}

		// Set sender and receiver
		request.SenderId = senderId
		request.ReceiverId = receiverId
		request.Sender = sender
		request.Receiver = receiver

		// Set message if it exists - message is a pointer field in ConnectionRequest
		if message.Valid {
			messageStr := message.String
			request.Message = &messageStr
		}

		return request, nil
	} else {
		return domain.ConnectionRequest{}, errors.New("connection request not found")
	}
}

func (repository *ConnectionRepositoryImpl) FindConnectionRequestsByReceiverId(ctx context.Context, tx *sql.Tx, receiverId uuid.UUID, limit, offset int) ([]domain.ConnectionRequest, int) {
	// First get the count
	countSQL := `SELECT COUNT(*) FROM connection_requests WHERE receiver_id = $1 AND status = 'pending'`
	var count int
	err := tx.QueryRowContext(ctx, countSQL, receiverId).Scan(&count)
	helper.PanicIfError(err)

	if count == 0 {
		return []domain.ConnectionRequest{}, 0
	}

	// Get the connection requests
	SQL := `SELECT cr.id, cr.sender_id, cr.receiver_id, cr.message, cr.status, cr.created_at, cr.updated_at,
               s.id AS s_id, s.name AS s_name, s.username AS s_username, s.headline AS s_headline, s.photo AS s_photo
           FROM connection_requests cr
           JOIN users s ON cr.sender_id = s.id
           WHERE cr.receiver_id = $1 AND cr.status = 'pending'
           ORDER BY cr.created_at DESC
           LIMIT $2 OFFSET $3`

	rows, err := tx.QueryContext(ctx, SQL, receiverId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var requests []domain.ConnectionRequest
	for rows.Next() {
		var request domain.ConnectionRequest
		var senderHeadline, senderPhoto, message sql.NullString
		var senderId uuid.UUID
		var senderName, senderUsername string

		err := rows.Scan(
			&request.Id, &request.SenderId, &request.ReceiverId, &message, &request.Status, &request.CreatedAt, &request.UpdatedAt,
			&senderId, &senderName, &senderUsername, &senderHeadline, &senderPhoto,
		)
		helper.PanicIfError(err)

		// Create sender with required fields
		sender := &domain.User{
			Id:       senderId,
			Name:     senderName,
			Username: senderUsername,
		}

		// Set optional fields if they exist - direct assignment for string fields
		if senderHeadline.Valid {
			sender.Headline = senderHeadline.String
		}

		if senderPhoto.Valid {
			sender.Photo = senderPhoto.String
		}

		// Set sender
		request.Sender = sender

		// Set message if it exists - message is a pointer field
		if message.Valid {
			messageStr := message.String
			request.Message = &messageStr
		}

		requests = append(requests, request)
	}

	return requests, count
}

func (repository *ConnectionRepositoryImpl) FindConnectionRequestBySenderIdAndReceiverId(ctx context.Context, tx *sql.Tx, senderId, receiverId uuid.UUID) (domain.ConnectionRequest, error) {
	SQL := `SELECT id, sender_id, receiver_id, message, status, created_at, updated_at
            FROM connection_requests
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at DESC
            LIMIT 1`

	rows, err := tx.QueryContext(ctx, SQL, senderId, receiverId)
	helper.PanicIfError(err)
	defer rows.Close()

	var request domain.ConnectionRequest
	if rows.Next() {
		var message sql.NullString
		err := rows.Scan(
			&request.Id, &request.SenderId, &request.ReceiverId, &message, &request.Status, &request.CreatedAt, &request.UpdatedAt,
		)
		helper.PanicIfError(err)

		// Set message if it exists - message is a pointer field
		if message.Valid {
			messageStr := message.String
			request.Message = &messageStr
		}

		return request, nil
	} else {
		return domain.ConnectionRequest{}, errors.New("connection request not found")
	}
}

func (repository *ConnectionRepositoryImpl) SaveConnection(ctx context.Context, tx *sql.Tx, connection domain.Connection) domain.Connection {
	id := uuid.New()
	now := time.Now()

	connection.Id = id
	connection.CreatedAt = now

	// Ensure user IDs are consistently ordered for uniqueness
	userIds := []uuid.UUID{connection.UserId1, connection.UserId2}
	sort.Slice(userIds, func(i, j int) bool {
		return userIds[i].String() < userIds[j].String()
	})
	connection.UserId1 = userIds[0]
	connection.UserId2 = userIds[1]

	SQL := `INSERT INTO connections (id, user_id_1, user_id_2, created_at)
            VALUES ($1, $2, $3, $4)`

	_, err := tx.ExecContext(
		ctx, SQL,
		connection.Id, connection.UserId1, connection.UserId2, connection.CreatedAt,
	)
	helper.PanicIfError(err)

	return connection
}

func (repository *ConnectionRepositoryImpl) CheckConnectionExists(ctx context.Context, tx *sql.Tx, userId1, userId2 uuid.UUID) bool {
	// Ensure user IDs are consistently ordered for uniqueness
	userIds := []uuid.UUID{userId1, userId2}
	sort.Slice(userIds, func(i, j int) bool {
		return userIds[i].String() < userIds[j].String()
	})

	SQL := `SELECT EXISTS (
                SELECT 1 FROM connections 
                WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)
            )`

	var exists bool
	err := tx.QueryRowContext(ctx, SQL, userIds[0], userIds[1]).Scan(&exists)
	helper.PanicIfError(err)

	return exists
}

func (repository *ConnectionRepositoryImpl) FindConnectionsByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.Connection, int) {
	// First get the count
	countSQL := `SELECT COUNT(*) FROM connections WHERE user_id_1 = $1 OR user_id_2 = $1`
	var count int
	err := tx.QueryRowContext(ctx, countSQL, userId).Scan(&count)
	helper.PanicIfError(err)

	if count == 0 {
		return []domain.Connection{}, 0
	}

	// Get the connections with related user info
	SQL := `
        SELECT c.id, c.user_id_1, c.user_id_2, c.created_at,
               u.id AS other_user_id, u.name, u.username, u.headline, u.photo
        FROM connections c
        JOIN users u ON 
            (c.user_id_1 = $1 AND c.user_id_2 = u.id) OR 
            (c.user_id_2 = $1 AND c.user_id_1 = u.id)
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var connections []domain.Connection
	for rows.Next() {
		var connection domain.Connection
		var headline, photo sql.NullString
		var otherUserId uuid.UUID
		var otherUserName, otherUserUsername string

		err := rows.Scan(
			&connection.Id, &connection.UserId1, &connection.UserId2, &connection.CreatedAt,
			&otherUserId, &otherUserName, &otherUserUsername, &headline, &photo,
		)
		helper.PanicIfError(err)

		// Create other user with required fields
		otherUser := &domain.User{
			Id:       otherUserId,
			Name:     otherUserName,
			Username: otherUserUsername,
		}

		// Set optional fields if they exist - direct assignment for string fields
		if headline.Valid {
			otherUser.Headline = headline.String
		}

		if photo.Valid {
			otherUser.Photo = photo.String
		}

		// Determine which user field to populate
		if connection.UserId1 == userId {
			connection.User2 = otherUser
		} else {
			connection.User1 = otherUser
		}

		connections = append(connections, connection)
	}

	return connections, count
}

func (repository *ConnectionRepositoryImpl) IsConnected(ctx context.Context, tx *sql.Tx, currentUserId, userId uuid.UUID) bool {
	// Ensure user IDs are consistently ordered for uniqueness
	userIds := []uuid.UUID{currentUserId, userId}
	sort.Slice(userIds, func(i, j int) bool {
		return userIds[i].String() < userIds[j].String()
	})

	SQL := `SELECT EXISTS (
				SELECT 1 FROM connections 
				WHERE (user_id_1 = $1 AND user_id_2 = $2)
			)`

	var exists bool
	err := tx.QueryRowContext(ctx, SQL, userIds[0], userIds[1]).Scan(&exists)
	helper.PanicIfError(err)

	return exists
}

func (repository *ConnectionRepositoryImpl) UpdateRequest(ctx context.Context, tx *sql.Tx, request domain.ConnectionRequest) domain.ConnectionRequest {
	SQL := `
        UPDATE connection_requests
        SET status = $1, updated_at = $2
        WHERE id = $3
        RETURNING id, sender_id, receiver_id, status, created_at, updated_at
    `
	row := tx.QueryRowContext(ctx, SQL, request.Status, time.Now(), request.Id)

	var updatedRequest domain.ConnectionRequest
	err := row.Scan(
		&updatedRequest.Id,
		&updatedRequest.SenderId,
		&updatedRequest.ReceiverId,
		&updatedRequest.Status,
		&updatedRequest.CreatedAt,
		&updatedRequest.UpdatedAt,
	)
	helper.PanicIfError(err)

	return updatedRequest
}

func (repository *ConnectionRepositoryImpl) FindRequest(ctx context.Context, tx *sql.Tx, senderId, receiverId uuid.UUID) (domain.ConnectionRequest, error) {
	SQL := `
        SELECT id, sender_id, receiver_id, status, created_at, updated_at
        FROM connection_requests
        WHERE sender_id = $1 AND receiver_id = $2
    `
	row := tx.QueryRowContext(ctx, SQL, senderId, receiverId)

	var request domain.ConnectionRequest
	err := row.Scan(
		&request.Id,
		&request.SenderId,
		&request.ReceiverId,
		&request.Status,
		&request.CreatedAt,
		&request.UpdatedAt,
	)
	if err != nil {
		return request, err
	}

	return request, nil
}

func (repository *ConnectionRepositoryImpl) Disconnect(ctx context.Context, tx *sql.Tx, userId1, userId2 uuid.UUID) error {
	// Delete connection in both directions to ensure complete disconnection
	SQL := `DELETE FROM connections WHERE 
            (user_id_1 = $1 AND user_id_2 = $2) OR 
            (user_id_2 = $2 AND user_id_1 = $1)`

	_, err := tx.ExecContext(ctx, SQL, userId1, userId2)
	return err
}
