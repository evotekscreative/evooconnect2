package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"github.com/google/uuid"
	"evoconnect/backend/model/domain"
)

type SearchServiceImpl struct {
	DB                   *sql.DB
	UserRepository       repository.UserRepository
	PostRepository       repository.PostRepository
	BlogRepository       repository.BlogRepository
	GroupRepository      repository.GroupRepository
	ConnectionRepository repository.ConnectionRepository
}

func NewSearchService(
	db *sql.DB,
	userRepository repository.UserRepository,
	postRepository repository.PostRepository,
	blogRepository repository.BlogRepository,
	groupRepository repository.GroupRepository,
	connectionRepository repository.ConnectionRepository,
) SearchService {
	return &SearchServiceImpl{
		DB:                   db,
		UserRepository:       userRepository,
		PostRepository:       postRepository,
		BlogRepository:       blogRepository,
		GroupRepository:      groupRepository,
		ConnectionRepository: connectionRepository,
	}
}

func (service *SearchServiceImpl) Search(ctx context.Context, query string, searchType string, limit int, offset int, currentUserId uuid.UUID) web.SearchResponse {
	response := web.SearchResponse{}
	fmt.Printf("Search service called with query: '%s', type: '%s', limit: %d, offset: %d\n", query, searchType, limit, offset)

	// Jika tidak ada query, kembalikan response kosong
	if query == "" {
		fmt.Println("Empty query, returning empty response")
		return response
	}

	// Set default limit jika tidak ditentukan
	if limit <= 0 {
		limit = 10
	}

	// Cari berdasarkan tipe
	if searchType == "all" || searchType == "user" {
		fmt.Println("Searching users...")
		users := service.searchUsers(ctx, query, limit, offset, currentUserId)
		response.Users = users
		fmt.Printf("Found %d users\n", len(users))
	}

	if searchType == "all" || searchType == "post" {
		fmt.Println("Searching posts...")
		posts := service.searchPosts(ctx, query, limit, offset, currentUserId)
		response.Posts = posts
		fmt.Printf("Found %d posts\n", len(posts))
	}

	if searchType == "all" || searchType == "blog" {
		fmt.Println("Searching blogs...")
		blogs := service.searchBlogs(ctx, query, limit, offset, currentUserId)
		response.Blogs = blogs
		fmt.Printf("Found %d blogs\n", len(blogs))
	}

	if searchType == "all" || searchType == "group" {
		fmt.Println("Searching groups...")
		groups := service.searchGroups(ctx, query, limit, offset, currentUserId) // Teruskan currentUserId
		response.Groups = groups
		fmt.Printf("Found %d groups\n", len(groups))
	}

	return response
}

func (service *SearchServiceImpl) searchUsers(ctx context.Context, query string, limit int, offset int, currentUserId uuid.UUID) []web.UserSearchResult {
    tx, err := service.DB.Begin()
    if err != nil {
        fmt.Printf("Error starting transaction for user search: %v\n", err)
        return []web.UserSearchResult{}
    }

    fmt.Printf("Searching users with query: '%s'\n", query)
    users := service.UserRepository.Search(ctx, tx, query, limit, offset)
    fmt.Printf("User repository returned %d users\n", len(users))

    var results []web.UserSearchResult
    for _, user := range users {
        // Log user IDs untuk debugging
        fmt.Printf("DEBUG: Checking connection between currentUserId=%s and userId=%s\n", 
                  currentUserId.String(), user.Id.String())
        
        isConnected := service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, user.Id)
        fmt.Printf("DEBUG: isConnected=%v\n", isConnected)

        // Check for connection request status
        var isConnectedRequest string = "none"

        // Jika sudah terhubung, set status ke "accepted"
        if isConnected {
            isConnectedRequest = "accepted"
            fmt.Printf("DEBUG: Users are connected, setting isConnectedRequest to 'accepted'\n")
        } else {
            // Jika belum terhubung, cek apakah ada permintaan koneksi
            fmt.Printf("DEBUG: Checking connection request from currentUser to user\n")
            request, err := service.ConnectionRepository.FindConnectionRequestBySenderIdAndReceiverId(ctx, tx, currentUserId, user.Id)
            if err == nil {
                // Request ditemukan, set status
                isConnectedRequest = string(request.Status)
                fmt.Printf("DEBUG: Found request from currentUser to user with status: %s\n", isConnectedRequest)
            } else {
                // Cek apakah ada permintaan dari user ini ke current user
                fmt.Printf("DEBUG: Checking connection request from user to currentUser\n")
                request, err = service.ConnectionRepository.FindConnectionRequestBySenderIdAndReceiverId(ctx, tx, user.Id, currentUserId)
                if err == nil {
                    isConnectedRequest = string(request.Status)
                    fmt.Printf("DEBUG: Found request from user to currentUser with status: %s\n", isConnectedRequest)
                } else {
                    fmt.Printf("DEBUG: No connection request found in either direction\n")
                }
            }
        }

        result := web.UserSearchResult{
            Id:                 user.Id.String(),
            Name:               user.Name,
            Username:           user.Username,
            Photo:              user.Photo,
            Headline:           &user.Headline,
            IsConnected:        isConnected,
            IsConnectedRequest: isConnectedRequest,
        }
        results = append(results, result)
        fmt.Printf("Added user to results: %s (%s), isConnected: %v, isConnectedRequest: %s\n",
            user.Name, user.Username, isConnected, isConnectedRequest)
    }

    err = tx.Commit()
    if err != nil {
        fmt.Printf("Error committing transaction for user search: %v\n", err)
        tx.Rollback()
    }
    return results
}

