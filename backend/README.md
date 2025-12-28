# 🚀 Daabi Backend API

This document describes the Next.js API routes that power the Daabi platform.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Posts](#posts)
  - [Issues](#issues)
  - [Demands](#demands)
  - [Marketplace](#marketplace)
  - [Comments](#comments)
  - [Reactions](#reactions)
  - [Users](#users)

---

## 🔧 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker (optional, for local database)

### Setup

1. **Start the PostgreSQL database:**
   ```bash
   cd web
   docker-compose up -d
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "errors": { "field": ["validation errors"] }
}
```

---

### 🔐 Authentication

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "student@sust.edu",
  "password": "SecurePass123",
  "name": "John Doe",
  "studentId": "2020331001",
  "department": "CSE",
  "batch": "53",
  "hall": "Bangabandhu Hall"
}
```

#### POST `/api/auth/login`
Log in to an existing account.

**Request Body:**
```json
{
  "email": "student@sust.edu",
  "password": "SecurePass123"
}
```

#### POST `/api/auth/logout`
Log out the current user.

#### GET `/api/auth/me`
Get the currently authenticated user.

---

### 📱 Posts

#### GET `/api/posts`
Get paginated posts feed.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `type` - Filter by post type (TEXT, IMAGE, VIDEO, LINK, POLL)
- `authorId` - Filter by author

#### POST `/api/posts`
Create a new post (requires authentication).

**Request Body:**
```json
{
  "content": "Hello campus!",
  "type": "TEXT",
  "visibility": "PUBLIC",
  "isAnonymous": false,
  "media": [
    { "url": "https://...", "type": "IMAGE", "caption": "..." }
  ]
}
```

#### GET `/api/posts/[id]`
Get a single post with comments and reactions.

#### PATCH `/api/posts/[id]`
Update a post (author only).

#### DELETE `/api/posts/[id]`
Delete a post (author only).

---

### 🔧 Issues

#### GET `/api/issues`
Get paginated issues list.

**Query Parameters:**
- `page`, `limit`
- `status` - REPORTED, ASSIGNED, IN_PROGRESS, DISCUSSED, ACTION_TAKEN, RESOLVED, CLOSED
- `category`, `priority`
- `sortBy` - activity, recent, votes

#### POST `/api/issues`
Create a new issue (requires authentication).

**Request Body:**
```json
{
  "title": "WiFi down in Hall A",
  "description": "The WiFi has been non-functional since yesterday...",
  "category": "Infrastructure",
  "location": "Hall A, 3rd Floor",
  "priority": "HIGH",
  "isAnonymous": false
}
```

#### GET `/api/issues/[id]`
Get issue details with contributions and comments.

#### PATCH `/api/issues/[id]`
Update an issue (author/moderator).

#### DELETE `/api/issues/[id]`
Delete an issue (author/admin).

#### GET `/api/issues/[id]/contributions`
Get all contributions for an issue.

#### POST `/api/issues/[id]/contributions`
Add a contribution (UPDATE, COMMENT, EVIDENCE, SOLUTION, ESCALATION).

---

### 📋 Demands

#### GET `/api/demands`
Get paginated demands list.

**Query Parameters:**
- `page`, `limit`
- `category` - DEPARTMENT, HALL, CLUB, ENVIRONMENT, INFRASTRUCTURE, ACADEMIC, ADMINISTRATIVE, OTHER
- `status` - PENDING, UNDER_REVIEW, ACCEPTED, IN_PROGRESS, REJECTED, RESOLVED
- `sortBy` - popular, recent, votes

#### POST `/api/demands`
Create a new demand (requires authentication).

#### GET `/api/demands/[id]`
Get demand details with votes, comments, events.

#### PATCH `/api/demands/[id]`
Update a demand.

#### DELETE `/api/demands/[id]`
Delete a demand.

#### POST `/api/demands/[id]/vote`
Vote on a demand (AGREE/DISAGREE).

**Request Body:**
```json
{
  "voteType": "AGREE"
}
```

---

### 🛒 Marketplace (Kroy-Bikroy)

#### GET `/api/marketplace`
Get marketplace items.

**Query Parameters:**
- `page`, `limit`
- `category` - ELECTRONICS, BOOKS, CLOTHING, FURNITURE, ACCESSORIES, SPORTS, STATIONERY, OTHER
- `condition` - NEW, LIKE_NEW, GOOD, FAIR, POOR
- `status` - AVAILABLE, RESERVED, SOLD
- `minPrice`, `maxPrice`
- `search`
- `sortBy` - recent, price_low, price_high

#### POST `/api/marketplace`
List a new item for sale.

**Request Body:**
```json
{
  "title": "MacBook Pro 2020",
  "description": "Excellent condition, barely used...",
  "price": 85000,
  "category": "ELECTRONICS",
  "condition": "LIKE_NEW",
  "location": "Hall A"
}
```

#### GET `/api/marketplace/[id]`
Get item details with seller info.

#### PATCH `/api/marketplace/[id]`
Update item listing.

#### DELETE `/api/marketplace/[id]`
Remove item listing.

---

### 💬 Comments

#### GET `/api/comments`
Get comments for a resource.

**Query Parameters:**
- `postId` OR `issueId` OR `demandId` (one required)
- `parentId` (for replies)
- `page`, `limit`

#### POST `/api/comments`
Add a comment.

**Request Body:**
```json
{
  "postId": "...",
  "content": "Great post!",
  "isAnonymous": false
}
```

#### GET `/api/comments/[id]`
Get comment with replies.

#### PATCH `/api/comments/[id]`
Edit a comment.

#### DELETE `/api/comments/[id]`
Delete a comment.

---

### ❤️ Reactions

#### POST `/api/reactions`
Add or toggle a reaction.

**Request Body:**
```json
{
  "postId": "...",
  "type": "LIKE"
}
```

**Reaction Types:** LIKE, LOVE, HAHA, WOW, SAD, ANGRY

#### DELETE `/api/reactions`
Remove a reaction.

**Query Parameters:**
- `postId` OR `commentId`

---

### 👤 Users

#### GET `/api/users/[id]`
Get user's public profile.

#### PATCH `/api/users/[id]`
Update user profile (self only).

---

## 🗃️ Database Schema

The database schema includes the following models:

- **User** - Student accounts with verification
- **Session** - Authentication sessions
- **Post** - Feed posts with media
- **Comment** - Threaded comments
- **Reaction** - Post/comment reactions
- **Issue** - Campus issues with status tracking
- **IssueContribution** - Activity log for issues
- **Demand** - Student demands with voting
- **DemandVote** - Agree/disagree votes
- **DemandEvent** - Events related to demands
- **MarketplaceItem** - Buy-sell listings
- **Crowdfunding** - Fundraising campaigns
- **Donation** - Crowdfunding donations
- **Notification** - User notifications
- **Report** - Content/user reports
- **Tag** - Content tagging system

See `prisma/schema.prisma` for full schema definition.

---

## 🔒 Authentication

The API uses cookie-based session authentication:

1. On login/signup, a secure HTTP-only cookie is set
2. The cookie is automatically sent with subsequent requests
3. Sessions expire after 30 days
4. Use `/api/auth/logout` to invalidate sessions

---

## 📝 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Server Error |
