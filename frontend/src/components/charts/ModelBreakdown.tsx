import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { DailyUsageSummary } from '../../types/usage'
import { formatTokens, formatPercentage } from '../../utils/formatters'

interface ModelBreakdownProps {
  data: DailyUsageSummary[]
  height?: number
  metric?: 'tokens' | 'cost' | 'co2'
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green  
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
]

export default function ModelBreakdown({ 
  data, 
  height = 300, 
  metric = 'tokens' 
}: ModelBreakdownProps) {
  // Aggregate model usage across all days
  const modelTotals = new Map<string, { tokens: number, cost: number, co2: number }>()
  
  data.forEach(day => {
    day.models.forEach(model => {
      const existing = modelTotals.get(model.name) || { tokens: 0, cost: 0, co2: 0 }
      modelTotals.set(model.name, {
        tokens: existing.tokens + model.tokens,
        cost: existing.cost + model.cost,
        co2: existing.co2 + model.co2
      })
    })
  })

  // Convert to chart data
  const chartData = Array.from(modelTotals.entries())
    .map(([name, totals]) => ({
      name: name.replace('claude-', '').replace('-', ' '),
      fullName: name,
      ...totals,
      value: totals[metric]
    }))
    .sort((a, b) => b.value - a.value)

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  const getMetricLabel = () => {
    switch (metric) {
      case 'tokens': return 'Tokens'
      case 'cost': return 'Cost ($)'
      case 'co2': return 'CO2 (g)'
      default: return 'Value'
    }
  }

  const formatValue = (value: number) => {
    switch (metric) {
      case 'tokens': return formatTokens(value)
      case 'cost': return `$${value.toFixed(2)}`
      case 'co2': return `${value.toFixed(1)}g`
      default: return value.toString()
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Tokens:</span>
              <span className="font-medium">{formatTokens(data.tokens)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost:</span>
              <span className="font-medium">${data.cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CO2:</span>
              <span className="font-medium">{data.co2.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Share:</span>
              <span className="font-medium">
                {formatPercentage(data.value, total)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {entry.payload.name} ({formatPercentage(entry.payload.value, total)})
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No model usage data available
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => 
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary below chart */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">
          {getMetricLabel()} Breakdown
        </h4>
        <div className="space-y-2">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{formatValue(item.value)}</span>
                <span className="text-gray-500 ml-2">
                  ({formatPercentage(item.value, total)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}