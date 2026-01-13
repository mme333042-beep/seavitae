# SeaVitae Backend API

A CV discovery platform backend built with Node.js, Express, PostgreSQL, and Prisma.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **PDF Generation**: PDFKit
- **Email**: Nodemailer

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── index.ts           # Configuration management
│   ├── controllers/
│   │   ├── authController.ts  # Authentication endpoints
│   │   ├── cvController.ts    # Jobseeker CV endpoints
│   │   ├── employerController.ts
│   │   └── messageController.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   ├── errorHandler.ts    # Error handling
│   │   └── validate.ts        # Request validation
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── cv.ts
│   │   ├── employer.ts
│   │   ├── messages.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── cvService.ts
│   │   ├── employerService.ts
│   │   ├── messageService.ts
│   │   ├── emailService.ts
│   │   └── pdfService.ts
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── utils/
│   │   ├── errors.ts          # Custom error classes
│   │   ├── jwt.ts             # JWT utilities
│   │   └── password.ts        # Password hashing
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, configure:
# - DATABASE_URL
# - JWT_ACCESS_SECRET
# - JWT_REFRESH_SECRET
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login with credentials |
| GET | `/verify-email/:token` | Verify email address |
| POST | `/resend-verification` | Resend verification email |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password/:token` | Reset password |
| POST | `/refresh` | Refresh access token |
| GET | `/me` | Get current user |
| POST | `/change-password` | Change password |

### CV/Profile - Jobseeker (`/api/cv`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get own CV profile |
| POST | `/profile` | Create CV profile |
| PUT | `/profile` | Update CV profile |
| GET | `/visibility` | Get visibility status |
| PUT | `/visibility` | Toggle visibility |
| GET | `/download` | Download CV as PDF |

### Employer (`/api/employer`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get employer profile |
| POST | `/profile` | Create employer profile |
| PUT | `/profile` | Update employer profile |
| GET | `/search` | Search visible CVs |
| GET | `/cv/:id` | View full CV |
| POST | `/cv/:id/save` | Save CV snapshot |
| GET | `/saved` | List saved CVs |
| GET | `/saved/:id` | Get saved CV |
| DELETE | `/saved/:id` | Delete saved CV |

### Messages (`/api/messages`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Send message (employer only) |
| GET | `/` | Get inbox |
| GET | `/unread/count` | Get unread count |
| GET | `/conversation/:userId` | Get conversation |
| GET | `/:id` | Get single message |

## Core Features

### Authentication
- Email + password signup/login
- Email verification required before access
- JWT-based authentication with refresh tokens
- Role-based access control (JOBSEEKER, EMPLOYER)

### Jobseeker Features
- Create and manage CV with all sections:
  - Professional summary (required)
  - Skills (required)
  - Experience (required)
  - Education (required)
  - Languages, Certifications, Projects, Publications (optional)
- Profile visibility toggle:
  - **ON**: CV visible to employers, editing locked
  - **OFF**: CV hidden, editing allowed
- Download CV as PDF (jobseeker only)

### Employer Features
- Search visible CVs with filters:
  - Keywords, skills, city
  - Years of experience range
  - Age range (filtering only, not displayed)
- View full CV profiles
- Save CV snapshots (preserved even if original changes)
- Send messages to jobseekers
- Verified employer badge

### Security Rules
- Employers cannot download CVs (only jobseekers)
- Employers cannot edit CVs
- Messaging is employer → jobseeker only
- Age is never displayed, only used for filtering
- Email and phone are hidden until interview accepted

## Scripts

```bash
# Development
npm run dev           # Start dev server with hot reload

# Build
npm run build         # Compile TypeScript

# Production
npm start             # Run compiled code

# Database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio

# Code Quality
npm run lint          # Run ESLint
npm run typecheck     # Type check without emit
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No (default: 3001) |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_ACCESS_SECRET` | Secret for access tokens | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | No (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | No (default: 7d) |
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASSWORD` | SMTP password | No |
| `EMAIL_FROM` | From email address | No |
| `FRONTEND_URL` | Frontend URL for email links | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |

## Security Best Practices

1. **Use strong JWT secrets** - Generate with `openssl rand -base64 64`
2. **Enable HTTPS** in production
3. **Set secure CORS origins** in production
4. **Rate limiting** is enabled by default
5. **Input validation** on all endpoints
6. **Password requirements**: 8+ chars, uppercase, lowercase, number

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (not authorized for action)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## License

Proprietary - SeaVitae
