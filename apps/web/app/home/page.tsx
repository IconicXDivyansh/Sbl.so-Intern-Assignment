import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()
  
  // Redirect to landing page if not authenticated
  if (!userId) {
    redirect('/')
  }

  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Ready to ask questions about any website? Let's get started!
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Submit a URL</h3>
              <p className="text-gray-600 text-sm">
                Enter the website URL you want to ask questions about
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Ask Your Question</h3>
              <p className="text-gray-600 text-sm">
                Type your question about the website's content
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Get AI Answer</h3>
              <p className="text-gray-600 text-sm">
                Receive an AI-powered answer based on the website content
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Start Asking Questions
            </button>
          </div>
        </div>

        {/* Recent Questions Section (Placeholder) */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Recent Questions
          </h2>
          <div className="text-center py-16 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">No questions yet. Start by asking your first question!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
