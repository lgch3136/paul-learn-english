'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'
import { sounds } from '@/lib/sounds'
import { loadPerformances, getPerformanceSummary } from '@/lib/question-scheduler'

export default function LessonPage() {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [streak, setStreak] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('paul_english_streak')
      const lastDate = localStorage.getItem('paul_english_last_study_date')
      const today = new Date().toISOString().split('T')[0]

      if (lastDate === today) {
        // 今天已经学过了，显示当前 streak
        if (saved) setStreak(parseInt(saved))
      } else if (lastDate) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        if (lastDate === yesterday) {
          // 连续学习，streak + 1
          const newStreak = parseInt(saved || '0') + 1
          setStreak(newStreak)
          localStorage.setItem('paul_english_streak', newStreak.toString())
        } else {
          // 断了一天，重置 streak
          setStreak(0)
          localStorage.setItem('paul_english_streak', '0')
        }
        localStorage.setItem('paul_english_last_study_date', today)
      } else {
        // 新用户，streak = 0
        setStreak(0)
      }

      // 加载学习统计
      const perf = loadPerformances()
      const summary = getPerformanceSummary(perf)
      setTotalWords(summary.mastered + summary.learning + summary.struggling)
      let answered = 0
      perf.forEach(p => { answered += p.correctCount + p.wrongCount })
      setTotalAnswered(answered)
    } catch (e) { /* ignore */ }
  }, [])

  // 一键开始练习
  const handleStartPractice = async () => {
    sounds.click()
    setIsStarting(true)

    // 跳转到单词练习
    setTimeout(() => {
      router.push('/practice/vocabulary')
    }, 300)
  }

  // 快速入口
  const quickLinks = [
    { icon: '🔤', title: '单词闯关', desc: '记忆单词', href: '/practice/vocabulary' },
    { icon: '📝', title: '语法小练', desc: '攻克语法', href: '/practice/grammar' },
    { icon: '🔄', title: '错题复习', desc: '巩固薄弱', href: '/practice/review' },
    { icon: '📊', title: '我的进步', desc: '查看成就', href: '/progress' },
  ]

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* 头部 */}
      <header className="text-center mb-8 pt-8">
        <BackButton href="/" label="返回首页" />
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          📚 今日练习
        </h1>
        <p className="text-gray-600 text-lg">译林版小学英语</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          {streak > 0 && (
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              🔥 连续 {streak} 天
            </span>
          )}
          {totalWords > 0 && (
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              📚 已学 {totalWords} 词
            </span>
          )}
        </div>
      </header>

      {/* 一键开始 - 主要按钮 */}
      <section className="max-w-md mx-auto mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-lg opacity-90 mb-2">预计 10 分钟</p>
            <p className="text-5xl font-bold mb-4 animate-float">10 min</p>
            <button
              onClick={handleStartPractice}
              disabled={isStarting}
              className="w-full bg-white text-blue-600 font-bold py-5 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isStarting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> 启动中...
                </span>
              ) : (
                '🚀 一键开始练习'
              )}
            </button>
            <p className="text-sm opacity-75 mt-3">快速进入单词闯关练习</p>
          </div>
        </div>
      </section>

      {/* 快速入口 */}
      <section className="max-w-md mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">或者单独练习</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="card hover:scale-105 transition-all duration-300 hover:shadow-lg group"
              onClick={() => sounds.click()}
            >
              <div className="text-center">
                <span className="text-3xl mb-2 block group-hover:animate-bounce">{link.icon}</span>
                <h3 className="font-semibold text-gray-800">{link.title}</h3>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 学习提示 */}
      <section className="max-w-md mx-auto mb-8">
        <div className="card bg-yellow-50 border-2 border-yellow-200">
          <div className="text-center">
            <span className="text-2xl mb-2 block">💡</span>
            <h3 className="font-semibold text-yellow-800 mb-2">学习小贴士</h3>
            <p className="text-sm text-yellow-700">
              每天坚持练习 10 分钟，连续 7 天解锁"勤奋好学"成就！
            </p>
          </div>
        </div>
      </section>

      {/* 今日成就预览 */}
      <section className="max-w-md mx-auto mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">🏆 今日目标</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📖</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">每日十词</p>
                <p className="text-sm text-gray-600">学会 10 个新单词</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">+50 积分</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔥</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">连击挑战</p>
                <p className="text-sm text-gray-600">连续答对 5 题</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+30 积分</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">完美主义者</p>
                <p className="text-sm text-gray-600">一轮练习全部答对</p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">+80 积分</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm pb-8">
        <p>每天进步一点点，积少成多！</p>
      </footer>
    </main>
  )
}