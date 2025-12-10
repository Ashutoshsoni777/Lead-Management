# 📊 Lead Management System - Visual Project Map

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lead Management System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐        ┌──────────────────────┐      │
│  │   Frontend (Port 3000) │        │  Backend (Port 5000)  │      │
│  │   ================   │        │   =================  │      │
│  │  Next.js + React     │        │  Express.js         │      │
│  │  Tailwind CSS        │        │  Sequelize ORM      │      │
│  │  Axios HTTP Client   │        │  SQLite Database    │      │
│  │                      │        │                     │      │
│  │  Pages:              │        │  API Endpoints:     │      │
│  │  • Home (/)          │        │  • GET    /leads    │      │
│  │  • List (/leads)     │        │  • POST   /leads    │      │
│  │  • Create (/leads..) │        │  • PUT    /leads..) │      │
│  │  • Detail (/leads..) │        │  • POST   /check-.. │      │
│  │                      │        │  • GET    /timeline │      │
│  └──────────────────────┘        │  • GET    /users    │      │
│          │                        │  • POST   /users    │      │
│          │                        └──────────────────────┘      │
│          │                                  │                   │
│          └──────────────────────────────────┘                   │
│                    API Calls (Axios)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ↓
              ┌──────────────────────┐
              │   SQLite Database    │
              │  ================   │
              │                     │
              │  • Users (managers) │
              │  • Leads (data)     │
              │  • Activities (log) │
              │                     │
              └──────────────────────┘
```

---

## 📱 Frontend Pages Structure

```
Home (/)
└── ┌─────────────────────┐
    │  Welcome Page       │
    │  • Logo & Title     │
    │  • 2 Main Buttons   │
    │    - View Leads     │
    │    - Create Lead    │
    └─────────────────────┘

Leads List (/leads)
└── ┌──────────────────────────────┐
    │  Lead Management Hub         │
    │  ┌────────────────────────┐ │
    │  │  Filter Bar            │ │
    │  │  • Status selector     │ │
    │  │  • Source selector     │ │
    │  │  • User selector       │ │
    │  └────────────────────────┘ │
    │  ┌────────────────────────┐ │
    │  │  Leads Table           │ │
    │  │  • Name, Email, Status │ │
    │  │  • Assigned User       │ │
    │  │  • Last Activity       │ │
    │  │  • View Button         │ │
    │  └────────────────────────┘ │
    │  ┌────────────────────────┐ │
    │  │  Pagination            │ │
    │  │  [1] [2] [3] ...       │ │
    │  └────────────────────────┘ │
    └──────────────────────────────┘

Create Lead (/leads/new)
└── ┌──────────────────────────────┐
    │  Lead Creation Form          │
    │  ┌────────────────────────┐ │
    │  │ Name input             │ │
    │  │ Email input            │ │
    │  │ Phone input            │ │
    │  │ Source dropdown        │ │
    │  │ Notes textarea         │ │
    │  │                        │ │
    │  │ [Check Duplicates] ──┐ │
    │  └────────────────────────┘ │
    │                             │
    │  If Duplicates Found:       │
    │  ┌────────────────────────┐ │
    │  │  Warning Dialog        │ │
    │  │  Match 1: 95% match    │ │
    │  │  ▰▰▰▰▰▰▰▰▰░           │ │
    │  │  Match 2: 60% match    │ │
    │  │  ▰▰▰▰▰░░░░            │ │
    │  │                        │ │
    │  │  [Create Anyway]       │ │
    │  │  [Cancel & Edit]       │ │
    │  └────────────────────────┘ │
    └──────────────────────────────┘

