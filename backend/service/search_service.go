package service

import (
	"context"
	"evoconnect/backend/model/web"
	"github.com/google/uuid"
)

type SearchService interface {
	Search(ctx context.Context, query string, searchType string, limit int, offset int, currentUserId uuid.UUID) web.SearchResponse
}
