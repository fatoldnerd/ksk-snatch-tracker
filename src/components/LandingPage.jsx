import { useState } from 'react'

function LandingPage({ onGetStarted, onSignIn, currentUser }) {
  return (
    <div className="min-h-screen relative" style={{
      background: `
        linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #dbeafe 75%, #f0f9ff 100%),
        radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
      `
    }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 shadow-large">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/New_Kettlebell.png" 
                alt="Kettlebell" 
                className="h-10 w-10 mr-3"
              />
              <h1 className="text-4xl font-bold text-white tracking-tight">KSK Snatch Tracker</h1>
            </div>
            <p className="text-primary-100 text-base font-medium">Master Geoff Neupert's King-Sized Killer Program</p>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-neutral-800 mb-4 tracking-tight">
            Crush Your Kettlebell Snatch Training with Precision
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track Every Rep. Stay Consistent. Elevate Your Performance.
          </p>
        </div>

        {/* What is KSK Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/50 p-8 mb-12 shadow-soft">
          <h3 className="text-2xl font-bold text-neutral-800 mb-4">What is the KSK Tracker?</h3>
          <p className="text-neutral-700 leading-relaxed mb-6">
            The KSK Tracker App is a powerful, user-friendly tool built for kettlebell athletes following one of the most demanding snatch-based programs available. Whether you're working to build strength, endurance, or mental toughness, our app helps you log, track, and visualize your progress every step, every set.
          </p>
          <p className="text-neutral-800 font-medium mb-4">
            We don't provide the workout. We help you execute it with precision.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>New to the program?</strong> You can get the official KSK program directly from{' '}
              <a 
                href="https://www.geoffneupert.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Geoff Neupert here
              </a>.
            </p>
          </div>
        </div>

        {/* Why Use KSK Tracker Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/50 p-8 mb-12 shadow-soft">
          <h3 className="text-2xl font-bold text-neutral-800 mb-6">Why Use the KSK Tracker?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">✅</div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Track Your Progress with Ease</h4>
                <p className="text-neutral-600 text-sm">Log rounds and sets in seconds, right from your phone or desktop.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">✅</div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Stay Accountable</h4>
                <p className="text-neutral-600 text-sm">See your volume, progress trends, and weekly totals to keep you focused.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">✅</div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Personalize Your Journey</h4>
                <p className="text-neutral-600 text-sm">Whether you're using lighter bells or pushing max reps, the app adapts to you.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">✅</div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Train with Purpose</h4>
                <p className="text-neutral-600 text-sm">Visual dashboards and clear targets keep you locked in session after session.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200/50 p-8 mb-12 shadow-soft">
          <h3 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Start Strong. Finish Stronger.</h3>
          <p className="text-neutral-700 text-center mb-8 max-w-2xl mx-auto">
            Our app is designed to support those already committed to their kettlebell journey. If you've got your program, we'll help you bring it to life.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-semibold text-neutral-800 mb-2">Secure Sign-In</h4>
              <p className="text-neutral-600 text-sm">Personal Progress Dashboard</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-3">🗓️</div>
              <h4 className="font-semibold text-neutral-800 mb-2">Daily Workout Views</h4>
              <p className="text-neutral-600 text-sm">Session Tracking</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-3">📈</div>
              <h4 className="font-semibold text-neutral-800 mb-2">Progress Visualization</h4>
              <p className="text-neutral-600 text-sm">At a Glance</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 rounded-2xl p-12 shadow-large">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Elevate Your Training?</h3>
          <p className="text-primary-100 mb-6 text-lg">
            Start tracking your kettlebell snatch progress today.
          </p>
          <p className="text-primary-100 mb-8">
            Let the KSK Tracker keep you honest, consistent, and progressing.
          </p>
          
          {currentUser ? (
            // User is already signed in
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-primary-700 rounded-xl hover:bg-primary-50 font-bold text-lg shadow-medium transition-all duration-200 hover:scale-105 hover:shadow-large"
            >
              👉 Continue to App
            </button>
          ) : (
            // User needs to sign up or sign in
            <div className="space-y-4">
              <button
                onClick={onGetStarted}
                className="block w-full max-w-xs mx-auto px-8 py-4 bg-white text-primary-700 rounded-xl hover:bg-primary-50 font-bold text-lg shadow-medium transition-all duration-200 hover:scale-105 hover:shadow-large"
              >
                👉 Get Started
              </button>
              <p className="text-primary-100 text-sm">
                Create your account to save your progress
              </p>
              <div className="pt-2">
                <button
                  onClick={onSignIn}
                  className="text-primary-100 hover:text-white font-medium underline transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default LandingPage