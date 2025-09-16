'use client';

import { useState, useEffect } from 'react';
import MenuBar from './MenuBar';
import UnderConstructionBanner from './UnderConstructionBanner';

// Types for Issue
interface Issue {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
    department?: string;
  };
  timestamp: string;
  title: string;
  description: string;
  images?: string[];
  category: 'wifi' | 'food' | 'infrastructure' | 'academic' | 'hostel' | 'transport' | 'other';
  status: 'reported' | 'assigned' | 'discussed' | 'action-taken' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  votes: {
    upvote: number;
    downvote: number;
  };
  userVote?: 'upvote' | 'downvote' | null;
  contributions: Contribution[];
  tags: string[];
  location?: string;
}

interface Contribution {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  timestamp: string;
  content: string;
  type: 'update' | 'comment' | 'action';
  votes: {
    upvote: number;
    downvote: number;
  };
  userVote?: 'upvote' | 'downvote' | null;
  taggedPersons?: string[];
}

// Sample data
const sampleIssues: Issue[] = [
  {
    id: '1',
    author: {
      name: 'Ahmed Hassan',
      avatar: '/api/placeholder/40/40',
      isVerified: true,
      department: 'Computer Science'
    },
    timestamp: '2 hours ago',
    title: 'WiFi Down in Hall A - Block 3',
    description: 'The WiFi connection has been completely down in Hall A Block 3 for the past 6 hours. Students are unable to attend online classes or complete assignments.',
    category: 'wifi',
    status: 'assigned',
    priority: 'high',
    votes: {
      upvote: 24,
      downvote: 1
    },
    userVote: 'upvote',
    contributions: [
      {
        id: 'c1',
        author: {
          name: 'Sarah Khan',
          avatar: '/api/placeholder/40/40',
          isVerified: true
        },
        timestamp: '1 hour ago',
        content: 'I spoke to the IT office - they are working on fixing it. Expected to be resolved by evening.',
        type: 'update',
        votes: { upvote: 15, downvote: 0 },
        taggedPersons: ['IT Head - Mr. Rahman']
      }
    ],
    tags: ['urgent', 'hall-a', 'connectivity'],
    location: 'Hall A - Block 3'
  },
  {
    id: '2',
    author: {
      name: 'Fatima Ali',
      avatar: '/api/placeholder/40/40',
      isVerified: true,
      department: 'Business Administration'
    },
    timestamp: '5 hours ago',
    title: 'Cafeteria Food Quality Issues',
    description: 'The food quality in the main cafeteria has been consistently poor this week. Multiple students have complained about stale food and hygiene issues.',
    category: 'food',
    status: 'discussed',
    priority: 'medium',
    votes: {
      upvote: 18,
      downvote: 3
    },
    contributions: [
      {
        id: 'c2',
        author: {
          name: 'Student Council',
          avatar: '/api/placeholder/40/40',
          isVerified: true
        },
        timestamp: '3 hours ago',
        content: 'We have scheduled a meeting with the cafeteria management for tomorrow. Will update with outcomes.',
        type: 'action',
        votes: { upvote: 12, downvote: 0 },
        taggedPersons: ['Cafeteria Manager']
      }
    ],
    tags: ['food-safety', 'cafeteria', 'hygiene'],
    location: 'Main Cafeteria'
  },
  {
    id: '3',
    author: {
      name: 'Michael Chen',
      avatar: '/api/placeholder/40/40',
      isVerified: true,
      department: 'Engineering'
    },
    timestamp: '1 day ago',
    title: 'Broken Projector in Room 301',
    description: 'The projector in classroom 301 has been malfunctioning for 3 days. Classes are being disrupted.',
    category: 'infrastructure',
    status: 'resolved',
    priority: 'medium',
    votes: {
      upvote: 8,
      downvote: 0
    },
    contributions: [
      {
        id: 'c3',
        author: {
          name: 'Maintenance Team',
          avatar: '/api/placeholder/40/40',
          isVerified: true
        },
        timestamp: '6 hours ago',
        content: 'Projector has been replaced with a new unit. Issue resolved.',
        type: 'action',
        votes: { upvote: 10, downvote: 0 }
      }
    ],
    tags: ['equipment', 'classroom', 'fixed'],
    location: 'Room 301'
  }
];

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(sampleIssues);
  const [filterStatus, setFilterStatus] = useState<'all' | 'solved' | 'unsolved' | 'under-process'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'votes' | 'priority'>('recent');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'other' as Issue['category'],
    priority: 'medium' as Issue['priority'],
    location: '',
    tags: ''
  });

  // Filter issues based on status
  const filteredIssues = issues.filter(issue => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'solved') return issue.status === 'resolved';
    if (filterStatus === 'unsolved') return issue.status === 'reported';
    if (filterStatus === 'under-process') return ['assigned', 'discussed', 'action-taken'].includes(issue.status);
    return true;
  });

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'votes') {
      return (b.votes.upvote - b.votes.downvote) - (a.votes.upvote - a.votes.downvote);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0; // Default to recent (already in correct order)
  });

  const handleVote = (issueId: string, voteType: 'upvote' | 'downvote') => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const currentVote = issue.userVote;
        let newVotes = { ...issue.votes };
        let newUserVote: 'upvote' | 'downvote' | null = voteType;

        // Remove previous vote
        if (currentVote === 'upvote') newVotes.upvote--;
        if (currentVote === 'downvote') newVotes.downvote--;

        // Add new vote (or remove if same)
        if (currentVote === voteType) {
          newUserVote = null;
        } else {
          if (voteType === 'upvote') newVotes.upvote++;
          if (voteType === 'downvote') newVotes.downvote++;
        }

        return {
          ...issue,
          votes: newVotes,
          userVote: newUserVote
        };
      }
      return issue;
    }));
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    
    const issue: Issue = {
      id: Date.now().toString(),
      author: {
        name: 'Current User',
        avatar: '/api/placeholder/40/40',
        isVerified: true,
        department: 'Computer Science'
      },
      timestamp: 'Just now',
      title: newIssue.title,
      description: newIssue.description,
      category: newIssue.category,
      status: 'reported',
      priority: newIssue.priority,
      votes: { upvote: 0, downvote: 0 },
      contributions: [],
      tags: newIssue.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      location: newIssue.location || undefined
    };

    setIssues(prev => [issue, ...prev]);
    setNewIssue({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      location: '',
      tags: ''
    });
    setShowCreateForm(false);
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'discussed': return 'bg-blue-100 text-blue-800';
      case 'action-taken': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: Issue['category']) => {
    switch (category) {
      case 'wifi': return '📶';
      case 'food': return '🍽️';
      case 'infrastructure': return '🏗️';
      case 'academic': return '📚';
      case 'hostel': return '🏠';
      case 'transport': return '🚌';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuBar />
      <UnderConstructionBanner />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Issues</h1>
          <p className="text-gray-600">Report and track campus-related problems</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Create Issue Button */}
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Report New Issue</span>
            </button>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Issues</option>
                <option value="unsolved">Unsolved</option>
                <option value="under-process">Under Process</option>
                <option value="solved">Solved</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="votes">Most Voted</option>
                <option value="priority">High Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Issue Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Report New Issue</h2>
            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief title describing the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                  placeholder="Detailed description of the issue"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newIssue.category}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="wifi">WiFi/Internet</option>
                    <option value="food">Food/Cafeteria</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="academic">Academic</option>
                    <option value="hostel">Hostel</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newIssue.location}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Where is this issue?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newIssue.tags}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="urgent, maintenance, etc."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit Issue
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Issues List */}
        <div className="space-y-6">
          {sortedIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              {/* Issue Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={issue.author.avatar}
                      alt={issue.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{issue.author.name}</h3>
                        {issue.author.isVerified && (
                          <span className="text-blue-500 text-sm">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{issue.author.department} • {issue.timestamp}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`} title={`${issue.priority} priority`}></div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                    <a 
                      href={`/issues/${issue.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {issue.title}
                    </a>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{issue.description}</p>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  {issue.location && (
                    <span className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{issue.location}</span>
                    </span>
                  )}
                  {issue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {issue.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voting */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote(issue.id, 'upvote')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      issue.userVote === 'upvote'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>👍</span>
                    <span>{issue.votes.upvote}</span>
                  </button>
                  
                  <button
                    onClick={() => handleVote(issue.id, 'downvote')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      issue.userVote === 'downvote'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>👎</span>
                    <span>{issue.votes.downvote}</span>
                  </button>

                  <span className="text-gray-500">
                    {issue.contributions.length} contribution{issue.contributions.length !== 1 ? 's' : ''}
                  </span>

                  <a
                    href={`/issues/${issue.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>

              {/* Recent Contributions */}
              {issue.contributions.length > 0 && (
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Updates</h4>
                  <div className="space-y-3">
                    {issue.contributions.slice(0, 2).map((contribution) => (
                      <div key={contribution.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={contribution.author.avatar}
                            alt={contribution.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{contribution.author.name}</span>
                              {contribution.author.isVerified && (
                                <span className="text-blue-500 text-xs">✓</span>
                              )}
                              <span className="text-xs text-gray-500">{contribution.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700">{contribution.content}</p>
                            {contribution.taggedPersons && contribution.taggedPersons.length > 0 && (
                              <div className="mt-2">
                                {contribution.taggedPersons.map((person, index) => (
                                  <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mr-1">
                                    @{person}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedIssues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600">Try adjusting your filters or create a new issue report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
