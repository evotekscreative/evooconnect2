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
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type ExperienceServiceImpl struct {
	ExperienceRepository repository.ExperienceRepository
	UserRepository       repository.UserRepository
	DB                   *sql.DB
	Validate             *validator.Validate
}

func NewExperienceService(
	experienceRepository repository.ExperienceRepository,
	userRepository repository.UserRepository,
	db *sql.DB,
	validate *validator.Validate) ExperienceService {
	return &ExperienceServiceImpl{
		ExperienceRepository: experienceRepository,
		UserRepository:       userRepository,
		DB:                   db,
		Validate:             validate,
	}
}

func (service *ExperienceServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.ExperienceCreateRequest, file *multipart.FileHeader) web.ExperienceResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	var uploadResult *helper.UploadResult
	if file != nil {
		image, err := file.Open()
		helper.PanicIfError(err)
		defer image.Close()

		uploadResult, err = helper.UploadImage(image, file, helper.DirExperience, userId.String(), "images")
		helper.PanicIfError(err)
	}

	// Create experience
	experience := domain.UserExperience{
		Id:          uuid.New(),
		UserId:      userId,
		JobTitle:    request.JobTitle,
		CompanyName: request.CompanyName,
		StartMonth:  request.StartMonth,
		StartYear:   request.StartYear,
		EndMonth:    request.EndMonth,
		EndYear:     request.EndYear,
		Caption:     request.Caption,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Handle image
	if uploadResult != nil {
		experience.Photo = &uploadResult.RelativePath
	} else if request.Photo != nil && *request.Photo != "" {
		experience.Photo = request.Photo
	}

	// Save experience
	experience = service.ExperienceRepository.Save(ctx, tx, experience)

	return helper.ToExperienceResponse(experience)
}

func (service *ExperienceServiceImpl) Update(ctx context.Context, experienceId uuid.UUID, userId uuid.UUID, request web.ExperienceUpdateRequest, file *multipart.FileHeader) web.ExperienceResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if experience exists
	experience, err := service.ExperienceRepository.FindById(ctx, tx, experienceId)
	if err != nil {
		panic(exception.NewNotFoundError("Experience not found"))
	}

	// Check if user is owner of this experience
	if experience.UserId != userId {
		panic(exception.NewForbiddenError("You don't have permission to update this experience"))
	}

	var uploadResult *helper.UploadResult
	if file != nil {
		image, err := file.Open()
		helper.PanicIfError(err)
		defer image.Close()

		uploadResult, err = helper.UploadImage(image, file, helper.DirExperience, userId.String(), "images")
		helper.PanicIfError(err)
	}

	// Update the experience data
	experience.JobTitle = request.JobTitle
	experience.CompanyName = request.CompanyName
	experience.StartMonth = request.StartMonth
	experience.StartYear = request.StartYear
	experience.EndMonth = request.EndMonth
	experience.EndYear = request.EndYear
	experience.Caption = request.Caption
	if uploadResult != nil {
		// Delete old photo if it exists
		if experience.Photo != nil {
			err = helper.DeleteFile(*experience.Photo)
			helper.PanicIfError(err)
		}
		experience.Photo = &uploadResult.RelativePath
	}

	// Update experience
	updatedExperience := service.ExperienceRepository.Update(ctx, tx, experience)

	return helper.ToExperienceResponse(updatedExperience)
}

func (service *ExperienceServiceImpl) Delete(ctx context.Context, experienceId uuid.UUID, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if experience exists
	experience, err := service.ExperienceRepository.FindById(ctx, tx, experienceId)
	if err != nil {
		panic(exception.NewNotFoundError("Experience not found"))
	}

	// Check if user is owner of this experience
	if experience.UserId != userId {
		panic(exception.NewForbiddenError("You don't have permission to delete this experience"))
	}

	experiencePhoto := experience.Photo

	// Delete experience
	service.ExperienceRepository.Delete(ctx, tx, experienceId)

	if experiencePhoto != nil {
		// Delete photo from storage
		err = helper.DeleteFile(*experiencePhoto)
		if err != nil {
			panic(exception.NewInternalServerError(err.Error()))
		}
	}
}

func (service *ExperienceServiceImpl) GetById(ctx context.Context, experienceId uuid.UUID) web.ExperienceResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find experience by id
	experience, err := service.ExperienceRepository.FindById(ctx, tx, experienceId)
	if err != nil {
		panic(exception.NewNotFoundError("Experience not found"))
	}

	return helper.ToExperienceResponse(experience)
}

func (service *ExperienceServiceImpl) GetByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) web.ExperienceListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Find experiences by userId
	experiences, count := service.ExperienceRepository.FindByUserId(ctx, tx, userId, limit, offset)

	return web.ExperienceListResponse{
		Experiences: helper.ToExperienceResponses(experiences),
		Total:       count,
	}
}
