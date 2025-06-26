-- +goose Up
-- +goose StatementBegin
ALTER TABLE groups ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE groups DROP COLUMN IF EXISTS cover_image;
-- +goose StatementEnd
