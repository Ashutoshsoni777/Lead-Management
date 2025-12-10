# Lead Management System - Setup Guide

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Install Dependencies

From the project root directory:

```bash
# Install all dependencies for both backend and frontend
npm run setup
```

Or manually:

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### Step 2: Start the Backend

```bash
cd backend
npm run dev
```

The backend API will start on `http://localhost:5000`

You should see output like:
```
Database synced successfully
Server is running on http://localhost:5000
```

### Step 3: (Optional) Seed Sample Data

In another terminal:

```bash
cd backend
npm run seed
```

This will create sample users and leads for testing.

### Step 4: Start the Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### Step 5: Access the Application

Open your browser and go to: **http://localhost:3000**

## Using Both Services Simultaneously

You can run both backend and frontend at the same time from the root directory:

```bash
npm run dev
```

This requires `concurrently` to be installed (included in root package.json).

## Application Overview

### Home Page
- Navigate to leads list
- Create a new lead

### Leads List Page (`/leads`)
- View all leads in a table format
- Filter by status, source, or assigned user
- Sort by creation date or last activity
- Pagination (10 leads per page)
- Click any lead to view details

### Create Lead Page (`/leads/new`)
1. Fill in required fields: Name, Email, Phone
2. Select a source (optional, defaults to 'other')
3. Add notes (optional)
4. Click "Check for Duplicates & Continue"
5. Review duplicate detection results if found
6. Confirm creation

### Lead Detail Page (`/leads/[id]`)
- View complete lead information
- See activity timeline grouped by date
- Change lead status with validation
- Only allowed status transitions are available

## Database

The system uses **SQLite** by default. The database file is automatically created at:
- Backend: `backend/database.sqlite`

## API Endpoints

All API endpoints are prefixed with `/api`

### Users API
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user

### Leads API
- `GET /api/leads` - Get paginated leads list
  - Query params: `page`, `status`, `source`, `assigned_to`, `sortBy`
- `POST /api/leads` - Create a new lead
- `GET /api/leads/:id/timeline` - Get lead activity timeline
- `PUT /api/leads/:id/status` - Update lead status
- `POST /api/leads/check-duplicate` - Check for duplicates

## Features in Detail

### Duplicate Detection

Smart algorithm that detects potential duplicates by:
1. **Email matching** (40% weight)
   - Exact match after normalization
   - Gmail dots are ignored (john.doe = johndoe)

2. **Phone matching** (35% weight)
   - Exact match after normalization
   - Ignores formatting: +91-98765-43210 = 9876543210

3. **Name matching** (25% weight)
   - Fuzzy string matching
   - Case-insensitive
   - Whitespace trimmed

**Threshold**: Warning shows if confidence >= 50%

### Status Transitions

```
new ──→ contacted ──→ qualified ──→ converted
 │                        │
 └────→ lost ←────────────┘
```

Any status can transition to 'lost', but no transitions from 'lost' or 'converted'.

### Auto-Assignment

When a new lead is created, it's automatically assigned to the user with the least number of assigned leads.

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify Node.js is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Frontend won't start
- Check if port 3000 is already in use
- Verify the backend API is running on port 5000
- Check NEXT_PUBLIC_API_URL in `frontend/.env.local`

### Database errors
- Delete `backend/database.sqlite` and restart the backend
- Run the seed script again: `npm run backend:seed`

### API calls failing
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API URL is correct in `frontend/src/lib/api.js`

## Development Tips

### Backend
- Modify API routes in `backend/routes/index.js`
- Add new controllers in `backend/controllers/`
- Update database models in `backend/models/`
- Use `nodemon` for auto-reload during development

### Frontend
- Pages are in `backend/src/pages/`
- API calls are in `frontend/src/lib/api.js`
- Styling uses Tailwind CSS
- Use `next dev` for hot reload

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a production database (PostgreSQL recommended)
3. Configure environment variables in `.env`
4. Deploy to a Node.js hosting service

### Frontend
1. Build the Next.js app: `npm run build`
2. Start production server: `npm start`
3. Deploy to Vercel, Netlify, or any static hosting

## File Structure

```
lead-management-system/
├── backend/
│   ├── controllers/
│   │   ├── leadController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   └── LeadActivity.js
│   ├── routes/
│   │   └── index.js
│   ├── utils/
│   │   ├── validators.js
│   │   └── duplicateDetection.js
│   ├── database.js
│   ├── index.js
│   ├── seed.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── index.js
│   │   │   ├── _app.js
│   │   │   ├── _document.js
│   │   │   └── leads/
│   │   │       ├── index.js
│   │   │       ├── [id].js
│   │   │       └── new.js
│   │   └── styles/
│   │       └── globals.css
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── README.md
├── SETUP.md (this file)
├── .gitignore
└── package.json
```

## Support

For issues or questions, refer to the README.md file or check the console logs for detailed error messages.

Happy lead managing! 🎉
