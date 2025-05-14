-- +goose Up
-- +goose StatementBegin
ALTER TABLE posts ADD COLUMN group_id UUID NULL REFERENCES groups(id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE posts DROP COLUMN group_id;
-- +goose StatementEnd
