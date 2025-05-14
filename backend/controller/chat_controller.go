package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type ChatController interface {
	// Conversation operations
	CreateConversation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetConversation(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetConversations(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	MarkConversationAsRead(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Message operations
	SendMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	SendFileMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetMessages(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	DeleteMessage(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

	// Pusher Auth
	AuthPusher(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
