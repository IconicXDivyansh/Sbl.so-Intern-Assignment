import Link from 'next/link'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <main className="min-h-screen mx-auto bg-linear-to-b from-blue-200 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-300">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI-Powered Website Analysis
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg drop-shadow-black/30 leading-tight">
            Ask Questions About
            <br />
            <span className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Any Website
            </span> 
          </h1>

          {/* Subheading */}
          <p className="text-xl text-neutral-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Enter a URL and your question. Our AI will scrape, analyze, and give you accurate answers in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <SignedIn>
              <Link href="/home">
                <button className="px-8 py-4 text-base font-semibold rounded-lg text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 text-base font-semibold rounded-lg text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  Get Started Free
                </button>
              </SignUpButton>
            </SignedOut>
            <Link href="#features">
              <button className="px-8 py-4 text-base font-semibold rounded-lg text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all">
                Learn More
              </button> 
            </Link>
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 rounded-2xl bg-white/20 backdrop-blur-lg dark:bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-left space-y-3">
              <div className="border border-zinc-400 dark:bg-zinc-800 rounded-lg p-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">URL:</p>
                <p className="text-zinc-700 dark:text-white font-mono">https://example.com</p>
              </div>
              <div className="border border-zinc-400 dark:bg-zinc-800 rounded-lg p-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Question:</p>
                <p className="text-zinc-700 dark:text-white">What is the main purpose of this website?</p>
              </div>
              <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">AI Answer:</p>
                <p className="font-bold text-white">This website is a comprehensive platform for...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg drop-shadow-black/30 text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-zinc-400">
            Three simple steps to get answers about any website
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/20 border-neutral-500 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">1. Submit URL</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Enter any website URL you want to analyze. Our system supports all major websites.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/20 border-neutral-500  dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">2. Ask Question</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Type your question about the website. Be as specific or general as you like.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/20 border-neutral-500 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">3. Get AI Answer</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Receive accurate, contextual answers powered by advanced AI analysis in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are getting instant answers about websites with AI.
          </p>
          <SignedIn>
            <Link href="/home">
              <button className="px-8 py-4 text-base font-semibold rounded-lg text-purple-600 bg-white hover:bg-gray-100 transition-all shadow-lg">
                Go to Dashboard
              </button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 text-base font-semibold rounded-lg text-purple-600 bg-white hover:bg-gray-100 transition-all shadow-lg">
                Start Analyzing Now
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </section>

     
    </main>
  );
} 

