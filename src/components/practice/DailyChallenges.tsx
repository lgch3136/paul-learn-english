'use client'

import { useState, useEffect } from 'react'
import { dailyChallenges, DailyChallenge, checkDailyChallenge } from '@/lib/gameification'
import { DailyStats, loadDailyStats } from '@/lib/daily-stats'

export default function DailyChallenges() {
  const [stats, setStats] = useState<DailyStats | null>(null)

  useEffect(() => {
    setStats(loadDailyStats())

    // 页面重新可见时刷新数据（从练习页返回时）
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
    }
  }, [])

  if (!stats) return null

  const challenges = dailyChallenges.map(challenge => {
    let current = 0
    switch (challenge.id) {
      case 'daily_5':
      case 'daily_10':
      case 'daily_20':
      case 'daily_speed':
        current = stats.wordsLearned; break
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
      completed: checkDailyChallenge(challenge, stats.wordsLearned, stats.maxStreak, stats.perfectRounds, stats.totalTime)
    }
  })

  const completedCount = challenges.filter(c => c.completed).length

  return (
    <section className="max-w-md mx-auto mb-8">
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
