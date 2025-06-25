-- +goose Up
-- +goose StatementBegin
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES comments(id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE comments DROP COLUMN IF EXISTS reply_to_id;
-- +goose StatementEnd
