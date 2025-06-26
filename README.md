# EvoConnect - Professional Social Networking Platform

EvoConnect is a comprehensive full-stack social networking platform designed for professional connections, job hunting, and career development. Built with modern technologies, it provides LinkedIn-like functionality with advanced features for professional networking, company management, content sharing, and real-time communication.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

## Project Overview

EvoConnect is a professional networking platform that facilitates meaningful connections between professionals, companies, and job seekers. The platform offers comprehensive features for career development, knowledge sharing, and business networking in the technology industry.

## Features

### 🔐 Authentication & Security
- **Multi-provider Authentication**: Email/password, Google OAuth integration
- **JWT-based Security**: Secure token-based authentication with refresh tokens
- **Password Management**: Secure password reset via email verification
- **Admin Authentication**: Separate admin panel with role-based access control

### 👤 User Management
- **Rich Profile System**: Professional profiles with photos, headlines, and contact information
- **Experience Management**: Add/edit work experiences with company logos and descriptions
- **Education Tracking**: Academic background with institutions and degrees
- **Skills & Endorsements**: Skill management with peer endorsements
- **Profile Analytics**: Track profile views and engagement metrics

### 🤝 Social Networking
- **Connection System**: Send/accept connection requests with personalized messages
- **Follow Companies**: Stay updated with company activities and job postings
- **Network Discovery**: Find and connect with professionals in your field
- **Connection Recommendations**: AI-powered connection suggestions

### 📰 Content & Feed
- **Dynamic News Feed**: Personalized content feed with smart algorithms
- **Rich Text Editor**: CKEditor integration for professional content creation
- **Multi-media Posts**: Support for images, videos, and document attachments
- **Post Interactions**: Like, comment, reply, and share functionality
- **Content Moderation**: Report inappropriate content with admin review system

### 👥 Group Management
- **Professional Groups**: Create and join industry-specific groups
- **Group Moderation**: Admin controls for member approval and content management
- **Group Analytics**: Track group engagement and member activity
- **Event Management**: Organize and manage professional events within groups

### 💼 Job Portal
- **Job Listings**: Comprehensive job posting system with detailed descriptions
- **Application Management**: Track applications with status updates
- **Saved Jobs**: Bookmark interesting opportunities for later review
- **Company Job Pages**: Dedicated company career pages
- **Application Analytics**: Track application success rates and feedback

### 🏢 Company Profiles
- **Company Pages**: Detailed company profiles with branding and information
- **Company Analytics**: Track follower growth and engagement metrics
- **Job Posting Management**: Post and manage job openings
- **Company Updates**: Share company news and achievements
- **Employee Management**: Manage company employee profiles and permissions

### 📝 Blog Platform
- **Professional Blogging**: Rich text blog creation with multimedia support
- **Article Management**: Draft, publish, and schedule blog posts
- **Blog Analytics**: Track article views, engagement, and reader demographics
- **Comment System**: Threaded comments with reply functionality
- **Content Categories**: Organize content by industry topics and tags

### 💬 Communication
- **Real-time Messaging**: WebSocket-based instant messaging system
- **File Sharing**: Share documents and media in conversations
- **Message Status**: Read receipts and delivery confirmations

### 🔔 Notifications
- **Real-time Alerts**: Instant notifications for important activities
- **Email Notifications**: Configurable email alerts for key events
- **Push Notifications**: Browser-based push notification support
- **Notification Preferences**: Granular control over notification types

### 📊 Analytics & Reporting
- **Profile Analytics**: Track profile views and search appearances
- **Content Performance**: Monitor post engagement and reach
- **Network Growth**: Visualize connection growth over time
- **Admin Dashboard**: Comprehensive platform analytics and user management

### 🛡️ Content Moderation
- **Report System**: User-generated content reporting with admin review
- **Automated Moderation**: AI-powered content filtering
- **Admin Panel**: Comprehensive moderation tools and user management
- **Content Appeals**: Appeal system for moderation decisions

## Tech Stack

