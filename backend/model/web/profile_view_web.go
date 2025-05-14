package web

import (
	"github.com/google/uuid"
	"time"
)

type ProfileViewerResponse struct {
	Id          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Username    string    `json:"username"`
	Photo       string    `json:"photo"`
	IsConnected bool      `json:"is_connected"`
	ViewedAt    time.Time `json:"viewed_at"`
}

type ProfileViewsResponse struct {
	Count       int                     `json:"count"`
	Viewers     []ProfileViewerResponse `json:"viewers"`
	PeriodStart time.Time               `json:"period_start"`
	PeriodEnd   time.Time               `json:"period_end"`
}
