'use client'

import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string | null
  email: string
  createdAt: string
  updatedAt: string
}

interface DbTestResponse {
  success: boolean
  message: string
  users?: User[]
  userCount?: number
  user?: User
  error?: string
}

export default function DatabaseTest() {
  const [response, setResponse] = useState<DbTestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })

  const testConnection = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test-db')
      const data: DbTestResponse = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({
        success: false,
        message: 'Failed to connect to API',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) return

    setLoading(true)
    try {
      const res = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data: DbTestResponse = await res.json()
      setResponse(data)
      if (data.success) {
        setFormData({ name: '', email: '' })
        // Refresh the users list
        setTimeout(testConnection, 500)
      }
    } catch (error) {
      setResponse({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Database Connection Test</h2>
      
      {/* Test Connection Button */}
      <div className="mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
        </button>
      </div>

      {/* Create User Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Create New User</h3>
        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !formData.email}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Response Display */}
      {response && (
        <div className="space-y-4">
          <div className={`p-4 rounded-md ${response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-2">
              <span className={`text-lg ${response.success ? 'text-green-600' : 'text-red-600'}`}>
                {response.success ? '✅' : '❌'}
              </span>
              <span className={`font-medium ${response.success ? 'text-green-800' : 'text-red-800'}`}>
                {response.message}
              </span>
            </div>
            {response.error && (
              <p className="text-red-600 text-sm mt-2">{response.error}</p>
            )}
          </div>

          {response.success && response.users && (
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Users in Database ({response.userCount})
              </h4>
              {response.users.length === 0 ? (
                <p className="text-gray-500 text-sm">No users found</p>
              ) : (
                <div className="space-y-2">
                  {response.users.map((user) => (
                    <div key={user.id} className="bg-white p-3 rounded border text-sm">
                      <div className="font-medium text-gray-900">
                        {user.name || 'Anonymous'} ({user.email})
                      </div>
                      <div className="text-gray-500 text-xs">
                        ID: {user.id} | Created: {new Date(user.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {response.success && response.user && (
            <div className="bg-blue-50 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">New User Created</h4>
              <div className="bg-white p-3 rounded border text-sm">
                <div className="font-medium text-gray-900">
                  {response.user.name || 'Anonymous'} ({response.user.email})
                </div>
                <div className="text-gray-500 text-xs">
                  ID: {response.user.id} | Created: {new Date(response.user.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
