CREATE TABLE comment_blog (
    id UUID PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES tb_blog(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID NULL REFERENCES comment_blog(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);