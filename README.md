# Lead Management System

A full-stack lead management application built with Node.js + Express (backend) and Next.js (frontend).

## Features

### Backend API
- **Create Leads** with auto-assignment to user with least leads
- **List Leads** with pagination, filtering (status, source, assigned_to), and sorting
- **Update Lead Status** with validation for allowed transitions
- **Activity Timeline** grouped by date
- **Duplicate Detection** with smart matching algorithm

### Frontend
- **Lead List Page** with table view, filters, and pagination
- **Lead Detail Page** with full information, timeline, and status management
- **Create Lead Page** with duplicate detection warning
- Responsive design with Tailwind CSS

## Project Structure

```
lead-management-system/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── database.js
│   ├── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── lib/
    │   ├── pages/
    │   └── styles/
    ├── package.json
    └── next.config.js
```

## Installation & Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Users
- `POST /api/users` - Create a user
- `GET /api/users` - List all users

### Leads
- `POST /api/leads` - Create a new lead
- `GET /api/leads` - List leads (with pagination, filters, sorting)
- `PUT /api/leads/:id/status` - Update lead status
- `GET /api/leads/:id/timeline` - Get lead activity timeline
- `POST /api/leads/check-duplicate` - Check for duplicate leads

## Validation Rules

### Email
- Must be a valid email format

### Phone
- Must contain exactly 10 digits
- Formats like `+1 (123) 456-7890` or `123-456-7890` are accepted

### Status Transitions
- `new` → `contacted` or `lost`
- `contacted` → `qualified` or `lost`
- `qualified` → `converted` or `lost`
- `converted` → (no transitions)
- `lost` → (no transitions)
- Any status → `lost`

## Duplicate Detection Algorithm

Matches based on:
1. **Email** (40% weight) - Ignores dots in Gmail addresses
2. **Phone** (35% weight) - Ignores formatting and country codes
3. **Name** (25% weight) - Case-insensitive, trimmed comparison

Confidence score: Shows overall match percentage (>50% triggers warning)

## Technologies

- **Backend**: Express.js, Sequelize, SQLite3, Validator.js
- **Frontend**: Next.js, React, Tailwind CSS, Axios, React Icons
- **Database**: SQLite3

## Database Schema

### Users
- id (primary key)
- name
- email (unique)
- department
- timestamps

### Leads
- id (primary key)
- name
- email
- phone
- source (enum)
- status (enum)
- assigned_to (foreign key to Users)
- notes
- timestamps

### LeadActivity
- id (primary key)
- lead_id (foreign key)
- activity_type (enum)
- description
- created_by (foreign key to Users, optional)
- createdAt

## Notes

- The system uses SQLite for simplicity. For production, consider using PostgreSQL
- Default leads are auto-assigned to the user with the least assigned leads
- The frontend requires the backend API to be running
