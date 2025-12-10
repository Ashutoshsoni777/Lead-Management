const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runVerification() {
  try {
    console.log('Starting Backend Verification...');

    // 1. Health Check (implicit via other calls, but good to have)
    // Not explicitly defined in routes, but let's try a simple GET /users if available or just proceed.
    
    // 2. Create Users (if not already seeded, but let's assume seed runs or we create one)
    // The controller has createUser.
    console.log('\n--- Creating Test User ---');
    let user;
    try {
        const userRes = await axios.post(`${API_URL}/users`, {
            name: 'Test Agent',
            email: `agent_${Date.now()}@test.com`,
            role: 'sales'
        });
        user = userRes.data;
        console.log('User created:', user.name);
    } catch (e) {
        console.log('User creation failed (might already exist or auth required?):', e.message);
    }

    // 3. Create Lead
    console.log('\n--- Creating Lead ---');
    const leadData = {
      name: 'John Doe',
      email: `johndoe_${Date.now()}@example.com`,
      phone: '1234567890',
      source: 'website'
    };
    const createRes = await axios.post(`${API_URL}/leads`, leadData);
    const lead = createRes.data;
    console.log('Lead created:', lead.id, lead.name, 'Assigned to:', lead.assigned_to);

    // 4. Check Duplicate
    console.log('\n--- Checking Duplicate ---');
    const dupCheckRes = await axios.post(`${API_URL}/leads/check-duplicate`, {
      name: 'John Doe', // Exact match
      email: leadData.email, // Exact match
      phone: '1234567890'
    });
    console.log('Duplicate Check Result:', dupCheckRes.data);

    // 5. Update Status
    console.log('\n--- Updating Status ---');
    try {
        const updateRes = await axios.put(`${API_URL}/leads/${lead.id}/status`, {
            newStatus: 'contacted'
        });
        console.log('Status updated to:', updateRes.data.status);
    } catch (e) {
        console.error('Status update failed:', e.response ? e.response.data : e.message);
    }

    // 6. Get Timeline
    console.log('\n--- Fetching Timeline ---');
    const timelineRes = await axios.get(`${API_URL}/leads/${lead.id}/timeline`);
    console.log('Timeline events:', Object.keys(timelineRes.data.timeline).length, 'days with events');

    // 7. List Leads
    console.log('\n--- Listing Leads ---');
    const listRes = await axios.get(`${API_URL}/leads`);
    console.log('Total Leads:', listRes.data.totalCount);

    console.log('\nVerification Completed Successfully!');
  } catch (error) {
    console.error('\nVerification Failed:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

// Wait for server to start
setTimeout(runVerification, 3000);
