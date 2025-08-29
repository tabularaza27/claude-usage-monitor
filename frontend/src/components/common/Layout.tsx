import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  lastUpdate?: Date
}

export default function Layout({ children, title, lastUpdate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌱</span>
              <h1 className="text-xl font-semibold text-gray-900">
                {title || 'Claude Usage & Environmental Impact Monitor'}
              </h1>
            </div>
            
            {lastUpdate && (
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-2">Last Updated:</span>
                <span className="font-medium">
                  {lastUpdate.toLocaleTimeString()}
                </span>
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>Claude Usage Dashboard - Environmental Impact Monitoring</p>
            <p className="mt-1">
              Powered by <span className="font-semibold">claude-monitor</span> • 
              Data updates every 5 minutes
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}