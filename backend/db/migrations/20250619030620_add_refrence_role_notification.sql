-- +goose Up
-- +goose StatementBegin
ALTER TABLE notifications 
ALTER COLUMN actor_id TYPE TEXT,
ADD COLUMN actor_type TEXT,
ADD COLUMN actor_name TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE notifications 
DROP COLUMN actor_name,
DROP COLUMN actor_type,
ALTER COLUMN actor_id TYPE UUID USING actor_id::uuid;
-- +goose StatementEnd