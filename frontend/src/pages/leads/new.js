import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { leadAPI, userAPI } from '@/lib/api';
import { MdArrowBack, MdCheckCircle, MdWarning, MdClose } from 'react-icons/md';

const SOURCES = ['website', 'referral', 'social_media', 'cold_call', 'email', 'other'];

export default function CreateLead() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'other',
    notes: '',
  });

  const [duplicates, setDuplicates] = useState(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duplicateChecked, setDuplicateChecked] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setDuplicateChecked(false);
    setDuplicates(null);
    setShowDuplicateWarning(false);
  };

  const checkForDuplicates = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in name, email, and phone');
      return;
    }

    setLoading(true);
    setError('');
    setDuplicateChecked(false);
    setDuplicates(null);

    try {
      const response = await leadAPI.checkDuplicate(
        formData.name,
        formData.email,
        formData.phone
      );

      setDuplicates(response.data);
      setDuplicateChecked(true);

      if (response.data.isDuplicate && response.data.confidence >= 50) {
        setShowDuplicateWarning(true);
      }
    } catch (err) {
      console.error('Duplicate check error:', err);
      setError(err.response?.data?.error || 'Failed to check for duplicates');
      setDuplicateChecked(false);
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (ignoreWarning = false) => {
    if (showDuplicateWarning && !ignoreWarning) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await leadAPI.createLead(formData);
      setSuccess('Lead created successfully!');
      setTimeout(() => {
        router.push(`/leads/${response.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-red-600 bg-red-50';
    if (confidence >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getConfidenceWidth = (confidence) => {
    return `${confidence}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/leads" className="text-blue-600 hover:text-blue-800">
            <MdArrowBack size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <MdClose size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <MdCheckCircle size={20} />
              {success}
            </div>
          )}

          <form onSubmit={checkForDuplicates}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (123) 456-7890"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Must contain 10 digits (formatting optional)
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes..."
                rows="4"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Checking for duplicates...' : 'Check for Duplicates & Continue'}
            </button>
          </form>

          {/* Duplicate Warning */}
          {showDuplicateWarning && duplicates?.matches && duplicates.matches.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MdWarning size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 text-lg">
                      Potential Duplicate(s) Found
                    </h3>
                    <p className="text-yellow-800 mt-1">
                      We found {duplicates.matches.length} similar lead(s) in the system. Please review before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {duplicates.matches.map((match, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${getConfidenceColor(match.confidence)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{match.name}</h4>
                        <p className="text-sm opacity-75">{match.email}</p>
                        <p className="text-sm opacity-75">{match.phone}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {match.confidence}%
                        </div>
                        <div className="text-xs opacity-75">Confidence</div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                          style={{ width: getConfidenceWidth(match.confidence) }}
                        />
                      </div>
                    </div>

                    {/* Matched Fields */}
                    <div className="text-sm">
                      <p className="font-medium mb-2">Matched fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchedFields.map((field, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-medium"
                          >
                            ✓ {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs opacity-75 mt-2">
                      Status: <span className="font-medium">{match.status}</span> | Source:{' '}
                      <span className="font-medium">{match.source}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => submitForm(true)}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Creating...' : 'Create Anyway'}
                </button>
                <button
                  onClick={() => {
                    setShowDuplicateWarning(false);
                    setDuplicates(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel & Edit
                </button>
              </div>
            </div>
          )}

          {/* Success State for non-duplicate leads */}
          {duplicateChecked && !showDuplicateWarning && (
            <div className="mt-8 border-t pt-8">
              <div className="bg-green-50 border border-green-200 p-4 mb-6 rounded-lg flex items-center gap-3">
                <MdCheckCircle size={24} className="text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">No Duplicates Found</h3>
                  <p className="text-green-800 text-sm">
                    This lead appears to be unique. You can safely create it.
                  </p>
                </div>
              </div>

              <button
                onClick={() => submitForm(false)}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
