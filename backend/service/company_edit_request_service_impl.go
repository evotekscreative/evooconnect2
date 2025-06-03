package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"log"
	"mime/multipart"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CompanyManagementServiceImpl struct {
	CompanyRepository            repository.CompanyRepository
	CompanyEditRequestRepository repository.CompanyEditRequestRepository
	UserRepository               repository.UserRepository
	AdminRepository              repository.AdminRepository
	NotificationService          NotificationService
	DB                           *sql.DB
	Validate                     *validator.Validate
}

func NewCompanyManagementService(
	companyRepository repository.CompanyRepository,
	companyEditRequestRepository repository.CompanyEditRequestRepository,
	userRepository repository.UserRepository,
	adminRepository repository.AdminRepository,
	notificationService NotificationService,
	db *sql.DB,
	validate *validator.Validate) CompanyManagementService {
	return &CompanyManagementServiceImpl{
		CompanyRepository:            companyRepository,
		CompanyEditRequestRepository: companyEditRequestRepository,
		UserRepository:               userRepository,
		AdminRepository:              adminRepository,
		NotificationService:          notificationService,
		DB:                           db,
		Validate:                     validate,
	}
}

func (service *CompanyManagementServiceImpl) GetMyCompanies(ctx context.Context, userId uuid.UUID) []web.CompanyManagementResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	companies := service.CompanyRepository.FindByOwnerId(ctx, tx, userId)

	var responses []web.CompanyManagementResponse
	for _, company := range companies {
		// Check for pending edit requests
		hasPendingEdit := service.CompanyEditRequestRepository.HasPendingEdit(ctx, tx, company.Id)

		response := web.CompanyManagementResponse{
			Id:             company.Id.String(),
			Name:           company.Name,
			LinkedinUrl:    company.LinkedinUrl,
			Website:        company.Website,
			Industry:       company.Industry,
			Size:           company.Size,
			Type:           company.Type,
			Logo:           company.Logo,
			Tagline:        company.Tagline,
			IsVerified:     company.IsVerified,
			CreatedAt:      company.CreatedAt,
			UpdatedAt:      company.UpdatedAt,
			HasPendingEdit: hasPendingEdit,
		}

		if hasPendingEdit {
			// Get pending edit request details
			editRequests := service.CompanyEditRequestRepository.FindByCompanyId(ctx, tx, company.Id)
			for _, editRequest := range editRequests {
				if editRequest.Status == domain.CompanyEditRequestStatusPending {
					response.PendingEditId = editRequest.Id.String()
					break
				}
			}
		}

		responses = append(responses, response)
	}

	return responses
}

func (service *CompanyManagementServiceImpl) GetCompanyDetail(ctx context.Context, companyId uuid.UUID, userId uuid.UUID) web.CompanyManagementResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	company, err := service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Check if user is the owner
	if company.OwnerId != userId {
		panic(exception.NewForbiddenError("You don't have permission to access this company"))
	}

	// Get edit requests history
	editRequests := service.CompanyEditRequestRepository.FindByCompanyId(ctx, tx, companyId)

	var editRequestResponses []web.CompanyEditRequestResponse
	for _, editRequest := range editRequests {
		editRequestResponses = append(editRequestResponses, helper.ToCompanyEditRequestResponse(editRequest))
	}

	hasPendingEdit := service.CompanyEditRequestRepository.HasPendingEdit(ctx, tx, companyId)
	var pendingEditId string
	if hasPendingEdit {
		for _, editRequest := range editRequests {
			if editRequest.Status == domain.CompanyEditRequestStatusPending {
				pendingEditId = editRequest.Id.String()
				break
			}
		}
	}

	return web.CompanyManagementResponse{
		Id:             company.Id.String(),
		Name:           company.Name,
		LinkedinUrl:    company.LinkedinUrl,
		Website:        company.Website,
		Industry:       company.Industry,
		Size:           company.Size,
		Type:           company.Type,
		Logo:           company.Logo,
		Tagline:        company.Tagline,
		IsVerified:     company.IsVerified,
		CreatedAt:      company.CreatedAt,
		UpdatedAt:      company.UpdatedAt,
		HasPendingEdit: hasPendingEdit,
		PendingEditId:  pendingEditId,
		EditRequests:   editRequestResponses,
	}
}

