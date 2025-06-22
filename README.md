# EvoConnect - Professional Social Networking Platform

EvoConnect is a full-stack social networking platform designed for professional connections, job hunting, and career development. It features a modern UI with various social networking capabilities similar to LinkedIn, including profiles, connections, job postings, company pages, blogging, and messaging.

## Table of Contents
- Project Overview
- Features
- Tech Stack
- Prerequisites
- Getting Started
  - Backend Setup
  - Frontend Setup
- Environment Variables
- Project Structure
- API Documentation
- Contributing
- License

## Project Overview

EvoConnect is a professional networking platform that connects professionals, helps them find job opportunities, and allows them to share knowledge through blog posts and updates.

## Features

- **User Authentication**: Register, login, forgot password, and JWT-based authentication
- **User Profiles**: Create and edit professional profiles with experiences, education, and skills
- **Social Networking**: Connect with other professionals and follow companies
- **News Feed**: Share updates, articles, and interact with posts (like, comment, reply)
- **Job Portal**: Browse, save, and apply to job listings
- **Company Profiles**: View and create company pages
- **Messaging System**: Real-time messaging between connections
- **Blog Platform**: Publish and read career-focused articles
- **Notifications**: Get alerted about important activities

## Tech Stack

### Backend
- **Language**: [Go](https://golang.org/dl/) (Golang)
- **Database**: SQL (requires MySQL or PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Authentication**: JWT-based authentication
- **File Storage**: Local file system (uploads directory)
- **API Documentation**: Swagger/Postman

### Frontend
- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React hooks (useState, useEffect)
- **Routing**: [React Router](https://reactrouter.com/)
- **UI Components**:
  - [Lucide React](https://lucide.dev/) for icons
  - [Recharts](https://recharts.org/en-US/) for data visualization
  - [CKEditor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/react.html) for rich text editing
  - [Trix](https://trix-editor.org/) as an alternative rich text editor
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Form Handling**: Custom form handling with validation
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) for toast notifications

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [Go](https://golang.org/dl/) (v1.16 or later)
- [PostgreSQL](https://www.postgresql.org/download/) database
- [Git](https://git-scm.com/downloads)

## Getting Started

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/evotekscreative/evooconnect2.git
cd evoconnect
```

2. Navigate to the backend directory:
```bash
cd backend
```

3. Install Go dependencies:
```bash
go mod download
```

4. Create and configure your environment variables:
```bash
cp .env.example .env
# Edit .env file with your database credentials and other configuration
```

5. Set up the database:
```bash
# Run database migrations (command may vary based on implementation)
go run ./db/migrations
```

6. Start the backend server:
```bash
go run main.go
```

The backend server should now be running at http://localhost:8080 (or your configured port).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Create and configure your environment variables if needed:
```bash
cp .env.example .env
# Edit .env file with your API URL and other configuration
```

4. Start the development server:
```bash
npm run dev
```

The frontend development server should now be running at http://localhost:5173.

## Environment Variables

### Backend (.env)
```
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
```
VITE_API_URL=http://localhost:8080/api
```

## Project Structure

```
evoconnect/
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── api_docs/
│   ├── app/
│   ├── controller/
│   ├── db/
│   ├── exception/
│   ├── helper/
│   ├── middleware/
│   ├── model/
│   ├── repository/
│   ├── service/
│   ├── test/
│   └── uploads/
└── frontend/
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        ├── pages/
        └── routes.jsx
```

## API Documentation

API documentation is available in the following formats:

<!-- - **Swagger**: Access at `http://localhost:8080/swagger/index.html` when the backend server is running -->
- **Postman Collection**: Available at postman.json

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and owned by EVO Technologies. All rights reserved.

---

For any issues or questions, please contact the development team.

Similar code found with 2 license types