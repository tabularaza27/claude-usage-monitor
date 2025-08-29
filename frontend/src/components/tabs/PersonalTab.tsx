import React from 'react'
import StatCard from '../common/StatCard'
import { LoadingCard, LoadingChart } from '../common/LoadingSpinner'
import UsageChart from '../charts/UsageChart'
import ModelBreakdown from '../charts/ModelBreakdown'
import { useUsageStats, useUsageSummary } from '../../hooks/useUsageData'
import { 
  formatTokens, 
  formatCO2, 
  formatTrees,
  formatKwh
} from '../../utils/formatters'

export default function PersonalTab() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useUsageStats()
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useUsageSummary(30)

  if (statsError || summaryError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Unable to fetch usage data. Please check your connection and try again.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Today's Usage"
              value={formatTokens(stats.today.tokens)}
              subValue="tokens"
              change={{
                current: stats.today.tokens,
                previous: stats.yesterday.tokens,
                label: "vs yesterday"
              }}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            
            <StatCard
              title="Daily CO2"
              value={formatCO2(stats.today.co2)}
              subValue="carbon emissions"
              change={{
                current: stats.today.co2,
                previous: stats.yesterday.co2,
                label: "vs yesterday"
              }}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
<StatCard
              title="Carbon Budget"
              value={`${((stats.yearlyProjection.co2 / 4700000) * 100).toFixed(1)}%`}
              subValue="of avg. annual budget"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
<StatCard
              title="Yearly CO2"
              value={formatCO2(stats.yearlyProjection.co2)}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Trends Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Trends (Last 30 Days)
          </h3>
          {summaryLoading ? (
            <LoadingChart height="h-64" />
          ) : summary?.summaries ? (
            <UsageChart data={summary.summaries} height={300} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No usage data available
            </div>
          )}
        </div>

        {/* CO2 Impact Analysis */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            CO2 Impact Analysis
          </h3>
          {statsLoading ? (
            <LoadingChart height="h-64" />
          ) : stats ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {formatCO2(stats.yearlyProjection.co2)}
                </div>
                <p className="text-gray-600">Annual CO2 projection</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Environmental Equivalents:</h4>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="flex items-center">
                      🚗 Car kilometers
                    </span>
                    <span className="font-medium">
                      {(stats.yearlyProjection.co2 / 250).toLocaleString('en-US', { maximumFractionDigits: 0 })} km
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="flex items-center">
                      🌳 Trees to offset (annually)
                    </span>
                    <span className="font-medium">
                      {formatTrees(stats.yearlyProjection.co2 / 22000)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="flex items-center">
                      ⚡ Electricity equivalent
                    </span>
                    <span className="font-medium">
                      {formatKwh(stats.yearlyProjection.co2 / 430)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="flex items-center">
                      👤 Personal carbon budget
                    </span>
                    <span className="font-medium">
                      {((stats.yearlyProjection.co2 / 4700000) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No CO2 data available
            </div>
          )}
        </div>
      </div>

      {/* Yearly Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projections Card */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Yearly Projections
          </h3>
          {statsLoading ? (
            <LoadingCard />
          ) : stats ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Based on current 30-day average:</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatTokens(stats.yearlyProjection.tokens)}
                  </p>
                  <p className="text-sm text-gray-600">Annual Tokens</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {formatCO2(stats.yearlyProjection.co2)}
                  </p>
                  <p className="text-sm text-gray-600">Annual CO2</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sustainability Insights */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sustainability Insights
          </h3>
          {statsLoading ? (
            <LoadingCard />
          ) : stats ? (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">Carbon Impact</h4>
                <p className="text-sm text-orange-700">
                  Your annual AI usage generates <strong>{formatCO2(stats.yearlyProjection.co2)}</strong> of CO2, 
                  which represents <strong>{((stats.yearlyProjection.co2 / 4700000) * 100).toFixed(1)}%</strong> of the average person's annual carbon budget.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Offset Recommendations</h4>
                <p className="text-sm text-green-700">
                  Consider planting <strong>{formatTrees(stats.yearlyProjection.co2 / 22000)}</strong> or 
                  purchasing carbon offsets to neutralize your AI environmental impact.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Usage Context</h4>
                <p className="text-sm text-blue-700">
                  Your AI emissions equal driving <strong>{(stats.yearlyProjection.co2 / 250).toLocaleString('en-US', { maximumFractionDigits: 0 })} km</strong> 
                  or consuming <strong>{formatKwh(stats.yearlyProjection.co2 / 430)}</strong> of electricity.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}