package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type NotificationController interface {
	GetNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	MarkAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	MarkAllAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	AuthPusher(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	DeleteNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) // Hapus semua atau berdasarkan kategori
	DeleteSelectedNotifications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) // Hapus berdasarkan ID yang dipilih
}
