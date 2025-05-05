Collecting workspace informationStill updating workspace index. Falling back to using the latest remote code index only. Response may be less accurate.# EvoConnect - Professional Social Networking Platform

EvoConnect is a full-stack social networking platform designed for professional connections, job hunting, and career development. It features a modern UI with various social networking capabilities similar to LinkedIn, including profiles, connections, job postings, company pages, blogging, and messaging.

!EvoConnect

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
- [MySQL](https://dev.mysql.com/downloads/) or [PostgreSQL](https://www.postgresql.org/download/) database
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
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=evoconnect
DB_USER=root
DB_PASSWORD=yourpassword

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h

# Server Configuration
PORT=8080
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

- **Swagger**: Access at `http://localhost:8080/swagger/index.html` when the backend server is running
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