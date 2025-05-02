-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS connection_requests (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_connection_request UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_id ON connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver_id ON connection_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY,
    user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_connection UNIQUE (user_id_1, user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_connections_user_id_1 ON connections(user_id_1);
CREATE INDEX IF NOT EXISTS idx_connections_user_id_2 ON connections(user_id_2);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS connection_requests;
-- +goose StatementEnd