func (service *CompanyManagementServiceImpl) RequestEdit(ctx context.Context, companyId uuid.UUID, userId uuid.UUID, request web.CreateCompanyEditRequestRequest, logoFile *multipart.FileHeader) web.CompanyEditRequestResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists and user is the owner
	company, err := service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	if company.OwnerId != userId {
		panic(exception.NewForbiddenError("You don't have permission to edit this company"))
	}

	// Check if there's already a pending edit request
	hasPendingEdit := service.CompanyEditRequestRepository.HasPendingEdit(ctx, tx, companyId)
	if hasPendingEdit {
		panic(exception.NewBadRequestError("You already have a pending edit request for this company"))
	}

	// Handle logo upload if provided
	var logoPath string = company.Logo // Keep existing logo by default
	if logoFile != nil {
		file, err := logoFile.Open()
		helper.PanicIfError(err)
		defer file.Close()

		uploadResult, err := helper.UploadImage(file, logoFile, helper.DirCompanies, userId.String(), "logo")
		helper.PanicIfError(err)
		logoPath = uploadResult.RelativePath
	}

	// Prepare current company data
	currentData := web.CompanyEditData{
		Name:        company.Name,
		LinkedinUrl: company.LinkedinUrl,
		Website:     company.Website,
		Industry:    company.Industry,
		Size:        company.Size,
		Type:        company.Type,
		Logo:        company.Logo,
		Tagline:     company.Tagline,
	}

	// Prepare requested changes
	requestedData := web.CompanyEditData{
		Name:        request.Name,
		LinkedinUrl: request.LinkedinUrl,
		Website:     request.Website,
		Industry:    request.Industry,
		Size:        request.Size,
		Type:        request.Type,
		Logo:        logoPath,
		Tagline:     request.Tagline,
	}

	// Convert to JSON strings
	currentDataJSON, err := json.Marshal(currentData)
	helper.PanicIfError(err)

	requestedDataJSON, err := json.Marshal(requestedData)
	helper.PanicIfError(err)

	// Create edit request
	editRequest := domain.CompanyEditRequest{
		Id:               uuid.New(),
		CompanyId:        companyId,
		UserId:           userId,
		RequestedChanges: string(requestedDataJSON),
		CurrentData:      string(currentDataJSON),
		Status:           domain.CompanyEditRequestStatusPending,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	editRequest = service.CompanyEditRequestRepository.Create(ctx, tx, editRequest)

	// Send notification to user
	if service.NotificationService != nil {
		go func() {
			refType := "company_edit_request_created"
			service.NotificationService.Create(
				context.Background(),
				userId,
				string(domain.NotificationCategoryCompany),
				"company_edit_request_created",
				"Company Edit Request Submitted",
				fmt.Sprintf("Your edit request for company '%s' has been submitted for review", company.Name),
				&editRequest.Id,
				&refType,
				nil,
			)
		}()
	}

	return helper.ToCompanyEditRequestResponse(editRequest)
}

func (service *CompanyManagementServiceImpl) GetMyEditRequests(ctx context.Context, userId uuid.UUID) []web.CompanyEditRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	editRequests := service.CompanyEditRequestRepository.FindByUserId(ctx, tx, userId)

	var responses []web.CompanyEditRequestResponse
	for _, editRequest := range editRequests {
		responses = append(responses, helper.ToCompanyEditRequestResponse(editRequest))
	}

	return responses
}

func (service *CompanyManagementServiceImpl) DeleteCompany(ctx context.Context, requestId uuid.UUID, userId uuid.UUID) error {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find edit request
	company, err := service.CompanyRepository.FindById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Check if user is the owner
	if company.OwnerId != userId {
		panic(exception.NewForbiddenError("You don't have permission to delete this company"))
	}

	// Check if there are pending edit requests
	hasPendingEdit := service.CompanyEditRequestRepository.HasPendingEdit(ctx, tx, company.Id)
	if hasPendingEdit {
		panic(exception.NewBadRequestError("You cannot delete a company with pending edit requests"))
	}

	// Get the logo file path
	companyLogo := company.Logo

	// Delete the company
	err = service.CompanyRepository.Delete(ctx, tx, company.Id)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to delete company"))
	}

	if companyLogo != "" {
		err = helper.DeleteFile(companyLogo)
		if err != nil {
			log.Printf("Failed to delete logo file: %v", err)
			panic(exception.NewInternalServerError("Failed to delete logo file"))
		}
		log.Printf("Logo file deleted successfully: %s", companyLogo)
	}

	return nil
}

func (service *CompanyManagementServiceImpl) DeleteCompanyEditRequest(ctx context.Context, requestId uuid.UUID, userId uuid.UUID) error {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find edit request
	editRequest, err := service.CompanyEditRequestRepository.FindById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("Company edit request not found"))
	}
	// Check if user is the owner of the request
	if editRequest.UserId != userId {
		panic(exception.NewForbiddenError("You don't have permission to delete this edit request"))
	}
	// Check if the request is already reviewed
	if editRequest.Status != domain.CompanyEditRequestStatusPending {
		panic(exception.NewBadRequestError("You cannot delete a company edit request that has already been reviewed"))
	}

	// Unmarshal the requested changes JSON string into CompanyEditData struct
	var requestedData web.CompanyEditData
	err = json.Unmarshal([]byte(editRequest.RequestedChanges), &requestedData)
	helper.PanicIfError(err)

	companyLogo := requestedData.Logo

	// Delete the edit request
	err = service.CompanyEditRequestRepository.Delete(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to delete company edit request"))
	}

	if companyLogo != "" {
		err = helper.DeleteFile(companyLogo)
		if err != nil {
			log.Printf("Failed to delete logo file: %v", err)
			panic(exception.NewInternalServerError("Failed to delete logo file"))
		}
		log.Printf("Logo file deleted successfully: %s", companyLogo)
	}

	return nil
}

