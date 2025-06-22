package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"mime/multipart"
	"net/http"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type CompanyManagementControllerImpl struct {
	CompanyManagementService service.CompanyManagementService
}

func NewCompanyManagementController(companyManagementService service.CompanyManagementService) CompanyManagementController {
	return &CompanyManagementControllerImpl{
		CompanyManagementService: companyManagementService,
	}
}

func (controller *CompanyManagementControllerImpl) GetAllCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)
	if userId == uuid.Nil {
		helper.NewBadRequestError("Invalid user ID")
		return
	}

	limit, offset, err := helper.GetPaginationParams(request)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid pagination parameters",
		})
		return
	}

	companies := controller.CompanyManagementService.GetAllCompanies(request.Context(), userId, limit, offset)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   companies,
	})
}

func (controller *CompanyManagementControllerImpl) GetMyCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)
	if userId == uuid.Nil {
		helper.NewBadRequestError("Invalid user ID")
		return
	}

	companies := controller.CompanyManagementService.GetMyCompanies(request.Context(), userId)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   companies,
	})
}

// func (controller *CompanyManagementControllerImpl) GetCompanyById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
// 	companyIdStr := params.ByName("companyId")
// 	companyId, err := uuid.Parse(companyIdStr)
// 	if err != nil {
// 		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
// 			Code:   http.StatusBadRequest,
// 			Status: "BAD_REQUEST",
// 			Error:  "Invalid company ID",
// 		})
// 		return
// 	}
// 	userId, err := helper.GetUserIdFromToken(request)
// 	helper.PanicIfError(err)
// 	if userId == uuid.Nil {
// 		helper.NewBadRequestError("Invalid user ID")
// 		return
// 	}
// 	company := controller.CompanyManagementService.GetCompanyById(request.Context(), companyId, userId)

// 	// If company found, return 200 OK with company data
// 	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
// 		Code:   http.StatusOK,
// 		Status: "OK",
// 		Data:   company,
// 	})
// }

func (controller *CompanyManagementControllerImpl) GetCompanyDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid company ID",
		})
		return
	}

	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)
	if userId == uuid.Nil {
		helper.NewBadRequestError("Invalid user ID")
		return
	}

	company := controller.CompanyManagementService.GetCompanyDetail(request.Context(), companyId, userId)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   company,
	})
}

func (controller *CompanyManagementControllerImpl) RequestEdit(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid company ID",
		})
		return
	}

	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)
	if userId == uuid.Nil {
		helper.NewBadRequestError("Invalid user ID")
		return
	}

	// Parse multipart form
	err = request.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Failed to parse form data",
		})
		return
	}

	// Parse individual form fields
	editRequest := web.CreateCompanyEditRequestRequest{
		Name:        request.FormValue("name"),
		LinkedinUrl: request.FormValue("linkedin_url"),
		Website:     request.FormValue("website"),
		Industry:    request.FormValue("industry"),
		Size:        request.FormValue("size"),
		Type:        request.FormValue("type"),
		Tagline:     request.FormValue("tagline"),
	}

	// Get logo file if provided
	var logoFileHeader *multipart.FileHeader
	logoFile, logoFileHeader, err := request.FormFile("logo")
	if err == nil {
		logoFile.Close() // Close the file after getting the header
	} else {
		logoFileHeader = nil // No file provided
	}

	result := controller.CompanyManagementService.RequestEdit(request.Context(), companyId, userId, editRequest, logoFileHeader)

	helper.WriteJSON(writer, http.StatusCreated, web.APIResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   result,
	})
}

func (controller *CompanyManagementControllerImpl) GetMyEditRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)
	if userId == uuid.Nil {
		helper.NewBadRequestError("Invalid user ID")
		return
	}

	editRequests := controller.CompanyManagementService.GetMyEditRequests(request.Context(), userId)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   editRequests,
	})
}

func (controller *CompanyManagementControllerImpl) DeleteCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid request ID",
		})
		return
	}

	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)
	if userId == uuid.Nil {
		helper.NewBadRequestError("Invalid user ID")
		return
	}

	err = controller.CompanyManagementService.DeleteCompany(request.Context(), companyId, userId)
	if err != nil {
		helper.WriteJSON(writer, http.StatusInternalServerError, web.APIResponse{
			Code:   http.StatusInternalServerError,
			Status: "INTERNAL_SERVER_ERROR",
			Error:  err.Error(),
		})
		return
	}

	helper.WriteJSON(writer, http.StatusNoContent, web.APIResponse{
		Code:   http.StatusNoContent,
		Status: "NO_CONTENT",
	})
}

func (controller *CompanyManagementControllerImpl) DeleteCompanyEditRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	requestIdStr := params.ByName("requestId")
	requestId, err := uuid.Parse(requestIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid request ID",
		})
		return
	}

	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)
	if userId == uuid.Nil {
		helper.NewBadRequestError("Invalid user ID")
		return
	}

	err = controller.CompanyManagementService.DeleteCompanyEditRequest(request.Context(), requestId, userId)
	if err != nil {
		helper.WriteJSON(writer, http.StatusInternalServerError, web.APIResponse{
			Code:   http.StatusInternalServerError,
			Status: "INTERNAL_SERVER_ERROR",
			Error:  err.Error(),
		})
		return
	}

	helper.WriteJSON(writer, http.StatusNoContent, web.APIResponse{
		Code:   http.StatusNoContent,
		Status: "NO_CONTENT",
	})
}
