# EvoConnect - Professional Social Networking Platform

EvoConnect adalah platform jejaring sosial profesional full-stack yang dirancang untuk koneksi profesional, pencarian kerja, dan pengembangan karir. Platform ini menyediakan UI modern dengan berbagai kemampuan jejaring sosial mirip LinkedIn, termasuk profil, koneksi, posting pekerjaan, halaman perusahaan, blogging, dan sistem pesan.

## Daftar Isi
- [Gambaran Proyek](#gambaran-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Struktur Proyek](#struktur-proyek)
- [Dokumentasi API](#dokumentasi-api)
- [Fitur-Fitur Detail](#fitur-fitur-detail)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Gambaran Proyek

EvoConnect adalah platform jejaring profesional yang menghubungkan para profesional, membantu mereka menemukan peluang kerja, dan memungkinkan berbagi pengetahuan melalui blog posts dan updates. Platform ini dibangun dengan arsitektur modern menggunakan Go untuk backend dan React untuk frontend.

## Fitur Utama

### 🔐 Autentikasi & Keamanan
- **Registrasi & Login**: Sistem autentikasi lengkap dengan JWT
- **Forgot Password**: Reset password melalui email
- **Google OAuth**: Login dengan akun Google
- **Role-based Access**: User dan Admin dengan permission berbeda
- **JWT Token Management**: Refresh token dan session management

### 👤 Manajemen Profil
- **Profil Pengguna**: Profil lengkap dengan foto, bio, kontak
- **Pengalaman Kerja**: CRUD pengalaman kerja dengan foto
- **Pendidikan**: Manajemen riwayat pendidikan dengan sertifikat
- **Skills**: Skill management dengan endorsement
- **Portfolio**: Upload dan showcase portfolio
- **CV Management**: Upload dan manajemen CV untuk aplikasi kerja

### 🌐 Jejaring Sosial
- **Sistem Koneksi**: Connect dengan profesional lain
- **Follow System**: Follow perusahaan dan influencer
- **Feed Algoritma**: News feed dengan algoritma personal
- **Post Interactions**: Like, comment, reply, share
- **Visibility Control**: Public, connections, private posts
- **Mention System**: Tag pengguna dalam post

### 💼 Portal Pekerjaan
- **Job Listings**: Browse lowongan dengan filter canggih
- **Saved Jobs**: Simpan lowongan menarik
- **Job Applications**: Apply dengan CV dan cover letter
- **Application Tracking**: Track status aplikasi
- **Employer Dashboard**: Manajemen lowongan untuk perusahaan
- **Applicant Management**: Review dan kelola pelamar

### 🏢 Halaman Perusahaan
- **Company Profiles**: Profil perusahaan lengkap
- **Company Posts**: Konten dari perusahaan
- **Company Members**: Manajemen anggota perusahaan
- **Company Verification**: Sistem verifikasi perusahaan
- **Company Statistics**: Dashboard statistik perusahaan

### 📝 Platform Blog
- **Rich Text Editor**: CKEditor untuk konten berkualitas
- **Blog Categories**: Kategori artikel berbeda
- **Blog Comments**: Sistem komentar dan reply
- **Blog Sharing**: Share artikel ke social media
- **Blog Analytics**: Statistik pembaca dan engagement

### 💬 Sistem Pesan
- **Real-time Chat**: Messaging real-time
- **Group Conversations**: Chat grup
- **File Sharing**: Kirim file dalam chat
- **Message Status**: Read receipts dan status
- **Chat History**: Riwayat percakapan

### 🔔 Notifikasi
- **Real-time Notifications**: Notifikasi real-time
- **Email Notifications**: Notifikasi via email
- **Push Notifications**: Browser push notifications
- **Notification Settings**: Kontrol preferensi notifikasi

### 👥 Manajemen Grup
- **Create Groups**: Buat grup diskusi
- **Group Posts**: Posting dalam grup
- **Group Moderation**: Moderasi konten grup
- **Join Requests**: Sistem persetujuan anggota
- **Group Roles**: Admin dan member roles

### 🛡️ Sistem Laporan & Moderasi
- **Content Reporting**: Laporkan konten bermasalah
- **Admin Dashboard**: Dashboard admin untuk moderasi
- **Take Action System**: Suspend, ban, take down content
- **Report Analytics**: Statistik laporan dan tindakan

### 🔍 Pencarian Global
- **Advanced Search**: Pencarian users, posts, companies, jobs
- **Search Filters**: Filter pencarian canggih
- **Search Suggestions**: Auto-complete pencarian
- **Search History**: Riwayat pencarian

## Tech Stack

### Backend
- **Language**: Go (Golang) 1.19+
- **Database**: PostgreSQL 13+
- **ORM**: Database/SQL dengan custom repository pattern
- **Authentication**: JWT dengan bcrypt hashing
- **File Storage**: Local filesystem dengan organized directory structure
- **Email Service**: SMTP dengan Gmail integration
- **Real-time**: WebSocket untuk chat dan notifikasi
- **Migration**: Goose untuk database migrations
- **API Design**: RESTful API dengan JSON responses
- **Middleware**: Custom middleware untuk auth, CORS, logging
- **Validation**: Custom validation dengan struct tags
- **Error Handling**: Centralized error handling dengan custom exceptions

### Frontend
- **Framework**: React 18 dengan Vite 4
- **Styling**: Tailwind CSS 3 dengan custom components
- **State Management**: React Hooks dengan Context API
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios dengan interceptors
- **Form Handling**: Custom form handling dengan validation
- **Rich Text**: CKEditor 5 dan Trix Editor
- **Icons**: Lucide React
- **Charts**: Recharts untuk analytics
- **Notifications**: React Toastify
- **Date Handling**: Day.js
- **File Upload**: Custom file upload dengan progress
- **Image Processing**: Client-side image optimization

## Prasyarat

Pastikan Anda memiliki software berikut terinstal:

- **Node.js** 16+ dan npm/yarn
- **Go** 1.19+
- **PostgreSQL** 13+
- **Git**
- **Email SMTP** (Gmail recommended)
- **Google OAuth** credentials (optional)

## Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/evoconnect.git
cd evoconnect
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
go mod download

# Copy environment file
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Setup database
createdb evoconnect
psql -d evoconnect -f db/schema.sql

# Run migrations
go run main.go migrate

# Start server
go run main.go
```

Backend akan berjalan di `http://localhost:3000`

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Konfigurasi Environment

### Backend (.env)
```env
# Application Configuration
APP_NAME="EvoConnect"
APP_HOST="localhost"
APP_PORT=3000
APP_URL="http://localhost:3000"
APP_ENV=development
APP_DEBUG=true

# JWT Configuration
JWT_SECRET_KEY="your-super-secret-jwt-key-change-this-in-production"
ADMIN_JWT_SECRET_KEY="your-admin-jwt-secret-key"
JWT_EXPIRES_IN=24

# Database Configuration
DB_HOST="localhost"
DB_PORT=5432
DB_NAME="evoconnect"
DB_USER="postgres"
DB_PASSWORD="your-db-password"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USERNAME="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="EvoConnect <noreply@evoconnect.com>"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Goose Migration Configuration
GOOSE_DRIVER=postgres
GOOSE_DBSTRING="postgres://postgres:password@localhost:5432/evoconnect"
GOOSE_MIGRATION_DIR=./db/migrations
GOOSE_TABLE=goose_migrations

# Client URL for CORS
CLIENT_URL="http://localhost:5173"
```

### Frontend (.env)
```env
# API Configuration
VITE_APP_BACKEND_URL=http://localhost:3000

# Client Configuration
VITE_APP_CLIENT_URL=http://localhost:5173
VITE_APP_NAME="EvoConnect"

# Feature Flags
VITE_APP_ENABLE_GOOGLE_AUTH=true
```

## Struktur Proyek

```
evoconnect/
├── README.md
├── backend/
│   ├── main.go                 # Entry point aplikasi
│   ├── go.mod                  # Go module dependencies
│   ├── go.sum                  # Checksums dependencies
│   ├── .env.example           # Template environment variables
│   ├── api_docs/              # API documentation
│   │   ├── postman.json       # Postman collection
│   │   ├── admin_postman.json # Admin API collection
│   │   └── swagger.json       # Swagger documentation
│   ├── app/                   # Application configuration
│   │   └── database.go        # Database connection
│   ├── controller/            # HTTP handlers
│   │   ├── auth_controller.go
│   │   ├── user_controller.go
│   │   ├── post_controller.go
│   │   ├── company_controller.go
│   │   ├── job_controller.go
│   │   ├── blog_controller.go
│   │   ├── chat_controller.go
│   │   ├── notification_controller.go
│   │   └── admin_*.go         # Admin controllers
│   ├── db/                    # Database related
│   │   ├── migrations/        # Database migrations
│   │   └── schema.sql         # Database schema
│   ├── exception/             # Custom exceptions
│   │   ├── error_handler.go
│   │   └── custom_errors.go
│   ├── helper/                # Utility functions
│   │   ├── model.go           # Model converters
│   │   ├── upload.go          # File upload utilities
│   │   ├── email.go           # Email utilities
│   │   └── validation.go      # Validation utilities
│   ├── middleware/            # HTTP middleware
│   │   ├── auth_middleware.go
│   │   ├── cors_middleware.go
│   │   └── admin_middleware.go
│   ├── model/                 # Data models
│   │   ├── domain/            # Domain models
│   │   └── web/               # Web request/response models
│   ├── repository/            # Data access layer
│   │   ├── *_repository.go
│   │   └── *_repository_impl.go
│   ├── service/               # Business logic
│   │   ├── *_service.go
│   │   └── *_service_impl.go
│   ├── uploads/               # File uploads directory
│   │   ├── avatars/
│   │   ├── posts/
│   │   ├── companies/
│   │   ├── blogs/
│   │   └── documents/
│   └── utils/                 # Utility packages
└── frontend/
    ├── index.html             # HTML template
    ├── package.json           # NPM dependencies
    ├── vite.config.js         # Vite configuration
    ├── tailwind.config.js     # Tailwind configuration
    ├── postcss.config.js      # PostCSS configuration
    ├── public/                # Static assets
    └── src/
        ├── main.jsx           # React entry point
        ├── App.jsx            # Main app component
        ├── routes.jsx         # Route definitions
        ├── assets/            # Static assets
        ├── components/        # Reusable components
        │   ├── Auth/          # Authentication components
        │   ├── Profile/       # Profile components
        │   ├── Post/          # Post components
        │   ├── Company/       # Company components
        │   ├── Job/           # Job components
        │   ├── Blog/          # Blog components
        │   ├── Chat/          # Chat components
        │   ├── Admin/         # Admin components
        │   └── Common/        # Common components
        └── pages/             # Page components
            ├── Auth/          # Authentication pages
            ├── Profile/       # Profile pages
            ├── Company/       # Company pages
            ├── Job/           # Job pages
            ├── Blog/          # Blog pages
            ├── Chat/          # Chat pages
            ├── Admin/         # Admin pages
            └── Home.jsx       # Homepage
```

## Dokumentasi API

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
```
POST   /auth/register          # User registration
POST   /auth/login             # User login
POST   /auth/google            # Google OAuth login
POST   /auth/forgot-password   # Forgot password
POST   /auth/reset-password    # Reset password
POST   /auth/refresh-token     # Refresh JWT token
POST   /auth/logout            # Logout
```

### User Management
```
GET    /user/profile           # Get current user profile
PUT    /user/profile           # Update user profile
POST   /user/avatar            # Upload avatar
GET    /users/{id}             # Get user by ID
GET    /users/search           # Search users
```

### Post Management
```
GET    /posts                  # Get posts feed
POST   /posts                  # Create new post
GET    /posts/{id}             # Get post by ID
PUT    /posts/{id}             # Update post
DELETE /posts/{id}             # Delete post
POST   /posts/{id}/like        # Like/unlike post
GET    /posts/{id}/comments    # Get post comments
POST   /posts/{id}/comments    # Add comment
```

### Company Management
```
GET    /companies              # Get companies list
POST   /companies              # Create company
GET    /companies/{id}         # Get company details
PUT    /companies/{id}         # Update company
GET    /companies/{id}/stats   # Get company statistics
GET    /companies/{id}/members # Get company members
POST   /companies/{id}/join    # Join company request
```

### Job Management
```
GET    /jobs                   # Get job listings
POST   /jobs                   # Create job posting
GET    /jobs/{id}              # Get job details
PUT    /jobs/{id}              # Update job
DELETE /jobs/{id}              # Delete job
POST   /jobs/{id}/apply        # Apply to job
GET    /saved-jobs             # Get saved jobs
POST   /saved-jobs/{id}        # Save job
DELETE /saved-jobs/{id}        # Unsave job
```

### Blog Management
```
GET    /blogs                  # Get blog posts
POST   /blogs                  # Create blog post
GET    /blogs/{id}             # Get blog post
PUT    /blogs/{id}             # Update blog post
DELETE /blogs/{id}             # Delete blog post
POST   /blogs/{id}/photo       # Upload blog photo
GET    /blog-comments/{id}     # Get blog comments
POST   /blog-comments/{id}     # Add blog comment
```

### Admin Endpoints
```
GET    /admin/users            # Get all users
PUT    /admin/users/{id}/status # Update user status
GET    /admin/reports          # Get reports
POST   /admin/reports/{id}/action # Take action on report
GET    /admin/companies        # Get companies for approval
PUT    /admin/companies/{id}/status # Approve/reject company
```

Dokumentasi lengkap tersedia di:
- **Postman Collection**: `backend/api_docs/postman.json`
- **Admin API Collection**: `backend/api_docs/admin_postman.json`
- **Swagger**: `backend/api_docs/swagger.json`

## Fitur-Fitur Detail

### 1. Sistem Autentikasi
- JWT-based authentication dengan refresh token
- Password hashing menggunakan bcrypt
- Google OAuth integration
- Email verification dan password reset
- Role-based access control (User, Admin)

### 2. Manajemen Profil Pengguna
- Complete profile dengan foto dan informasi lengkap
- Pengalaman kerja dengan foto perusahaan
- Riwayat pendidikan dengan sertifikat
- Skills management dengan endorsement system
- Portfolio showcase dengan file upload

### 3. Sistem Posting & Feed
- Rich text posting dengan image upload
- Visibility control (public, connections, private)
- Like, comment, dan reply system
- Mention system untuk tag pengguna
- Feed algoritma berdasarkan connections

### 4. Portal Pekerjaan
- Advanced job search dengan multiple filters
- Saved jobs untuk bookmark lowongan
- Application tracking system
- CV management untuk aplikasi
- Employer dashboard untuk posting jobs

### 5. Halaman Perusahaan
- Company profile dengan verifikasi
- Company posts dan updates
- Member management system
- Join request approval
- Company statistics dashboard

### 6. Platform Blog
- CKEditor untuk rich text editing
- Blog categories dan tagging
- Comment system dengan replies
- Blog sharing ke social media
- Analytics untuk blog performance

### 7. Sistem Chat
- Real-time messaging
- Group conversations
- File sharing dalam chat
- Message status (sent, delivered, read)
- Chat history dan search

### 8. Admin Dashboard
- User management dan moderation
- Content moderation tools
- Report management system
- Company approval workflow
- System analytics dan statistics

## Deployment

### Backend Deployment

1. **Build aplikasi**:
```bash
cd backend
go build -o evoconnect main.go
```

2. **Setup database production**:
```bash
# Import schema
psql -d evoconnect_prod -f db/schema.sql

# Run migrations
./evoconnect migrate
```

3. **Setup environment production**:
```bash
# Copy dan edit environment
cp .env.example .env.production
# Edit dengan konfigurasi production
```

4. **Run aplikasi**:
```bash
./evoconnect
```

### Frontend Deployment

1. **Build aplikasi**:
```bash
cd frontend
npm run build
```

2. **Deploy ke web server**:
```bash
# Copy dist folder ke web server
cp -r dist/* /var/www/evoconnect/
```

### Docker Deployment (Optional)

1. **Create Dockerfile backend**:
```dockerfile
FROM golang:1.19-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
COPY --from=builder /app/.env .
CMD ["./main"]
```

2. **Create Dockerfile frontend**:
```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **Docker Compose**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: evoconnect
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
psql -l | grep evoconnect

# Check connection string
psql -h localhost -U postgres -d evoconnect
```

2. **CORS Error**:
```bash
# Check CLIENT_URL in backend .env
CLIENT_URL="http://localhost:5173"

# Check VITE_APP_BACKEND_URL in frontend .env
VITE_APP_BACKEND_URL=http://localhost:3000
```

3. **File Upload Error**:
```bash
# Check uploads directory permissions
chmod 755 backend/uploads
chmod -R 644 backend/uploads/*

# Check disk space
df -h
```

4. **JWT Token Error**:
```bash
# Check JWT_SECRET_KEY length (minimum 32 characters)
# Regenerate secret key if needed
openssl rand -base64 32
```

5. **Email Not Sending**:
```bash
# For Gmail, use App Password instead of regular password
# Enable 2FA and generate App Password
# Check EMAIL_* configuration in .env
```

### Performance Optimization

1. **Database Optimization**:
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_users_email ON users(email);
```

2. **File Upload Optimization**:
```go
// Implement image compression
// Use CDN for file storage in production
// Add file size limits
```

3. **Frontend Optimization**:
```bash
# Enable gzip compression
# Implement lazy loading
# Use React.memo for heavy components
# Optimize bundle size
npm run build --analyze
```

## Kontribusi

Kami menerima kontribusi untuk meningkatkan EvoConnect:

1. **Fork repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Coding Standards

- **Go**: Follow Go standard formatting dengan `gofmt`
- **React**: Use functional components dengan hooks
- **CSS**: Use Tailwind utility classes
- **Commits**: Use conventional commit messages
- **Testing**: Write tests untuk new features

### Development Workflow

1. **Setup development environment**
2. **Create feature branch dari main**
3. **Implement feature dengan tests**
4. **Run linting dan tests**
5. **Update documentation**
6. **Submit pull request**

## Lisensi

Proyek ini adalah proprietary dan dimiliki oleh EVO Technologies. Semua hak dilindungi undang-undang.

---

## Kontak & Support

Untuk pertanyaan, issue, atau dukungan:

- **Email**: support@evotekscreative.com
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/evoconnect/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/evoconnect/wiki)

---

**EvoConnect** - Menghubungkan Profesional, Membuka Peluang Karir

*Dikembangkan dengan ❤️ oleh Tim Developer dari SMK WIKRAMA BOGOR*