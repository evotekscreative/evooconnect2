package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"github.com/google/uuid"
)

type SearchServiceImpl struct {
	DB                         *sql.DB
	UserRepository             repository.UserRepository
	PostRepository             repository.PostRepository
	BlogRepository             repository.BlogRepository
	GroupRepository            repository.GroupRepository
	ConnectionRepository       repository.ConnectionRepository
	GroupJoinRequestRepository repository.GroupJoinRequestRepository
	CompanyRepository          repository.CompanyRepository          
	CompanyPostRepository      repository.CompanyPostRepository     
	JobVacancyRepository       repository.JobVacancyRepository      
	CompanyFollowerRepository  repository.CompanyFollowerRepository 
}

func NewSearchService(
	db *sql.DB,
	userRepository repository.UserRepository,
	postRepository repository.PostRepository,
	blogRepository repository.BlogRepository,
	groupRepository repository.GroupRepository,
	connectionRepository repository.ConnectionRepository,
	groupJoinRequestRepository repository.GroupJoinRequestRepository,
	companyRepository repository.CompanyRepository,        
	companyPostRepository repository.CompanyPostRepository,  
	jobVacancyRepository repository.JobVacancyRepository,    
	companyFollowerRepository repository.CompanyFollowerRepository,
) SearchService {
	return &SearchServiceImpl{
		DB:                         db,
		UserRepository:             userRepository,
		PostRepository:             postRepository,
		BlogRepository:             blogRepository,
		GroupRepository:            groupRepository,
		ConnectionRepository:       connectionRepository,
		GroupJoinRequestRepository: groupJoinRequestRepository,
		CompanyRepository:          companyRepository,         
		CompanyPostRepository:      companyPostRepository,      
		JobVacancyRepository:       jobVacancyRepository,       
		CompanyFollowerRepository:  companyFollowerRepository,  
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

	// Existing searches...
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
		groups := service.searchGroups(ctx, query, limit, offset, currentUserId)
		response.Groups = groups
		fmt.Printf("Found %d groups\n", len(groups))
	}

	// NEW SEARCHES - TAMBAH INI
	if searchType == "all" || searchType == "company" {
		fmt.Println("Searching companies...")
		companies := service.searchCompanies(ctx, query, limit, offset, currentUserId)
		response.Companies = companies
		fmt.Printf("Found %d companies\n", len(companies))
	}

	if searchType == "all" || searchType == "company_post" {
		fmt.Println("Searching company posts...")
		companyPosts := service.searchCompanyPosts(ctx, query, limit, offset, currentUserId)
		response.CompanyPosts = companyPosts
		fmt.Printf("Found %d company posts\n", len(companyPosts))
	}

	if searchType == "all" || searchType == "job_vacancy" {
		fmt.Println("Searching job vacancies...")
		jobVacancies := service.searchJobVacancies(ctx, query, limit, offset, currentUserId)
		response.JobVacancies = jobVacancies
		fmt.Printf("Found %d job vacancies\n", len(jobVacancies))
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

		// Check join request status
		var isJoined string = "false"
		if isMember {
			isJoined = "true"
		} else {
			// Check if there's a pending join request
			joinRequest, err := service.GroupJoinRequestRepository.FindByGroupIdAndUserId(ctx, tx, group.Id, currentUserId)
			if err == nil && joinRequest.Status == "pending" {
				isJoined = "pending"
			}
		}

		// Handle image nil case
		var imageStr string
		if group.Image != nil {
			imageStr = *group.Image
		}

		result := web.GroupSearchResult{
			Id:           group.Id.String(),
			Name:         group.Name,
			Description:  group.Description,
			Image:        imageStr,
			MemberCount:  memberCount,
			IsMember:     isMember,
			IsJoined:     isJoined,
			PrivacyLevel: group.PrivacyLevel,
		}
		results = append(results, result)
	}

	return results
}


func (service *SearchServiceImpl) searchCompanies(ctx context.Context, query string, limit int, offset int, currentUserId uuid.UUID) []web.CompanySearchResult {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("Error starting transaction for company search: %v\n", err)
		return []web.CompanySearchResult{}
	}
	defer helper.CommitOrRollback(tx)

	SQL := `SELECT id, name, industry, size, type, logo, tagline, is_verified, created_at
            FROM companies
            WHERE (LOWER(name) LIKE LOWER($1) OR LOWER(industry) LIKE LOWER($1) OR LOWER(tagline) LIKE LOWER($1))
            AND taken_down_at IS NULL
            ORDER BY name
            LIMIT $2 OFFSET $3`

	searchPattern := "%" + query + "%"
	rows, err := tx.QueryContext(ctx, SQL, searchPattern, limit, offset)
	if err != nil {
		fmt.Printf("Error executing company search: %v\n", err)
		return []web.CompanySearchResult{}
	}
	defer rows.Close()

	var results []web.CompanySearchResult
	for rows.Next() {
		var company web.CompanySearchResult
		err := rows.Scan(
			&company.Id,
			&company.Name,
			&company.Industry,
			&company.Size,
			&company.Type,
			&company.Logo,
			&company.Tagline,
			&company.IsVerified,
			&company.CreatedAt,
		)
		if err != nil {
			continue
		}

		// Check if user is following this company
		companyUUID, _ := uuid.Parse(company.Id)
		company.IsFollowing = service.CompanyFollowerRepository.IsFollowing(ctx, tx, currentUserId, companyUUID)

		results = append(results, company)
	}

	return results
}

