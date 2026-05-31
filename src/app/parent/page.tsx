'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sounds } from '@/lib/sounds'
import { achievements as allAchievements } from '@/lib/gameification'
import {
  WordPerformance,
  loadPerformances,
  getPerformanceSummary,
} from '@/lib/question-scheduler'

interface ReportData {
  date: string
  totalAnswered: number
  totalCorrect: number
  accuracy: number
  masteredWords: string[]
  weakWords: { word: string; errorRate: number }[]
  totalWords: number
  points: number
  streak: number
  unlockedAchievements: string[]
}

export default function ParentPage() {
  const [report, setReport] = useState<ReportData | null>(null)

  useEffect(() => {
    const perf = loadPerformances()
    let points = 0
    let streak = 1
    let unlockedIds: string[] = []

    try {
      const pts = localStorage.getItem('paul_english_points')
      if (pts) points = parseInt(pts)
      const str = localStorage.getItem('paul_english_streak')
      if (str) streak = parseInt(str)
      const saved = localStorage.getItem('paul_english_achievements')
      if (saved) unlockedIds = JSON.parse(saved)
    } catch (e) { /* ignore */ }

    let totalAnswered = 0
    let totalCorrect = 0
    const masteredWords: string[] = []
    const weakWords: { word: string; errorRate: number }[] = []

    perf.forEach((p) => {
      const total = p.correctCount + p.wrongCount
      totalAnswered += total
      totalCorrect += p.correctCount

      const cleanWordId = p.wordId
        .replace(/^unit_\d+_\d+_/, '')
        .replace(/^g\d+(up|dn)_\d+_/, '')

      if (p.consecutiveCorrect >= 3) {
        masteredWords.push(cleanWordId)
      } else if (total > 0 && p.wrongCount > 0 && p.wrongCount / total > 0.3) {
        weakWords.push({
          word: cleanWordId,
          errorRate: Math.round((p.wrongCount / total) * 100)
        })
      }
    })

    weakWords.sort((a, b) => b.errorRate - a.errorRate)

    setReport({
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      totalAnswered,
      totalCorrect,
      accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      masteredWords,
      weakWords,
      totalWords: perf.size,
      points,
      streak,
      unlockedAchievements: unlockedIds,
    })
  }, [])

  if (!report) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </main>
    )
  }

  const suggestions: string[] = []
  if (report.weakWords.length > 0) {
    const top3 = report.weakWords.slice(0, 3).map(w => w.word).join('、')
    suggestions.push(`重点复习薄弱单词：${top3}，每天花5分钟巩固记忆`)
  }
  if (report.accuracy < 80) {
    suggestions.push('正确率偏低，建议放慢答题速度，仔细看清题目再选择')
  }
  if (report.streak >= 3) {
    suggestions.push(`已连续学习${report.streak}天，非常棒！继续保持这个节奏`)
  }
  suggestions.push('每天坚持练习10分钟，效果比一次练1小时更好')
  if (suggestions.length === 0) {
    suggestions.push('孩子表现很好，继续保持每天练习的习惯！')
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <header className="text-center mb-8">
        <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block" onClick={() => sounds.click()}>
          ← 返回首页
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">📋 学习报告</h1>
        <p className="text-gray-600">{report.date}</p>
      </header>

      {/* 总体概况 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">📊 学习概况</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{report.totalAnswered}</p>
              <p className="text-sm text-gray-600">答题总数</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{report.accuracy}%</p>
              <p className="text-sm text-gray-600">正确率</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{report.points}</p>
              <p className="text-sm text-gray-600">总积分</p>
            </div>
          </div>
        </div>
      </section>

      {/* 单词掌握情况 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">🔤 单词掌握</h2>

          {report.masteredWords.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">✅ 已掌握（{report.masteredWords.length} 个）：</p>
              <div className="flex flex-wrap gap-2">
                {report.masteredWords.slice(0, 12).map((word, i) => (
                  <span key={i} className="badge bg-green-100 text-green-800">{word}</span>
                ))}
                {report.masteredWords.length > 12 && (
                  <span className="badge bg-gray-100 text-gray-600">+{report.masteredWords.length - 12} 更多</span>
                )}
              </div>
            </div>
          )}

          {report.weakWords.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">🔄 需要复习（{report.weakWords.length} 个）：</p>
              <div className="space-y-2">
                {report.weakWords.slice(0, 8).map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <span className="badge bg-yellow-100 text-yellow-800">{w.word}</span>
                    <span className="text-xs text-red-600">错误率 {w.errorRate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.masteredWords.length === 0 && report.weakWords.length === 0 && (
            <p className="text-gray-500 text-center py-4">暂无练习数据，快去练习吧！</p>
          )}
        </div>
      </section>

      {/* 成就概览 */}
      {report.unlockedAchievements.length > 0 && (
        <section className="max-w-md mx-auto mb-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">🏆 已解锁成就</h2>
            <div className="flex flex-wrap gap-3">
              {allAchievements.filter(a => report.unlockedAchievements.includes(a.id)).map(a => (
                <div key={a.id} className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-xl block">{a.icon}</span>
                  <p className="text-xs font-medium mt-1">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 陪学建议 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="card bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <h2 className="text-lg font-semibold mb-4">👨‍👩‍👧 陪学建议</h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg shrink-0">•</span>
                <p className="opacity-95">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 薄弱单词详情 */}
      {report.weakWords.length > 0 && (
        <section className="max-w-md mx-auto mb-8">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">📝 重点关注</h2>
            <div className="bg-orange-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-orange-800 font-medium mb-2">💡 辅导建议：</p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• 让孩子用薄弱单词各造一个句子</li>
                <li>• 在日常对话中自然地使用这些单词</li>
                <li>• 每天花5分钟做错题复习</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      <footer className="text-center text-gray-500 text-sm pb-8">
        <div className="card bg-yellow-50 max-w-md mx-auto">
          <p className="text-yellow-800 font-medium">💡 温馨提示</p>
          <p className="text-yellow-700 mt-1">
            {report.streak >= 3
              ? `孩子已连续学习${report.streak}天，非常棒！坚持每天10分钟，效果更好。`
              : '每天坚持练习10分钟，效果比一次练1小时更好。加油！'}
          </p>
        </div>
      </footer>
    </main>
  )
}