# Property Activity Tracker Backend

This is the backend for the Property Activity Tracker application.
It is built with NestJS and will provide REST API and WebSocket functionality for tracking property-related activities by sales representatives.

## Features

- JWT Authentication & Role-based access control
- Track different types of activities for each property
- Real-time updates for connected users
- Replay of missed activities when a user reconnects
- Weighted scoring system with notifications
- Swagger API documentation

## Tech Stack

- NestJS
- PostgreSQL
- Prisma ORM
- WebSockets (Socket.IO)
- Swagger for API documentation

## Installation

```bash
# Clone repository
git clone https://github.com/Salma-Mahmoudd/PropertyActivityTracker.git
cd PropertyActivityTracker

# Install dependencies
npm install
```

## Database Setup (Prisma)

This project uses **Prisma** as the ORM. Before running the project, configure your database connection.

1. **Set your database URL** in a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/your_database?schema=public"
```

Replace `USER`, `PASSWORD`, and `your_database` with your PostgreSQL credentials.

2. **Run Prisma migrations** to set up the database schema:

```bash
npx prisma migrate dev --name init
```

3. **Generate Prisma Client**:

```bash
npx prisma generate
```

4. **Seed the database with sample data**:

```bash
npx prisma db seed
```

## Running the Project

```bash
# Development mode
npm run start:dev
```

## API Documentation

Once the server is running, Swagger UI will be available at:

```none
http://localhost:3000/api-docs
```
