'use client';

import { useState } from 'react';

export default function SignUpPage() {
  const [signUpMethod, setSignUpMethod] = useState<'student' | 'manual'>('student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phoneNumber: '',
    acceptTerms: false,
  });
  const [studentIdImage, setStudentIdImage] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sign up functionality will be implemented later
    console.log('Sign up attempted with:', { 
      method: signUpMethod, 
      formData, 
      studentIdImage: studentIdImage?.name 
    });
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setStudentIdImage(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const isStudentEmail = formData.email.endsWith('@sust.edu');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Daabi</h1>
          <p className="text-gray-600">Connect with your campus community</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Choose your preferred registration method</p>
          </div>

          {/* Registration Method Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSignUpMethod('student')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  signUpMethod === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎓</div>
                  <h3 className="font-semibold mb-1">Student Email</h3>
                  <p className="text-sm text-gray-600">
                    Quick signup with @sust.edu email
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Auto-verified
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSignUpMethod('manual')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  signUpMethod === 'manual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-semibold mb-1">Manual Verification</h3>
                  <p className="text-sm text-gray-600">
                    Upload student ID for approval
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Requires approval
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
                {signUpMethod === 'student' && (
                  <span className="text-blue-600 text-xs ml-1">(must end with @sust.edu)</span>
                )}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 outline-none ${
                  signUpMethod === 'student' && formData.email && !isStudentEmail
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder={signUpMethod === 'student' ? 'yourname@sust.edu' : 'Enter your email'}
              />
              {signUpMethod === 'student' && formData.email && !isStudentEmail && (
                <p className="mt-1 text-sm text-red-600">Email must end with @sust.edu for student registration</p>
              )}
              {signUpMethod === 'student' && isStudentEmail && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <span className="mr-1">✓</span>
                  Valid student email - you'll be automatically verified
                </p>
              )}
            </div>

            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none"
                placeholder="Enter your student ID"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Student ID Card Upload - Only for Manual Registration */}
            {signUpMethod === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID Card Image
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {studentIdImage ? (
                    <div className="text-center">
                      <div className="text-green-500 text-2xl mb-2">✓</div>
                      <p className="text-sm font-medium text-gray-900">{studentIdImage.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(studentIdImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setStudentIdImage(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-400 text-3xl mb-4">📷</div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required={signUpMethod === 'manual'}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Please upload a clear photo of your student ID card. This will be reviewed by our moderators for approval.
                </p>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 outline-none ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Confirm your password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="acceptTerms" className="ml-3 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                !formData.acceptTerms ||
                formData.password !== formData.confirmPassword ||
                (signUpMethod === 'student' && !isStudentEmail) ||
                (signUpMethod === 'manual' && !studentIdImage)
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {signUpMethod === 'student' ? 'Create Account' : 'Submit for Approval'}
            </button>
          </form>

          {/* Registration Status Info */}
          {signUpMethod === 'manual' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-lg">⏳</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Manual Verification Process
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Your account will be reviewed by our moderators after submission. 
                    You'll receive an email notification once your account is approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Sign in here
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
