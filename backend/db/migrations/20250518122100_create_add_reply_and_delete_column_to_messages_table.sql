-- +goose Up
-- +goose StatementBegin
-- Run this SQL to modify your messages table
ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMP;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Run this SQL to revert the changes made in the Up migration
ALTER TABLE messages DROP COLUMN reply_to_id;
ALTER TABLE messages DROP COLUMN deleted_at;
-- +goose StatementEnd
