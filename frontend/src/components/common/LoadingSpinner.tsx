import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-green-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export function LoadingCard({ title, className = '' }: { title?: string; className?: string }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          {title && (
            <p className="mt-4 text-sm text-gray-500">{title}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoadingChart({ title, height = 'h-64', className = '' }: { title?: string; height?: string; className?: string }) {
  return (
    <div className={`chart-container ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className={`flex items-center justify-center ${height}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading chart data...</p>
        </div>
      </div>
    </div>
  )
}