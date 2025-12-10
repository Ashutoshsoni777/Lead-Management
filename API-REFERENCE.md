# API Reference - Lead Management System

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Users

#### List All Users
```
GET /users
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "department": "Sales",
    "createdAt": "2025-12-10T10:00:00Z",
    "updatedAt": "2025-12-10T10:00:00Z"
  }
]
```

#### Create User
```
POST /users
```
**Request Body:**
```json
{
  "name": "John Manager",
  "email": "john@company.com",
  "department": "Sales"
}
```

---

### Leads

#### Create Lead
```
POST /leads
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "source": "website",
  "notes": "Interested in enterprise plan"
}
```
**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "source": "website",
  "status": "new",
  "assigned_to": 1,
  "notes": "Interested in enterprise plan",
  "assignee": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@company.com"
  },
  "createdAt": "2025-12-10T10:00:00Z",
  "updatedAt": "2025-12-10T10:00:00Z"
}
```

**Errors:**
- `400` - Name, email, or phone missing
- `400` - Invalid email format
- `400` - Invalid phone format (not 10 digits)

---

#### List Leads
```
GET /leads?page=1&status=new&source=website&assigned_to=1&sortBy=created_at
```

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `status` (string, optional) - Filter by status: `new`, `contacted`, `qualified`, `converted`, `lost`
- `source` (string, optional) - Filter by source: `website`, `referral`, `social_media`, `cold_call`, `email`, `other`
- `assigned_to` (number, optional) - Filter by user ID
- `sortBy` (string, optional) - Sort by `created_at` (default) or `last_activity`

**Response:**
```json
{
  "leads": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "source": "website",
      "status": "new",
      "assigned_to": 1,
      "notes": null,
      "createdAt": "2025-12-10T10:00:00Z",
      "updatedAt": "2025-12-10T10:00:00Z",
      "assignee": {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@company.com"
      },
      "activityCount": 3
    }
  ],
  "totalCount": 1,
  "page": 1,
  "totalPages": 1
}
```

**Example Requests:**
```bash
# Get first page
curl http://localhost:5000/api/leads?page=1

# Filter by status
curl http://localhost:5000/api/leads?status=contacted

# Filter by source and user
curl http://localhost:5000/api/leads?source=referral&assigned_to=2

# Sort by last activity
curl http://localhost:5000/api/leads?sortBy=last_activity
```

---

#### Update Lead Status
```
PUT /leads/:id/status
```
**Path Parameters:**
- `id` (number) - Lead ID

**Request Body:**
```json
{
  "newStatus": "contacted"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "source": "website",
  "status": "contacted",
  "assigned_to": 1,
  "notes": null,
  "createdAt": "2025-12-10T10:00:00Z",
  "updatedAt": "2025-12-10T10:00:01Z"
}
```

**Errors:**
- `404` - Lead not found
- `400` - Invalid status transition

**Valid Transitions:**
- `new` → `contacted`, `lost`
- `contacted` → `qualified`, `lost`
- `qualified` → `converted`, `lost`
- Any status → `lost`

**Example:**
```bash
curl -X PUT http://localhost:5000/api/leads/1/status \
  -H "Content-Type: application/json" \
  -d '{"newStatus":"contacted"}'
