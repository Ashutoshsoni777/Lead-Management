# Testing Guide - Lead Management System

## Running the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```
Expected output:
```
Database synced successfully
Server is running on http://localhost:5000
```

### 2. Start Frontend (in another terminal)
```bash
cd frontend
npm run dev
```
Expected output:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 3. Seed Sample Data (optional, in a third terminal)
```bash
cd backend
npm run seed
```
Expected output:
```
✅ Created users: Alice Johnson, Bob Smith, Carol Williams
✅ Created leads: John Doe, Jane Smith, Mike Johnson, Sarah Davis
✅ Created activities
✅ Database seeding completed successfully!
```

## Manual Testing Scenarios

### Test 1: View Homepage
1. Open http://localhost:3000
2. Click "View Leads" or "Create Lead"
3. Should navigate correctly

### Test 2: List Leads
1. Go to http://localhost:3000/leads
2. Should see leads table with columns: Name, Email, Status, Assigned To, Last Activity, Action
3. Test pagination if there are more than 10 leads
4. Test filters:
   - Filter by Status (try "new", "contacted", etc.)
   - Filter by Source (try "website", "referral", etc.)
   - Filter by Assigned User

### Test 3: Create Lead (without duplicates)
1. Go to http://localhost:3000/leads/new
2. Fill in form:
   - Name: "Test User"
   - Email: "test@newemail.com"
   - Phone: "1234567890"
   - Source: "website"
   - Notes: "Test note"
3. Click "Check for Duplicates & Continue"
4. Should see "No Duplicates Found" message
5. Click "Create Lead"
6. Should redirect to lead detail page with success message

### Test 4: Duplicate Detection
1. Go to http://localhost:3000/leads/new
2. Fill in existing lead's info (from seeded data):
   - Name: "John Doe"
   - Email: "john.doe@gmail.com" or "johndoe@gmail.com" (Gmail dot variant)
   - Phone: "+1-555-123-4567" or "5551234567" (different format)
3. Click "Check for Duplicates & Continue"
4. Should show duplicate warning with:
   - Lead name, email, phone
   - Confidence percentage (should be high)
   - Matched fields (email, phone, name)
   - Option to "Create Anyway" or "Cancel & Edit"

### Test 5: View Lead Details
1. Go to http://localhost:3000/leads
2. Click "View" button on any lead
3. Should see:
   - Full lead information
   - Status badge
   - Activity timeline grouped by date
   - Status change dropdown

### Test 6: Change Lead Status
1. On a lead detail page
2. Select a new status from the dropdown (if allowed)
3. Click "Update Status"
4. Should see success message
5. Timeline should update with new activity
6. Test invalid transitions:
   - Try changing from "converted" (should be disabled)
   - Try changing from "lost" (should be disabled)

### Test 7: API Testing with cURL/Postman

#### Create a User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","department":"Sales"}'
```

#### Get All Users
```bash
curl http://localhost:5000/api/users
```

#### Create a Lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Lead",
    "email":"test@example.com",
    "phone":"9876543210",
    "source":"website",
    "notes":"Test notes"
  }'
```

#### Get Leads (with filters)
```bash
# Get page 1
curl http://localhost:5000/api/leads?page=1

# Filter by status
curl http://localhost:5000/api/leads?status=new

# Filter by source
curl http://localhost:5000/api/leads?source=website

# Filter by assigned user
curl http://localhost:5000/api/leads?assigned_to=1

# Sort by last activity
curl http://localhost:5000/api/leads?sortBy=last_activity
```

#### Check for Duplicates
```bash
curl -X POST http://localhost:5000/api/leads/check-duplicate \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"johndoe@gmail.com",
    "phone":"5551234567"
  }'
```

#### Get Lead Timeline
```bash
curl http://localhost:5000/api/leads/1/timeline
```

#### Update Lead Status
```bash
curl -X PUT http://localhost:5000/api/leads/1/status \
  -H "Content-Type: application/json" \
  -d '{"newStatus":"contacted"}'
```

## Expected Behaviors

### Validation
- ✓ Email format validation (must be valid email)
- ✓ Phone validation (must have 10 digits, formatting optional)
- ✓ Required fields: name, email, phone
- ✓ Status transition validation

### Auto-Assignment
- ✓ New leads are assigned to user with least assigned leads
- ✓ If no users exist, lead is created unassigned

### Duplicate Detection
- ✓ Detects exact email matches
- ✓ Handles Gmail dot notation (john.doe = johndoe)
- ✓ Detects phone matches regardless of formatting
- ✓ Detects name matches (fuzzy matching, case-insensitive)
- ✓ Shows confidence score >= 50%

### Status Transitions
- ✓ new → contacted, lost
- ✓ contacted → qualified, lost
- ✓ qualified → converted, lost
- ✓ Any status → lost
- ✓ converted ↛ (no transitions)
- ✓ lost ↛ (no transitions)

### Activity Logging
- ✓ Status changes are logged
- ✓ Activities grouped by date
- ✓ Timeline shows who made changes (if applicable)

## Troubleshooting Tests

### "Cannot POST /api/leads" Error
- Ensure backend is running
- Check API URL in frontend env file

### "Email/Phone validation failed" Error
- Email must be valid format (user@domain.com)
- Phone must have 10 digits: 1234567890, 123-456-7890, etc.

### Duplicate detection not working
- Check if leads exist in database (run seed script)
- Verify API response with Postman

### Status change not working
- Check if transition is valid for current status
- Backend should return error with allowed transitions

## Performance Notes
- Pagination: 10 leads per page (configurable)
- Duplicate detection: Searches all leads (optimize with indexing in production)
- Timeline grouping: Groups by date in memory (fine for small datasets)

## Browser DevTools Checks
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed API calls
4. Verify API responses in Network tab

## Database Verification
Check SQLite database directly:
```bash
# Using sqlite3 command line (if installed)
sqlite3 backend/database.sqlite
sqlite> SELECT * FROM Users;
sqlite> SELECT * FROM Leads;
sqlite> SELECT * FROM LeadActivities;
sqlite> .exit
```

## Cleanup
To reset the application:
1. Stop both backend and frontend servers
2. Delete `backend/database.sqlite`
3. Run seed script again: `cd backend && node seed.js`
4. Restart both services

---

**Happy testing!** 🚀 If you encounter any issues, check the browser console and backend logs for detailed error messages.