func (service *SearchServiceImpl) searchPosts(ctx context.Context, query string, limit int, offset int, currentUserId uuid.UUID) []web.PostSearchResult {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("Error starting transaction for post search: %v\n", err)
		return []web.PostSearchResult{}
	}

	fmt.Printf("Searching posts with query: '%s'\n", query)
	posts := service.PostRepository.Search(ctx, tx, query, limit, offset)
	fmt.Printf("Post repository returned %d posts\n", len(posts))

	var results []web.PostSearchResult
	for _, post := range posts {
		if post.User == nil {
			fmt.Println("Skipping post with nil user")
			continue
		}

		isConnected := service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, post.User.Id)

		userResult := web.UserSearchResult{
			Id:          post.User.Id.String(),
			Name:        post.User.Name,
			Username:    post.User.Username,
			Photo:       post.User.Photo,
			IsConnected: isConnected,
		}

		result := web.PostSearchResult{
			Id:        post.Id.String(),
			Content:   post.Content,
			CreatedAt: post.CreatedAt,
			User:      userResult,
		}
		results = append(results, result)
		fmt.Printf("Added post to results: %s by %s\n", post.Id, post.User.Name)
	}

	err = tx.Commit()
	if err != nil {
		fmt.Printf("Error committing transaction for post search: %v\n", err)
		tx.Rollback()
	}
	return results
}

func (service *SearchServiceImpl) searchBlogs(ctx context.Context, query string, limit int, offset int, currentUserId uuid.UUID) []web.BlogSearchResult {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("Error starting transaction for blog search: %v\n", err)
		return []web.BlogSearchResult{}
	}
	defer helper.CommitOrRollback(tx)

	blogs := service.BlogRepository.Search(ctx, tx, query, limit, offset)

	var results []web.BlogSearchResult
	for _, blog := range blogs {
		userID, err := uuid.Parse(blog.UserID)
		if err != nil {
			continue
		}

		user, err := service.UserRepository.FindById(ctx, tx, userID)
		if err != nil {
			continue
		}

		isConnected := service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, user.Id)

		result := web.BlogSearchResult{
			Id:        blog.ID,
			Title:     blog.Title,
			Content:   blog.Content,
			Slug:      blog.Slug,      // Tambahkan slug
			Image:     blog.ImagePath, // Tambahkan image
			CreatedAt: blog.CreatedAt,
			User: web.UserSearchResult{
				Id:          user.Id.String(),
				Name:        user.Name,
				Username:    user.Username,
				Photo:       user.Photo,
				IsConnected: isConnected,
			},
		}
		results = append(results, result)
	}

	return results
}

func (service *SearchServiceImpl) searchGroups(ctx context.Context, query string, limit int, offset int, currentUserId uuid.UUID) []web.GroupSearchResult {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("Error starting transaction for group search: %v\n", err)
		return []web.GroupSearchResult{}
	}
	defer helper.CommitOrRollback(tx)

	fmt.Printf("Searching groups with query: '%s'\n", query)
	
	// Ubah ini untuk menggunakan SQL yang menampilkan semua grup
	SQL := `SELECT id, name, description, rule, creator_id, image, privacy_level, invite_policy, created_at, updated_at
            FROM groups
            WHERE (LOWER(name) LIKE LOWER($1) OR LOWER(description) LIKE LOWER($1))
            ORDER BY name
            LIMIT $2 OFFSET $3`

	searchPattern := "%" + query + "%"
	fmt.Printf("Executing direct group search SQL with pattern: %s\n", searchPattern)

	rows, err := tx.QueryContext(ctx, SQL, searchPattern, limit, offset)
	if err != nil {
		fmt.Printf("Error executing group search: %v\n", err)
		return []web.GroupSearchResult{}
	}
	defer rows.Close()

	var groups []domain.Group
	for rows.Next() {
		group := domain.Group{}
		var imagePtr *string
		err := rows.Scan(
			&group.Id,
			&group.Name,
			&group.Description,
			&group.Rule,
			&group.CreatorId,
			&imagePtr,
			&group.PrivacyLevel,
			&group.InvitePolicy,
			&group.CreatedAt,
			&group.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("Error scanning group: %v\n", err)
			continue
		}
		group.Image = imagePtr
		groups = append(groups, group)
	}
	
	fmt.Printf("Direct SQL query returned %d groups\n", len(groups))

	var results []web.GroupSearchResult
	for _, group := range groups {
		memberCount := service.GroupRepository.CountMembers(ctx, tx, group.Id)
		isMember := service.GroupRepository.IsMember(ctx, tx, group.Id, currentUserId)

		// Tangani kasus image nil
		var imageStr string
		if group.Image != nil {
			imageStr = *group.Image
		}

		result := web.GroupSearchResult{
			Id:          group.Id.String(),
			Name:        group.Name,
			Description: group.Description,
			Image:       imageStr, // Gunakan string yang sudah ditangani
			MemberCount: memberCount,
			IsMember:    isMember,
		}
		results = append(results, result)
		fmt.Printf("Added group to results: %s (members: %d, isMember: %v)\n", group.Name, memberCount, isMember)
	}

	return results
}
