-- +goose Up
-- +goose StatementBegin
ALTER TABLE companies ADD COLUMN taken_down_at TIMESTAMP NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE companies DROP COLUMN IF EXISTS taken_down_at;
-- +goose StatementEnd
