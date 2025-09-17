'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MenuBar from './MenuBar';
import UnderConstructionBanner from './UnderConstructionBanner';

// Reusing the same types from IssuesPage
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
  images?: string[];
  videos?: string[];
  votes: {
    upvote: number;
    downvote: number;
  };
  userVote?: 'upvote' | 'downvote' | null;
  taggedPersons?: string[];
}

// Sample data (in real app, this would come from API)
const sampleIssue: Issue = {
  id: '1',
  author: {
    name: 'Ahmed Hassan',
    avatar: '/api/placeholder/40/40',
    isVerified: true,
    department: 'Computer Science'
  },
  timestamp: '2 hours ago',
  title: 'WiFi Down in Hall A - Block 3',
  description: 'The WiFi connection has been completely down in Hall A Block 3 for the past 6 hours. Students are unable to attend online classes or complete assignments. This is affecting around 200+ students in the block.\n\nThe issue started at around 2 PM today and IT support has been notified multiple times. Students have tried restarting their devices and connecting to different networks but nothing seems to work.',
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
      votes: { upvote: 15, downvote: 0 },
      taggedPersons: ['IT Head - Mr. Rahman']
    },
    {
      id: 'c2',
      author: {
        name: 'IT Support Team',
        avatar: '/api/placeholder/40/40',
        isVerified: true
      },
      timestamp: '45 minutes ago',
      content: 'We have identified the issue with the main router in Block 3. Our technician is on site and working to replace the faulty equipment.',
      votes: { upvote: 20, downvote: 0 }
    },
    {
      id: 'c3',
      author: {
        name: 'Mike Chen',
        avatar: '/api/placeholder/40/40',
        isVerified: true
      },
      timestamp: '30 minutes ago',
      content: 'Great to hear from IT team directly! This kind of transparency is what we need. Thank you for the quick response.',
      votes: { upvote: 8, downvote: 0 }
    },
    {
      id: 'c4',
      author: {
        name: 'Residence Hall Supervisor',
        avatar: '/api/placeholder/40/40',
        isVerified: true
      },
      timestamp: '20 minutes ago',
      content: 'We have arranged temporary wifi hotspots in the common areas for urgent academic work. They are available on the ground floor lobby.',
      votes: { upvote: 12, downvote: 0 },
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200']
    }
  ],
  tags: ['urgent', 'hall-a', 'connectivity'],
  location: 'Hall A - Block 3'
};

interface IssueDetailPageProps {
  issueId: string;
}

