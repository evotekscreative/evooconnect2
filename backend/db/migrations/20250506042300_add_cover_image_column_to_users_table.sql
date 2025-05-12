-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN cover_image VARCHAR(255);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN cover_image;
-- +goose StatementEnd