Lead Detail (/leads/[id])
└── ┌──────────────────────────────┐
    │  Lead Information & Timeline  │
    │  ┌────────────────────────┐ │
    │  │ Lead Card              │ │
    │  │ Name: John Doe         │ │
    │  │ Email: john@test.com   │ │
    │  │ Phone: 123-456-7890    │ │
    │  │ Status: ⬤ new          │ │
    │  └────────────────────────┘ │
    │  ┌────────────────────────┐ │
    │  │ Status Management      │ │
    │  │ [dropdown ▼ contacted] │ │
    │  │ Valid: contacted, lost │ │
    │  │ [Update Status]        │ │
    │  └────────────────────────┘ │
    │  ┌────────────────────────┐ │
    │  │ Activity Timeline      │ │
    │  │                        │ │
    │  │ Dec 10, 2025           │ │
    │  │ • 📊 Status changed    │ │
    │  │ • 📝 Note added        │ │
    │  │                        │ │
    │  │ Dec 9, 2025            │ │
    │  │ • ✅ Lead created      │ │
    │  └────────────────────────┘ │
    └──────────────────────────────┘
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      SQLite Database                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                       │
│  │   Users Table    │                                       │
│  ├──────────────────┤                                       │
│  │ id (PRIMARY KEY) │                                       │
│  │ name (STRING)    │                                       │
│  │ email (STRING)   │◄─────┐                               │
│  │ department       │      │                               │
│  │ createdAt        │      │                               │
│  │ updatedAt        │      │                               │
│  └──────────────────┘      │                               │
│                            │ one-to-many                   │
│  ┌──────────────────┐      │                               │
│  │  Leads Table     │      │                               │
│  ├──────────────────┤      │                               │
│  │ id (PRIMARY KEY) │      │                               │
│  │ name (STRING)    │◄─────┘                               │
│  │ email (STRING)   │                                       │
│  │ phone (STRING)   │◄─────┐                               │
│  │ source (ENUM)    │      │ one-to-many                   │
│  │ status (ENUM)    │      │                               │
│  │ assigned_to (FK) │      │                               │
│  │ notes (TEXT)     │      │                               │
│  │ createdAt        │      │                               │
│  │ updatedAt        │      │                               │
│  └──────────────────┘      │                               │
│                            │                               │
│  ┌──────────────────────┐  │                               │
│  │ LeadActivities Table │  │                               │
│  ├──────────────────────┤  │                               │
│  │ id (PRIMARY KEY)     │  │                               │
│  │ lead_id (FK)         │◄─┘                               │
│  │ activity_type (ENUM) │                                   │
│  │ description (TEXT)   │                                   │
│  │ created_by (FK)      │                                   │
│  │ createdAt            │                                   │
│  └──────────────────────┘                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Creating a Lead
```
User fills form
    ↓
[Check Duplicates] API call
    ↓
Backend searches all leads
    ↓
Fuzzy matching algorithm
    ↓
Return matches (if any)
    ↓
Show warning UI / Show "No duplicates"
    ↓
[Create Anyway] button clicked
    ↓
POST /api/leads
    ↓
Validate email, phone, name
    ↓
Find user with least leads
    ↓
Create lead record
    ↓
Log activity: "Lead created"
    ↓
Return created lead with user info
    ↓
Redirect to detail page
```

### Updating Lead Status
```
User selects new status
    ↓
Click [Update Status]
    ↓
PUT /api/leads/:id/status
    ↓
Backend validates transition
    ↓
Valid? ├─→ No  ──→ Return error
       │
       └─→ Yes ──→ Update lead.status
                    ↓
                Create activity log
                    ↓
                Return updated lead
                    ↓
            Fetch timeline
                    ↓
            Update UI with new timeline
```

### Detecting Duplicates
```
Form submission
    ↓
POST /api/leads/check-duplicate
    ├─ name
    ├─ email
    └─ phone
    ↓
Normalize inputs
├─ Email: remove dots (Gmail), lowercase
├─ Phone: remove formatting, extract digits
└─ Name: lowercase, trim spaces
    ↓
Check all existing leads
    ↓
For each lead:
├─ Calculate email similarity
├─ Calculate phone similarity
├─ Calculate name similarity
└─ Sum weighted scores
    ↓
Filter matches with score >= 50%
    ↓
Sort by confidence (highest first)
    ↓
Return { isDuplicate, matches, confidence }
    ↓
Show warning UI with matches
```

---

## 🔀 User Workflows

### Workflow 1: Create & Manage a New Lead
```
1. Click "Create Lead" button
2. Fill in: Name, Email, Phone, Source
3. Click "Check for Duplicates"
4. Review any warnings
5. Click "Create Anyway" or "Cancel"
6. See success message
7. Redirected to lead detail page
8. Change status as needed
9. View activity timeline
```

### Workflow 2: Find & Filter Leads
```
1. Go to Leads List
2. See all leads (page 1)
3. Apply filters:
   - Status = "contacted"
   - Source = "referral"
   - Assigned = "Alice"
4. Table updates with matches
5. Go to pagination page 2
6. Click on lead to view details
7. View full information
```

### Workflow 3: Track Lead Progress
```
1. View lead details
2. See current status: "new"
3. Change to "contacted"
4. See activity: "Status changed to contacted"
5. Days later... change to "qualified"
6. See updated timeline
7. Continue until "converted" or "lost"
8. Full audit trail visible
```

---

## 📤 API Request/Response Flow

### Example: Create Lead
```
┌─────────────────────────────────────────────────┐
│ FRONTEND (axios)                                │
│ POST /api/leads                                 │
│ {                                               │
│   "name": "John Doe",                          │
│   "email": "john@test.com",                    │
│   "phone": "1234567890",                       │
│   "source": "website"                          │
│ }                                               │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────┐
│ BACKEND (Express)                               │
│ leadController.createLead()                     │
│ 1. Validate email ✓                             │
│ 2. Validate phone ✓                             │
│ 3. Find user with least leads                   │
│ 4. Create lead in database                      │
│ 5. Log activity                                 │
│ 6. Fetch created lead with user info            │
└──────────────────┬───────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────┐
│ FRONTEND (receives response)                    │
│ {                                               │
│   "id": 1,                                      │
│   "name": "John Doe",                          │
│   "email": "john@test.com",                    │
│   "phone": "1234567890",                       │
│   "source": "website",                         │
│   "status": "new",                             │
│   "assigned_to": 1,                            │
│   "assignee": {...}                            │
│ }                                               │
│ → Redirect to /leads/1                         │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Status Transition State Machine

```
                    ┌─────────┐
                    │   NEW   │
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            ↓            ↓            ↓
      ┌────────┐    ┌──────────┐  ┌────────┐
      │ LOST   │    │CONTACTED │  │ LOST   │
      └────────┘    └────┬─────┘  └────────┘
            ↑             │
            │        ┌────┴────┐
            │        ↓         ↓
            │    ┌─────────┐ ┌────────┐
            │    │ LOST    │ │QUALIFIED
            │    └─────────┘ └───┬────┘
            │                   │
            │         ┌─────────┘
            │         ↓
            │    ┌──────────┐
            │    │CONVERTED │
            └────┤ (dead-end)
                 └──────────┘

