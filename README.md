# Property Activity Tracker Backend

A comprehensive backend system for tracking property-related activities by sales representatives with real-time updates, activity replay, and notification systems.

## Overview

This backend system provides a robust foundation for a map-based property activity tracker where sales representatives can perform various activities related to properties (visit, call, inspection, follow-up, note) with real-time tracking, persistent history, and collaborative features.

## Key Features

### Core Functionality

- **Real-time Activity Tracking**: Live updates of all user activities via WebSocket
- **Activity Replay System**: Fast-forwarded replay of missed activities when users return online
- **Persistent History**: All activities are stored and remain queryable
- **Weighted Scoring System**: Activities carry weighted scores that accumulate for users
- **Notification System**: Broadcast notifications for score milestones and high-impact activities
- **User Status Tracking**: Real-time online/offline status for all users
- **Team Collaboration**: Full visibility of all users' actions on the shared map

### Technical Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different user roles
- **WebSocket Integration**: Real-time communication using Socket.IO
- **RESTful API**: Comprehensive REST endpoints with Swagger documentation
- **Database Persistence**: PostgreSQL with Prisma ORM

## Architecture

### Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Authentication**: JWT with Passport.js
- **Documentation**: Swagger/OpenAPI

### Project Structure

```
src/
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators (current-user, roles)
│   ├── enums/               # User roles and status enums
│   └── guards/              # Authentication and authorization guards
├── database/
│   └── prisma/              # Database schema and migrations
├── modules/
│   ├── auth/                # Authentication module
│   ├── users/               # User management
│   ├── properties/          # Property management
│   ├── activities/          # Activity type management
│   ├── user-activities/     # User activity tracking and WebSocket
│   └── dashboard/           # Dashboard statistics and leaderboard
└── main.ts                  # Application entry point
```

## Data Models

### User (SalesRep)

- `id`: Unique identifier
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (SALES_REP, ADMIN, MANAGER)
- `status`: Online/offline status
- `score`: Accumulated weighted score
- `lastSeen`: Last activity timestamp
- `avatarUrl`: User avatar URL

### Property

- `id`: Unique identifier
- `name`: Property name (optional)
- `address`: Full property address
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude

### Activity

- `id`: Unique identifier
- `name`: Activity type name (visit, call, inspection, follow-up, note)
- `weight`: Importance score (2-10)
- `icon`: Activity icon URL
- `description`: Activity description

### UserActivity

- `id`: Unique identifier
- `userId`: Reference to user
- `propertyId`: Reference to property
- `activityId`: Reference to activity type
- `note`: Optional activity note
- `latitude`: Activity location latitude
- `longitude`: Activity location longitude
- `createdAt`: Activity timestamp

## Activity Types and Weights

| Activity Type | Description                | Weight | Map Display                  |
| ------------- | -------------------------- | ------ | ---------------------------- |
| visit         | Sales rep visited property | 10     | Marker bounce or pin drop    |
| call          | Called property contact    | 8      | Phone icon flash on location |
| inspection    | Physical inspection logged | 6      | Checklist icon or badge      |
| follow-up     | Follow-up action taken     | 4      | Clock or arrow icon          |
| note          | Note left about property   | 2      | Sticky note popup or tooltip |

## Real-time Features

### Live Activities

- Real-time broadcasting of all user activities
- Instant map updates for all connected users
- Activity notifications with user and property details

### Activity Replay

- **Fast-forwarded replay** (10x speed) when users return online
- **Persistent history** - all activities remain queryable
- **Chronological order** - activities are replayed in time sequence
- **Visual consistency** - replay visuals mirror original live versions

### User Status Management

- Real-time online/offline status tracking
- Automatic status updates on connection/disconnection
- Broadcast status changes to all connected users

## Notification System

### Score-based Notifications

- Triggered when user reaches 100+ points
- Message: "[User] reached 100 points!"
- Broadcast to all connected users

### High-impact Activity Notifications

- Triggered for activities with weight >= 8
- Message: "[User] had an opportunity!"
- Broadcast to all connected users

### Notification Delivery

- Real-time delivery via WebSocket
- Multiple notification types (success, error, info, warning)
- Persistent notification history

## API Endpoints

### Health Check

- `GET /health` - Health check endpoint

### Authentication

- `POST /auth/login` - User login with JWT token generation

### Users

- `GET /users` - Get all users (Admin only)
- `GET /users/public/list` - Get public users (Authenticated users)
- `GET /users/me` - Get current user profile (Authenticated users)
- `GET /users/:id` - Get user by ID (Admin only)
- `POST /users` - Create new user (Admin only)
- `PATCH /users/me` - Update current user profile (Authenticated users)
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Soft delete user (Admin only)
- `PATCH /users/:id/status` - Update user account status (Admin only)

### Properties

- `GET /properties` - Get all properties (Authenticated users)
- `GET /properties/:id` - Get property by ID (Authenticated users)
- `POST /properties` - Create new property (Admin only)
- `PATCH /properties/:id` - Update property (Admin only)
- `DELETE /properties/:id` - Delete property (Admin only)

### Activities

- `GET /activities` - Get all activity types (Authenticated users)
- `GET /activities/:id` - Get activity by ID (Authenticated users)
- `POST /activities` - Create new activity type (Admin only)
- `PATCH /activities/:id` - Update activity type (Admin only)
- `DELETE /activities/:id` - Delete activity type (Admin only)

### User Activities

- `GET /user-activities` - Get current user's activities (Authenticated users)
- `GET /user-activities/all` - Get all user activities with filters (Authenticated users)
- `GET /user-activities/:id` - Get specific user activity (Authenticated users)
- `POST /user-activities` - Create new user activity (Authenticated users)
- `PATCH /user-activities/:id` - Update user activity (Owner only)
- `DELETE /user-activities/:id` - Delete user activity (Owner only)

### Dashboard

- `GET /dashboard/stats` - Get dashboard statistics (Authenticated users)
- `GET /dashboard/leaderboard` - Get user leaderboard (Authenticated users)

## WebSocket Events

### Connection Events

- `connect` - User connects to WebSocket
- `disconnect` - User disconnects from WebSocket

### Activity Events

- `live-activity` - New activity broadcast
- `replay-start` - Replay session starts
- `replay-activity` - Individual activity in replay
- `replay-end` - Replay session ends

### User Events

- `user-status-changed` - User status update
- `online-users` - List of online users

### Notification Events

- `notification` - System notification
- `ping/pong` - Connection health check

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/Salma-Mahmoudd/PropertyActivityTracker.git
cd PropertyActivityTracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/property_activity_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
FRONTEND_URL="http://localhost:5173"
```

4. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed
```

5. **Start the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the server is running, Swagger UI is available at:

```
http://localhost:3000/api-docs
```

## Development

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- TypeScript for type safety

### Available Scripts

```bash
npm run build          # Build the application
npm run start          # Start the application
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run lint           # Run ESLint
npm run format         # Run Prettier
```

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.
