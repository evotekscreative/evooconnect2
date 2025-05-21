package web

import (
	"time"
)

type SearchResponse struct {
    Users  []UserSearchResult  `json:"users,omitempty"`
    Posts  []PostSearchResult  `json:"posts,omitempty"`
    Blogs  []BlogSearchResult  `json:"blogs,omitempty"`
    Groups []GroupSearchResult `json:"groups,omitempty"`
}

type UserSearchResult struct {
    Id          string  `json:"id"`
    Name        string  `json:"name"`
    Username    string  `json:"username"`
    Photo       string  `json:"photo"`
    Headline    *string `json:"headline,omitempty"`
    IsConnected bool    `json:"is_connected"`
    Highlight   string  `json:"highlight,omitempty"` 
}

type PostSearchResult struct {
    Id        string          `json:"id"`
    Content   string          `json:"content"`
    CreatedAt time.Time       `json:"created_at"`
    User      UserSearchResult `json:"user"`
    Highlight string          `json:"highlight,omitempty"` 
}

type BlogSearchResult struct {
    Id        string          `json:"id"`
    Title     string          `json:"title"`
    Content   string          `json:"content"`
    CreatedAt string          `json:"created_at"`
    User      UserSearchResult `json:"user"`
    Highlight string          `json:"highlight,omitempty"` 
}

type GroupSearchResult struct {
    Id          string `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    Image       string `json:"image"`      
    MemberCount int    `json:"member_count"`
    IsMember    bool   `json:"is_member"`
}