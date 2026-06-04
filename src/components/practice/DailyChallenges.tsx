'use client'

import { useState, useEffect, useRef } from 'react'
import { dailyChallenges, DailyChallenge, checkDailyChallenge } from '@/lib/gameification'
import { DailyStats, loadDailyStats } from '@/lib/daily-stats'

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

// 加载今日已领取奖励的挑战 ID
function loadRewardedChallenges(): string[] {
  try {
    const saved = localStorage.getItem('paul_english_daily_rewards')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.date === getToday()) return data.ids || []
    }
  } catch (e) {}
  return []
}

function saveRewardedChallenges(ids: string[]) {
  try {
    localStorage.setItem('paul_english_daily_rewards', JSON.stringify({ date: getToday(), ids }))
  } catch (e) {}
}

export default function DailyChallenges() {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [rewardedIds, setRewardedIds] = useState<string[]>([])
  const [newReward, setNewReward] = useState<{ points: number; title: string } | null>(null)
  const rewardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queuedRewardRef = useRef<{ points: number; title: string } | null>(null)

  useEffect(() => {
    setStats(loadDailyStats())
    setRewardedIds(loadRewardedChallenges())

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setStats(loadDailyStats())
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleVisibility)
      if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current)
    }
  }, [])

  // 检查新完成的挑战并发放奖励
  // 奖励分配（积分、rewardedIds 更新）始终执行
  // 通知排队显示，不会丢失
  useEffect(() => {
    if (!stats) return

    const challenges = dailyChallenges.map(challenge => ({
      ...challenge,
      completed: checkDailyChallenge(challenge, stats.wordsLearned, stats.maxStreak, stats.perfectRounds, stats.totalTime, stats.lastSessionWords, stats.lastSessionTime)
    }))

    const newlyCompleted = challenges.filter(c => c.completed && !rewardedIds.includes(c.id))

    // 显示排队的通知（当前通知结束后）
    if (newlyCompleted.length === 0 && !newReward && queuedRewardRef.current) {
      const queued = queuedRewardRef.current
      queuedRewardRef.current = null
      setNewReward(queued)
      if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current)
      rewardTimerRef.current = setTimeout(() => {
        setNewReward(null)
        rewardTimerRef.current = null
      }, 3000)
      return
    }

    if (newlyCompleted.length === 0) return

    const totalReward = newlyCompleted.reduce((sum, c) => sum + c.reward, 0)
    const newRewardedIds = [...rewardedIds, ...newlyCompleted.map(c => c.id)]

    // 发放积分（始终执行，无论通知是否显示）
    try {
      const currentPoints = parseInt(localStorage.getItem('paul_english_points') || '0')
      localStorage.setItem('paul_english_points', (currentPoints + totalReward).toString())
    } catch (e) {}

    // 记录已领取（始终执行）
    setRewardedIds(newRewardedIds)
    saveRewardedChallenges(newRewardedIds)

    // 显示通知或排队
    const rewardData = { points: totalReward, title: newlyCompleted.map(c => c.title).join('、') }
    if (!newReward) {
      setNewReward(rewardData)
      if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current)
      rewardTimerRef.current = setTimeout(() => {
        setNewReward(null)
        rewardTimerRef.current = null
      }, 3000)
    } else {
      // 当前有通知，排队等待显示
      queuedRewardRef.current = rewardData
    }
  }, [stats, rewardedIds, newReward])

  if (!stats) return null

  const challenges = dailyChallenges.map(challenge => {
    let current = 0
    switch (challenge.id) {
      case 'daily_5':
      case 'daily_10':
      case 'daily_20':
        current = stats.wordsLearned; break
      case 'daily_speed':
        current = stats.lastSessionWords || 0; break
      case 'daily_streak_3':
      case 'daily_streak':
      case 'daily_streak_10':
        current = stats.maxStreak; break
      case 'daily_perfect':
        current = stats.perfectRounds; break
    }
    return {
      ...challenge,
      current: Math.min(current, challenge.target),
      completed: checkDailyChallenge(challenge, stats.wordsLearned, stats.maxStreak, stats.perfectRounds, stats.totalTime, stats.lastSessionWords, stats.lastSessionTime)
    }
  })

  const completedCount = challenges.filter(c => c.completed).length

  return (
    <section className="max-w-md mx-auto mb-8">
      {/* 奖励弹窗 */}
      {newReward && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold">🎉 挑战完成！+{newReward.points} 积分</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">🎯 今日挑战</h2>
          <span className="text-sm text-blue-600 font-bold">{completedCount}/{challenges.length}</span>
        </div>

        {/* 进度条 */}
        <div className="bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-2 transition-all duration-1000"
            style={{ width: `${(completedCount / challenges.length) * 100}%` }}
          />
        </div>

        {/* 挑战列表 */}
        <div className="space-y-2">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                challenge.completed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50'
              }`}
            >
              <span className={`text-2xl ${challenge.completed ? 'opacity-100' : 'opacity-60'}`}>
                {challenge.completed ? '✅' : challenge.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium text-sm ${challenge.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {challenge.title}
                  </p>
                  <span className="text-xs text-gray-400">{challenge.current}/{challenge.target}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{challenge.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                challenge.completed
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                +{challenge.reward}
              </span>
            </div>
          ))}
        </div>

        {completedCount === challenges.length && (
          <div className="mt-4 text-center">
            <span className="text-lg">🎉</span>
            <p className="text-sm text-green-600 font-medium mt-1">今日挑战已全部完成！太厉害了！</p>
          </div>
        )}
      </div>
    </section>
  )
}
