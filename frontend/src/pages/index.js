import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-900">
          Lead Management System
        </h1>
        <p className="text-lg text-center text-gray-600 mb-10">
          Manage your leads efficiently with our modern, intuitive platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/leads">
            <div className="cursor-pointer bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border-2 border-blue-200 transition">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">View Leads</h2>
              <p className="text-gray-600">
                Browse all leads with filters and pagination
              </p>
            </div>
          </Link>

          <Link href="/leads/new">
            <div className="cursor-pointer bg-green-50 hover:bg-green-100 p-6 rounded-lg border-2 border-green-200 transition">
              <h2 className="text-2xl font-bold text-green-600 mb-2">Create Lead</h2>
              <p className="text-gray-600">
                Add a new lead with duplicate detection
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
