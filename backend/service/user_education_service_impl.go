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

type EducationServiceImpl struct {
	EducationRepository repository.UserEducationRepository
	UserRepository      repository.UserRepository
	DB                  *sql.DB
	Validate            *validator.Validate
}

func NewEducationService(
	educationRepository repository.UserEducationRepository,
	userRepository repository.UserRepository,
	db *sql.DB,
	validate *validator.Validate) EducationService {
	return &EducationServiceImpl{
		EducationRepository: educationRepository,
		UserRepository:      userRepository,
		DB:                  db,
		Validate:            validate,
	}
}

func (service *EducationServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreateEducationRequest) web.EducationResponse {
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

	// Create education entity
	education := domain.UserEducation{
		UserId:        userId,
		InstituteName: request.InstituteName,
		Major:         request.Major,
		StartMonth:    request.StartMonth,
		StartYear:     request.StartYear,
		EndMonth:      request.EndMonth,
		EndYear:       request.EndYear,
		Caption:       request.Caption,
		Photo:         request.Photo,
	}

	// Save to database
	education = service.EducationRepository.Save(ctx, tx, education)

	return helper.ToEducationResponse(education)
}

func (service *EducationServiceImpl) Update(ctx context.Context, educationId uuid.UUID, userId uuid.UUID, request web.UpdateEducationRequest) web.EducationResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing education
	education, err := service.EducationRepository.FindById(ctx, tx, educationId)
	if err != nil {
		panic(exception.NewNotFoundError("Education not found"))
	}

	// Check ownership
	if education.UserId != userId {
		panic(exception.NewForbiddenError("You don't have permission to update this education entry"))
	}

	// Update fields
	education.InstituteName = request.InstituteName
	education.Major = request.Major
	education.StartMonth = request.StartMonth
	education.StartYear = request.StartYear
	education.EndMonth = request.EndMonth
	education.EndYear = request.EndYear
	education.Caption = request.Caption
	education.Photo = request.Photo

	// Save changes
	education = service.EducationRepository.Update(ctx, tx, education)

	return helper.ToEducationResponse(education)
}

func (service *EducationServiceImpl) Delete(ctx context.Context, educationId uuid.UUID, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing education
	education, err := service.EducationRepository.FindById(ctx, tx, educationId)
	if err != nil {
		panic(exception.NewNotFoundError("Education not found"))
	}

	// Check ownership
	if education.UserId != userId {
		panic(exception.NewForbiddenError("You don't have permission to delete this education entry"))
	}

	// Delete from database
	err = service.EducationRepository.Delete(ctx, tx, educationId)
	if err != nil {
		panic(exception.NewInternalServerError(err.Error()))
	}
}

func (service *EducationServiceImpl) GetById(ctx context.Context, educationId uuid.UUID) web.EducationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find education by ID
	education, err := service.EducationRepository.FindById(ctx, tx, educationId)
	if err != nil {
		panic(exception.NewNotFoundError("Education not found"))
	}

	return helper.ToEducationResponse(education)
}

func (service *EducationServiceImpl) GetByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) web.EducationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Set default limit and offset
	if limit <= 0 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	// Get education entries
	educations, err := service.EducationRepository.FindByUserId(ctx, tx, userId, limit, offset)
	helper.PanicIfError(err)

	// Get total count
	total, err := service.EducationRepository.CountByUserId(ctx, tx, userId)
	helper.PanicIfError(err)

	return web.EducationListResponse{
		Educations: helper.ToEducationResponses(educations),
		Total:      total,
	}
}
