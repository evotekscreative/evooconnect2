package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"

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

func (service *ExperienceServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.ExperienceCreateRequest) web.ExperienceResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Create experience
	experience := domain.UserExperience{
		UserId:      userId,
		JobTitle:    request.JobTitle,
		CompanyName: request.CompanyName,
		StartMonth:  request.StartMonth,
		StartYear:   request.StartYear,
		EndMonth:    request.EndMonth,
		EndYear:     request.EndYear,
		Caption:     request.Caption,
		Photo:       request.Photo,
	}

	// Save experience
	experience = service.ExperienceRepository.Save(ctx, tx, experience)

	return helper.ToExperienceResponse(experience)
}

func (service *ExperienceServiceImpl) Update(ctx context.Context, experienceId uuid.UUID, userId uuid.UUID, request web.ExperienceUpdateRequest) web.ExperienceResponse {
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

	// Update the experience data
	experience.JobTitle = request.JobTitle
	experience.CompanyName = request.CompanyName
	experience.StartMonth = request.StartMonth
	experience.StartYear = request.StartYear
	experience.EndMonth = request.EndMonth
	experience.EndYear = request.EndYear
	experience.Caption = request.Caption

	// Only update photo if provided
	if request.Photo != nil {
		experience.Photo = request.Photo
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

	// Delete experience
	service.ExperienceRepository.Delete(ctx, tx, experienceId)
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