export default function IssueDetailPage({ }: IssueDetailPageProps) {
  const router = useRouter();
  const [issue, setIssue] = useState<Issue>(sampleIssue);
  const [newContribution, setNewContribution] = useState('');
  const [contributionImages, setContributionImages] = useState<string[]>([]);
  const [contributionVideos, setContributionVideos] = useState<string[]>([]);
  const [taggedPersons, setTaggedPersons] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    setIssue(prev => {
      const currentVote = prev.userVote;
      let newVotes = { ...prev.votes };
      let newUserVote: 'upvote' | 'downvote' | null = voteType;

      // Remove previous vote
      if (currentVote === 'upvote') {
        newVotes = { ...newVotes, upvote: newVotes.upvote - 1 };
      }
      if (currentVote === 'downvote') {
        newVotes = { ...newVotes, downvote: newVotes.downvote - 1 };
      }

      // Add new vote (or remove if same)
      if (currentVote === voteType) {
        newUserVote = null;
      } else {
        if (voteType === 'upvote') {
          newVotes = { ...newVotes, upvote: newVotes.upvote + 1 };
        }
        if (voteType === 'downvote') {
          newVotes = { ...newVotes, downvote: newVotes.downvote + 1 };
        }
      }

      return {
        ...prev,
        votes: newVotes,
        userVote: newUserVote
      };
    });
  };

  const handleContributionVote = (contributionId: string, voteType: 'upvote' | 'downvote') => {
    setIssue(prev => ({
      ...prev,
      contributions: prev.contributions.map(contribution => {
        if (contribution.id === contributionId) {
          const currentVote = contribution.userVote;
          let newVotes = { ...contribution.votes };
          let newUserVote: 'upvote' | 'downvote' | null = voteType;

          // Remove previous vote
          if (currentVote === 'upvote') {
            newVotes = { ...newVotes, upvote: newVotes.upvote - 1 };
          }
          if (currentVote === 'downvote') {
            newVotes = { ...newVotes, downvote: newVotes.downvote - 1 };
          }

          // Add new vote (or remove if same)
          if (currentVote === voteType) {
            newUserVote = null;
          } else {
            if (voteType === 'upvote') {
              newVotes = { ...newVotes, upvote: newVotes.upvote + 1 };
            }
            if (voteType === 'downvote') {
              newVotes = { ...newVotes, downvote: newVotes.downvote + 1 };
            }
          }

          return {
            ...contribution,
            votes: newVotes,
            userVote: newUserVote
          };
        }
        return contribution;
      })
    }));
  };

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContribution.trim()) return;

    setIsSubmitting(true);

    const contribution: Contribution = {
      id: Date.now().toString(),
      author: {
        name: 'Current User',
        avatar: '/api/placeholder/40/40',
        isVerified: true
      },
      timestamp: 'Just now',
      content: newContribution,
      votes: { upvote: 0, downvote: 0 },
      images: contributionImages.length > 0 ? contributionImages : undefined,
      videos: contributionVideos.length > 0 ? contributionVideos : undefined,
      taggedPersons: taggedPersons.length > 0 ? taggedPersons : undefined
    };

    setIssue(prev => ({
      ...prev,
      contributions: [...prev.contributions, contribution]
    }));

    // Reset form
    setNewContribution('');
    setContributionImages([]);
    setContributionVideos([]);
    setTaggedPersons([]);
    setIsSubmitting(false);
  };

  const addTag = () => {
    if (newTag.trim() && !taggedPersons.includes(newTag.trim())) {
      setTaggedPersons(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTaggedPersons(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const removeImage = (indexToRemove: number) => {
    setContributionImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeVideo = (indexToRemove: number) => {
    setContributionVideos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800 border-red-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'discussed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'action-taken': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <span>←</span>
          <span>Back to Issues</span>
        </button>

        {/* Issue Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <Image
                src={issue.author.avatar}
                alt={issue.author.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{issue.author.name}</h3>
                  {issue.author.isVerified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{issue.author.department} • {issue.timestamp}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${getPriorityColor(issue.priority)}`} title={`${issue.priority} priority`}></div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
                {issue.status.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
              <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{issue.description}</p>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            {issue.location && (
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span>{issue.location}</span>
              </span>
            )}
            {issue.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Voting */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleVote('upvote')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                issue.userVote === 'upvote'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>👍</span>
              <span className="font-medium">{issue.votes.upvote}</span>
            </button>
            
            <button
              onClick={() => handleVote('downvote')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                issue.userVote === 'downvote'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>👎</span>
              <span className="font-medium">{issue.votes.downvote}</span>
            </button>

            <span className="text-gray-500 ml-4">
              {issue.contributions.length} contribution{issue.contributions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Add to Log Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <span>✍️</span>
            <span>Add Your Contribution To Solve The Issue</span>
          </h3>
          <form onSubmit={handleSubmitContribution} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Contribution</label>
              <textarea
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="Share an update, provide information, or add your thoughts about this issue..."
                required
              />
            </div>

            {/* Tagged Persons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tag People/Authorities</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter name or authority"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Add Tag
                </button>
              </div>
              {taggedPersons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {taggedPersons.map((person, index) => (
                    <span key={index} className="inline-flex items-center bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                      @{person}
                      <button
                        type="button"
                        onClick={() => removeTag(person)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media (Images & Videos) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                  
                  const files = Array.from(e.dataTransfer.files);
                  files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                      const imageUrl = URL.createObjectURL(file);
                      setContributionImages(prev => [...prev, imageUrl]);
                    } else if (file.type.startsWith('video/')) {
                      const videoUrl = URL.createObjectURL(file);
                      setContributionVideos(prev => [...prev, videoUrl]);
                    }
                  });
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*,video/*';
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    files.forEach(file => {
                      if (file.type.startsWith('image/')) {
                        const imageUrl = URL.createObjectURL(file);
                        setContributionImages(prev => [...prev, imageUrl]);
                      } else if (file.type.startsWith('video/')) {
                        const videoUrl = URL.createObjectURL(file);
                        setContributionVideos(prev => [...prev, videoUrl]);
                      }
                    });
                  };
                  input.click();
                }}
              >
                <div className="space-y-2">
                  <div className="text-4xl">📎</div>
                  <div className="text-lg font-medium text-gray-600">Drop files here or click to browse</div>
                  <div className="text-sm text-gray-500">
                    Support for images and videos (JPG, PNG, MP4, etc.)
                  </div>
                </div>
              </div>

              {/* Combined Media Display */}
              {(contributionImages.length > 0 || contributionVideos.length > 0) && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {/* Images */}
                  {contributionImages.map((image, index) => (
                    <div key={`img-${index}`} className="relative">
                      <Image
                        src={image}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        IMG
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Videos */}
                  {contributionVideos.map((video, index) => (
                    <div key={`vid-${index}`} className="relative">
                      <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">🎥</span>
                      </div>
                      <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 rounded">
                        VID
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !newContribution.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Your Contribution'}
              </button>
            </div>
          </form>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <span>📋</span>
            <span>Activity Log</span>
          </h2>
          
          <div className="space-y-6">
            {issue.contributions.map((contribution, index) => (
              <div key={contribution.id} className="relative">
                {/* Timeline connector */}
                {index < issue.contributions.length - 1 && (
                  <div className="absolute left-6 top-14 w-px h-16 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <Image
                    src={contribution.author.avatar}
                    alt={contribution.author.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-white shadow-md"
                  />
                  
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{contribution.author.name}</span>
                          {contribution.author.isVerified && (
                            <span className="text-blue-500 text-sm">✓</span>
                          )}
                          <span className="text-sm text-gray-500">{contribution.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{contribution.content}</p>
                    
                    {/* Images */}
                    {contribution.images && contribution.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {contribution.images.map((image, imgIndex) => (
                          <Image
                            key={imgIndex}
                            src={image}
                            alt={`Contribution image ${imgIndex + 1}`}
                            width={200}
                            height={128}
                            className="rounded-lg object-cover h-32 w-full"
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Videos */}
                    {contribution.videos && contribution.videos.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        {contribution.videos.map((video, vidIndex) => (
                          <div key={vidIndex} className="bg-gray-200 rounded-lg h-32 flex items-center justify-center">
                            <span className="text-gray-500">🎥 Video {vidIndex + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Tagged persons */}
                    {contribution.taggedPersons && contribution.taggedPersons.length > 0 && (
                      <div className="mb-3">
                        {contribution.taggedPersons.map((person, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mr-1">
                            @{person}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Voting */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleContributionVote(contribution.id, 'upvote')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                          contribution.userVote === 'upvote'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>👍</span>
                        <span>{contribution.votes.upvote}</span>
                      </button>
                      
                      <button
                        onClick={() => handleContributionVote(contribution.id, 'downvote')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                          contribution.userVote === 'downvote'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>👎</span>
                        <span>{contribution.votes.downvote}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}