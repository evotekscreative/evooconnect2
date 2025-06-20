package web

// RequestCountResponse adalah respons untuk endpoint countrequestinvitation
type RequestCountResponse struct {
	ConnectionRequests int `json:"connection_requests"`
	GroupInvitations   int `json:"group_invitations"`
	Total              int `json:"total"`
}