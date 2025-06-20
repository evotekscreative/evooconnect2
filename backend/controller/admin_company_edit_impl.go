package controller

import (
	"encoding/json"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type AdminCompanyEditControllerImpl struct {
	CompanyManagementService service.CompanyManagementService
}

func NewAdminCompanyEditController(companyManagementService service.CompanyManagementService) AdminCompanyEditController {
	return &AdminCompanyEditControllerImpl{
		CompanyManagementService: companyManagementService,
	}
}

func (controller *AdminCompanyEditControllerImpl) GetAllEditRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10
	offset := 0

	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
			limit = parsedLimit
		}
	}

	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil {
			offset = parsedOffset
		}
	}

	editRequests := controller.CompanyManagementService.GetAllEditRequests(request.Context(), limit, offset)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   editRequests,
	})
}

func (controller *AdminCompanyEditControllerImpl) GetEditRequestsByStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	status := params.ByName("status")
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10
	offset := 0

	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
			limit = parsedLimit
		}
	}

	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil {
			offset = parsedOffset
		}
	}

	editRequests := controller.CompanyManagementService.GetEditRequestsByStatus(request.Context(), status, limit, offset)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   editRequests,
	})
}

func (controller *AdminCompanyEditControllerImpl) GetEditRequestDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	editRequest := controller.CompanyManagementService.GetEditRequestDetail(request.Context(), requestId)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   editRequest,
	})
}

func (controller *AdminCompanyEditControllerImpl) ReviewEditRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	reviewerIdStr := request.Context().Value("admin_id").(string)
	reviewerId, err := uuid.Parse(reviewerIdStr)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid reviewer ID",
		})
		return
	}

	var reviewRequest web.ReviewCompanyEditRequestRequest
	err = json.NewDecoder(request.Body).Decode(&reviewRequest)
	if err != nil {
		helper.WriteJSON(writer, http.StatusBadRequest, web.APIResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Error:  "Invalid request body",
		})
		return
	}

	result := controller.CompanyManagementService.ReviewEditRequest(request.Context(), requestId, reviewerId, reviewRequest)

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   result,
	})
}

func (controller *AdminCompanyEditControllerImpl) GetEditRequestStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	stats := controller.CompanyManagementService.GetEditRequestStats(request.Context())

	helper.WriteJSON(writer, http.StatusOK, web.APIResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   stats,
	})
}
