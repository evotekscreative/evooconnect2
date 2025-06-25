-- +goose Up
-- +goose StatementBegin
ALTER TABLE reports RENAME COLUMN other_reason TO description;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE reports RENAME COLUMN description TO other_reason;
-- +goose StatementEnd
