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

type ChatRepositoryImpl struct {
}

func NewChatRepository() ChatRepository {
	return &ChatRepositoryImpl{}
}

// Conversation operations
func (repository *ChatRepositoryImpl) CreateConversation(ctx context.Context, tx *sql.Tx, conversation domain.Conversation) domain.Conversation {
	if conversation.Id == uuid.Nil {
		conversation.Id = uuid.New()
	}

	now := time.Now()
	conversation.CreatedAt = now
	conversation.UpdatedAt = now

	// fmt.Println("Creating conversation with ID:", conversation.Id)
	SQL := `INSERT INTO conversations (id, created_at, updated_at) VALUES ($1, $2, $3)`
	_, err := tx.ExecContext(ctx, SQL, conversation.Id, conversation.CreatedAt, conversation.UpdatedAt)
	helper.PanicIfError(err)
	// fmt.Println("Conversation created successfully with ID:", conversation.Id)

	return conversation
}

func (repository *ChatRepositoryImpl) AddParticipant(ctx context.Context, tx *sql.Tx, participant domain.ConversationParticipant) (domain.ConversationParticipant, error) {
	SQL := `INSERT INTO conversation_participants (conversation_id, user_id, created_at) VALUES ($1, $2, $3)`
	_, err := tx.ExecContext(ctx, SQL, participant.ConversationId, participant.UserId, time.Now())
	if err != nil {
		return domain.ConversationParticipant{}, err
	}

	return participant, nil
}

func (repository *ChatRepositoryImpl) FindConversationById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Conversation, error) {
	SQL := `SELECT id, created_at, updated_at FROM conversations WHERE id = $1`
	row := tx.QueryRowContext(ctx, SQL, id)

	conversation := domain.Conversation{}
	err := row.Scan(&conversation.Id, &conversation.CreatedAt, &conversation.UpdatedAt)
	if err != nil {
		return conversation, err
	}

	// Get participants
	participants, _ := repository.getConversationParticipants(ctx, tx, conversation.Id)
	conversation.Participants = participants

	// Get last message
	messages, _ := repository.FindMessagesByConversationId(ctx, tx, conversation.Id, 1, 0)
	if len(messages) > 0 {
		conversation.LastMessage = &messages[0]
	}

	return conversation, nil
}

func (repository *ChatRepositoryImpl) FindConversationByParticipants(ctx context.Context, tx *sql.Tx, participantIds []uuid.UUID) (domain.Conversation, error) {
	// This function finds a conversation where exactly these participants are present
	if len(participantIds) == 0 {
		return domain.Conversation{}, fmt.Errorf("no participants provided")
	}

	// First, create a query to find conversation IDs that have all these participants
	participantPlaceholders := []string{}
	participantArgs := []interface{}{}
	for i, participantId := range participantIds {
		participantPlaceholders = append(participantPlaceholders, fmt.Sprintf("$%d", i+1))
		participantArgs = append(participantArgs, participantId)
	}

	// Count the total participants for each conversation involving these users
	SQL := fmt.Sprintf(`
        SELECT cp.conversation_id
        FROM conversation_participants cp
        WHERE cp.user_id IN (%s)
        GROUP BY cp.conversation_id
        HAVING COUNT(DISTINCT cp.user_id) = $%d AND COUNT(cp.user_id) = $%d
    `, strings.Join(participantPlaceholders, ", "), len(participantIds)+1, len(participantIds)+2)

	participantArgs = append(participantArgs, len(participantIds), len(participantIds)) // exact participant count

	rows, err := tx.QueryContext(ctx, SQL, participantArgs...)
	if err != nil {
		return domain.Conversation{}, err
	}
	defer rows.Close()

	// If a matching conversation is found, return it
	if rows.Next() {
		var conversationId uuid.UUID
		err = rows.Scan(&conversationId)
		if err != nil {
			return domain.Conversation{}, err
		}

		return repository.FindConversationById(ctx, tx, conversationId)
	}

	return domain.Conversation{}, fmt.Errorf("no conversation found with these exact participants")
}

