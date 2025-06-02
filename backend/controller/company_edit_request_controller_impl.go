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

func (controller *CompanyManagementControllerImpl) GetMyCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid user ID",
		})
		return
	}

	companies := controller.CompanyManagementService.GetMyCompanies(request.Context(), userId)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   companies,
	})
}

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

	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid user ID",
		})
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

	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid user ID",
		})
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
	userIdStr := request.Context().Value("user_id").(string)
	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid user ID",
		})
		return
	}

	editRequests := controller.CompanyManagementService.GetMyEditRequests(request.Context(), userId)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   editRequests,
	})
}
