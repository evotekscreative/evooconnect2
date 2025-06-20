-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS company_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only')),
    is_announcement BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_company_posts_company_id ON company_posts(company_id);
CREATE INDEX idx_company_posts_creator_id ON company_posts(creator_id);
CREATE INDEX idx_company_posts_status ON company_posts(status);
CREATE INDEX idx_company_posts_created_at ON company_posts(created_at DESC);
CREATE INDEX idx_company_posts_is_announcement ON company_posts(is_announcement, created_at DESC);

-- Table for company post likes
CREATE TABLE IF NOT EXISTS company_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES company_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_company_post_likes_post_id ON company_post_likes(post_id);
CREATE INDEX idx_company_post_likes_user_id ON company_post_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_company_post_likes_created_at ON company_post_likes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_post_likes_post_user ON company_post_likes(post_id, user_id);

-- Add index for counting likes efficiently
CREATE INDEX IF NOT EXISTS idx_company_post_likes_post_count ON company_post_likes(post_id) INCLUDE (user_id);
-- Table for company post comments
CREATE TABLE IF NOT EXISTS company_post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES company_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES company_post_comments(id) ON DELETE CASCADE,
    comment_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_parent_comment CHECK (
        parent_id IS NULL OR parent_id != id
    ),
    CONSTRAINT valid_comment_structure CHECK (
        (parent_id IS NULL AND comment_to_id IS NULL) OR  -- Main comment
        (parent_id IS NOT NULL AND comment_to_id IS NULL) OR -- Reply comment
        (parent_id IS NOT NULL AND comment_to_id IS NOT NULL)  -- Sub-reply comment
    )
);

-- Indexes for performance
CREATE INDEX idx_company_post_comments_post_id ON company_post_comments(post_id);
CREATE INDEX idx_company_post_comments_user_id ON company_post_comments(user_id);
CREATE INDEX idx_company_post_comments_parent_id ON company_post_comments(parent_id);
CREATE INDEX idx_company_post_comments_comment_to_id ON company_post_comments(comment_to_id);
CREATE INDEX idx_company_post_comments_created_at ON company_post_comments(created_at);

-- Index for getting main comments efficiently
CREATE INDEX idx_company_post_comments_main ON company_post_comments(post_id, created_at) WHERE parent_id IS NULL;

-- Index for getting replies efficiently  
CREATE INDEX idx_company_post_comments_replies ON company_post_comments(parent_id, created_at) WHERE parent_id IS NOT NULL;

-- Update existing migration atau buat migration baru
ALTER TABLE company_post_comments 
DROP CONSTRAINT IF EXISTS company_post_comments_comment_to_id_fkey;

ALTER TABLE company_post_comments 
ADD CONSTRAINT company_post_comments_comment_to_id_fkey 
FOREIGN KEY (comment_to_id) REFERENCES company_post_comments(id) ON DELETE SET NULL;

-- Update constraint untuk struktur comment yang benar
ALTER TABLE company_post_comments 
DROP CONSTRAINT IF EXISTS valid_comment_structure;

ALTER TABLE company_post_comments 
ADD CONSTRAINT valid_comment_structure CHECK (
    (parent_id IS NULL AND comment_to_id IS NULL) OR  -- Main comment
    (parent_id IS NOT NULL AND comment_to_id IS NULL) OR -- Reply comment
    (parent_id IS NOT NULL AND comment_to_id IS NOT NULL)  -- Sub-reply comment (reply to specific comment)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS company_post_comments;
DROP TABLE IF EXISTS company_post_likes;
DROP TABLE IF EXISTS company_posts;
-- +goose StatementEnd
