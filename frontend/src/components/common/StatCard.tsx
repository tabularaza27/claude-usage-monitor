import React from 'react'
import { formatChangePercent } from '../../utils/formatters'

interface StatCardProps {
  title: string
  value: string | number
  subValue?: string
  change?: {
    current: number
    previous: number
    label: string
  }
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export default function StatCard({
  title,
  value,
  subValue,
  change,
  icon,
  trend,
  className = ''
}: StatCardProps) {
  const getTrendColor = () => {
    if (!change) return ''
    const changePercent = ((change.current - change.previous) / change.previous) * 100
    if (changePercent > 0) return 'text-green-600'
    if (changePercent < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getTrendIcon = () => {
    if (!change) return null
    const changePercent = ((change.current - change.previous) / change.previous) * 100
    if (changePercent > 0) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    if (changePercent < 0) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="metric-label">{title}</p>
          <p className="metric-value mt-1">{value}</p>
          {subValue && (
            <p className="text-sm text-gray-600 mt-1">{subValue}</p>
          )}
        </div>
        
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {change && (
        <div className={`flex items-center mt-4 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-1 font-medium">
            {formatChangePercent(change.current, change.previous)}
          </span>
          <span className="ml-1 text-gray-500">
            {change.label}
          </span>
        </div>
      )}
    </div>
  )
}