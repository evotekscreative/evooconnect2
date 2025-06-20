package service

import (
	"context"
	"evoconnect/backend/model/web"
	"mime/multipart"

	"github.com/google/uuid"
)

type ExperienceService interface {
	Create(ctx context.Context, userId uuid.UUID, request web.ExperienceCreateRequest, file *multipart.FileHeader) web.ExperienceResponse
	Update(ctx context.Context, experienceId uuid.UUID, userId uuid.UUID, request web.ExperienceUpdateRequest, file *multipart.FileHeader) web.ExperienceResponse
	Delete(ctx context.Context, experienceId uuid.UUID, userId uuid.UUID)
	GetById(ctx context.Context, experienceId uuid.UUID) web.ExperienceResponse
	GetByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) web.ExperienceListResponse
}
