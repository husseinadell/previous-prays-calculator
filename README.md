# Previous Prays Calculator API

API for calculating previous prayers that a user didn't pray and setting goals for each prayer.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Package Manager**: pnpm

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker and Docker Compose

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values as needed.

3. **Start PostgreSQL database**:
   ```bash
   docker-compose up -d
   ```

4. **Set up Prisma**:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

5. **Start the development server**:
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ "email": "user@example.com", "password": "password123" }`

### Health Check

- `GET /health` - Check server status

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
src/
  ├── config/
  │   └── database.ts       # Prisma client configuration
  ├── controllers/
  │   └── auth.controller.ts # Authentication controllers
  ├── middleware/
  │   └── validation.middleware.ts # Request validation
  ├── routes/
  │   └── auth.routes.ts    # Authentication routes
  └── index.ts              # Application entry point
```