func (repository *ChatRepositoryImpl) FindConversationsByUserId(ctx context.Context, tx *sql.Tx, userId uuid.UUID, limit, offset int) ([]domain.Conversation, int) {
	SQL := `
        SELECT c.id, c.created_at, c.updated_at
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = $1
        ORDER BY c.updated_at DESC
        LIMIT $2 OFFSET $3
    `
	rows, err := tx.QueryContext(ctx, SQL, userId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var conversations []domain.Conversation
	var conversationIDs []uuid.UUID

	for rows.Next() {
		conversation := domain.Conversation{}
		err := rows.Scan(&conversation.Id, &conversation.CreatedAt, &conversation.UpdatedAt)
		helper.PanicIfError(err)
		conversations = append(conversations, conversation)
		conversationIDs = append(conversationIDs, conversation.Id)
	}

	if len(conversationIDs) == 0 {
		return conversations, 0
	}

	// Ambil semua participants sekaligus
	participantsMap := make(map[uuid.UUID][]domain.ConversationParticipant)
	{
		placeholders := []string{}
		args := []interface{}{}
		for i, id := range conversationIDs {
			placeholders = append(placeholders, fmt.Sprintf("$%d", i+1))
			args = append(args, id)
		}
		SQL := fmt.Sprintf(`
            SELECT cp.conversation_id, cp.user_id, cp.last_read_at, cp.created_at,
                u.id, u.name, u.username, COALESCE(u.photo, ''), u.email
            FROM conversation_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.conversation_id IN (%s)
        `, strings.Join(placeholders, ","))
		rows, err := tx.QueryContext(ctx, SQL, args...)
		helper.PanicIfError(err)
		defer rows.Close()
		for rows.Next() {
			participant := domain.ConversationParticipant{}
			user := domain.User{}
			var lastReadAt sql.NullTime
			err := rows.Scan(
				&participant.ConversationId,
				&participant.UserId,
				&lastReadAt,
				&participant.CreatedAt,
				&user.Id,
				&user.Name,
				&user.Username,
				&user.Photo,
				&user.Email,
			)
			helper.PanicIfError(err)
			if lastReadAt.Valid {
				val := lastReadAt.Time
				participant.LastReadAt = &val
			}
			participant.User = &user
			participantsMap[participant.ConversationId] = append(participantsMap[participant.ConversationId], participant)
		}
	}

	// Ambil pesan terakhir sekaligus
	lastMsgMap := make(map[uuid.UUID]*domain.Message)
	{
		placeholders := []string{}
		args := []interface{}{}
		for i, id := range conversationIDs {
			placeholders = append(placeholders, fmt.Sprintf("$%d", i+1))
			args = append(args, id)
		}
		sql := fmt.Sprintf(`
    WITH ranked AS (
        SELECT m.*, u.id AS user_id, u.name, u.username, COALESCE(u.photo, '') AS photo,
            ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) AS rn
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id IN (%s)
    )
    SELECT id, conversation_id, sender_id, message_type, content, file_path, file_name, file_size, file_type, created_at, updated_at, is_read,
        user_id, name, username, photo, conversation_id
    FROM ranked WHERE rn = 1
`, strings.Join(placeholders, ","))
		rows, err := tx.QueryContext(ctx, sql, args...)
		helper.PanicIfError(err)
		defer rows.Close()
		for rows.Next() {
			message := domain.Message{}
			user := domain.User{}
			var convId uuid.UUID
			err := rows.Scan(
				&message.Id,
				&message.ConversationId,
				&message.SenderId,
				&message.MessageType,
				&message.Content,
				&message.FilePath,
				&message.FileName,
				&message.FileSize,
				&message.FileType,
				&message.CreatedAt,
				&message.UpdatedAt,
				&message.IsRead,
				&user.Id,
				&user.Name,
				&user.Username,
				&user.Photo,
				&convId,
			)
			helper.PanicIfError(err)
			message.Sender = &user
			lastMsgMap[convId] = &message
		}
	}

	// Hitung unread sekaligus
	unreadMap := make(map[uuid.UUID]int)
	{
		placeholders := []string{}
		args := []interface{}{userId}
		for i, id := range conversationIDs {
			placeholders = append(placeholders, fmt.Sprintf("$%d", i+2))
			args = append(args, id)
		}
		sql := fmt.Sprintf(`
            SELECT conversation_id, COUNT(*)
            FROM messages
            WHERE sender_id != $1 AND conversation_id IN (%s) AND is_read = FALSE
            GROUP BY conversation_id
        `, strings.Join(placeholders, ","))
		rows, err := tx.QueryContext(ctx, sql, args...)
		helper.PanicIfError(err)
		defer rows.Close()
		for rows.Next() {
			var convId uuid.UUID
			var count int
			err := rows.Scan(&convId, &count)
			helper.PanicIfError(err)
			unreadMap[convId] = count
		}
	}

	// Gabungkan hasil ke conversations
	for i := range conversations {
		id := conversations[i].Id
		conversations[i].Participants = participantsMap[id]
		conversations[i].LastMessage = lastMsgMap[id]
		conversations[i].UnreadCount = unreadMap[id]
	}

	// Hitung total
	var total int
	countSQL := `
        SELECT COUNT(DISTINCT c.id) 
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = $1
    `
	err = tx.QueryRowContext(ctx, countSQL, userId).Scan(&total)
	helper.PanicIfError(err)

	return conversations, total
}

func (repository *ChatRepositoryImpl) UpdateLastReadAt(ctx context.Context, tx *sql.Tx, conversationId, userId uuid.UUID, lastReadAt string) error {
	SQL := `
        UPDATE conversation_participants
        SET last_read_at = $1
        WHERE conversation_id = $2 AND user_id = $3
    `

	_, err := tx.ExecContext(ctx, SQL, lastReadAt, conversationId, userId)
	return err
}

func (repository *ChatRepositoryImpl) getConversationParticipants(ctx context.Context, tx *sql.Tx, conversationId uuid.UUID) ([]domain.ConversationParticipant, error) {
	SQL := `
        SELECT cp.conversation_id, cp.user_id, cp.last_read_at, cp.created_at,
            u.id, u.name, u.username, COALESCE(u.photo, ''), u.email
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = $1
    `

	rows, err := tx.QueryContext(ctx, SQL, conversationId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var participants []domain.ConversationParticipant

	for rows.Next() {
		participant := domain.ConversationParticipant{}
		user := domain.User{}
		var lastReadAt sql.NullTime

		err := rows.Scan(
			&participant.ConversationId,
			&participant.UserId,
			&lastReadAt,
			&participant.CreatedAt,
			&user.Id,
			&user.Name,
			&user.Username,
			&user.Photo,
			&user.Email,
		)
		if err != nil {
			return nil, err
		}

		if lastReadAt.Valid {
			lastReadAtVal := lastReadAt.Time
			participant.LastReadAt = &lastReadAtVal
		}

		participant.User = &user
		participants = append(participants, participant)
	}

	return participants, nil
}

// Message operations
func (repository *ChatRepositoryImpl) CreateMessage(ctx context.Context, tx *sql.Tx, message domain.Message) domain.Message {
	if message.Id == uuid.Nil {
		message.Id = uuid.New()
	}

	now := time.Now()
	message.CreatedAt = now
	message.UpdatedAt = now

	SQL := `
        INSERT INTO messages (id, conversation_id, sender_id, message_type, content, file_path, file_name, file_size, file_type, created_at, updated_at, is_read)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `
	_, err := tx.ExecContext(ctx, SQL,
		message.Id,
		message.ConversationId,
		message.SenderId,
		message.MessageType,
		message.Content,
		message.FilePath,
		message.FileName,
		message.FileSize,
		message.FileType,
		message.CreatedAt,
		message.UpdatedAt,
		message.IsRead,
	)
	helper.PanicIfError(err)

	// Update conversation's updated_at
	updateSQL := `UPDATE conversations SET updated_at = $1 WHERE id = $2`
	_, err = tx.ExecContext(ctx, updateSQL, now, message.ConversationId)
	helper.PanicIfError(err)

	return message
}

func (repository *ChatRepositoryImpl) FindMessagesByConversationId(ctx context.Context, tx *sql.Tx, conversationId uuid.UUID, limit, offset int) ([]domain.Message, int) {
	SQL := `
        SELECT m.id, m.conversation_id, m.sender_id, m.message_type, m.content, 
            m.file_path, m.file_name, m.file_size, m.file_type, 
            m.created_at, m.updated_at, m.is_read,
            u.id, u.name, u.username, COALESCE(u.photo, '')
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := tx.QueryContext(ctx, SQL, conversationId, limit, offset)
	helper.PanicIfError(err)
	defer rows.Close()

	var messages []domain.Message

	for rows.Next() {
		message := domain.Message{}
		user := domain.User{}

		err := rows.Scan(
			&message.Id,
			&message.ConversationId,
			&message.SenderId,
			&message.MessageType,
			&message.Content,
			&message.FilePath,
			&message.FileName,
			&message.FileSize,
			&message.FileType,
			&message.CreatedAt,
			&message.UpdatedAt,
			&message.IsRead,
			&user.Id,
			&user.Name,
			&user.Username,
			&user.Photo,
		)
		helper.PanicIfError(err)

		message.Sender = &user
		messages = append(messages, message)
	}

	// Count total messages
	var total int
	countSQL := `SELECT COUNT(*) FROM messages WHERE conversation_id = $1`
	err = tx.QueryRowContext(ctx, countSQL, conversationId).Scan(&total)
	helper.PanicIfError(err)

	return messages, total
}

func (repository *ChatRepositoryImpl) FindMessageById(ctx context.Context, tx *sql.Tx, id uuid.UUID) (domain.Message, error) {
	SQL := `
        SELECT m.id, m.conversation_id, m.sender_id, m.message_type, m.content, 
            m.file_path, m.file_name, m.file_size, m.file_type,
            m.created_at, m.updated_at, m.is_read,
            u.id, u.name, u.username, COALESCE(u.photo, '')
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = $1
    `

	row := tx.QueryRowContext(ctx, SQL, id)

	message := domain.Message{}
	user := domain.User{}

	err := row.Scan(
		&message.Id,
		&message.ConversationId,
		&message.SenderId,
		&message.MessageType,
		&message.Content,
		&message.FilePath,
		&message.FileName,
		&message.FileSize,
		&message.FileType,
		&message.CreatedAt,
		&message.UpdatedAt,
		&message.IsRead,
		&user.Id,
		&user.Name,
		&user.Username,
		&user.Photo,
	)
	if err != nil {
		return message, err
	}

	message.Sender = &user
	return message, nil
}

func (repository *ChatRepositoryImpl) UpdateMessage(ctx context.Context, tx *sql.Tx, message domain.Message) domain.Message {
	message.UpdatedAt = time.Now()

	SQL := `
        UPDATE messages
        SET content = $1, updated_at = $2
        WHERE id = $3
    `
	_, err := tx.ExecContext(ctx, SQL, message.Content, message.UpdatedAt, message.Id)
	helper.PanicIfError(err)

	return message
}

func (repository *ChatRepositoryImpl) DeleteMessage(ctx context.Context, tx *sql.Tx, id uuid.UUID) error {
	SQL := `DELETE FROM messages WHERE id = $1`
	_, err := tx.ExecContext(ctx, SQL, id)
	return err
}

func (repository *ChatRepositoryImpl) CountUnreadMessages(ctx context.Context, tx *sql.Tx, conversationId, userId uuid.UUID) int {
	SQL := `
        SELECT COUNT(*)
        FROM messages m
        WHERE m.conversation_id = $1 AND m.sender_id != $2 AND m.is_read = FALSE
    `

	var count int
	err := tx.QueryRowContext(ctx, SQL, conversationId, userId).Scan(&count)
	helper.PanicIfError(err)

	return count
}

func (repository *ChatRepositoryImpl) MarkMessagesAsRead(ctx context.Context, tx *sql.Tx, conversationId, userId uuid.UUID) error {
	SQL := `
        UPDATE messages
        SET is_read = TRUE
        WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE
    `
	_, err := tx.ExecContext(ctx, SQL, conversationId, userId)
	return err
}
