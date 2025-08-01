# Property Activity Tracker Backend

This is the backend for the Property Activity Tracker application.
It is built with NestJS and will provide REST API and WebSocket functionality for tracking property-related activities by sales representatives.

## Features

* Track different types of activities for each property
* Real-time updates for connected users
* Replay of missed activities when a user reconnects
* Weighted scoring system with notifications

## Tech Stack

* NestJS
* PostgreSQL
* WebSockets (Socket.IO)
* Swagger for API documentation

## Installation

```bash
# Clone repository
git clone https://github.com/Salma-Mahmoudd/PropertyActivityTracker.git
cd PropertyActivityTracker

# Install dependencies
npm install
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
