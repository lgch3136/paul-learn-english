/**
 * 打卡签到系统
 * 独立于答题系统，学生每天打开 APP 就能签到
 * 鼓励每天打开 APP，降低使用门槛
 */

export interface CheckInData {
  history: string[]     // 签到日期列表，格式 "2026-06-03"
  currentStreak: number // 当前连续签到天数
  longestStreak: number // 历史最长连续签到
  totalCheckIns: number // 累计签到天数
  milestones: number[]  // 已领取的里程碑天数 [3, 7, 14, ...]
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterday(): string {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0]
}

// 获取本周一的日期
function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

const STORAGE_KEY = 'paul_english_checkin'

export function loadCheckIn(): CheckInData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return { history: [], currentStreak: 0, longestStreak: 0, totalCheckIns: 0, milestones: [] }
}

export function saveCheckIn(data: CheckInData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {}
}

// 是否今天已签到
export function hasCheckedInToday(): boolean {
  const data = loadCheckIn()
  return data.history.includes(getToday())
}

// 执行签到，返回签到后的数据
export function doCheckIn(): CheckInData {
  const data = loadCheckIn()
  const today = getToday()

  if (data.history.includes(today)) return data

  data.history.push(today)
  data.totalCheckIns = data.history.length

  // 计算连续签到天数
  const yesterday = getYesterday()
  if (data.history.includes(yesterday)) {
    data.currentStreak += 1
  } else {
    data.currentStreak = 1
  }

  data.longestStreak = Math.max(data.longestStreak, data.currentStreak)
  saveCheckIn(data)

  // 同步更新学习连续天数（让成就系统也能识别签到天数）
  try {
    const existingStreak = parseInt(localStorage.getItem('paul_english_streak') || '0')
    if (data.currentStreak > existingStreak) {
      localStorage.setItem('paul_english_streak', data.currentStreak.toString())
      localStorage.setItem('paul_english_last_study_date', today)
    }
  } catch (e) {}

  return data
}

// 获取最近 28 天的签到日历（4 周）
export function getRecentCalendar(): { date: string; checked: boolean; isToday: boolean; isFuture: boolean }[] {
  const data = loadCheckIn()
  const today = new Date()
  const todayStr = getToday()
  const calendar: { date: string; checked: boolean; isToday: boolean; isFuture: boolean }[] = []

  // 从 4 周前的周一开始
  const startDate = getMonday(new Date(today.getTime() - 21 * 86400000))

  for (let i = 0; i < 28; i++) {
    const d = new Date(startDate.getTime() + i * 86400000)
    const dateStr = formatDate(d)
    calendar.push({
      date: dateStr,
      checked: data.history.includes(dateStr),
      isToday: dateStr === todayStr,
      isFuture: d > today,
    })
  }

  return calendar
}

// 里程碑定义
export interface CheckInMilestone {
  days: number
  title: string
  icon: string
  reward: number
  description: string
}

export const checkInMilestones: CheckInMilestone[] = [
  { days: 1, title: '初次签到', icon: '🌱', reward: 5, description: '第一次签到打卡' },
  { days: 3, title: '三日签到', icon: '🌿', reward: 15, description: '连续签到3天' },
  { days: 5, title: '五日不辍', icon: '🌳', reward: 25, description: '连续签到5天' },
  { days: 7, title: '一周达人', icon: '⭐', reward: 50, description: '连续签到7天' },
  { days: 10, title: '十日签王', icon: '🔥', reward: 60, description: '连续签到10天' },
  { days: 14, title: '两周英雄', icon: '🛡️', reward: 80, description: '连续签到14天' },
  { days: 21, title: '三周勇士', icon: '⚔️', reward: 120, description: '连续签到21天' },
  { days: 30, title: '月签之王', icon: '👑', reward: 200, description: '连续签到30天' },
  { days: 50, title: '五十传说', icon: '💎', reward: 300, description: '连续签到50天' },
  { days: 100, title: '百日之功', icon: '👸', reward: 500, description: '连续签到100天' },
]

// 获取签到后新达成的里程碑（发放奖励前调用）
export function getNewMilestones(data: CheckInData): CheckInMilestone[] {
  return checkInMilestones.filter(
    m => data.currentStreak >= m.days && !data.milestones.includes(m.days)
  )
}

// 领取里程碑奖励
export function claimMilestone(data: CheckInData, days: number): CheckInData {
  if (!data.milestones.includes(days)) {
    data.milestones.push(days)
    saveCheckIn(data)
  }
  return data
}

// 获取下一个未达成的里程碑
export function getNextMilestone(data: CheckInData): CheckInMilestone | null {
  return checkInMilestones.find(m => !data.milestones.includes(m.days)) || null
}

// 获取本周签到天数
export function getThisWeekCheckIns(): number {
  const data = loadCheckIn()
  const monday = getMonday(new Date())
  let count = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime() + i * 86400000)
    const dateStr = formatDate(d)
    if (data.history.includes(dateStr)) count++
  }
  return count
}

// 获取签到日的显示标签
export function getWeekDayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  return labels[d.getDay()]
}
