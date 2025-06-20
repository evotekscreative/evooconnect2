package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type UserCvStorageServiceImpl struct {
	UserCvStorageRepository repository.UserCvStorageRepository
	UserRepository          repository.UserRepository
	DB                      *sql.DB
	Validate                *validator.Validate
}

func NewUserCvStorageService(
	userCvStorageRepository repository.UserCvStorageRepository,
	userRepository repository.UserRepository,
	DB *sql.DB,
	validate *validator.Validate) UserCvStorageService {
	return &UserCvStorageServiceImpl{
		UserCvStorageRepository: userCvStorageRepository,
		UserRepository:          userRepository,
		DB:                      DB,
		Validate:                validate,
	}
}

func (service *UserCvStorageServiceImpl) UploadCv(ctx context.Context, file *multipart.FileHeader, userId uuid.UUID) web.UploadCvResponse {
	if file == nil {
		panic(exception.NewBadRequestError("CV file is required"))
	}

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Verify user exists and is job seeker
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// if user.Role != "job_seeker" {
	// 	panic(exception.NewForbiddenError("Only job seekers can upload CV"))
	// }

	// Validate file
	if file.Size > 5*1024*1024 { // 5MB limit
		panic(exception.NewBadRequestError("CV file size must be less than 5MB"))
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".pdf" && ext != ".doc" && ext != ".docx" {
		panic(exception.NewBadRequestError("CV must be in PDF, DOC, or DOCX format"))
	}

	// Check if user already has CV
	userHasCv := service.UserCvStorageRepository.ExistsByUserId(ctx, tx, userId)
	var oldCvPath string

	if userHasCv {
		// Get old CV path for deletion
		existingCv, err := service.UserCvStorageRepository.FindByUserId(ctx, tx, userId)
		if err == nil {
			oldCvPath = existingCv.CvFilePath
		}
	}

	// Save file
	src, err := file.Open()
	if err != nil {
		panic(exception.NewBadRequestError("Failed to open uploaded file"))
	}
	defer src.Close()

	filePath := helper.SaveUploadedFile(src, "cv_storage", userId.String(), file.Filename)

	// Update or create CV storage record
	cvStorage := domain.UserCvStorage{
		Id:               uuid.New(),
		UserId:           userId,
		CvFilePath:       filePath,
		OriginalFilename: file.Filename,
		FileSize:         file.Size,
		UploadedAt:       time.Now(),
		UpdatedAt:        time.Now(),
	}

	if userHasCv {
		// Update existing record
		service.UserCvStorageRepository.Update(ctx, tx, cvStorage)

		// Delete old file if exists and different from new one
		if oldCvPath != "" && oldCvPath != filePath {
			go func() {
				os.Remove(oldCvPath)
			}()
		}
	} else {
		// Create new record
		service.UserCvStorageRepository.Create(ctx, tx, cvStorage)
	}

	return web.UploadCvResponse{
		Message:  "CV uploaded successfully",
		CvPath:   filePath,
		Filename: file.Filename,
		FileSize: file.Size,
	}
}

func (service *UserCvStorageServiceImpl) GetUserCv(ctx context.Context, userId uuid.UUID) web.UserCvStorageResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	cvStorage, err := service.UserCvStorageRepository.FindByUserId(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("CV not found"))
	}

	return web.UserCvStorageResponse{
		Id:               cvStorage.Id,
		UserId:           cvStorage.UserId,
		CvFilePath:       cvStorage.CvFilePath,
		OriginalFilename: cvStorage.OriginalFilename,
		FileSize:         cvStorage.FileSize,
		UploadedAt:       cvStorage.UploadedAt,
		UpdatedAt:        cvStorage.UpdatedAt,
	}
}

func (service *UserCvStorageServiceImpl) DeleteCv(ctx context.Context, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get CV info before deleting
	cvStorage, err := service.UserCvStorageRepository.FindByUserId(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("CV not found"))
	}

	// Delete from database
	err = service.UserCvStorageRepository.Delete(ctx, tx, userId)
	helper.PanicIfError(err)

	// Delete file asynchronously
	go func() {
		os.Remove(cvStorage.CvFilePath)
	}()
}

func (service *UserCvStorageServiceImpl) HasCv(ctx context.Context, userId uuid.UUID) bool {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	return service.UserCvStorageRepository.ExistsByUserId(ctx, tx, userId)
}
