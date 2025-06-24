package controller

import (
	"net/http"
	"github.com/julienschmidt/httprouter"
)

type AdminNotificationController interface {
    GetNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    MarkAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    MarkAllAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    DeleteNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}