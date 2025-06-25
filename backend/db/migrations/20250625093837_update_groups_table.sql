-- +goose Up
-- +goose StatementBegin
ALTER TABLE groups ADD COLUMN IF NOT EXISTS post_approval BOOLEAN 
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE groups DROP COLUMN IF EXISTS post_approval;
-- +goose StatementEnd