func (service *CompanyManagementServiceImpl) GetAllEditRequests(ctx context.Context, limit, offset int) []web.CompanyEditRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	editRequests := service.CompanyEditRequestRepository.FindAll(ctx, tx, limit, offset)

	var responses []web.CompanyEditRequestResponse
	for _, editRequest := range editRequests {
		responses = append(responses, helper.ToCompanyEditRequestResponse(editRequest))
	}

	return responses
}

func (service *CompanyManagementServiceImpl) GetEditRequestsByStatus(ctx context.Context, status string, limit, offset int) []web.CompanyEditRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	requestStatus := domain.CompanyEditRequestStatus(status)
	editRequests := service.CompanyEditRequestRepository.FindByStatus(ctx, tx, requestStatus, limit, offset)

	var responses []web.CompanyEditRequestResponse
	for _, editRequest := range editRequests {
		responses = append(responses, helper.ToCompanyEditRequestResponse(editRequest))
	}

	return responses
}

func (service *CompanyManagementServiceImpl) GetEditRequestDetail(ctx context.Context, requestId uuid.UUID) web.CompanyEditRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	editRequest, err := service.CompanyEditRequestRepository.FindById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("Company edit request not found"))
	}

	return helper.ToCompanyEditRequestResponse(editRequest)
}

func (service *CompanyManagementServiceImpl) ReviewEditRequest(ctx context.Context, requestId uuid.UUID, reviewerId uuid.UUID, request web.ReviewCompanyEditRequestRequest) web.CompanyEditRequestResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find edit request
	editRequest, err := service.CompanyEditRequestRepository.FindById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("Company edit request not found"))
	}

	// Check if already reviewed
	if editRequest.Status != domain.CompanyEditRequestStatusPending {
		panic(exception.NewBadRequestError("Company edit request has already been reviewed"))
	}

	// Check if admin reviewer exists
	_, err = service.AdminRepository.FindById(ctx, tx, reviewerId)
	if err != nil {
		panic(exception.NewNotFoundError("Admin reviewer not found"))
	}

	// Update edit request
	now := time.Now()
	editRequest.Status = domain.CompanyEditRequestStatus(request.Status)
	editRequest.RejectionReason = request.RejectionReason
	editRequest.ReviewedBy = &reviewerId
	editRequest.ReviewedAt = &now
	editRequest.UpdatedAt = now

	editRequest = service.CompanyEditRequestRepository.Update(ctx, tx, editRequest)

	// If approved, update the company with new data
	if editRequest.Status == domain.CompanyEditRequestStatusApproved {
		var requestedData web.CompanyEditData
		err := json.Unmarshal([]byte(editRequest.RequestedChanges), &requestedData)
		helper.PanicIfError(err)

		// Get company and update
		company, err := service.CompanyRepository.FindById(ctx, tx, editRequest.CompanyId)
		helper.PanicIfError(err)

		company.Name = requestedData.Name
		company.LinkedinUrl = requestedData.LinkedinUrl
		company.Website = requestedData.Website
		company.Industry = requestedData.Industry
		company.Size = requestedData.Size
		company.Type = requestedData.Type
		company.Logo = requestedData.Logo
		company.Tagline = requestedData.Tagline
		company.UpdatedAt = time.Now()

		service.CompanyRepository.Update(ctx, tx, company)
	}

	// Send notification to user
	if service.NotificationService != nil {
		go func() {
			var title, message string
			refType := "company_edit_request_reviewed"

			if editRequest.Status == domain.CompanyEditRequestStatusApproved {
				title = "Company Edit Request Approved"
				message = "Your company edit request has been approved and changes have been applied"
			} else {
				title = "Company Edit Request Rejected"
				message = fmt.Sprintf("Your company edit request has been rejected. Reason: %s", editRequest.RejectionReason)
			}

			service.NotificationService.Create(
				context.Background(),
				editRequest.UserId,
				string(domain.NotificationCategoryCompany),
				"company_edit_request_reviewed",
				title,
				message,
				&editRequest.Id,
				&refType,
				nil,
			)
		}()
	}

	return helper.ToCompanyEditRequestResponse(editRequest)
}

func (service *CompanyManagementServiceImpl) GetEditRequestStats(ctx context.Context) map[string]int {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	return service.CompanyEditRequestRepository.GetStatsByStatus(ctx, tx)
}
