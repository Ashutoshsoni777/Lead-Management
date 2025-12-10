import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { leadAPI } from '@/lib/api';
import { MdArrowBack, MdCheckCircle, MdX, MdWarning } from 'react-icons/md';

const VALID_TRANSITIONS = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['converted', 'lost'],
  converted: [],
  lost: [],
};

export default function LeadDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [timeline, setTimeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchLeadAndTimeline();
    }
  }, [id]);

  const fetchLeadAndTimeline = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await leadAPI.getLeadTimeline(id);
      setLead(response.data.lead);
      setTimeline(response.data.timeline);
      setNewStatus(response.data.lead.status);
    } catch (err) {
      setError('Failed to fetch lead details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === lead.status) {
      setStatusError('Please select a different status');
      return;
    }

    // Validate transition
    if (newStatus !== 'lost' && !VALID_TRANSITIONS[lead.status]?.includes(newStatus)) {
      setStatusError(
        `Cannot change from '${lead.status}' to '${newStatus}'. Valid transitions: ${VALID_TRANSITIONS[lead.status].join(', ')}`
      );
      return;
    }

    setUpdating(true);
    setStatusError('');
    setStatusSuccess('');

    try {
      const response = await leadAPI.updateLeadStatus(id, newStatus);
      setLead(response.data);
      setStatusSuccess(`Status updated to '${newStatus}'`);
      // Refresh timeline
      fetchLeadAndTimeline();
      setTimeout(() => setStatusSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update status';
      setStatusError(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      status_change: 'bg-blue-50 text-blue-700',
      note_added: 'bg-green-50 text-green-700',
      assignment_change: 'bg-purple-50 text-purple-700',
      other: 'bg-gray-50 text-gray-700',
    };
    return colors[type] || 'bg-gray-50 text-gray-700';
  };

  if (!id) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/leads" className="text-blue-600 hover:text-blue-800">
            <MdArrowBack size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
            <MdX size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading lead details...
          </div>
        ) : lead ? (
          <div className="space-y-6">
            {/* Lead Info Card */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{lead.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium text-gray-900">{lead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg font-medium text-gray-900">{lead.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {lead.source.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(lead.createdAt)}
                  </p>
                </div>
              </div>

              {lead.notes && (
                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-900">{lead.notes}</p>
                </div>
              )}
            </div>

            {/* Status Management Card */}
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Status Management</h3>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Current Status</p>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(lead.status)}`}>
                  {lead.status.toUpperCase()}
                </span>
              </div>

              {statusSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                  <MdCheckCircle size={20} />
                  {statusSuccess}
                </div>
              )}

              {statusError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                  <MdWarning size={20} />
                  {statusError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Status To
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => {
                      setNewStatus(e.target.value);
                      setStatusError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={lead.status}>{lead.status} (Current)</option>
                    {['new', 'contacted', 'qualified', 'converted', 'lost'].map((status) => {
                      if (status === lead.status) return null;
                      const isAllowed =
                        status === 'lost' || VALID_TRANSITIONS[lead.status]?.includes(status);
                      return (
                        <option key={status} value={status} disabled={!isAllowed}>
                          {status.toUpperCase()}
                          {!isAllowed ? ' (Not allowed)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    <strong>Valid transitions from "{lead.status}":</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lead.status === 'lost' || lead.status === 'converted' ? (
                      <span className="text-gray-500 text-sm italic">No transitions allowed</span>
                    ) : (
                      <>
                        {VALID_TRANSITIONS[lead.status].map((status) => (
                          <span key={status} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            → {status}
                          </span>
                        ))}
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded">
                          → lost
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleStatusChange}
                  disabled={updating || newStatus === lead.status}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Activity Timeline</h3>

              {Object.keys(timeline).length === 0 ? (
                <p className="text-gray-500 italic">No activities yet</p>
              ) : (
                <div className="space-y-8">
                  {Object.entries(timeline).map(([date, activities]) => (
                    <div key={date}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                        {date}
                      </h4>

                      <div className="space-y-4 ml-6 border-l-2 border-gray-200 pl-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className={`p-4 rounded-lg ${getActivityTypeColor(activity.activity_type)}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-sm">
                                {activity.activity_type === 'status_change'
                                  ? '📊 Status Change'
                                  : activity.activity_type === 'note_added'
                                  ? '📝 Note Added'
                                  : activity.activity_type === 'assignment_change'
                                  ? '👤 Assignment Changed'
                                  : '📌 Activity'}
                              </div>
                              <span className="text-xs opacity-75">
                                {new Date(activity.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{activity.description}</p>
                            {activity.creator && (
                              <p className="text-xs opacity-75">
                                By: {activity.creator.name}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
