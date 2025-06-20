-- +goose Up
-- +goose StatementBegin
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE notifications 
ADD CONSTRAINT notifications_actor_id_fkey 
FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;
-- +goose StatementEnd