Legend:
→ = Valid transition
All statuses can → LOST
```

---

## 🔍 Duplicate Detection Algorithm

```
Input: name, email, phone
   ↓
Normalization:
├─ Email: lowercase, remove Gmail dots
├─ Phone: extract digits, remove +91
└─ Name: lowercase, trim spaces
   ↓
For each existing lead:
├─ Email similarity (40% weight)
│  ├─ Exact match → 40 points
│  └─ Similarity > 80% → scaled points
│
├─ Phone similarity (35% weight)
│  ├─ Exact match → 35 points
│  └─ Similarity > 90% → scaled points
│
└─ Name similarity (25% weight)
   ├─ Levenshtein distance calculation
   └─ Similarity > 85% → scaled points
   
   ↓
Total confidence = sum of weighted scores
   ↓
Filter: confidence >= 50%
   ↓
Sort by confidence (descending)
   ↓
Return {
  isDuplicate: true/false,
  matches: [{id, confidence, matchedFields}, ...],
  confidence: highest_score
}
```

---

## 📊 Component Hierarchy (Frontend)

```
App (_app.js)
│
├─ Home Page (/)
│  └─ Navigation buttons
│
├─ Leads List (/leads)
│  ├─ Header (nav)
│  ├─ Filters
│  │  ├─ Status select
│  │  ├─ Source select
│  │  └─ User select
│  ├─ Leads Table
│  │  ├─ Header row
│  │  └─ Lead rows (each clickable)
│  └─ Pagination
│
├─ Create Lead (/leads/new)
│  ├─ Header
│  ├─ Form
│  │  ├─ Name input
│  │  ├─ Email input
│  │  ├─ Phone input
│  │  ├─ Source dropdown
│  │  └─ Notes textarea
│  ├─ Duplicate Warning (conditional)
│  │  ├─ Lead match cards
│  │  └─ Action buttons
│  └─ Success message (conditional)
│
└─ Lead Detail (/leads/[id])
   ├─ Header
   ├─ Lead Info Card
   ├─ Status Manager
   │  ├─ Status dropdown
   │  ├─ Valid transitions
   │  └─ Update button
   └─ Timeline
      ├─ Date groups
      └─ Activity items
```

---

## 🎨 UI Color Scheme (Tailwind)

```
Status Badges:
├─ new       → Blue (bg-blue-100, text-blue-800)
├─ contacted → Purple (bg-purple-100, text-purple-800)
├─ qualified → Yellow (bg-yellow-100, text-yellow-800)
├─ converted → Green (bg-green-100, text-green-800)
└─ lost      → Red (bg-red-100, text-red-800)

Activity Types:
├─ status_change     → Blue
├─ note_added        → Green
├─ assignment_change → Purple
└─ other             → Gray

Buttons:
├─ Primary   → Blue (bg-blue-600)
├─ Success   → Green (bg-green-600)
├─ Danger    → Red (bg-red-600)
└─ Secondary → Gray (bg-gray-600)

Backgrounds:
├─ Page     → Light gray (bg-gray-50)
├─ Cards    → White (bg-white)
├─ Success  → Green (bg-green-50)
├─ Warning  → Yellow (bg-yellow-50)
└─ Error    → Red (bg-red-50)
```

---

## 🚀 Deployment Architecture

```
Production Setup:
┌────────────────────────────────────────────────────┐
│         Frontend (Vercel or Netlify)               │
│  Next.js build → Static files + serverless        │
│  Environment: NEXT_PUBLIC_API_URL=...             │
└──────────────┬─────────────────────────────────────┘
               ↓
        HTTPS / CORS
               ↓
┌──────────────────────────────────────────────────┐
│      Backend (Heroku, AWS, DigitalOcean)         │
│  Node.js Express Server (Port: 5000 → 8000)     │
│  Sequelize ORM → PostgreSQL                      │
│  Environment variables for config                │
└──────────────┬─────────────────────────────────────┘
               ↓
        Connection pool
               ↓
┌──────────────────────────────────────────────────┐
│         Database (PostgreSQL)                     │
│  • Users table (indexed on id)                   │
│  • Leads table (indexed on status, source)       │
│  • LeadActivities table (indexed on lead_id)     │
│  • Daily backups                                 │
│  • Read replicas for scale                       │
└──────────────────────────────────────────────────┘
```

---

This visual map shows you exactly how every piece fits together! 🎯

Use this alongside the documentation files for complete understanding.
