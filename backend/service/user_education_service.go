package service

import (
	"context"
	"evoconnect/backend/model/web"
	"mime/multipart"

	"github.com/google/uuid"
)

type EducationService interface {
	Create(ctx context.Context, userId uuid.UUID, request web.CreateEducationRequest, file *multipart.FileHeader) web.EducationResponse
	Update(ctx context.Context, educationId uuid.UUID, userId uuid.UUID, request web.UpdateEducationRequest, file *multipart.FileHeader) web.EducationResponse
	Delete(ctx context.Context, educationId uuid.UUID, userId uuid.UUID)
	GetById(ctx context.Context, educationId uuid.UUID) web.EducationResponse
	GetByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) web.EducationListResponse
}
