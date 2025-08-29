export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return formatNumber(tokens)
}

export function formatCO2(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`
  }
  return `${grams.toFixed(1)}g`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function formatChangePercent(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+∞%' : '0%'
  const change = ((current - previous) / previous) * 100
  const prefix = change > 0 ? '+' : ''
  return `${prefix}${change.toFixed(1)}%`
}

export function formatMiles(miles: number): string {
  if (miles < 0.1) {
    return `${(miles * 5280).toFixed(0)} ft`
  }
  return `${miles.toFixed(1)} mi`
}

export function formatTrees(trees: number): string {
  if (trees < 0.01) {
    return `${(trees * 365).toFixed(1)} tree-days`
  }
  return `${trees.toFixed(2)} trees`
}

export function formatKwh(kwh: number): string {
  if (kwh < 0.1) {
    return `${(kwh * 1000).toFixed(0)} Wh`
  }
  return `${kwh.toFixed(1)} kWh`
}

export function formatTimeRange(days: number): string {
  if (days === 1) return 'Today'
  if (days === 7) return 'Last 7 days'
  if (days === 30) return 'Last 30 days'
  if (days === 90) return 'Last 3 months'
  if (days === 365) return 'Last year'
  return `Last ${days} days`
}