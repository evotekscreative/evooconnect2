-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS  messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text', -- text, image, document, audio
    content TEXT, -- for text messages
    file_path VARCHAR(255), -- for media files
    file_name VARCHAR(255), -- original filename 
    file_size INT, -- file size in bytes
    file_type VARCHAR(100), -- MIME type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP TABLE IF EXISTS messages;
-- +goose StatementEnd
