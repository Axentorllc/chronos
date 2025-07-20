import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.extend(duration)

/**
 * Format date for display
 * @param {string|Date|dayjs} date - Date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * Format time for display
 * @param {string|Date|dayjs} time - Time to format
 * @param {string} format - Format string (default: 'HH:mm')
 * @returns {string} Formatted time string
 */
export const formatTime = (time, format = 'HH:mm') => {
  if (!time) return ''
  return dayjs(time, 'HH:mm:ss').format(format)
}

/**
 * Format datetime for display
 * @param {string|Date|dayjs} datetime - Datetime to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD HH:mm')
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime, format = 'YYYY-MM-DD HH:mm') => {
  if (!datetime) return ''
  return dayjs(datetime).format(format)
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date|dayjs} date - Date to get relative time for
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * Get start of week (Monday)
 * @param {string|Date|dayjs} date - Date to get week start for
 * @returns {dayjs} Start of week
 */
export const getWeekStart = (date = dayjs()) => {
  return dayjs(date).startOf('isoWeek')
}

/**
 * Get end of week (Sunday)
 * @param {string|Date|dayjs} date - Date to get week end for
 * @returns {dayjs} End of week
 */
export const getWeekEnd = (date = dayjs()) => {
  return dayjs(date).endOf('isoWeek')
}

/**
 * Get array of dates for a week
 * @param {string|Date|dayjs} date - Date within the week
 * @returns {dayjs[]} Array of 7 dayjs objects representing the week
 */
export const getWeekDates = (date = dayjs()) => {
  const start = getWeekStart(date)
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'))
}

/**
 * Get array of dates for a month
 * @param {string|Date|dayjs} date - Date within the month
 * @returns {dayjs[]} Array of dayjs objects representing the month
 */
export const getMonthDates = (date = dayjs()) => {
  const start = dayjs(date).startOf('month')
  const end = dayjs(date).endOf('month')
  const daysInMonth = end.date()
  return Array.from({ length: daysInMonth }, (_, i) => start.add(i, 'day'))
}

/**
 * Check if a date is today
 * @param {string|Date|dayjs} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * Check if a date is in the current week
 * @param {string|Date|dayjs} date - Date to check
 * @returns {boolean} True if date is in current week
 */
export const isThisWeek = (date) => {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'week')
}

/**
 * Check if a date is in the current month
 * @param {string|Date|dayjs} date - Date to check
 * @returns {boolean} True if date is in current month
 */
export const isThisMonth = (date) => {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'month')
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {string|Date|dayjs} date - Date to check
 * @returns {boolean} True if date is weekend
 */
export const isWeekend = (date) => {
  if (!date) return false
  const day = dayjs(date).day()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a working day (Monday to Friday)
 * @param {string|Date|dayjs} date - Date to check
 * @returns {boolean} True if date is a working day
 */
export const isWorkingDay = (date) => {
  return !isWeekend(date)
}

/**
 * Get the number of working days between two dates
 * @param {string|Date|dayjs} startDate - Start date
 * @param {string|Date|dayjs} endDate - End date
 * @returns {number} Number of working days
 */
export const getWorkingDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  let workingDays = 0
  let current = start
  
  while (current.isSameOrBefore(end, 'day')) {
    if (isWorkingDay(current)) {
      workingDays++
    }
    current = current.add(1, 'day')
  }
  
  return workingDays
}

/**
 * Calculate duration between two times in hours
 * @param {string} startTime - Start time (HH:mm format)
 * @param {string} endTime - End time (HH:mm format)
 * @returns {number} Duration in hours
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0
  
  const start = dayjs(`2023-01-01 ${startTime}`)
  const end = dayjs(`2023-01-01 ${endTime}`)
  
  if (end.isBefore(start)) return 0
  
  return end.diff(start, 'hour', true)
}

/**
 * Format duration in hours to human readable format
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration (e.g., "2h 30m", "1.5h")
 */
