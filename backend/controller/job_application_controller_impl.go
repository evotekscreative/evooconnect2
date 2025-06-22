package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type JobApplicationControllerImpl struct {
	JobApplicationService service.JobApplicationService
}

func NewJobApplicationController(jobApplicationService service.JobApplicationService) JobApplicationController {
	return &JobApplicationControllerImpl{
		JobApplicationService: jobApplicationService,
	}
}

func (controller *JobApplicationControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse job vacancy ID from URL
	jobVacancyIdStr := params.ByName("jobVacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid job vacancy ID format",
		})
		return
	}

	// Parse multipart form for file upload
	err = request.ParseMultipartForm(10 << 20) // 10MB limit
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Failed to parse form data",
		})
		return
	}

	// Create request object
	applicationRequest := web.CreateJobApplicationRequest{}

	// Handle CV file upload
	cvFile, _, err := request.FormFile("cv_file")
	if err == nil {
		defer cvFile.Close()
		fileHeader, err := helper.GetFileHeaderFromForm(request, "cv_file")
		helper.PanicIfError(err)
		applicationRequest.CvFile = fileHeader
	}

	// Parse existing CV path if no file uploaded
	if applicationRequest.CvFile == nil {
		existingCvPath := request.FormValue("existing_cv_path")
		if existingCvPath != "" {
			applicationRequest.ExistingCvPath = &existingCvPath
		}
	}

	// Parse contact info
	applicationRequest.ContactInfo = web.ContactInfoRequest{
		Phone:    request.FormValue("contact_phone"),
		Email:    request.FormValue("contact_email"),
		Address:  request.FormValue("contact_address"),
		LinkedIn: request.FormValue("contact_linkedin"),
	}

	// Parse optional fields
	motivationLetter := request.FormValue("motivation_letter")
	if motivationLetter != "" {
		applicationRequest.MotivationLetter = &motivationLetter
	}

	coverLetter := request.FormValue("cover_letter")
	if coverLetter != "" {
		applicationRequest.CoverLetter = &coverLetter
	}

	expectedSalaryStr := request.FormValue("expected_salary")
	if expectedSalaryStr != "" {
		if expectedSalary, err := strconv.ParseFloat(expectedSalaryStr, 64); err == nil {
			applicationRequest.ExpectedSalary = &expectedSalary
		}
	}

	availableStartDateStr := request.FormValue("available_start_date")
	if availableStartDateStr != "" {
		if availableStartDate, err := helper.ParseDateString(availableStartDateStr); err == nil {
			applicationRequest.AvailableStartDate = &availableStartDate
		}
	}

	// Create application
	jobApplicationResponse := controller.JobApplicationService.Create(request.Context(), applicationRequest, jobVacancyId, userId)

	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse application ID from URL
	applicationIdStr := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid application ID format",
		})
		return
	}

	// Parse multipart form for file upload
	err = request.ParseMultipartForm(10 << 20) // 10MB limit
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Failed to parse form data",
		})
		return
	}

	// Create request object
	applicationRequest := web.UpdateJobApplicationRequest{}

	// Handle CV file upload
	cvFile, _, err := request.FormFile("cv_file")
	if err == nil {
		defer cvFile.Close()
		fileHeader, err := helper.GetFileHeaderFromForm(request, "cv_file")
		helper.PanicIfError(err)
		applicationRequest.CvFile = fileHeader
	}

	// Parse existing CV path if no file uploaded
	if applicationRequest.CvFile == nil {
		existingCvPath := request.FormValue("existing_cv_path")
		if existingCvPath != "" {
			applicationRequest.ExistingCvPath = &existingCvPath
		}
	}

	// Parse contact info
	applicationRequest.ContactInfo = web.ContactInfoRequest{
		Phone:    request.FormValue("contact_phone"),
		Email:    request.FormValue("contact_email"),
		Address:  request.FormValue("contact_address"),
		LinkedIn: request.FormValue("contact_linkedin"),
	}

	// Parse optional fields
	motivationLetter := request.FormValue("motivation_letter")
	if motivationLetter != "" {
		applicationRequest.MotivationLetter = &motivationLetter
	}

	coverLetter := request.FormValue("cover_letter")
	if coverLetter != "" {
		applicationRequest.CoverLetter = &coverLetter
	}

	expectedSalaryStr := request.FormValue("expected_salary")
	if expectedSalaryStr != "" {
		if expectedSalary, err := strconv.ParseFloat(expectedSalaryStr, 64); err == nil {
			applicationRequest.ExpectedSalary = &expectedSalary
		}
	}

	availableStartDateStr := request.FormValue("available_start_date")
	if availableStartDateStr != "" {
		if availableStartDate, err := helper.ParseDateString(availableStartDateStr); err == nil {
			applicationRequest.AvailableStartDate = &availableStartDate
		}
	}

	// Update application
	jobApplicationResponse := controller.JobApplicationService.Update(request.Context(), applicationRequest, applicationId, userId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse application ID from URL
	applicationIdStr := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid application ID format",
		})
		return
	}

	controller.JobApplicationService.Delete(request.Context(), applicationId, userId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   "Application deleted successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse application ID from URL
	applicationIdStr := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid application ID format",
		})
		return
	}

	jobApplicationResponse := controller.JobApplicationService.FindById(request.Context(), applicationId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindByJobVacancy(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse job vacancy ID from URL
	jobVacancyIdStr := params.ByName("jobVacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid job vacancy ID format",
		})
		return
	}

	// Parse query parameters
	status := request.URL.Query().Get("status")
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // default
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offset := 0 // default
	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	jobApplicationResponse := controller.JobApplicationService.FindByJobVacancyId(request.Context(), jobVacancyId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindByApplicant(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse applicant ID from URL (optional, defaults to current user)
	applicantIdStr := params.ByName("applicantId")
	var applicantId uuid.UUID

	if applicantIdStr != "" {
		applicantId, err = uuid.Parse(applicantIdStr)
		if err != nil {
			helper.WriteToResponseBody(writer, web.WebResponse{
				Code:   http.StatusBadRequest,
				Status: "BAD REQUEST",
				Data:   "Invalid applicant ID format",
			})
			return
		}
	} else {
		applicantId = userId
	}

	// Check authorization
	if applicantId != userId {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "You can only view your own applications",
		})
		return
	}

	// Parse query parameters
	status := request.URL.Query().Get("status")
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // default
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offset := 0 // default
	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	jobApplicationResponse := controller.JobApplicationService.FindByApplicantId(request.Context(), applicantId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindByCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	_, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse company ID from URL (optional, defaults to user's company)
	companyIdStr := params.ByName("companyId")
	var companyId uuid.UUID

	if companyIdStr != "" {
		companyId, err = uuid.Parse(companyIdStr)
		if err != nil {
			helper.WriteToResponseBody(writer, web.WebResponse{
				Code:   http.StatusBadRequest,
				Status: "BAD REQUEST",
				Data:   "Invalid company ID format",
			})
			return
		}
	} else {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Company ID is required",
		})
		return
	}

	// Check authorization
	// if userClaims.CompanyId != nil && *userClaims.CompanyId != companyId {
	// 	helper.WriteToResponseBody(writer, web.WebResponse{
	// 		Code:   http.StatusForbidden,
	// 		Status: "FORBIDDEN",
	// 		Data:   "You can only view applications for your company",
	// 	})
	// 	return
	// }

	// Parse query parameters
	status := request.URL.Query().Get("status")
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // default
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offset := 0 // default
	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	jobApplicationResponse := controller.JobApplicationService.FindByCompanyId(request.Context(), companyId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindWithFilters(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse query parameters
	var filterRequest web.JobApplicationFilterRequest

	// Parse UUID parameters
	if jobVacancyIdStr := request.URL.Query().Get("job_vacancy_id"); jobVacancyIdStr != "" {
		if jobVacancyId, err := uuid.Parse(jobVacancyIdStr); err == nil {
			filterRequest.JobVacancyId = &jobVacancyId
		}
	}

	if applicantIdStr := request.URL.Query().Get("applicant_id"); applicantIdStr != "" {
		if applicantId, err := uuid.Parse(applicantIdStr); err == nil {
			filterRequest.ApplicantId = &applicantId
		}
	}

	if reviewedByStr := request.URL.Query().Get("reviewed_by"); reviewedByStr != "" {
		if reviewedBy, err := uuid.Parse(reviewedByStr); err == nil {
			filterRequest.ReviewedBy = &reviewedBy
		}
	}

	if companyIdStr := request.URL.Query().Get("company_id"); companyIdStr != "" {
		if companyId, err := uuid.Parse(companyIdStr); err == nil {
			filterRequest.CompanyId = &companyId
		}
	}

	// Parse string parameters
	filterRequest.Status = request.URL.Query().Get("status")
	filterRequest.Search = request.URL.Query().Get("search")

	// Parse pagination
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	filterRequest.Limit = 10 // default
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			filterRequest.Limit = parsedLimit
		}
	}

	filterRequest.Offset = 0 // default
	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			filterRequest.Offset = parsedOffset
		}
	}

	jobApplicationResponse := controller.JobApplicationService.FindWithFilters(request.Context(), filterRequest)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) ReviewApplication(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse application ID from URL
	applicationIdStr := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid application ID format",
		})
		return
	}

	reviewRequest := web.ReviewJobApplicationRequest{}
	helper.ReadFromRequestBody(request, &reviewRequest)

	jobApplicationResponse := controller.JobApplicationService.ReviewApplication(request.Context(), reviewRequest, applicationId, userId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) GetStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	_, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	var companyId *uuid.UUID

	// Parse company ID from URL or use user's company
	companyIdStr := params.ByName("companyId")
	if companyIdStr != "" {
		if parsedCompanyId, err := uuid.Parse(companyIdStr); err == nil {
			companyId = &parsedCompanyId
		}
	}

	// Check authorization for company-specific stats
	// if companyId != nil {
	// 	if userClaims.Role != "hr" && userClaims.Role != "company_admin" && userClaims.Role != "super_admin" {
	// 		helper.WriteToResponseBody(writer, web.WebResponse{
	// 			Code:   http.StatusForbidden,
	// 			Status: "FORBIDDEN",
	// 			Data:   "You don't have permission to view company statistics",
	// 		})
	// 		return
	// 	}

	// 	if userClaims.Role != "super_admin" && userClaims.CompanyId != nil && *userClaims.CompanyId != *companyId {
	// 		helper.WriteToResponseBody(writer, web.WebResponse{
	// 			Code:   http.StatusForbidden,
	// 			Status: "FORBIDDEN",
	// 			Data:   "You can only view statistics for your company",
	// 		})
	// 		return
	// 	}
	// }

	statsResponse := controller.JobApplicationService.GetStats(request.Context(), companyId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   statsResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) CheckApplicationStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse job vacancy ID from URL
	jobVacancyIdStr := params.ByName("jobVacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid job vacancy ID format",
		})
		return
	}

	hasApplied := controller.JobApplicationService.HasApplied(request.Context(), jobVacancyId, userId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data: map[string]bool{
			"has_applied": hasApplied,
		},
	}

	helper.WriteToResponseBody(writer, webResponse)
}
