'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sounds } from '@/lib/sounds'
import { achievements, Achievement, getCurrentLevel, getLevelProgress, titles } from '@/lib/gameification'
import { loadPerformances, getPerformanceSummary } from '@/lib/question-scheduler'

export default function AchievementsPage() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null)

  useEffect(() => {
    // 从本地存储加载已解锁的成就
    const saved = localStorage.getItem('paul_english_achievements')
    if (saved) {
      setUnlockedAchievements(JSON.parse(saved))
    }
    const points = localStorage.getItem('paul_english_points')
    if (points) {
      setTotalPoints(parseInt(points))
    }
  }, [])

  const currentLevel = getCurrentLevel(totalPoints)
  const levelProgress = getLevelProgress(totalPoints)

  // 成就分类
  const categories = [
    { id: 'all', name: '全部', icon: '🏆' },
    { id: 'vocabulary', name: '词汇', icon: '📚' },
    { id: 'streak', name: '连击', icon: '🔥' },
    { id: 'perfect', name: '完美', icon: '⭐' },
    { id: 'speed', name: '速度', icon: '⚡' },
    { id: 'persistence', name: '坚持', icon: '💪' },
    { id: 'special', name: '特殊', icon: '✨' },
  ]

  // 过滤成就
  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.id.startsWith(selectedCategory) || 
        (selectedCategory === 'vocabulary' && a.id.includes('word')) ||
        (selectedCategory === 'streak' && a.id.includes('streak')) ||
        (selectedCategory === 'perfect' && a.id.includes('perfect')) ||
        (selectedCategory === 'speed' && a.id.includes('speed')) ||
        (selectedCategory === 'persistence' && (a.id.includes('persistent') || a.id.includes('dedicated') || a.id.includes('unstoppable'))) ||
        (selectedCategory === 'special' && !['word', 'streak', 'perfect', 'speed', 'persistent', 'dedicated', 'unstoppable'].some(p => a.id.includes(p)))
      )

  const isUnlocked = (id: string) => unlockedAchievements.includes(id)
  const unlockedCount = unlockedAchievements.length
  const totalCount = achievements.length
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100)

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* 头部 */}
      <header className="text-center mb-8">
        <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
          ← 返回首页
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-3">
          🏆 成就殿堂
        </h1>
        <p className="text-gray-600 text-lg">收集成就，成为英语达人！</p>
      </header>

      {/* 等级和进度 */}
      <section className="max-w-2xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 shadow-2xl">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

          <div className="relative p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-4xl">{currentLevel.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Lv.{currentLevel.level} {currentLevel.title}</h2>
                <p className="opacity-90">{totalPoints} 积分</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full h-3 transition-all duration-1000"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <p className="text-sm opacity-75 text-right">{levelProgress}%</p>
          </div>
        </div>
      </section>

      {/* 成就进度 */}
      <section className="max-w-2xl mx-auto mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📊 成就进度</h2>
            <span className="text-blue-600 font-bold">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-4 transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">{completionPercentage}% 已完成</p>
        </div>
      </section>

      {/* 分类选择 */}
      <section className="max-w-2xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.click()
                setSelectedCategory(cat.id)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 成就列表 */}
      <section className="max-w-2xl mx-auto mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement, index) => {
            const unlocked = isUnlocked(achievement.id)
            return (
              <div
                key={achievement.id}
                className={`relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                  unlocked
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-lg'
                    : 'bg-gray-100 border-2 border-gray-200 opacity-75'
                }`}
                onMouseEnter={() => {
                  if (unlocked) {
                    sounds.correct()
                  }
                }}
              >
                {/* 解锁标记 */}
                {unlocked && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">✓</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      unlocked
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                        : 'bg-gray-300'
                    }`}>
                      {unlocked ? achievement.icon : '🔒'}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-1 ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-2 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          unlocked
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          +{achievement.reward} 积分
                        </span>
                        {unlocked && (
                          <span className="text-xs text-green-600 font-medium">已获得</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 称号展示 */}
      <section className="max-w-2xl mx-auto mb-8">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">👑 我的称号</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {titles.map((title) => {
              const isAvailable = unlockedAchievements.some(id => 
                id.includes(title.id) || 
                (title.id === 'newbie') ||
                (title.id === 'first_word' && unlockedAchievements.includes('first_word'))
              )
              return (
                <div
                  key={title.id}
                  className={`p-3 rounded-xl text-center transition-all duration-300 ${
                    isAvailable
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300'
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{title.icon}</span>
                  <p className={`text-sm font-bold ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                    {title.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 激励语 */}
      <section className="max-w-2xl mx-auto mb-8">
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-center">
            <span className="text-4xl mb-3 block">🌟</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">继续加油！</h3>
            <p className="text-gray-600">
              {completionPercentage < 30
                ? '你才刚刚开始，还有很多成就等着你！'
                : completionPercentage < 60
                ? '已经很不错了，继续努力收集更多成就！'
                : completionPercentage < 90
                ? '太厉害了！你已经是成就收集大师！'
                : '哇！你快要收集完所有成就了，冲刺吧！'}
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm pb-8">
        <p>成就系统让你的学习更有动力！</p>
      </footer>
    </main>
  )
}
