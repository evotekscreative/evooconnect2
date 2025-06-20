package service

import (
	"context"
	"evoconnect/backend/model/web"
	"mime/multipart"

	"github.com/google/uuid"
)

type UserCvStorageService interface {
	UploadCv(ctx context.Context, file *multipart.FileHeader, userId uuid.UUID) web.UploadCvResponse
	GetUserCv(ctx context.Context, userId uuid.UUID) web.UserCvStorageResponse
	DeleteCv(ctx context.Context, userId uuid.UUID)
	HasCv(ctx context.Context, userId uuid.UUID) bool
}
