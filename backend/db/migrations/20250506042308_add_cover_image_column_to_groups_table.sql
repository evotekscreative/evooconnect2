-- +goose Up
-- +goose StatementBegin
ALTER TABLE groups ADD COLUMN cover_image VARCHAR(255);-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE groups DROP COLUMN cover_image;
-- +goose StatementEnd
