package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type UserCvStorageControllerImpl struct {
	UserCvStorageService service.UserCvStorageService
}

func NewUserCvStorageController(userCvStorageService service.UserCvStorageService) UserCvStorageController {
	return &UserCvStorageControllerImpl{
		UserCvStorageService: userCvStorageService,
	}
}

func (controller *UserCvStorageControllerImpl) UploadCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse user ID from URL (optional, defaults to current user)
	paramUserIdStr := params.ByName("userId")
	var paramUserId uuid.UUID

	if paramUserIdStr != "" {
		paramUserId, err = uuid.Parse(paramUserIdStr)
		if err != nil {
			helper.WriteToResponseBody(writer, web.WebResponse{
				Code:   http.StatusBadRequest,
				Status: "BAD REQUEST",
				Data:   "Invalid user ID format",
			})
			return
		}
	}

	// Check authorization
	if paramUserId != userId {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "You can only upload CV for your own account",
		})
		return
	}

	// Parse multipart form
	err = request.ParseMultipartForm(10 << 20) // 10MB limit
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Failed to parse form data",
		})
		return
	}

	// Get file from form
	fileHeader, err := helper.GetFileHeaderFromForm(request, "cv_file")
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "No file found for field 'cv_file'",
		})
		return
	}

	uploadResponse := controller.UserCvStorageService.UploadCv(request.Context(), fileHeader, userId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   uploadResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserCvStorageControllerImpl) GetUserCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse user ID from URL (optional, defaults to current user)
	paramUserIdStr := params.ByName("userId")
	var paramUserId uuid.UUID

	if paramUserIdStr != "" {
		paramUserId, err = uuid.Parse(paramUserIdStr)
		if err != nil {
			helper.WriteToResponseBody(writer, web.WebResponse{
				Code:   http.StatusBadRequest,
				Status: "BAD REQUEST",
				Data:   "Invalid user ID format",
			})
			return
		}
	}

	// Check authorization
	if paramUserId != userId {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "You can only view your own CV",
		})
		return
	}

	cvResponse := controller.UserCvStorageService.GetUserCv(request.Context(), paramUserId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   cvResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserCvStorageControllerImpl) DeleteCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get authenticated user
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse user ID from URL (optional, defaults to current user)
	paramUserIdStr := params.ByName("userId")
	var paramUserId uuid.UUID

	if paramUserIdStr != "" {
		paramUserId, err = uuid.Parse(paramUserIdStr)
		if err != nil {
			helper.WriteToResponseBody(writer, web.WebResponse{
				Code:   http.StatusBadRequest,
				Status: "BAD REQUEST",
				Data:   "Invalid user ID format",
			})
			return
		}
	}

	// Check authorization
	if paramUserId != userId {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "You can only delete your own CV",
		})
		return
	}

	controller.UserCvStorageService.DeleteCv(request.Context(), paramUserId)

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   "CV deleted successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *UserCvStorageControllerImpl) DownloadCv(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// // Get authenticated user
	// userClaims := middleware.GetUserFromContext(request.Context())

	// Parse user ID from URL
	paramUserIdStr := params.ByName("userId")
	paramUserId, err := uuid.Parse(paramUserIdStr)
	if err != nil {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   "Invalid user ID format",
		})
		return
	}

	// Check authorization
	canDownload := false

	// Job seeker can download their own CV
	if userId == paramUserId {
		canDownload = true
	}

	// HR and company admin can download CVs (they'll be checked in service for company authorization)
	// if userClaims.Role == "hr" || userClaims.Role == "company_admin" || userClaims.Role == "super_admin" {
	// 	canDownload = true
	// }

	if !canDownload {
		helper.WriteToResponseBody(writer, web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "You don't have permission to download this CV",
		})
		return
	}

	// Get CV info
	cvInfo := controller.UserCvStorageService.GetUserCv(request.Context(), userId)

	// Set response headers for file download
	writer.Header().Set("Content-Disposition", "attachment; filename=\""+cvInfo.OriginalFilename+"\"")
	writer.Header().Set("Content-Type", "application/octet-stream")

	// Get file extension for content type
	ext := filepath.Ext(cvInfo.OriginalFilename)
	switch ext {
	case ".pdf":
		writer.Header().Set("Content-Type", "application/pdf")
	case ".doc":
		writer.Header().Set("Content-Type", "application/msword")
	case ".docx":
		writer.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	}

	// Serve file
	http.ServeFile(writer, request, cvInfo.CvFilePath)
}
