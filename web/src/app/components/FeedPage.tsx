'use client';

import { useState } from 'react';
import Image from 'next/image';
import MenuBar from './MenuBar';
import UnderConstructionBanner from './UnderConstructionBanner';

// Types for different post types
interface BasePost {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
    department?: string;
  };
  timestamp: string;
  content: string;
  images?: string[];
  reactions: {
    like: number;
    love: number;
    support: number;
    angry: number;
  };
  comments: Comment[];
  userReaction?: 'like' | 'love' | 'support' | 'angry' | null;
}

interface GeneralPost extends BasePost {
  type: 'general';
}

interface DemandPost extends BasePost {
  type: 'demand';
  demandTitle: string;
  category: 'department' | 'club' | 'hall' | 'environment';
  votes: {
    agree: number;
    disagree: number;
  };
  userVote?: 'agree' | 'disagree' | null;
  targetAuthority: string;
}

interface IssuePost extends BasePost {
  type: 'issue';
  issueTitle: string;
  status: 'reported' | 'assigned' | 'discussed' | 'action-taken' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  location: string;
}

interface EventPost extends BasePost {
  type: 'event';
  eventTitle: string;
  eventDate: string;
  location: string;
  userResponse?: 'going' | 'not-going' | 'interested' | null;
  responseCount: {
    going: number;
    interested: number;
    notGoing: number;
  };
}

