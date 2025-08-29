import React from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { DailyUsageSummary } from '../../types/usage'
import { formatTokens, formatDate, formatCO2 } from '../../utils/formatters'

interface UsageChartProps {
  data: DailyUsageSummary[]
  height?: number
  showCost?: boolean
  showCO2?: boolean
}

export default function UsageChart({ 
  data, 
  height = 300, 
  showCost = false, 
  showCO2 = true 
}: UsageChartProps) {
  // Reverse data to show chronological order (oldest to newest)
  const chartData = [...data].reverse().map(item => ({
    ...item,
    date_formatted: formatDate(item.date),
    tokens_k: Math.round(item.total_tokens / 1000),
    co2_kg: item.total_co2 / 1000
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{formatDate(data.date)}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                Tokens:
              </span>
              <span className="font-medium">{formatTokens(data.total_tokens)}</span>
            </div>
            {showCO2 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  CO2:
                </span>
                <span className="font-medium">{(data.total_co2 / 1000).toFixed(3)} kg</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 20, right: 60, left: 60, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date_formatted" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            yAxisId="tokens"
            orientation="left"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}K`}
            label={{ value: 'Tokens (K)', angle: -90, position: 'insideLeft' }}
          />
          {showCO2 && (
            <YAxis 
              yAxisId="co2"
              orientation="right"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              label={{ value: 'CO2 (kg)', angle: 90, position: 'insideRight' }}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line
            yAxisId="tokens"
            type="monotone"
            dataKey="tokens_k"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
            name="Tokens (K)"
          />
          
          
          {showCO2 && (
            <Line
              yAxisId="co2"
              type="monotone"
              dataKey="co2_kg"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
              name="CO2 (kg)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}