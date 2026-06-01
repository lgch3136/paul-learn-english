/**
 * 全模块通用的成就追踪器
 * 所有练习模式（经典、闪电、闯关、听力、拼写、语法、错题复习）共用此模块
 */

import {
  Achievement,
  PlayerStats,
  checkAchievements,
} from '@/lib/gameification'
import {
  WordPerformance,
  loadPerformances,
  savePerformances,
  initializePerformance,
  updatePerformance,
} from '@/lib/question-scheduler'

// 从所有模块的 performance 数据计算累计统计
export function getCumulativeStats(sessionMaxStreak: number = 0): PlayerStats {
  const perf = loadPerformances()
  let totalCorrect = 0
  let totalWrong = 0
  let maxConsecutive = 0

  perf.forEach(p => {
    totalCorrect += p.correctCount
    totalWrong += p.wrongCount
    maxConsecutive = Math.max(maxConsecutive, p.consecutiveCorrect)
  })

  // sessionMaxStreak 是本次会话的最大连击数（跨单词）
  maxConsecutive = Math.max(maxConsecutive, sessionMaxStreak)

  let daysStudied = 1
  try {
    const s = localStorage.getItem('paul_english_streak')
    if (s) daysStudied = parseInt(s)
  } catch (e) {}

  let perfectRounds = 0
  try {
    const r = localStorage.getItem('paul_english_perfect_rounds')
    if (r) perfectRounds = parseInt(r)
  } catch (e) {}

  const stats = {
    totalWords: perf.size,
    correctAnswers: totalCorrect,
    wrongAnswers: totalWrong,
    streak: 0,
    maxStreak: maxConsecutive,
    totalTime: 0,
    daysStudied,
    perfectRounds,
  }
  console.log('[成就系统] getCumulativeStats → Map.size:', perf.size, 'totalCorrect:', totalCorrect, 'totalWrong:', totalWrong, 'maxConsecutive:', maxConsecutive, 'daysStudied:', daysStudied, 'perfectRounds:', perfectRounds)
  return stats
}

// 记录答题表现（统一入口，所有模式都调用这个）
export function recordAnswer(wordId: string, isCorrect: boolean): void {
  console.log('[成就系统] recordAnswer called → wordId:', wordId, 'isCorrect:', isCorrect)
  const perf = loadPerformances()
  const current = perf.get(wordId) || initializePerformance(wordId)
  const updated = updatePerformance(current, isCorrect)
  perf.set(wordId, updated)
  savePerformances(perf)
  console.log('[成就系统] recordAnswer saved → Map.size:', perf.size, 'correctCount:', updated.correctCount, 'wrongCount:', updated.wrongCount)
}

// 记录完美轮次
export function recordPerfectRound(): void {
  try {
    const current = parseInt(localStorage.getItem('paul_english_perfect_rounds') || '0')
    localStorage.setItem('paul_english_perfect_rounds', (current + 1).toString())
  } catch (e) {}
}

// 增加积分
export function addPoints(amount: number): number {
  try {
    const current = parseInt(localStorage.getItem('paul_english_points') || '0')
    const newPoints = current + amount
    localStorage.setItem('paul_english_points', newPoints.toString())
    return newPoints
  } catch (e) { return 0 }
}

export interface AchievementResult {
  newAchievements: Achievement[]
  totalPoints: number
}

// 检查并返回新解锁的成就（不保存到 localStorage，由调用方在弹窗关闭后保存）
export function checkNewAchievements(sessionMaxStreak: number = 0): AchievementResult {
  const stats = getCumulativeStats(sessionMaxStreak)
  console.log('[成就追踪] 累计统计:', stats)

  const allMatching = checkAchievements(stats)
  console.log('[成就追踪] 符合条件:', allMatching.map(a => a.id))

  let currentUnlockedIds: string[] = []
  try {
    const saved = localStorage.getItem('paul_english_achievements')
    if (saved) currentUnlockedIds = JSON.parse(saved)
  } catch (e) {}

  const newAchievements = allMatching.filter(a => !currentUnlockedIds.includes(a.id))
  console.log('[成就追踪] 新解锁:', newAchievements.map(a => a.id), '已有:', currentUnlockedIds)

  const rewardPoints = newAchievements.reduce((sum, a) => sum + a.reward, 0)
  const totalPoints = addPoints(rewardPoints)

  return { newAchievements, totalPoints }
}

// 将成就保存到 localStorage（弹窗关闭后调用）
export function saveAchievement(achievement: Achievement): void {
  try {
    const saved = localStorage.getItem('paul_english_achievements')
    let ids: string[] = saved ? JSON.parse(saved) : []
    if (!ids.includes(achievement.id)) {
      ids.push(achievement.id)
      localStorage.setItem('paul_english_achievements', JSON.stringify(ids))
    }
  } catch (e) {
    console.error('保存成就失败:', e)
  }
}
