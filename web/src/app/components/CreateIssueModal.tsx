'use client';

import { useState } from 'react';
import Image from 'next/image';

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

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: Issue) => void;
}

export default function CreateIssueModal({ isOpen, onClose, onSubmit }: CreateIssueModalProps) {
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'other' as Issue['category'],
    tags: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
      priority: 'medium', // Default to medium priority
      votes: { upvote: 0, downvote: 0 },
      contributions: [],
      tags: newIssue.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      images: uploadedFiles.length > 0 ? uploadedFiles.map(file => URL.createObjectURL(file)) : undefined
    };

    onSubmit(issue);
    setNewIssue({
      title: '',
      description: '',
      category: 'other',
      tags: ''
    });
    setUploadedFiles([]);
    onClose();
  };

  const handleClose = () => {
    setNewIssue({
      title: '',
      description: '',
      category: 'other',
      tags: ''
    });
    setUploadedFiles([]);
    onClose();
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle dropped files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Process files
  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      return (isImage || isVideo) && isValidSize;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Report New Issue</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
              placeholder="Detailed description of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newIssue.category}
              onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value as Issue['category'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="wifi">📶 WiFi/Internet</option>
              <option value="food">🍽️ Food/Cafeteria</option>
              <option value="infrastructure">🏗️ Infrastructure</option>
              <option value="academic">📚 Academic</option>
              <option value="hostel">🏠 Hostel</option>
              <option value="transport">🚌 Transport</option>
              <option value="other">📝 Other</option>
            </select>
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

          {/* Media Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Media (Images/Videos)</label>
            
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="text-center">
                <div className="text-4xl mb-2">📎</div>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Images and videos up to 10MB
                </p>
              </div>
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={48}
                            height={48}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 text-xl">🎥</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
