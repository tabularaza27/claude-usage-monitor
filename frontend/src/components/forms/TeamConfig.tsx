import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import { TeamConfig } from '../../types/usage'

interface TeamConfigProps {
  initialConfig: TeamConfig
  onConfigUpdate?: (config: TeamConfig) => void
}

export default function TeamConfigForm({ initialConfig, onConfigUpdate }: TeamConfigProps) {
  const [teamSize, setTeamSize] = useState(initialConfig.team_size)
  const [usageMultiplier, setUsageMultiplier] = useState(initialConfig.usage_multiplier)
  const [isEditing, setIsEditing] = useState(false)

  const queryClient = useQueryClient()

  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<TeamConfig>) => api.updateTeamConfig(config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
      setIsEditing(false)
      onConfigUpdate?.(data.config)
    },
    onError: (error) => {
      console.error('Failed to update team config:', error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateConfigMutation.mutate({
      team_size: teamSize,
      usage_multiplier: usageMultiplier
    })
  }

  const handleCancel = () => {
    setTeamSize(initialConfig.team_size)
    setUsageMultiplier(initialConfig.usage_multiplier)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Configuration</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Size
              </label>
              <div className="text-2xl font-bold text-blue-600">
                {teamSize} people
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Multiplier
              </label>
              <div className="text-2xl font-bold text-green-600">
                {usageMultiplier}x
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Configuration Explanation:</p>
            <ul className="space-y-1">
              <li>• <strong>Team Size:</strong> Number of team members to project usage for</li>
              <li>• <strong>Usage Multiplier:</strong> Adjusts individual usage for team patterns (1.0 = same as you)</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Team Configuration</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
            Team Size
          </label>
          <div className="relative">
            <input
              type="number"
              id="teamSize"
              min="1"
              max="1000"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-16"
              placeholder="Enter team size"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm">people</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Number of team members (including yourself)
          </p>
        </div>

        <div>
          <label htmlFor="usageMultiplier" className="block text-sm font-medium text-gray-700 mb-2">
            Usage Pattern Multiplier
          </label>
          <div className="relative">
            <input
              type="number"
              id="usageMultiplier"
              min="0.1"
              max="10"
              step="0.1"
              value={usageMultiplier}
              onChange={(e) => setUsageMultiplier(parseFloat(e.target.value) || 1.0)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8"
              placeholder="1.0"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm">x</span>
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <p>Adjust for different usage patterns:</p>
            <ul className="mt-1 space-y-0.5 ml-2">
              <li>• 0.5x = Team uses half your amount</li>
              <li>• 1.0x = Team uses same as you</li>
              <li>• 2.0x = Team uses twice your amount</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Preview:</strong> A team of {teamSize} people with {usageMultiplier}x usage would have{' '}
                <strong>{(teamSize * usageMultiplier).toFixed(1)}x</strong> your environmental impact.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateConfigMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateConfigMutation.isPending ? 'Updating...' : 'Update Configuration'}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>

        {updateConfigMutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              Failed to update configuration. Please try again.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}