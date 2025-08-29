import React from 'react'
import StatCard from '../common/StatCard'
import { LoadingCard, LoadingChart } from '../common/LoadingSpinner'
import TeamConfigForm from '../forms/TeamConfig'
import UsageChart from '../charts/UsageChart'
import { useTeamConfig, useTeamProjection, useUsageSummary } from '../../hooks/useUsageData'
import { 
  formatTokens, 
  formatCO2, 
  formatTrees,
  formatKwh
} from '../../utils/formatters'

export default function TeamTab() {
  const { data: teamConfig, isLoading: configLoading, error: configError } = useTeamConfig()
  const { data: teamProjection, isLoading: projectionLoading, error: projectionError } = useTeamProjection()
  const { data: summary, isLoading: summaryLoading } = useUsageSummary(30)

  if (configError || projectionError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading team data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Unable to fetch team configuration or projections. Please check your connection and try again.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const teamMultiplier = teamConfig ? teamConfig.team_size * teamConfig.usage_multiplier : 1

  return (
    <div className="space-y-8">
      {/* Team Configuration */}
      <div>
        {configLoading ? (
          <LoadingCard />
        ) : teamConfig ? (
          <TeamConfigForm initialConfig={teamConfig} />
        ) : null}
      </div>

      {/* Team Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectionLoading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : teamProjection ? (
          <>
            <StatCard
              title="Team Daily Usage"
              value={formatTokens(teamProjection.daily.tokens)}
              subValue={`tokens (${teamMultiplier.toFixed(1)}x personal)`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            
            <StatCard
              title="Team Daily CO2"
              value={formatCO2(teamProjection.daily.co2)}
              subValue="carbon emissions"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <StatCard
              title="Team Carbon Budget"
              value={`${((teamProjection.yearly.co2 / teamProjection.team_size / 4700000) * 100).toFixed(1)}%`}
              subValue="avg. per person budget"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <StatCard
              title="Team Yearly CO2"
              value={formatCO2(teamProjection.yearly.co2)}
              subValue="projected emissions"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </>
        ) : null}
      </div>

      {/* CO2 Equivalents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projectionLoading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : teamProjection ? (
          <>
            <StatCard
              title="Car Kilometers"
              value={`${(teamProjection.yearly.co2 / 250).toLocaleString('en-US', { maximumFractionDigits: 0 })} km`}
              subValue="equivalent driving"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6h3l4 4-4 4h-3m-8-8h3l4 4-4 4H5m8-8v8" />
                </svg>
              }
            />
            
            <StatCard
              title="Electricity"
              value={formatKwh(teamProjection.yearly.co2 / 430)}
              subValue="equivalent consumption"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            
            <StatCard
              title="Trees to Offset"
              value={formatTrees(teamProjection.yearly.co2 / 22000)}
              subValue="annual planting needed"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          </>
        ) : null}
      </div>
    </div>
  )
}