```

---

#### Get Lead Timeline
```
GET /leads/:id/timeline
```
**Path Parameters:**
- `id` (number) - Lead ID

**Response:**
```json
{
  "lead": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "source": "website",
    "status": "contacted",
    "assigned_to": 1,
    "notes": null,
    "createdAt": "2025-12-10T10:00:00Z",
    "updatedAt": "2025-12-10T10:00:01Z"
  },
  "timeline": {
    "Dec 10, 2025": [
      {
        "id": 1,
        "lead_id": 1,
        "activity_type": "other",
        "description": "Lead created with email john@example.com",
        "created_by": null,
        "creator": null,
        "createdAt": "2025-12-10T10:00:00Z"
      },
      {
        "id": 2,
        "lead_id": 1,
        "activity_type": "status_change",
        "description": "Status changed from 'new' to 'contacted'",
        "created_by": null,
        "creator": null,
        "createdAt": "2025-12-10T10:00:01Z"
      }
    ]
  }
}
```

**Example:**
```bash
curl http://localhost:5000/api/leads/1/timeline
```

---

#### Check for Duplicate Leads
```
POST /leads/check-duplicate
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@gmail.com",
  "phone": "+1 (555) 123-4567"
}
```

**Response (with duplicates found):**
```json
{
  "isDuplicate": true,
  "matches": [
    {
      "id": 2,
      "name": "John Doe",
      "email": "johndoe@gmail.com",
      "phone": "5551234567",
      "status": "new",
      "source": "website",
      "confidence": 95,
      "matchedFields": ["email", "phone", "name"]
    }
  ],
  "confidence": 95
}
```

**Response (no duplicates):**
```json
{
  "isDuplicate": false,
  "matches": [],
  "confidence": 0
}
```

**Confidence Breakdown:**
- Email (40%) - Exact match or high similarity
- Phone (35%) - Exact match or high similarity  
- Name (25%) - Fuzzy match (Levenshtein distance)

**Special Cases:**
- Gmail dots ignored: `john.doe@gmail.com` = `johndoe@gmail.com`
- Phone formatting ignored: `+91-98765-43210` = `9876543210`
- Name case-insensitive: `john smith` = `John Smith`

**Errors:**
- `400` - Name, email, or phone missing
- `400` - Invalid email format
- `400` - Invalid phone format

**Example:**
```bash
curl -X POST http://localhost:5000/api/leads/check-duplicate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "phone": "+1 (555) 123-4567"
  }'
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Resource doesn't exist |
| `500` | Server Error - Internal error |

---

## Common Headers

**Request:**
```
Content-Type: application/json
```

**Response:**
```
Content-Type: application/json
```

---

## Data Types

### Lead Sources
- `website`
- `referral`
- `social_media`
- `cold_call`
- `email`
- `other`

### Lead Statuses
- `new` - Just created
- `contacted` - Reached out
- `qualified` - Shows potential
- `converted` - Won the deal
- `lost` - Deal fell through

### Activity Types
- `status_change` - Status updated
- `note_added` - Note added
- `assignment_change` - Assigned to different user
- `other` - Generic activity

---

## Examples Using cURL

### Create a Lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@company.com",
    "phone": "9876543210",
    "source": "referral",
    "notes": "Referred by John"
  }'
```

### Get All Leads
```bash
curl http://localhost:5000/api/leads
```

### Filter by Status
```bash
curl "http://localhost:5000/api/leads?status=contacted&page=1"
```

### Update Status
```bash
curl -X PUT http://localhost:5000/api/leads/1/status \
  -H "Content-Type: application/json" \
  -d '{"newStatus": "qualified"}'
```

### Get Timeline
```bash
curl http://localhost:5000/api/leads/1/timeline
```

### Check Duplicates
```bash
curl -X POST http://localhost:5000/api/leads/check-duplicate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@company.com",
    "phone": "9876543210"
  }'
```

---

## Testing the API

### Using Postman
1. Import the endpoints listed above
2. Set base URL: `http://localhost:5000/api`
3. Test each endpoint

### Using cURL (see examples above)

### Using Frontend UI
1. Open http://localhost:3000
2. All API calls are made automatically
3. Check browser Network tab to see requests

---

## Rate Limiting
Currently no rate limiting. Add in production!

## Authentication
Currently no authentication. Add JWT in production!

## Pagination
- Default: 10 items per page
- Maximum: Not enforced (set in production)
- Configurable in frontend/src/pages/leads/index.js

---

**Last Updated**: December 10, 2025  
**API Version**: 1.0