export const formatDuration = (hours) => {
  if (!hours || hours === 0) return '0h'
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }
  
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  
  if (minutes === 0) {
    return `${wholeHours}h`
  }
  
  return `${wholeHours}h ${minutes}m`
}

/**
 * Get time slots for a day (e.g., for scheduling)
 * @param {string} startTime - Start time (default: '09:00')
 * @param {string} endTime - End time (default: '17:00')
 * @param {number} interval - Interval in minutes (default: 30)
 * @returns {Array} Array of time slot objects
 */
export const getTimeSlots = (startTime = '09:00', endTime = '17:00', interval = 30) => {
  const slots = []
  let current = dayjs(`2023-01-01 ${startTime}`)
  const end = dayjs(`2023-01-01 ${endTime}`)
  
  while (current.isBefore(end)) {
    const next = current.add(interval, 'minute')
    slots.push({
      start: current.format('HH:mm'),
      end: next.format('HH:mm'),
      label: `${current.format('HH:mm')} - ${next.format('HH:mm')}`
    })
    current = next
  }
  
  return slots
}

/**
 * Check if two time ranges overlap
 * @param {string} start1 - Start time of first range
 * @param {string} end1 - End time of first range
 * @param {string} start2 - Start time of second range
 * @param {string} end2 - End time of second range
 * @returns {boolean} True if ranges overlap
 */
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  const range1Start = dayjs(`2023-01-01 ${start1}`)
  const range1End = dayjs(`2023-01-01 ${end1}`)
  const range2Start = dayjs(`2023-01-01 ${start2}`)
  const range2End = dayjs(`2023-01-01 ${end2}`)
  
  return range1Start.isBefore(range2End) && range1End.isAfter(range2Start)
}

/**
 * Get calendar weeks for a month (including partial weeks)
 * @param {string|Date|dayjs} date - Date within the month
 * @returns {Array} Array of week arrays, each containing 7 dayjs objects
 */
export const getCalendarWeeks = (date = dayjs()) => {
  const monthStart = dayjs(date).startOf('month')
  const monthEnd = dayjs(date).endOf('month')
  const calendarStart = monthStart.startOf('isoWeek')
  const calendarEnd = monthEnd.endOf('isoWeek')
  
  const weeks = []
  let current = calendarStart
  
  while (current.isSameOrBefore(calendarEnd)) {
    const week = Array.from({ length: 7 }, (_, i) => current.add(i, 'day'))
    weeks.push(week)
    current = current.add(1, 'week')
  }
  
  return weeks
}

/**
 * Parse Frappe datetime string to dayjs object
 * @param {string} frappeDateTime - Frappe datetime string
 * @returns {dayjs} Dayjs object
 */
export const parseFrappeDateTime = (frappeDateTime) => {
  if (!frappeDateTime) return null
  return dayjs(frappeDateTime, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * Convert dayjs object to Frappe datetime string
 * @param {dayjs} date - Dayjs object
 * @returns {string} Frappe datetime string
 */
export const toFrappeDateTime = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * Convert dayjs object to Frappe date string
 * @param {dayjs} date - Dayjs object
 * @returns {string} Frappe date string
 */
export const toFrappeDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * Convert dayjs object to Frappe time string
 * @param {dayjs} time - Dayjs object
 * @returns {string} Frappe time string
 */
export const toFrappeTime = (time) => {
  if (!time) return ''
  return dayjs(time).format('HH:mm:ss')
}

// Export dayjs for direct use
export { dayjs }

// Export default object with all utilities
export default {
  dayjs,
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  getWeekStart,
  getWeekEnd,
  getWeekDates,
  getMonthDates,
  isToday,
  isThisWeek,
  isThisMonth,
  isWeekend,
  isWorkingDay,
  getWorkingDaysBetween,
  calculateDuration,
  formatDuration,
  getTimeSlots,
  timeRangesOverlap,
  getCalendarWeeks,
  parseFrappeDateTime,
  toFrappeDateTime,
  toFrappeDate,
  toFrappeTime
}