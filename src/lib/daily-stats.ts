// 每日学习统计追踪
export interface DailyStats {
  date: string
  wordsLearned: number
  maxStreak: number
  perfectRounds: number
  totalTime: number // 秒（累计）
  lastSessionTime: number // 最近一次练习用时（秒）
  lastSessionWords: number // 最近一次练习答对题数
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function loadDailyStats(): DailyStats {
  try {
    const saved = localStorage.getItem('paul_english_daily_stats')
    if (saved) {
      const stats: DailyStats = JSON.parse(saved)
      if (stats.date === getToday()) {
        // 兼容旧数据：补全新字段
        if (stats.lastSessionTime === undefined) stats.lastSessionTime = 0
        if (stats.lastSessionWords === undefined) stats.lastSessionWords = 0
        return stats
      }
    }
  } catch (e) {}
  return { date: getToday(), wordsLearned: 0, maxStreak: 0, perfectRounds: 0, totalTime: 0, lastSessionTime: 0, lastSessionWords: 0 }
}

export function saveDailyStats(stats: DailyStats): void {
  try {
    stats.date = getToday()
    localStorage.setItem('paul_english_daily_stats', JSON.stringify(stats))
  } catch (e) {}
}

// 更新连续学习天数（每次答题时调用）
export function updateStudyStreak(): number {
  const today = getToday()
  try {
    const lastDate = localStorage.getItem('paul_english_last_study_date')
    const saved = localStorage.getItem('paul_english_streak')
    let streak = saved ? parseInt(saved) : 0

    if (lastDate === today) {
      // 今天已经学过了
      return streak
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (lastDate === yesterday) {
      streak += 1
    } else if (lastDate) {
      streak = 1
    } else {
      streak = 1
    }

    localStorage.setItem('paul_english_streak', streak.toString())
    localStorage.setItem('paul_english_last_study_date', today)
    return streak
  } catch (e) {}
  return 1
}

export function updateDailyStats(partial: Partial<Pick<DailyStats, 'wordsLearned' | 'maxStreak' | 'perfectRounds' | 'totalTime' | 'lastSessionTime' | 'lastSessionWords'>>): DailyStats {
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
  // 记录本次练习的用时和答对数（用于 daily_speed 挑战判定）
  if (partial.lastSessionTime !== undefined) {
    stats.lastSessionTime = partial.lastSessionTime
  }
  if (partial.lastSessionWords !== undefined) {
    stats.lastSessionWords = partial.lastSessionWords
  }
  saveDailyStats(stats)
  // 每次更新每日统计时，同步更新连续学习天数
  updateStudyStreak()
  return stats
}
