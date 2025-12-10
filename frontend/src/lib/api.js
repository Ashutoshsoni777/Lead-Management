import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const leadAPI = {
  // Create a new lead
  createLead: (leadData) => api.post('/leads', leadData),

  // Get all leads with filters and pagination
  getLeads: (params = {}) => api.get('/leads', { params }),

  // Update lead status
  updateLeadStatus: (leadId, newStatus) =>
    api.put(`/leads/${leadId}/status`, { newStatus }),

  // Get lead timeline
  getLeadTimeline: (leadId) => api.get(`/leads/${leadId}/timeline`),

  // Check for duplicates
  checkDuplicate: (name, email, phone) =>
    api.post('/leads/check-duplicate', { name, email, phone }),
};

export const userAPI = {
  // Get all users
  getUsers: () => api.get('/users'),

  // Create a user
  createUser: (userData) => api.post('/users', userData),
};
