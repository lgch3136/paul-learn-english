'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sounds } from '@/lib/sounds'
import {
  achievements as allAchievements,
  Achievement,
  getCurrentLevel,
  getLevelProgress,
  getNextLevel,
} from '@/lib/gameification'
import {
  WordPerformance,
  loadPerformances,
  getPerformanceSummary,
} from '@/lib/question-scheduler'

export default function ProgressPage() {
  const [performances, setPerformances] = useState<Map<string, WordPerformance>>(new Map())
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [points, setPoints] = useState(0)
  const [streak, setStreak] = useState(1)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const perf = loadPerformances()
    setPerformances(perf)

    try {
      const saved = localStorage.getItem('paul_english_achievements')
      if (saved) setUnlockedIds(JSON.parse(saved))
      const pts = localStorage.getItem('paul_english_points')
      if (pts) setPoints(parseInt(pts))
      const str = localStorage.getItem('paul_english_streak')
      if (str) setStreak(parseInt(str))
    } catch (e) { /* ignore */ }

    setReady(true)
  }, [])

  const summary = getPerformanceSummary(performances)
  const currentLevel = getCurrentLevel(points)
  const levelProgress = getLevelProgress(points)
  const nextLevel = getNextLevel(points)

  // 统计错词
  const weakWords: { word: string; errorRate: number }[] = []
  performances.forEach((perf) => {
    const total = perf.correctCount + perf.wrongCount
    if (total > 0 && perf.wrongCount > 0 && perf.wrongCount / total > 0.3) {
      weakWords.push({ word: perf.wordId, errorRate: Math.round((perf.wrongCount / total) * 100) })
    }
  })
  weakWords.sort((a, b) => b.errorRate - a.errorRate)

  // 统计总题数和正确率
  let totalAnswered = 0
  let totalCorrect = 0
  performances.forEach(p => {
    totalAnswered += p.correctCount + p.wrongCount
    totalCorrect += p.correctCount
  })
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  if (!ready) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <header className="text-center mb-8">
        <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block" onClick={() => sounds.click()}>
          ← 返回首页
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">📊 我的进步</h1>
      </header>

      {/* 连续学习 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="card bg-gradient-to-r from-orange-400 to-red-500 text-white">
          <div className="text-center">
            <span className="text-5xl">🔥</span>
            <h2 className="text-2xl font-bold mt-2">连续学习 {streak} 天</h2>
            <p className="opacity-90 mt-1">坚持就是胜利！</p>
          </div>
        </div>
      </section>

      {/* 等级和积分 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{currentLevel.icon}</span>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg">Lv.{currentLevel.level} {currentLevel.title}</span>
                <span className="text-blue-600 font-semibold">{points} 积分</span>
              </div>
              <div className="progress-bar h-3">
                <div className="progress-fill" style={{ width: `${levelProgress}%` }}></div>
              </div>
              {nextLevel && (
                <p className="text-xs text-gray-500 mt-1 text-right">距离下一等级还需 {nextLevel.minPoints - points} 积分</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 学习统计 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">📈 学习统计</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{totalAnswered}</p>
              <p className="text-sm text-gray-600">总答题数</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-sm text-gray-600">正确率</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-green-600">{summary.mastered}</p>
              <p className="text-xs text-gray-600">已掌握</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{summary.learning}</p>
              <p className="text-xs text-gray-600">学习中</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{summary.struggling}</p>
              <p className="text-xs text-gray-600">需加强</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-600">{summary.unseen}</p>
              <p className="text-xs text-gray-600">未学习</p>
            </div>
          </div>
        </div>
      </section>

      {/* 薄弱单词 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">⚠️ 薄弱单词</h2>
          {weakWords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无薄弱单词，继续保持！</p>
          ) : (
            <div className="space-y-2">
              {weakWords.slice(0, 10).map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{w.word}</span>
                  <span className="text-sm text-red-600">错误率 {w.errorRate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 成就系统 */}
      <section className="max-w-md mx-auto mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🏆 我的成就</h2>
            <Link href="/achievements" className="text-blue-500 text-sm" onClick={() => sounds.click()}>查看全部 →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allAchievements.slice(0, 6).map((a) => {
              const unlocked = unlockedIds.includes(a.id)
              return (
                <div key={a.id} className={`text-center p-3 rounded-lg ${
                  unlocked ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-100 opacity-50'
                }`}>
                  <span className="text-2xl block mb-1">{unlocked ? a.icon : '🔒'}</span>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm pb-8">
        <p>继续努力，解锁更多成就！</p>
      </footer>
    </main>
  )
}