-- +goose Up
-- +goose StatementBegin
CREATE TABLE profile_views (
    id UUID PRIMARY KEY,
    profile_user_id UUID NOT NULL,
    viewer_id UUID NOT NULL,
    viewed_at TIMESTAMP NOT NULL,
    FOREIGN KEY (profile_user_id) REFERENCES users(id),
    FOREIGN KEY (viewer_id) REFERENCES users(id)
);

-- Indexes for faster queries
CREATE INDEX idx_profile_views_profile_user_id ON profile_views (profile_user_id);
CREATE INDEX idx_profile_views_viewer_id ON profile_views (viewer_id);
CREATE INDEX idx_profile_views_viewed_at ON profile_views (viewed_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS profile_views;
-- +goose StatementEnd
