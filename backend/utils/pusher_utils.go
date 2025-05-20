package utils

import (
	"evoconnect/backend/helper"

	"github.com/pusher/pusher-http-go/v5"
)

var PusherClient *pusher.Client

func InitPusherClient() {
	PusherClient = &pusher.Client{
		AppID:   helper.GetEnv("PUSHER_APP_ID", "your-app-id"),
		Key:     helper.GetEnv("PUSHER_KEY", "your-key"),
		Secret:  helper.GetEnv("PUSHER_SECRET", "your-secret"),
		Cluster: helper.GetEnv("PUSHER_CLUSTER", "your-cluster"),
		Secure:  true,
	}
}
