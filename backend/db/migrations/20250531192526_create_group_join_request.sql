-- +goose Up
-- +goose StatementBegin
CREATE TABLE group_join_requests (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_group_join_requests_group_id ON group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_user_id ON group_join_requests(user_id);
CREATE INDEX idx_group_join_requests_status ON group_join_requests(status);
-- +goose Down
-- +goose StatementBegin
DROP TABLE group_join_requests;
-- +goose StatementEnd
