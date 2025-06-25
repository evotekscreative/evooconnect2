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
	CompanyJoinRequestRepository repository.CompanyJoinRequestRepository
	MemberCompanyRepository      repository.MemberCompanyRepository
	CompanyFollowerRepository    repository.CompanyFollowerRepository // Add this
	UserRepository               repository.UserRepository
	AdminRepository              repository.AdminRepository
	NotificationService          NotificationService
	ReportRepository             repository.ReportRepository // Optional, can be nil if not used
	DB                           *sql.DB
	Validate                     *validator.Validate
}

// Update the NewCompanyManagementService function
func NewCompanyManagementService(
	companyRepository repository.CompanyRepository,
	companyEditRequestRepository repository.CompanyEditRequestRepository,
	companyJoinRequestRepository repository.CompanyJoinRequestRepository,
	memberCompanyRepository repository.MemberCompanyRepository,
	companyFollowerRepository repository.CompanyFollowerRepository, // Add this
	userRepository repository.UserRepository,
	adminRepository repository.AdminRepository,
	notificationService NotificationService,
	reportRepo repository.ReportRepository,
	db *sql.DB,
	validate *validator.Validate,
) CompanyManagementService {
	return &CompanyManagementServiceImpl{
		CompanyRepository:            companyRepository,
		CompanyEditRequestRepository: companyEditRequestRepository,
		CompanyJoinRequestRepository: companyJoinRequestRepository,
		MemberCompanyRepository:      memberCompanyRepository,
		CompanyFollowerRepository:    companyFollowerRepository, // Add this
		UserRepository:               userRepository,
		AdminRepository:              adminRepository,
		NotificationService:          notificationService,
		ReportRepository:             reportRepo, // Optional, can be nil if not used
		DB:                           db,
		Validate:                     validate,
	}
}

