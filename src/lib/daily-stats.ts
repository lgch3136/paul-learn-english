// 每日学习统计追踪
export interface DailyStats {
  date: string
  wordsLearned: number
  maxStreak: number
  perfectRounds: number
  totalTime: number // 秒
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function loadDailyStats(): DailyStats {
  try {
    const saved = localStorage.getItem('paul_english_daily_stats')
    if (saved) {
      const stats: DailyStats = JSON.parse(saved)
      // 如果不是今天的，重置
      if (stats.date === getToday()) return stats
    }
  } catch (e) {}
  return { date: getToday(), wordsLearned: 0, maxStreak: 0, perfectRounds: 0, totalTime: 0 }
}

export function saveDailyStats(stats: DailyStats): void {
  try {
    stats.date = getToday()
    localStorage.setItem('paul_english_daily_stats', JSON.stringify(stats))
  } catch (e) {}
}

export function updateDailyStats(partial: Partial<Pick<DailyStats, 'wordsLearned' | 'maxStreak' | 'perfectRounds' | 'totalTime'>>): DailyStats {
  const stats = loadDailyStats()
  if (partial.wordsLearned !== undefined) {
    stats.wordsLearned += partial.wordsLearned
  }
  if (partial.maxStreak !== undefined) {
    stats.maxStreak = Math.max(stats.maxStreak, partial.maxStreak)
  }
  if (partial.perfectRounds !== undefined) {
    stats.perfectRounds += partial.perfectRounds
  }
  if (partial.totalTime !== undefined) {
    stats.totalTime += partial.totalTime
  }
  saveDailyStats(stats)
  return stats
}
