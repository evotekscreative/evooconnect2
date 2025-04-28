package web

import "time"

// ConnectionRequestCreate represents a request to create a connection request
type ConnectionRequestCreate struct {
	Message *string `json:"message"`
}

// ConnectionRequestResponse represents a response for a connection request
type ConnectionRequestResponse struct {
	Id        string     `json:"id"`
	Status    string     `json:"status"`
	Message   *string    `json:"message,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Sender    *UserShort `json:"sender,omitempty"`
	Receiver  *UserShort `json:"receiver,omitempty"`
}

// ConnectionRequestListResponse represents a response for a list of connection requests
type ConnectionRequestListResponse struct {
	Requests []ConnectionRequestResponse `json:"requests"`
	Total    int                         `json:"total"`
}

// ConnectionResponse represents a response for a connection
type ConnectionResponse struct {
	Id        string     `json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	User      *UserShort `json:"user"`
}

// ConnectionListResponse represents a response for a list of connections
type ConnectionListResponse struct {
	Connections []ConnectionResponse `json:"connections"`
	Total       int                  `json:"total"`
}

// UserShort represents a shortened user response with basic info
type UserShort struct {
	Id       string  `json:"id"`
	Name     string  `json:"name"`
	Username string  `json:"username"`
	Headline *string `json:"headline,omitempty"`
	Photo    *string `json:"photo,omitempty"`
}