func (service *CompanyManagementServiceImpl) GetAllCompanies(ctx context.Context, userId uuid.UUID, limit, offset int) web.CompanyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get all companies
	companies := service.CompanyRepository.FindAll(ctx, tx, limit, offset)

	// Get company IDs for batch follow status check
	var companyIds []uuid.UUID
	for _, company := range companies {
		companyIds = append(companyIds, company.Id)
	}

	// Get follow status for all companies
	followStatus := service.CompanyFollowerRepository.GetFollowStatusForCompanies(ctx, tx, userId, companyIds)

	var companyResponses []web.CompanyDetailResponse
	for _, company := range companies {
		// Get followers count
		followersCount := service.CompanyFollowerRepository.CountFollowersByCompanyId(ctx, tx, company.Id)

		// Get membership info
		isPendingJoinRequest := service.CompanyJoinRequestRepository.IsPendingJoinRequest(ctx, tx, userId, company.Id)
		var joinRequest domain.CompanyJoinRequest
		var joinRequestId *uuid.UUID = nil
		if isPendingJoinRequest {
			// If user has a pending join request, get the request ID
			joinRequest, err = service.CompanyJoinRequestRepository.FindByUserIdAndCompanyId(ctx, tx, userId, company.Id)
			joinRequestId = &joinRequest.Id
			helper.PanicIfError(err)
		}
		isMember, err := service.MemberCompanyRepository.IsUserMemberOfCompany(ctx, tx, userId, company.Id)
		if err != nil {
			panic(exception.NewInternalServerError("Failed to check membership status"))
		}
		userRole := ""
		if memberInfo, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, company.Id); err == nil {
			isMember = true
			userRole = string(memberInfo.Role)
		}

		// Check for pending edit requests
		hasPendingEdit := service.CompanyEditRequestRepository.HasPendingEdit(ctx, tx, company.Id)
		pendingEditId := ""
		if hasPendingEdit {
			if editRequests := service.CompanyEditRequestRepository.FindByCompanyId(ctx, tx, company.Id); len(editRequests) > 0 {
				for _, req := range editRequests {
					if req.Status == domain.CompanyEditRequestStatusPending {
						pendingEditId = req.Id.String()
						break
					}
				}
			}
		}

		response := web.CompanyDetailResponse{
			Id:          company.Id.String(),
			Name:        company.Name,
			LinkedinUrl: company.LinkedinUrl,
			Website:     company.Website,
			Industry:    company.Industry,
			Size:        company.Size,
			Type:        company.Type,
			Logo:        company.Logo,
			Tagline:     company.Tagline,
			IsVerified:  company.IsVerified,
			CreatedAt:   company.CreatedAt,
			UpdatedAt:   company.UpdatedAt,

			// Follow information
			IsFollowing:    followStatus[company.Id],
			FollowersCount: followersCount,

			// Membership information
			IsPendingJoinRequest: isPendingJoinRequest,
			JoinRequestId:        joinRequestId,
			IsMemberOfCompany:    isMember,
			UserRole:             userRole,

			// Edit information
			HasPendingEdit: hasPendingEdit,
			PendingEditId:  pendingEditId,
		}

		companyResponses = append(companyResponses, response)
	}

	return web.CompanyListResponse{
		Companies: companyResponses,
		Total:     len(companyResponses),
		Limit:     limit,
		Offset:    offset,
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
		followersCount := service.CompanyFollowerRepository.CountFollowersByCompanyId(ctx, tx, company.Id)
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
			FollowersCount: followersCount,
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

// GetCompanyById retrieves a company's basic information by its ID
// func (service *CompanyManagementServiceImpl) GetCompanyById(ctx context.Context, companyId uuid.UUID, userId uuid.UUID) web.CompanyPublicResponse {
// 	tx, err := service.DB.Begin()
// 	helper.PanicIfError(err)
// 	defer helper.CommitOrRollback(tx)

// 	// Find the company by ID
// 	company, err := service.CompanyRepository.FindById(ctx, tx, companyId)
// 	if err != nil {
// 		panic(exception.NewNotFoundError("Company not found"))
// 	}

// 	// Check if the user is following the company
// 	isFollowing := service.CompanyFollowerRepository.IsFollowing(ctx, tx, userId, companyId)

// 	// Get followers count
// 	followersCount := service.CompanyFollowerRepository.CountFollowersByCompanyId(ctx, tx, companyId)

// 	// Get membership information
// 	isPendingJoinRequest := service.CompanyJoinRequestRepository.IsPendingJoinRequest(ctx, tx, userId, companyId)
// 	isMember := false
// 	userRole := ""
// 	if memberInfo, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, companyId); err == nil {
// 		isMember = true
// 		userRole = string(memberInfo.Role)
// 	}

// 	// Check for pending edit requests
// 	hasPendingEdit := service.CompanyEditRequestRepository.HasPendingEdit(ctx, tx, companyId)

// 	// Get pending edit request ID if exists
// 	pendingEditId := ""
// 	if hasPendingEdit {
// 		editRequests := service.CompanyEditRequestRepository.FindByCompanyId(ctx, tx, companyId)
// 		for _, editRequest := range editRequests {
// 			if editRequest.Status == domain.CompanyEditRequestStatusPending {
// 				pendingEditId = editRequest.Id.String()
// 				break
// 			}
// 		}
// 	}

// 	response := web.CompanyPublicResponse{
// 		Id:          company.Id.String(),
// 		Name:        company.Name,
// 		LinkedinUrl: company.LinkedinUrl,
// 		Website:     company.Website,
// 		Industry:    company.Industry,
// 		Size:        company.Size,
// 		Type:        company.Type,
// 		Logo:        company.Logo,
// 		Tagline:     company.Tagline,
// 		IsVerified:  company.IsVerified,
// 		CreatedAt:   company.CreatedAt,
// 		UpdatedAt:   company.UpdatedAt,

// 		// Follow information
// 		IsFollowing:    isFollowing,
// 		FollowersCount: followersCount,

// 		// Membership information
// 		IsPendingJoinRequest: isPendingJoinRequest,
// 		IsMemberOfCompany:    isMember,
// 		UserRole:             userRole,

// 		// Edit information
// 		HasPendingEdit: hasPendingEdit,
// 		PendingEditId:  pendingEditId,
// 	}

// 	// Set owner information
// 	owner, err := service.UserRepository.FindById(ctx, tx, company.OwnerId)
// 	if err != nil {
// 		owner = domain.User{}
// 	}
// 	if owner.Id != uuid.Nil {
// 		response.Owner = &web.UserBasicInfo{
// 			Id:       owner.Id.String(),
// 			Name:     owner.Name,
// 			Username: owner.Username,
// 			Photo:    owner.Photo,
// 		}
// 	} else {
// 		response.Owner = nil
// 	}

// 	return response
// }

func (service *CompanyManagementServiceImpl) GetCompanyDetail(ctx context.Context, companyId uuid.UUID, userId uuid.UUID) web.CompanyDetailResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get company details
	company, err := service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Jika perusahaan sudah di-takedown dan user bukan pemiliknya, kembalikan error not found
	if company.TakenDownAt != nil && !company.IsVerified && company.OwnerId != userId {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Get owner information
	owner, err := service.UserRepository.FindById(ctx, tx, company.OwnerId)
	if err != nil {
		owner = domain.User{} // Set empty if not found
	}

	// Get follow information
	isFollowing := service.CompanyFollowerRepository.IsFollowing(ctx, tx, userId, companyId)
	followersCount := service.CompanyFollowerRepository.CountFollowersByCompanyId(ctx, tx, companyId)

	// Get membership information
	isPendingJoinRequest := service.CompanyJoinRequestRepository.IsPendingJoinRequest(ctx, tx, userId, companyId)
	var joinRequest domain.CompanyJoinRequest
	var joinRequestId *uuid.UUID = nil
	if isPendingJoinRequest {
		// If user has a pending join request, get the request ID
		joinRequest, err = service.CompanyJoinRequestRepository.FindByUserIdAndCompanyId(ctx, tx, userId, companyId)
		joinRequestId = &joinRequest.Id
		helper.PanicIfError(err)
	}

	// Check if user is member and get role
	isMember := false
	userRole := ""
	if memberInfo, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, companyId); err == nil {
		isMember = true
		userRole = string(memberInfo.Role)
	}

	// Check for pending edit requests
	hasPendingEdit := service.CompanyEditRequestRepository.HasPendingEdit(ctx, tx, companyId)
	pendingEditId := ""
	if hasPendingEdit {
		if editRequests := service.CompanyEditRequestRepository.FindByCompanyId(ctx, tx, companyId); len(editRequests) > 0 {
			for _, req := range editRequests {
				if req.Status == domain.CompanyEditRequestStatusPending {
					pendingEditId = req.Id.String()
					break
				}
			}
		}
	}

	// Check if user has reported this company
	isReported := false
	if service.ReportRepository != nil {
		isReported, _ = service.ReportRepository.HasReported(ctx, userId.String(), "company", companyId.String())
	}

	// Build response
	response := web.CompanyDetailResponse{
		Id:          company.Id.String(),
		Name:        company.Name,
		LinkedinUrl: company.LinkedinUrl,
		Website:     company.Website,
		Industry:    company.Industry,
		Size:        company.Size,
		Type:        company.Type,
		Logo:        company.Logo,
		Tagline:     company.Tagline,
		IsVerified:  company.IsVerified,
		CreatedAt:   company.CreatedAt,
		UpdatedAt:   company.UpdatedAt,
		TakenDownAt: company.TakenDownAt,

		// Follow information
		IsFollowing:    isFollowing,
		FollowersCount: followersCount,

		// Membership information
		IsPendingJoinRequest: isPendingJoinRequest,
		JoinRequestId:        joinRequestId,
		IsMemberOfCompany:    isMember,
		UserRole:             userRole,

		// Edit information
		HasPendingEdit: hasPendingEdit,
		PendingEditId:  pendingEditId,

		// Report information
		IsReported: isReported,
	}

	// Set owner info if available
	if owner.Id != uuid.Nil {
		response.Owner = &web.UserBasicInfo{
			Id:       owner.Id.String(),
			Name:     owner.Name,
			Username: owner.Username,
			Photo:    owner.Photo,
		}
	}

	return response
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

func (service *CompanyManagementServiceImpl) GetRandomCompanies(ctx context.Context, page, pageSize int) web.CompanyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	offset := (page - 1) * pageSize
	companies := service.CompanyRepository.FindRandomCompanies(ctx, tx, pageSize, offset)

	var responses []web.CompanyDetailResponse
	for _, company := range companies {
		response := web.CompanyDetailResponse{
			Id:          company.Id.String(),
			Name:        company.Name,
			LinkedinUrl: company.LinkedinUrl,
			Website:     company.Website,
			Industry:    company.Industry,
			Size:        company.Size,
			Type:        company.Type,
			Logo:        company.Logo,
			Tagline:     company.Tagline,
			IsVerified:  company.IsVerified,
			CreatedAt:   company.CreatedAt,
			UpdatedAt:   company.UpdatedAt,
		}
		responses = append(responses, response)
	}

	return web.CompanyListResponse{
		Companies: responses,
		Total:     len(responses),
		Limit:     pageSize,
		Offset:    offset,
	}
}