func (service *SearchServiceImpl) searchCompanyPosts(ctx context.Context, query string, limit int, offset int, currentUserId uuid.UUID) []web.CompanyPostSearchResult {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("Error starting transaction for company post search: %v\n", err)
		return []web.CompanyPostSearchResult{}
	}
	defer helper.CommitOrRollback(tx)

	SQL := `SELECT cp.id, cp.company_id, cp.creator_id, cp.content, cp.created_at,
                   c.name as company_name, c.logo as company_logo,
                   u.name as creator_name, u.username as creator_username
            FROM company_posts cp
            JOIN companies c ON cp.company_id = c.id
            LEFT JOIN users u ON cp.creator_id = u.id
            WHERE LOWER(cp.content) LIKE LOWER($1)
            AND cp.status != 'taken_down'
            AND cp.visibility = 'public'
            ORDER BY cp.created_at DESC
            LIMIT $2 OFFSET $3`

	searchPattern := "%" + query + "%"
	rows, err := tx.QueryContext(ctx, SQL, searchPattern, limit, offset)
	if err != nil {
		fmt.Printf("Error executing company post search: %v\n", err)
		return []web.CompanyPostSearchResult{}
	}
	defer rows.Close()

	var results []web.CompanyPostSearchResult
	for rows.Next() {
		var result web.CompanyPostSearchResult
		var creatorName, creatorUsername sql.NullString
		
		err := rows.Scan(
			&result.Id,
			&result.CompanyId,
			&result.CreatorId,
			&result.Content,
			&result.CreatedAt,
			&result.CompanyName,
			&result.CompanyLogo,
			&creatorName,
			&creatorUsername,
		)
		if err != nil {
			continue
		}

		if creatorName.Valid {
			result.CreatorName = creatorName.String
		}
		if creatorUsername.Valid {
			result.CreatorUsername = creatorUsername.String
		}

		results = append(results, result)
	}

	return results
}

func (service *SearchServiceImpl) searchJobVacancies(ctx context.Context, query string, limit int, offset int, currentUserId uuid.UUID) []web.JobVacancySearchResult {
	tx, err := service.DB.Begin()
	if err != nil {
		fmt.Printf("Error starting transaction for job vacancy search: %v\n", err)
		return []web.JobVacancySearchResult{}
	}
	defer helper.CommitOrRollback(tx)

	SQL := `SELECT jv.id, jv.company_id, jv.title, jv.description, jv.location, 
                   jv.job_type, jv.experience_level, jv.min_salary, jv.max_salary, 
                   jv.currency, jv.work_type, jv.created_at,
                   c.name as company_name, c.logo as company_logo
            FROM job_vacancies jv
            JOIN companies c ON jv.company_id = c.id
            WHERE (LOWER(jv.title) LIKE LOWER($1) OR LOWER(jv.description) LIKE LOWER($1) 
                   OR LOWER(jv.location) LIKE LOWER($1) OR LOWER(jv.job_type) LIKE LOWER($1))
            AND jv.status = 'active'
            AND jv.taken_down_at IS NULL
            ORDER BY jv.created_at DESC
            LIMIT $2 OFFSET $3`

	searchPattern := "%" + query + "%"
	rows, err := tx.QueryContext(ctx, SQL, searchPattern, limit, offset)
	if err != nil {
		fmt.Printf("Error executing job vacancy search: %v\n", err)
		return []web.JobVacancySearchResult{}
	}
	defer rows.Close()

	var results []web.JobVacancySearchResult
	for rows.Next() {
		var result web.JobVacancySearchResult
		var minSalary, maxSalary sql.NullInt64
		var currency sql.NullString

		err := rows.Scan(
			&result.Id,
			&result.CompanyId,
			&result.Title,
			&result.Description,
			&result.Location,
			&result.JobType,
			&result.ExperienceLevel,
			&minSalary,
			&maxSalary,
			&currency,
			&result.WorkType,
			&result.CreatedAt,
			&result.CompanyName,
			&result.CompanyLogo,
		)
		if err != nil {
			continue
		}

		if minSalary.Valid {
			result.MinSalary = &minSalary.Int64
		}
		if maxSalary.Valid {
			result.MaxSalary = &maxSalary.Int64
		}
		if currency.Valid {
			result.Currency = &currency.String
		}

		results = append(results, result)
	}

	return results
}