type Post = GeneralPost | DemandPost | IssuePost | EventPost;

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  replies?: Comment[];
}

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    type: 'demand',
    author: {
      name: 'Ahmed Rahman',
      avatar: '👨‍🎓',
      isVerified: true,
      department: 'CSE'
    },
    timestamp: '2 hours ago',
    demandTitle: 'Better WiFi Infrastructure in Academic Buildings',
    content: 'The WiFi in academic buildings is extremely slow and often disconnects during online classes. We need better internet infrastructure to support our digital learning needs.',
    category: 'environment',
    targetAuthority: 'IT Department & Administration',
    votes: { agree: 147, disagree: 12 },
    userVote: 'agree',
    reactions: { like: 89, love: 23, support: 156, angry: 8 },
    comments: [
      {
        id: 'c1',
        author: { name: 'Fatima Khan', avatar: '👩‍🎓' },
        content: 'Totally agree! Had to miss important parts of lectures due to connection issues.',
        timestamp: '1 hour ago'
      }
    ],
    userReaction: 'support'
  },
  {
    id: '2',
    type: 'issue',
    author: {
      name: 'Sadia Islam',
      avatar: '👩‍🎓',
      isVerified: true,
      department: 'EEE'
    },
    timestamp: '4 hours ago',
    issueTitle: 'Broken AC in Library Reading Room',
    content: 'The AC in the main reading room has been broken for 3 days. Students are finding it hard to study in this heat.',
    status: 'assigned',
    priority: 'high',
    location: 'Central Library - Reading Room 2',
    reactions: { like: 45, love: 5, support: 67, angry: 23 },
    comments: [
      {
        id: 'c2',
        author: { name: 'Maintenance Team', avatar: '🔧' },
        content: 'We have assigned a technician to fix this issue. Expected resolution by tomorrow.',
        timestamp: '2 hours ago'
      }
    ],
    userReaction: 'support'
  },
  {
    id: '3',
    type: 'general',
    author: {
      name: 'Rahim Uddin',
      avatar: '👨‍🎓',
      isVerified: true,
      department: 'Physics'
    },
    timestamp: '6 hours ago',
    content: 'Just had an amazing physics lab session! Our professor demonstrated quantum interference patterns. Science is beautiful! 🔬✨',
    images: ['https://www.sust.edu/public/uploads/website/deptBanner/9_671c7728e8649.jpg'],
    reactions: { like: 78, love: 34, support: 12, angry: 0 },
    comments: [
      {
        id: 'c3',
        author: { name: 'Maria Ahmed', avatar: '👩‍🎓' },
        content: 'Wish I could attend that lab! Physics is fascinating.',
        timestamp: '5 hours ago'
      }
    ],
    userReaction: 'love'
  },
  {
    id: '4',
    type: 'event',
    author: {
      name: 'SUST Programming Club',
      avatar: '💻',
      isVerified: true,
      department: 'Club'
    },
    timestamp: '1 day ago',
    eventTitle: 'Inter-University Programming Contest 2025',
    content: 'Join us for the biggest programming contest of the year! Registration is now open. Prizes worth 50,000 BDT!',
    eventDate: '2025-10-15',
    location: 'Computer Lab, Academic Building 1',
    userResponse: 'going',
    responseCount: {
      going: 89,
      interested: 45,
      notGoing: 12
    },
    reactions: { like: 134, love: 67, support: 203, angry: 0 },
    comments: [
      {
        id: 'c4',
        author: { name: 'Karim Hassan', avatar: '👨‍💻' },
        content: 'Count me in! Already practicing algorithms.',
        timestamp: '20 hours ago'
      }
    ],
    userReaction: 'love'
  }
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const handleReaction = (postId: string, reaction: 'like' | 'love' | 'support' | 'angry') => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedPost = { ...post };
        
        // Remove previous reaction if exists
        if (post.userReaction) {
          updatedPost.reactions[post.userReaction]--;
        }
        
        // Add new reaction or remove if same
        if (post.userReaction === reaction) {
          updatedPost.userReaction = null;
        } else {
          updatedPost.reactions[reaction]++;
          updatedPost.userReaction = reaction;
        }
        
        return updatedPost;
      }
      return post;
    }));
  };

  const handleVote = (postId: string, vote: 'agree' | 'disagree') => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.type === 'demand') {
        const updatedPost = { ...post };
        
        // Remove previous vote if exists
        if (post.userVote) {
          updatedPost.votes[post.userVote]--;
        }
        
        // Add new vote or remove if same
        if (post.userVote === vote) {
          updatedPost.userVote = null;
        } else {
          updatedPost.votes[vote]++;
          updatedPost.userVote = vote;
        }
        
        return updatedPost;
      }
      return post;
    }));
  };

  const handleComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    
    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: { name: 'You', avatar: '👤' },
      content: content.trim(),
      timestamp: 'Just now'
    };
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleEventResponse = (postId: string, response: 'going' | 'not-going' | 'interested') => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.type === 'event') {
        const updatedPost = { ...post };
        
        // Remove previous response if exists
        if (post.userResponse) {
          const currentResponse = post.userResponse === 'not-going' ? 'notGoing' : post.userResponse;
          updatedPost.responseCount[currentResponse as keyof typeof post.responseCount]--;
        }
        
        // Add new response or remove if same
        if (post.userResponse === response) {
          updatedPost.userResponse = null;
        } else {
          const responseKey = response === 'not-going' ? 'notGoing' : response;
          updatedPost.responseCount[responseKey as keyof typeof post.responseCount]++;
          updatedPost.userResponse = response;
        }
        
        return updatedPost;
      }
      return post;
    }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      reported: 'bg-red-100 text-red-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      discussed: 'bg-blue-100 text-blue-800',
      'action-taken': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      department: 'bg-blue-100 text-blue-800',
      club: 'bg-purple-100 text-purple-800',
      hall: 'bg-green-100 text-green-800',
      environment: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-100/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-100/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Menu Bar */}
      <MenuBar isHidden={showNewPostForm} />

      {/* Under Construction Banner */}
      <UnderConstructionBanner />

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Facebook-style Post Creation Box */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-5 mb-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="flex-1">
              <button
                onClick={() => setShowNewPostForm(true)}
                className="w-full p-4 text-left text-gray-500 bg-gray-50/80 hover:bg-gray-100/80 rounded-full transition-all duration-200 cursor-text border border-transparent hover:border-gray-200/50"
              >
                What&apos;s happening on campus?
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Post Creation Form */}
        {showNewPostForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 animate-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100/80">
                <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
                <button
                  onClick={() => setShowNewPostForm(false)}
                  className="p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-gray-100/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">You</h4>
                    <div className="flex items-center space-x-2">
                      <select className="text-sm bg-gray-50/80 border-0 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200">
                        <option>🌍 Public</option>
                        <option>👥 Campus Only</option>
                        <option>🏢 Department Only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's happening on campus?"
                  className="w-full p-4 border-0 resize-none focus:ring-0 outline-none text-lg placeholder-gray-400 bg-transparent transition-all duration-200 hover:placeholder-gray-500 focus:placeholder-gray-300"
                  rows={4}
                  style={{ minHeight: '120px' }}
                />

                {/* Post Type Selection */}
                <div className="mt-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100/80">
                  <h5 className="text-sm font-medium text-gray-700 mb-4">Add to your post</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl hover:bg-blue-50/80 transition-all duration-200 border border-gray-200/50 hover:border-blue-200/50 group">
                      <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">Photo</span>
                    </button>
                    <button className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl hover:bg-purple-50/80 transition-all duration-200 border border-gray-200/50 hover:border-purple-200/50 group">
                      <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm font-medium">Demand</span>
                    </button>
                    <button className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl hover:bg-red-50/80 transition-all duration-200 border border-gray-200/50 hover:border-red-200/50 group">
                      <svg className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Issue</span>
                    </button>
                    <button className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl hover:bg-green-50/80 transition-all duration-200 border border-gray-200/50 hover:border-green-200/50 group">
                      <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">Event</span>
                    </button>
                    <button className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl hover:bg-yellow-50/80 transition-all duration-200 border border-gray-200/50 hover:border-yellow-200/50 group">
                      <svg className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Feeling</span>
                    </button>
                    <button className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl hover:bg-indigo-50/80 transition-all duration-200 border border-gray-200/50 hover:border-indigo-200/50 group">
                      <svg className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">Location</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100/80">
                <button 
                  disabled={!newPostContent.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReaction={handleReaction}
              onVote={handleVote}
              onComment={handleComment}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getCategoryColor={getCategoryColor}
              onEventResponse={handleEventResponse}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ 
  post, 
  onReaction, 
  onVote, 
  onComment, 
  getStatusColor, 
  getPriorityColor, 
  getCategoryColor,
  onEventResponse
}: {
  post: Post;
  onReaction: (postId: string, reaction: 'like' | 'love' | 'support' | 'angry') => void;
  onVote: (postId: string, vote: 'agree' | 'disagree') => void;
  onComment: (postId: string, content: string) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
  onEventResponse: (postId: string, response: 'going' | 'not-going' | 'interested') => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showEventResponsePicker, setShowEventResponsePicker] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    onComment(post.id, newComment);
    setNewComment('');
  };

  const getPostTypeIcon = () => {
    switch (post.type) {
      case 'demand': return '📋';
      case 'issue': return '🔧';
      case 'event': return '📅';
      default: return '💬';
    }
  };

  const getPostTypeBadge = () => {
    const badges = {
      demand: 'bg-blue-100 text-blue-800',
      issue: 'bg-red-100 text-red-800',
      event: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return badges[post.type];
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-[1.01] hover:border-gray-300/50">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 group">
            <div className="text-2xl transition-transform duration-200 group-hover:scale-110">{post.author.avatar}</div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{post.author.name}</h3>
                {post.author.isVerified && <span className="text-blue-500 animate-pulse">✓</span>}
                {post.type !== 'general' && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${getPostTypeBadge()}`}>
                    {getPostTypeIcon()} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {post.author.department && <span className="hover:text-gray-700 transition-colors duration-200">{post.author.department}</span>}
                <span>•</span>
                <span className="hover:text-gray-700 transition-colors duration-200">{post.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Type Specific Headers */}
        {post.type === 'demand' && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{post.demandTitle}</h2>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </span>
              <span className="text-sm text-gray-600">→ {post.targetAuthority}</span>
            </div>
          </div>
        )}

        {post.type === 'issue' && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{post.issueTitle}</h2>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                {post.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(post.priority)}`}>
                {post.priority.charAt(0).toUpperCase() + post.priority.slice(1)} Priority
              </span>
            </div>
            <p className="text-sm text-gray-600">📍 {post.location}</p>
          </div>
        )}

        {post.type === 'event' && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{post.eventTitle}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span>📅 {new Date(post.eventDate).toLocaleDateString()}</span>
              <span>📍 {post.location}</span>
            </div>
            {/* Response Summary */}
            <div className="flex items-center space-x-4 text-sm mb-2">
              <div className="flex items-center space-x-1 text-green-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{post.responseCount.going}</span>
                <span>going</span>
              </div>
              <div className="flex items-center space-x-1 text-yellow-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="font-medium">{post.responseCount.interested}</span>
                <span>interested</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">{post.responseCount.notGoing}</span>
                <span>not going</span>
              </div>
            </div>
          </div>
        )}

        {/* Post Content */}
        <p className="text-gray-800 leading-relaxed">{post.content}</p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3">
            {post.images.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden bg-gray-100 relative">
                <Image 
                  src={image} 
                  alt={`Post image ${index + 1}`}
                  width={800}
                  height={400}
                  className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  style={{ objectFit: 'cover' }}
                  unoptimized={true}
                  onError={() => {
                    // Handle error by showing fallback
                    console.warn('Image failed to load:', image);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Demand Voting */}
        {post.type === 'demand' && (
          <div className="mt-3 inline-flex items-center gap-2.5 px-2.5 py-2 bg-gray-50/60 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Community Vote</span>
            <div className="flex space-x-1.5">
              <button
                onClick={() => onVote(post.id, 'agree')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 group text-xs ${
                  post.userVote === 'agree'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-white border border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700'
                }`}
              >
                <svg className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  post.userVote === 'agree' ? 'text-white' : 'text-green-600'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                <span className="font-medium">{post.votes.agree}</span>
              </button>
              <button
                onClick={() => onVote(post.id, 'disagree')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 group text-xs ${
                  post.userVote === 'disagree'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white border border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700'
                }`}
              >
                <svg className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  post.userVote === 'disagree' ? 'text-white' : 'text-red-600'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10l-5 5-5-5z"/>
                </svg>
                <span className="font-medium">{post.votes.disagree}</span>
              </button>
            </div>
          </div>
        )}

        {/* Event Response Buttons */}
        {post.type === 'event' && (
          <div className="mt-4">
            <div className="relative">
              <button
                onMouseEnter={() => setShowEventResponsePicker(true)}
                onMouseLeave={() => setShowEventResponsePicker(false)}
                onClick={() => {
                  // If no response, default to 'going'
                  if (!post.userResponse) {
                    onEventResponse(post.id, 'going');
                  } else {
                    // Remove current response
                    onEventResponse(post.id, post.userResponse);
                  }
                }}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                  post.userResponse === 'going'
                    ? 'bg-green-600 text-white shadow-md'
                    : post.userResponse === 'interested'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : post.userResponse === 'not-going'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {post.userResponse === 'going' && (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Going</span>
                  </>
                )}
                {post.userResponse === 'interested' && (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Interested</span>
                  </>
                )}
                {post.userResponse === 'not-going' && (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Not Going</span>
                  </>
                )}
                {!post.userResponse && (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Respond to Event</span>
                  </>
                )}
              </button>

              {/* Hover Event Response Picker */}
              {showEventResponsePicker && (
                <div
                  className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-10 animate-in slide-in-from-bottom-2 fade-in duration-200 min-w-max"
                  onMouseEnter={() => setShowEventResponsePicker(true)}
                  onMouseLeave={() => setShowEventResponsePicker(false)}
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        onEventResponse(post.id, 'going');
                        setShowEventResponsePicker(false);
                      }}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-green-50 transition-all duration-200 text-green-600 hover:scale-105 active:scale-95 group"
                      title="Going"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">Going</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onEventResponse(post.id, 'interested');
                        setShowEventResponsePicker(false);
                      }}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-yellow-50 transition-all duration-200 text-yellow-600 hover:scale-105 active:scale-95 group"
                      title="Interested"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="text-sm font-medium">Interested</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onEventResponse(post.id, 'not-going');
                        setShowEventResponsePicker(false);
                      }}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600 hover:scale-105 active:scale-95 group"
                      title="Not Going"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm font-medium">Not Going</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reactions and Comments Bar */}
      <div className="px-3 py-2 md:px-6 md:py-3 border-t border-gray-100">
        {/* Reaction Summary */}
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm text-gray-600">
            <span>{Object.values(post.reactions).reduce((a, b) => a + b, 0)} reactions</span>
            <span>{post.comments.length} comments</span>
          </div>
        </div>

        {/* Reaction Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Like/React Button with Hover */}
            <div 
              className="relative"
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              {/* Extended hover area above the button */}
              <div className="absolute -top-12 -left-4 -right-4 h-12 z-0" />
              
              <button
                onClick={() => {
                  if (post.userReaction === 'like') {
                    onReaction(post.id, 'like'); // Remove reaction if already liked
                  } else {
                    onReaction(post.id, 'like'); // Default to like
                  }
                }}
                className={`flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 rounded-lg transition-all duration-200 hover:scale-105 group relative z-10 ${
                  post.userReaction
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-sm md:text-lg transition-transform duration-200 group-hover:scale-110">
                  {post.userReaction === 'like' && '👍'}
                  {post.userReaction === 'love' && '❤️'}
                  {post.userReaction === 'support' && '🙌'}
                  {post.userReaction === 'angry' && '😠'}
                  {!post.userReaction && '👍'}
                </span>
                <span className="text-xs md:text-sm font-medium">
                  {post.userReaction
                    ? post.userReaction.charAt(0).toUpperCase() + post.userReaction.slice(1)
                    : 'Like'
                  }
                </span>
              </button>

              {/* Hover Reaction Picker */}
              {showReactionPicker && (
                <div
                  className="absolute top-0 left-0 -translate-y-full mb-2 bg-white border border-gray-200 rounded-full shadow-xl p-2 flex space-x-1 z-10 animate-in slide-in-from-top-2 fade-in duration-200"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {[
                    { type: 'like' as const, emoji: '👍', label: 'Like' },
                    { type: 'love' as const, emoji: '❤️', label: 'Love' },
                    { type: 'support' as const, emoji: '🙌', label: 'Support' },
                    { type: 'angry' as const, emoji: '😠', label: 'Angry' }
                  ].map((reaction) => (
                    <button
                      key={reaction.type}
                      onClick={() => {
                        onReaction(post.id, reaction.type);
                        setShowReactionPicker(false);
                      }}
                      className="hover:scale-125 transition-all duration-200 p-2 rounded-full hover:bg-gray-50 hover:shadow-md transform active:scale-110"
                      title={reaction.label}
                    >
                      <span className="text-2xl block transform hover:rotate-12 transition-transform duration-200">{reaction.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200 hover:scale-105 group"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:text-gray-800 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs md:text-sm font-medium">Comment</span>
            </button>

            <button className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200 hover:scale-105 group">
              <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:text-gray-800 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-xs md:text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100/80 animate-in slide-in-from-top-2 fade-in duration-300">
          {/* Existing Comments */}
          {post.comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className="px-3 py-3 md:px-6 md:py-4 border-b border-gray-50/80 last:border-b-0 hover:bg-gray-50/30 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-2 md:space-x-3 group">
                <div className="text-sm md:text-lg transition-transform duration-200 group-hover:scale-110">{comment.author.avatar}</div>
                <div className="flex-1">
                  <div className="bg-gray-50/80 rounded-xl p-2 md:p-3 hover:bg-gray-100/80 transition-all duration-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-xs md:text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{comment.author.name}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-3 md:space-x-4 mt-2 text-xs text-gray-500">
                    <button className="hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1 group">
                      <svg className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 8.5v9.5m0 0V14m0 5.5l2.5-2.5M12 14l2.5 2.5" />
                      </svg>
                      <span>Like</span>
                    </button>
                    <button className="hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1 group">
                      <svg className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* New Comment Form */}
          <form onSubmit={handleSubmitComment} className="px-3 py-3 md:px-6 md:py-4 bg-gray-50/30">
            <div className="flex items-start space-x-2 md:space-x-3">
              <div className="text-sm md:text-lg transition-transform duration-200 hover:scale-110">👤</div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-2 md:p-3 border border-gray-300/50 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-gray-400/50 text-sm md:text-base"
                  rows={2}
                />
                <div className="flex justify-end mt-2 md:mt-3">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-1 md:space-x-2 group shadow-md hover:shadow-lg disabled:shadow-none text-xs md:text-sm"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
