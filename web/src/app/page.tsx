export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl text-center">
          {/* Logo/Brand Section */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8 shadow-lg">
              <span className="text-4xl font-bold text-white">🎓</span>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">Daabi</h1>
            <p className="text-2xl text-gray-600 mb-4 font-medium">
              Your Campus, Your Voice, Your Community
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
              A comprehensive student platform for raising demands, sharing campus moments, 
              tracking issues, and building a vibrant campus marketplace
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 max-w-md mx-auto">
            <a
              href="/login"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Sign In
            </a>
            
            <a
              href="/signup"
              className="flex-1 bg-white text-gray-700 py-4 px-8 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Join Campus
            </a>
          </div>

          {/* Demo Link */}
          <div className="mb-8">
            <a
              href="/feed"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span>👀</span>
              <span>Preview Campus Feed</span>
              <span>→</span>
            </a>
          </div>

          {/* Features Grid */}
           
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <a href="/feed">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-3xl">�</span>
              </div>
             
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Campus Feed</h3>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                Stay updated with campus news, discussions, and moments shared by your fellow students
              </p>
            </div>
            </a>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Demands & Issues</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Raise your voice on campus issues, track progress, and collaborate on solutions
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">�</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Kroy-Bikroy</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Campus marketplace for buying and selling items among students
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <span className="text-3xl">💝</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Crowdfunding</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Support campus initiatives and events through transparent fundraising
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <span className="text-2xl">🎬</span>
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 mb-2">Campus Highlights</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Share and discover trending campus moments through short videos and highlights
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
                  <span className="text-2xl">🗳️</span>
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 mb-2">Democracy Practice</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Participate in campus governance through voting and democratic decision-making
                </p>
              </div>
            </div>
          </div>

          {/* Trust & Security */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-16 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Secure & Verified Campus Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <span className="text-xl">🔐</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Verified Students</h4>
                <p className="text-sm text-gray-600">Only verified students with .edu emails or ID cards can join</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <span className="text-xl">�️</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Safe Environment</h4>
                <p className="text-sm text-gray-600">Zero tolerance for harassment with legal protection</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <span className="text-xl">�</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Community Driven</h4>
                <p className="text-sm text-gray-600">Managed by elected student bodies and transparency</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Campus Experience?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already using Daabi to make their voices heard, 
              solve campus issues, and build a stronger community together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <a
                href="/signup"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="flex-1 bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-8 text-sm text-gray-600 mb-6">
            <a href="#" className="hover:text-gray-800 transition-colors">About Daabi</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Community Guidelines</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 Daabi. Built for students, by students. Empowering campus communities everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