func (service *CompanyManagementServiceImpl) GetCompanyStats(ctx context.Context, companyId uuid.UUID) web.CompanyStatsResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Get total posts
	var totalPosts int
	err = tx.QueryRowContext(ctx, "SELECT COUNT(*) FROM company_posts WHERE company_id = $1 AND status != 'taken_down'", companyId).Scan(&totalPosts)
	helper.PanicIfError(err)

	// Get total job vacancies
	var totalJobVacancies int
	err = tx.QueryRowContext(ctx, "SELECT COUNT(*) FROM job_vacancies WHERE company_id = $1 AND taken_down_at IS NULL", companyId).Scan(&totalJobVacancies)
	helper.PanicIfError(err)

	// Get total members
	var totalMembers int
	err = tx.QueryRowContext(ctx, "SELECT COUNT(*) FROM member_company WHERE company_id = $1 AND status = 'active'", companyId).Scan(&totalMembers)
	helper.PanicIfError(err)

	// Get total applicants for all job vacancies of this company
	var totalApplicants int
	err = tx.QueryRowContext(ctx, `
        SELECT COUNT(*) 
        FROM job_applications ja 
        JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id 
        WHERE jv.company_id = $1
    `, companyId).Scan(&totalApplicants)
	helper.PanicIfError(err)

	return web.CompanyStatsResponse{
		TotalPosts:        totalPosts,
		TotalJobVacancies: totalJobVacancies,
		TotalMembers:      totalMembers,
		TotalApplicants:   totalApplicants,
	}
}
