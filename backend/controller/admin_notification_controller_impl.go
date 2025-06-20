package controller

import (
    "evoconnect/backend/helper"
    "evoconnect/backend/model/web"
    "evoconnect/backend/service"
    "github.com/julienschmidt/httprouter"
    "net/http"
    "strconv"
)

type AdminNotificationControllerImpl struct {
    AdminNotificationService service.AdminNotificationService
}

func NewAdminNotificationController(adminNotificationService service.AdminNotificationService) AdminNotificationController {
    return &AdminNotificationControllerImpl{
        AdminNotificationService: adminNotificationService,
    }
}

func (controller *AdminNotificationControllerImpl) GetNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Parse query params
    limit := 10
    offset := 0
    category := request.URL.Query().Get("category")

    limitParam := request.URL.Query().Get("limit")
    if limitParam != "" {
        parsedLimit, err := strconv.Atoi(limitParam)
        if err == nil && parsedLimit > 0 {
            limit = parsedLimit
        }
    }

    offsetParam := request.URL.Query().Get("offset")
    if offsetParam != "" {
        parsedOffset, err := strconv.Atoi(offsetParam)
        if err == nil && parsedOffset >= 0 {
            offset = parsedOffset
        }
    }

    notificationListResponse := controller.AdminNotificationService.GetNotifications(request.Context(), category, limit, offset)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   notificationListResponse,
    }

    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AdminNotificationControllerImpl) MarkAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    markReadRequest := web.MarkNotificationReadRequest{}
    helper.ReadFromRequestBody(request, &markReadRequest)

    unreadCount := controller.AdminNotificationService.MarkAsRead(request.Context(), markReadRequest)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data: map[string]interface{}{
            "unread_count": unreadCount,
        },
    }

    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AdminNotificationControllerImpl) MarkAllAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    category := request.URL.Query().Get("category")

    unreadCount := controller.AdminNotificationService.MarkAllAsRead(request.Context(), category)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data: map[string]interface{}{
            "unread_count": unreadCount,
        },
    }

    helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AdminNotificationControllerImpl) DeleteNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    category := request.URL.Query().Get("category")

    deletedCount := controller.AdminNotificationService.DeleteNotifications(request.Context(), category)

    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data: map[string]interface{}{
            "deleted_count": deletedCount,
            "message":       "Admin notifications deleted successfully",
        },
    }

    helper.WriteToResponseBody(writer, webResponse)
}