### Backend
- **Language**: [Go (Golang)](https://golang.org/) v1.21+
- **Database**: PostgreSQL 14+ with optimized indexing
- **Authentication**: JWT with RS256 signing algorithm
- **File Storage**: Local filesystem with organized directory structure
- **Email Service**: SMTP integration for transactional emails
- **WebSocket**: Real-time communication support
- **Validation**: Go-playground/validator for request validation
- **Logging**: Structured logging with logrus
- **CORS**: Configurable cross-origin resource sharing

### Frontend
- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/) build tool
- **Language**: JavaScript ES6+ with JSX
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3.x with custom components
- **State Management**: React hooks (useState, useEffect, useContext)
- **Routing**: [React Router v6](https://reactrouter.com/) with protected routes
- **HTTP Client**: [Axios](https://axios-http.com/) with interceptors
- **Form Handling**: Custom form validation with real-time feedback
- **Rich Text Editor**: [CKEditor 5](https://ckeditor.com/) for content creation
- **Charts**: [Chart.js](https://www.chartjs.org/) with React wrapper for analytics
- **Icons**: [Lucide React](https://lucide.dev/) icon library
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/) for user feedback
- **Date Handling**: [Day.js](https://day.js.org/) for date manipulation
- **Image Handling**: Custom image upload and preview components

### Development Tools
- **Version Control**: Git with conventional commits
- **Code Quality**: ESLint and Prettier for consistent formatting
- **API Testing**: Postman collections with comprehensive test suites
- **Documentation**: Swagger/Postman 3.0 specification
- **Environment Management**: Environment-based configuration

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18.0 or later)
- **[Go](https://golang.org/dl/)** (v1.21 or later)
- **[PostgreSQL](https://www.postgresql.org/download/)** (v14.0 or later)
- **[Git](https://git-scm.com/downloads)** (latest version)
- **Code Editor** (VS Code recommended with Go and React extensions)

## Getting Started

### Backend Setup

1. **Clone the repository:**
```bash
git clone https://github.com/evotekscreative/evoconnect.git
cd epokonek
```

2. **Navigate to the backend directory:**
```bash
cd backend
```

3. **Install Go dependencies:**
```bash
go mod download
go mod tidy
```

4. **Set up environment variables:**
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration (see Environment Variables section).

5. **Set up the database:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE evoconnect WITH ENCODING='UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';"

# Run migrations 
sh ./db/migrations/migrate-fresh.sh 
```

6. **Start the backend server:**
```bash
# Development mode
go run main.go

# Or build and run
go build -o evoconnect main.go
./evoconnect
```

The backend server will start at `http://localhost:3000` (default port).

### Frontend Setup

1. **Navigate to the frontend directory:**
```bash
cd ../frontend
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```
Configure the environment variables for your setup.

4. **Start the development server:**
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:5173`.

## Environment Variables

### Backend (.env)
```bash
# Database Configuration
APP_HOST="localhost"
APP_PORT=3000

APP_NAME="EvoConnect"
APP_URL="http://${APP_HOST}:${APP_PORT}"
APP_ENV=development
APP_DEBUG=true
APP_SERVER="${APP_HOST}:${APP_PORT}"

JWT_SECRET_KEY="your_jwt_secret_key_here"
ADMIN_JWT_SECRET_KEY="your_admin_jwt_secret_key_here"
JWT_EXPIRES_IN=24  

DB_HOST="localhost"
DB_PORT=5432
DB_NAME="evoconnect"
DB_USER="postgres"
DB_PASSWORD="your_database_password"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USERNAME="your_email@gmail.com"
EMAIL_PASSWORD="your_app_password" 
EMAIL_FROM="EvoConnect <noreply@evoconnect.com>"

PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

GOOSE_DRIVER=postgres
# GOOSE_DBSTRING=postgres://admin:admin@localhost:5432/admin_db
GOOSE_DBSTRING="${GOOSE_DRIVER}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
GOOSE_MIGRATION_DIR=./db/migrations
GOOSE_TABLE=custom.goose_migrations

GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

CLIENT_URL="http://localhost:3000"
```

### Frontend (.env)
```bash
# API Configuration
VITE_APP_BACKEND_URL=http://localhost:3000
VITE_APP_CLIENT_URL=http://localhost:5173
```

## Project Structure

```
evoconnect/
├── README.md
├── .gitignore
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── go.mod
│   ├── go.sum
│   ├── main.go                    # Application entry point
│   ├── getSocketID.html           # WebSocket testing page
│   ├── api_docs/
│   │   ├── postman.json          # Postman collection
│   │   ├── admin_postman.json    # Admin endpoints collection
│   │   └── swagger.json          # OpenAPI specification
│   ├── app/
│   │   └── database.go           # Database connection and configuration
│   ├── controller/               # HTTP request handlers
│   │   ├── auth_controller.go
│   │   ├── user_controller.go
│   │   ├── post_controller.go
│   │   ├── group_controller.go
│   │   ├── job_controller.go
│   │   ├── company_controller.go
│   │   ├── blog_controller.go
│   │   └── admin_controller.go
│   ├── db/                       # Database related files
│   │   ├── migrations/
│   │   └── seeds/
│   ├── exception/                # Custom error handling
│   │   └── error_handler.go
│   ├── helper/                   # Utility functions
│   │   ├── bcrypt.go
│   │   ├── jwt.go
│   │   ├── validation.go
│   │   └── file_upload.go
│   ├── middleware/               # HTTP middlewares
│   │   ├── auth_middleware.go
│   │   ├── cors_middleware.go
│   │   ├── rate_limit_middleware.go
│   │   └── logging_middleware.go
│   ├── model/                    # Data models and structs
│   │   ├── user.go
│   │   ├── post.go
│   │   ├── group.go
│   │   ├── job.go
│   │   ├── company.go
│   │   └── blog.go
│   ├── public/                   # Static files served by backend
│   ├── repository/               # Data access layer
│   │   ├── user_repository.go
│   │   ├── post_repository.go
│   │   ├── group_repository.go
│   │   └── job_repository.go
│   ├── service/                  # Business logic layer
│   │   ├── auth_service.go
│   │   ├── user_service.go
│   │   ├── post_service.go
│   │   ├── notification_service.go
│   │   └── email_service.go
│   ├── uploads/                  # File upload directory
│   │   ├── profiles/
│   │   ├── posts/
│   │   ├── companies/
│   │   └── documents/
│   └── utils/                    # Additional utilities
│       ├── logger.go
│       ├── response.go
│       └── constants.go
└── frontend/
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.cjs
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── README.md
    ├── public/
    │   ├── favicon.ico
    │   └── evoconnect1.png         # App logo
    └── src/
        ├── App.css
        ├── App.jsx                 # Main application component
        ├── index.css              # Global styles
        ├── main.jsx               # Application entry point
        ├── routes.jsx             # Application routing configuration
        ├── assets/                # Static assets
        │   ├── css/
        │   │   └── style.css      # Custom CSS styles
        │   ├── img/               # Image assets
        │   └── icons/
        ├── components/            # Reusable UI components
        │   ├── Auth/              # Authentication components
        │   │   ├── alert.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── Admin/             # Admin panel components
        │   │   ├── Sidebar/
        │   │   ├── Cards/
        │   │   └── Charts/
        │   ├── Blog/              # Blog-related components
        │   │   ├── BlogCard.jsx
        │   │   ├── EditBlog.jsx
        │   │   └── BlogList.jsx
        │   ├── CompanyProfile/    # Company profile components
        │   │   ├── CompanyHeader.jsx
        │   │   ├── CompanyEditModal.jsx
        │   │   └── CompanyPosts.jsx
        │   ├── Profile/           # User profile components
        │   │   ├── ProfileHeader.jsx
        │   │   ├── ProfilePosts.jsx
        │   │   ├── ExperienceModal.jsx
        │   │   └── EducationModal.jsx
        │   ├── Case.jsx           # Layout wrapper component
        │   ├── Button.jsx         # Reusable button component
        │   └── NetworkManager.jsx # Network connection handler
        └── pages/                 # Page components
            ├── Home.jsx           # Main dashboard/feed
            ├── Help.jsx           # Help and support page
            ├── SinglePost.jsx     # Individual post view
            ├── UserPostPage.jsx   # User's posts listing
            ├── Groups.jsx         # Groups discovery page
            ├── GroupPage.jsx      # Individual group view
            ├── Admin/             # Admin panel pages
            │   ├── AuthAdmin/
            │   │   └── LoginAdmin.jsx
            │   ├── Report/        # Content moderation
            │   │   ├── ReportPostDetail.jsx
            │   │   └── ReportBlogPage.jsx
            │   └── Dashboard/
            ├── Blog/              # Blog-related pages
            │   └── Blog.jsx
            ├── CompanyProfile/    # Company pages
            │   └── JobProfile.jsx
            ├── Connection/        # Networking pages
            │   └── Connections.jsx
            └── Profile/           # User profile pages
                └── Profile.jsx
```

## API Documentation

The API follows RESTful principles with comprehensive endpoint coverage:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### User Management
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user-profile/{username}` - Get user by username
- `GET /api/users/{userId}/posts` - Get user's posts
- `GET /api/users/{userId}/connections` - Get user connections
- `GET /api/users/{userId}/education` - Get user education
- `GET /api/users/{userId}/experience` - Get user experience

### Posts & Content
- `GET /api/posts` - Get all posts with pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/{postId}` - Get specific post
- `PUT /api/posts/{postId}` - Update post
- `DELETE /api/posts/{postId}` - Delete post
- `POST /api/posts/{postId}/comments` - Add comment to post
- `POST /api/post-actions/{postId}/like` - Like/unlike post

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/{groupId}` - Get group details
- `PUT /api/groups/{groupId}` - Update group
- `POST /api/groups/{groupId}/join` - Join group
- `POST /api/groups/{groupId}/posts` - Create group post
- `GET /api/groups/{groupId}/members` - Get group members

### Job Portal
- `GET /api/job-vacancies` - Get job listings
- `POST /api/job-vacancies` - Create job posting
- `GET /api/job-vacancies/{jobId}` - Get job details
- `POST /api/job-applications/{jobId}` - Apply for job
- `POST /api/saved-jobs/{jobId}` - Save job
- `GET /api/saved-jobs` - Get saved jobs

### Company Management
- `GET /api/companies` - Get companies
- `POST /api/companies` - Create company
- `GET /api/companies/{companyId}` - Get company details
- `PUT /api/companies/{companyId}` - Update company
- `POST /api/companies/{companyId}/follow` - Follow company

### Search & Discovery
- `GET /api/search/users` - Search users
- `GET /api/search/posts` - Search posts
- `GET /api/search/groups` - Search groups
- `GET /api/search` - Global search

### Admin Endpoints
- `GET /api/admin/users` - Manage users
- `GET /api/admin/reports` - Content moderation
- `PUT /api/admin/reports/{reportId}` - Handle reports
- `GET /api/admin/analytics` - Platform analytics

Full API documentation is available in:
- **Postman Collection**: `backend/api_docs/postman.json`
- **Admin Collection**: `backend/api_docs/admin_postman.json`
- **Swagger Spec**: `backend/api_docs/swagger.json`

## Database Schema

The application uses MySQL with the following main entities:

### Core Tables
- **users** - User profiles and authentication
- **posts** - User posts and content
- **comments** - Post comments and replies
- **groups** - Professional groups
- **group_members** - Group membership
- **connections** - User connections/networking
- **companies** - Company profiles
- **job_vacancies** - Job postings
- **job_applications** - Job applications
- **blogs** - Blog articles
- **notifications** - User notifications
- **reports** - Content moderation reports

### Relationship Overview
- Users can create posts, join groups, connect with others
- Posts can have comments, likes, and be shared
- Groups have members with different roles (admin, moderator, member)
- Companies can post jobs and have followers
- Users can apply for jobs and save interesting positions

## Deployment

### Production Deployment

#### Backend Deployment
```bash
# Build the application
go build -o evoconnect main.go

# Set production environment variables
export DB_HOST=your_production_db_host
export JWT_SECRET=your_production_jwt_secret

# Run the application
./evoconnect
```

#### Frontend Deployment
```bash
# Build for production
npm run build

# The dist/ folder can be served by any static file server
# or deployed to services like Vercel, Netlify, or AWS S3
```

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

## Contributing

We welcome contributions from the community! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear, descriptive commits
4. Write or update tests as needed
5. Ensure code follows the project's style guidelines
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with a detailed description

### Code Standards
- **Go**: Follow Go conventions, use `gofmt` and `golint`
- **React**: Use functional components with hooks, follow ESLint rules
- **Git**: Use conventional commit messages
- **Documentation**: Update README and API docs for new features

### Pull Request Process
1. Ensure all tests pass
2. Update documentation for any API changes
3. Include screenshots for UI changes
4. Get at least one code review approval
5. Ensure CI/CD checks pass

## Team

This project was developed by talented interns from SMK Wikrama Bogor:

### Development Team
- **Muhamad Afghan Alzena** - *Full Stack Developer*
  - Lead developer responsible for overall architecture and implementation
  - Backend API development and frontend integration
  - API development and security implementation
  - Database design and optimization
  
- **Fazrie Riesky Putra** - *Backend Developer*
  - Database design and optimization
  - API development and security implementation
  
- **Zahran Fairuz** - *Frontend Developer*
  - User interface design and implementation
  - Cross-browser compatibility and testing
  - React components and state management
  - Component optimization and performance tuning
  
- **Bintang Asydqy** - *Frontend Developer*
  - Interface development and styling
  - Frontend feature development
  
- **Zahra Kamila** - *Frontend Developer*
  - UI/UX development and responsive design
  - User experience optimization
  
- **Windha Kusuma Dewi** - *Frontend Developer*
  - Interface development and styling
  - React components management

### Internship Program
This project was completed as part of the **SMK Wikrama Bogor** internship program, demonstrating the students' capabilities in modern web development technologies and collaborative software development practices.

### Acknowledgments
- SMK Wikrama Bogor for providing the opportunity and guidance
- EVO Technologies for project mentorship and resources
- The open-source community for the amazing tools and libraries

## License

This project is proprietary and owned by **EVO Technologies**. All rights reserved.

### Usage Rights
- This software is developed for internal use and client projects
- Redistribution or commercial use without explicit permission is prohibited
- Educational use within the scope of the internship program is permitted

### Third-Party Licenses
This project uses various open-source libraries and frameworks. Please refer to their respective licenses for usage terms.

---

## Support & Contact

For technical support, bug reports, or feature requests:

- **Email**: dev@evotechnologies.com
- **Issue Tracker**: [GitHub Issues](https://github.com/evotekscreative/epokonek/issues)
- **Documentation**: This README and API documentation
- **Development Team**: Contact any of the team members listed above

*Built with ❤️ by the SMK Wikrama Bogor development