package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"evoconnect/backend/utils"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type AdminAuthServiceImpl struct {
	AdminRepository repository.AdminRepository
	DB              *sql.DB
	Validate        *validator.Validate
}

func NewAdminAuthService(adminRepository repository.AdminRepository, DB *sql.DB, validate *validator.Validate) AdminAuthService {
	return &AdminAuthServiceImpl{
		AdminRepository: adminRepository,
		DB:              DB,
		Validate:        validate,
	}
}

func (service *AdminAuthServiceImpl) Login(ctx context.Context, request web.AdminLoginRequest) web.AdminResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	admin, err := service.AdminRepository.FindByEmail(ctx, tx, request.Email)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid email or password"))
	}

	err = utils.VerifyPassword(admin.Password, request.Password)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid email or password"))
	}

	// Generate token with admin role and separate claim
	token, err := utils.GenerateToken(admin.Id.String(), admin.Email, "admin", 24*time.Hour)
	helper.PanicIfError(err)

	return web.AdminResponse{
		Id:        admin.Id,
		Username:  admin.Username,
		Email:     admin.Email,
		Name:      admin.Name,
		Role:      admin.Role,
		CreatedAt: admin.CreatedAt,
		Token:     token,
	}
}

func (service *AdminAuthServiceImpl) Register(ctx context.Context, request web.AdminRegisterRequest) web.AdminResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if email already exists
	_, err = service.AdminRepository.FindByEmail(ctx, tx, request.Email)
	if err == nil {
		panic(exception.NewBadRequestError("Email already registered"))
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(request.Password)
	helper.PanicIfError(err)

	admin := domain.Admin{
		Username: request.Username,
		Email:    request.Email,
		Password: hashedPassword,
		Name:     request.Name,
		Role:     request.Role,
	}

	admin = service.AdminRepository.Save(ctx, tx, admin)

	// Generate token
	token, err := utils.GenerateToken(admin.Id.String(), admin.Email, "admin", 24*time.Hour)
	helper.PanicIfError(err)

	return web.AdminResponse{
		Id:        admin.Id,
		Username:  admin.Username,
		Email:     admin.Email,
		Name:      admin.Name,
		Role:      admin.Role,
		CreatedAt: admin.CreatedAt,
		Token:     token,
	}
}

func (service *AdminAuthServiceImpl) FindById(ctx context.Context, adminId uuid.UUID) web.AdminResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	admin, err := service.AdminRepository.FindById(ctx, tx, adminId)
	if err != nil {
		panic(exception.NewNotFoundError("Admin not found"))
	}

	return web.AdminResponse{
		Id:        admin.Id,
		Username:  admin.Username,
		Email:     admin.Email,
		Name:      admin.Name,
		Role:      admin.Role,
		CreatedAt: admin.CreatedAt,
	}
}
