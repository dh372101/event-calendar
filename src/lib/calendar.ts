export interface CalendarDay {
  date: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday?: boolean
  events: import('@/types').Event[]
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // 转换为周一开始 (0=Monday, 6=Sunday)
  return day === 0 ? 6 : day - 1
}

export function generateCalendarDays(year: number, month: number, allEvents: import('@/types').Event[]): CalendarDay[] {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const days: CalendarDay[] = []

  // 上个月的日期
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    days.push({
      date,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      events: allEvents.filter(event => event.date === dateStr),
    })
  }

  // 当前月的日期
  for (let date = 1; date <= daysInMonth; date++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    days.push({
      date,
      month,
      year,
      isCurrentMonth: true,
      events: allEvents.filter(event => event.date === dateStr),
    })
  }

  // 下个月的日期
  const remainingDays = 42 - days.length // 6行 x 7列
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year

  for (let date = 1; date <= remainingDays; date++) {
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    days.push({
      date,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      events: allEvents.filter(event => event.date === dateStr),
    })
  }

  return days
}

export function formatMonthYear(year: number, month: number): string {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]
  return `${year}年${months[month]}`
}

export function getWeekDays(): string[] {
  return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  }
}