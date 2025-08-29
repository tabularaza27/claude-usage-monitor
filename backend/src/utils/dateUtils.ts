export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr)
}

export function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDate(date)
}

export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date())
}

export function isYesterday(dateStr: string): boolean {
  return dateStr === getDaysAgo(1)
}