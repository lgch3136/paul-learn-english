'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'
import Skeleton, { WordCardSkeleton } from '@/components/ui/Skeleton'
import { updateDailyStats } from '@/lib/daily-stats'
import { recordAnswer, checkNewAchievements, saveAchievement } from '@/lib/achievement-tracker'
import { sounds } from '@/lib/sounds'
import { createConfetti, addConfettiStyle, vibrate } from '@/lib/animations'
import {
  WordPerformance,
  initializePerformance,
  loadPerformances,
  updatePerformance,
  savePerformances,
  getPerformanceSummary,
} from '@/lib/question-scheduler'
import AchievementPopup from '@/components/gameification/AchievementPopup'
import PointsReward from '@/components/gameification/PointsReward'
import WordCard from '@/components/practice/WordCard'
import OptionGrid from '@/components/practice/OptionGrid'
import ResultCard from '@/components/practice/ResultCard'
import {
  Achievement,
  PlayerStats,
  checkAchievements,
  getRandomEncouragement,
  getCurrentLevel,
  getLevelProgress,
} from '@/lib/gameification'

interface VocabWord {
  word_id: string
  word: string
  meaning: string
  phonetic: string
  sentence?: string
  phrase?: string[]
  error_tags?: string[]
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateOptions(correctMeaning: string, allMeanings: string[]): string[] {
  const options = [correctMeaning]
  const others = allMeanings.filter(m => m !== correctMeaning)
  while (options.length < 4 && others.length > 0) {
    const idx = Math.floor(Math.random() * others.length)
    options.push(others[idx])
    others.splice(idx, 1)
  }
  return options.sort(() => Math.random() - 0.5)
}

export default function ReviewPractice() {
  const [allWords, setAllWords] = useState<VocabWord[]>([])
  const [reviewWords, setReviewWords] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [encouragement, setEncouragement] = useState('')
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [pointsReward, setPointsReward] = useState<{ points: number; message: string; icon: string } | null>(null)
  const [points, setPoints] = useState(0)
  const [stats, setStats] = useState<PlayerStats>({
    totalWords: 0, correctAnswers: 0, wrongAnswers: 0,
    streak: 0, maxStreak: 0, totalTime: 0, daysStudied: 1, perfectRounds: 0,
  })
  const [performances, setPerformances] = useState<Map<string, WordPerformance>>(new Map())
  const [cardTransition, setCardTransition] = useState(false)
  const pendingAchievementRef = useRef<Achievement | null>(null)
  const achievementQueueRef = useRef<Achievement[]>([])
  const showingAchievementRef = useRef(false)

  // 成就队列处理
  const showNextAchievement = useCallback(() => {
    if (achievementQueueRef.current.length > 0) {
      const next = achievementQueueRef.current.shift()!
      showingAchievementRef.current = true
      pendingAchievementRef.current = next
      setUnlockedAchievement(next)
    } else {
      showingAchievementRef.current = false
      pendingAchievementRef.current = null
      setUnlockedAchievement(null)
    }
  }, [])

  const handleAchievementClose = useCallback(() => {
    const pending = pendingAchievementRef.current
    if (pending) {
      pendingAchievementRef.current = null
      saveAchievement(pending)
    }
    setTimeout(() => showNextAchievement(), 300)
  }, [showNextAchievement])

  // 持久化积分
  useEffect(() => {
    if (points > 0) {
      try { localStorage.setItem('paul_english_points', points.toString()) } catch (e) {}
    }
  }, [points])

  useEffect(() => {
    addConfettiStyle()
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const perf = loadPerformances()
      setPerformances(perf)

      try {
        const pts = localStorage.getItem('paul_english_points')
        if (pts) setPoints(parseInt(pts))
      } catch (e) {}

      const response = await fetch('/api/vocabulary?unit=all')
      const data = await response.json()
      if (data.success && data.vocabulary) {
        setAllWords(data.vocabulary)
        const wrongWords = data.vocabulary.filter((w: VocabWord) => {
          const p = perf.get(w.word_id)
          if (!p) return false
          return p.consecutiveWrong >= 1 || (p.wrongCount > 0 && p.wrongCount / (p.correctCount + p.wrongCount) > 0.3)
        })
        setReviewWords(shuffleArray(wrongWords))
      }
    } catch (e) {
      console.error('加载数据失败:', e)
    } finally {
      setLoading(false)
    }
  }

  const currentWord = reviewWords[currentIndex]
  const isCorrect = currentWord ? selectedAnswer === currentWord.meaning : false

  // 检查成就（使用共享模块 + 队列）
  const checkForAchievements = (sessionMaxStreak: number) => {
    const { newAchievements, totalPoints } = checkNewAchievements(sessionMaxStreak)
    if (newAchievements.length > 0) {
      setPoints(totalPoints)
      const existingIds = new Set(achievementQueueRef.current.map(a => a.id))
      if (unlockedAchievement) existingIds.add(unlockedAchievement.id)
      const toEnqueue = newAchievements.filter(a => !existingIds.has(a.id))
      achievementQueueRef.current.push(...toEnqueue)
      if (!showingAchievementRef.current) {
        showingAchievementRef.current = true
        const first = achievementQueueRef.current.shift()!
        pendingAchievementRef.current = first
        setUnlockedAchievement(first)
      }
    }
  }

  const startReview = () => {
    if (reviewWords.length === 0) return
    setStarted(true)
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setFinished(false)
    const allMeanings = allWords.map(v => v.meaning)
    setCurrentOptions(generateOptions(reviewWords[0].meaning, allMeanings))
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult || !currentWord) return
    sounds.click()
    vibrate(30)
    setSelectedAnswer(answer)
    setShowResult(true)

    const correct = answer === currentWord.meaning
    const wordId = currentWord.word_id
    console.log('[成就系统-错题复习] handleAnswerSelect → wordId:', wordId, 'correct:', correct)

    // 通过共享模块记录
    recordAnswer(wordId, correct)

    // 同时更新本地 Map
    const currentPerf = performances.get(wordId) || initializePerformance(wordId)
    const updated = updatePerformance(currentPerf, correct)
    const newPerfs = new Map(performances)
    newPerfs.set(wordId, updated)
    setPerformances(newPerfs)

    if (correct) {
      const newStreak = streak + 1
      const earnedPoints = 10 + (newStreak >= 3 ? 5 : 0)
      setScore(score + 1)
      setStreak(newStreak)
      setPoints(points + earnedPoints)
      setEncouragement(getRandomEncouragement('correct'))
      sounds.correct()
      vibrate(100)

      updateDailyStats({ wordsLearned: 1, maxStreak: newStreak })

      const newStats: PlayerStats = {
        ...stats,
        totalWords: stats.totalWords + 1,
        correctAnswers: stats.correctAnswers + 1,
        streak: newStreak,
        maxStreak: Math.max(stats.maxStreak, newStreak),
      }
      setStats(newStats)
      checkForAchievements(newStreak)
    } else {
      setStreak(0)
      setEncouragement(getRandomEncouragement('wrong'))
      sounds.wrong()
      vibrate(200)

      setStats(prev => ({ ...prev, wrongAnswers: prev.wrongAnswers + 1, streak: 0 }))
    }
  }

  const handleNext = () => {
    if (currentIndex < reviewWords.length - 1) {
      setCardTransition(true)
      setTimeout(() => {
        const nextIdx = currentIndex + 1
        setCurrentIndex(nextIdx)
        setSelectedAnswer(null)
        setShowResult(false)
        setEncouragement('')
        const allMeanings = allWords.map(v => v.meaning)
        setCurrentOptions(generateOptions(reviewWords[nextIdx].meaning, allMeanings))
        setCardTransition(false)
      }, 250)
    } else {
      setFinished(true)
      if (score >= reviewWords.length * 0.7) {
        sounds.complete()
      }
    }
  }

  const currentLevel = getCurrentLevel(points)
  const levelProgress = getLevelProgress(points)

  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Skeleton variant="rect" className="h-8 w-48 mx-auto mb-3" />
            <Skeleton variant="text" className="w-64 mx-auto" />
          </div>
          <WordCardSkeleton />
        </div>
      </main>
    )
  }

  if (reviewWords.length === 0) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <BackButton href="/" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🔄 错题复习</h1>
        </header>
        <section className="max-w-md mx-auto">
          <div className="card text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h2 className="text-xl font-bold text-gray-800 mb-4">太棒了！没有错题！</h2>
            <p className="text-gray-600 mb-6">你之前做的练习都答对了，继续保持！</p>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800">✅ 继续练习新单词，巩固你的词汇量！</p>
            </div>
            <Link href="/practice/vocabulary" className="btn-primary inline-block">去练习新单词 →</Link>
          </div>
        </section>
      </main>
    )
  }

  if (!started) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <BackButton href="/" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🔄 错题复习</h1>
          <p className="text-gray-600">专练你做错过的单词</p>
        </header>
        <section className="max-w-md mx-auto">
          <div className="card text-center">
            <span className="text-6xl mb-4 block">📖</span>
            <h2 className="text-xl font-bold text-gray-800 mb-2">找到 {reviewWords.length} 个错词</h2>
            <p className="text-gray-600 mb-6">系统已筛选出你之前做错的单词，现在来重新练习吧！</p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">💡 重新答对后，系统会自动更新你的掌握情况</p>
            </div>
            <button onClick={startReview} className="btn-primary text-lg px-8 py-4">开始复习 🚀</button>
          </div>
        </section>
      </main>
    )
  }

  if (finished) {
    const percentage = Math.round((score / reviewWords.length) * 100)
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🔄 错题复习完成</h1>
        </header>
        <section className="max-w-md mx-auto">
          <div className="card text-center animate-bounce-in">
            <span className="text-6xl mb-4 block">{percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">复习完成！</h2>
            <div className="my-6">
              <p className="text-gray-600">答对 <span className="font-bold text-green-600 text-2xl">{score}</span> / {reviewWords.length} 题</p>
              <p className="text-gray-600 mt-1">正确率 <span className="font-bold text-blue-600 text-xl">{percentage}%</span></p>
              <p className="text-gray-600 mt-1">获得积分 <span className="font-bold text-purple-600 text-xl">{points}</span></p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800">✅ 答对的错词已更新掌握记录，下次不会再出现了！</p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl text-center hover:bg-gray-200">返回首页</Link>
              <button onClick={startReview} className="flex-1 btn-primary py-4">再练一次</button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* 成就弹窗 */}
      {unlockedAchievement && (
        <AchievementPopup achievement={unlockedAchievement} onClose={handleAchievementClose} />
      )}
      {pointsReward && (
        <PointsReward points={pointsReward.points} message={pointsReward.message} icon={pointsReward.icon} onComplete={() => setPointsReward(null)} />
      )}

      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => setStarted(false)} className="text-blue-500 hover:text-blue-600">← 返回</button>
          <BackButton href="/" label="首页" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🔄 错题复习</h1>
        <p className="text-gray-600">纠正薄弱环节</p>
      </header>

      {/* 积分和等级 */}
      <div className="max-w-md mx-auto mb-4">
        <div className="card py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentLevel.icon}</span>
            <div className="flex-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Lv.{currentLevel.level}</span>
                <span className="text-blue-600">{points} 积分</span>
              </div>
              <div className="progress-bar h-1.5 mt-1">
                <div className="progress-fill" style={{ width: `${levelProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 进度 */}
      <section className="max-w-md mx-auto mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>进度</span>
          <span>{currentIndex + 1} / {reviewWords.length}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }} />
        </div>
      </section>

      {/* 得分和连击 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-3">
            <p className="text-xs text-gray-600">得分</p>
            <p className="text-2xl font-bold text-blue-600">{score}</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xs text-gray-600">连击</p>
            <p className={`text-2xl font-bold ${streak >= 3 ? 'text-orange-500 animate-pulse' : 'text-green-600'}`}>
              {streak > 0 ? `×${streak}` : '-'}
            </p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xs text-gray-600">积分</p>
            <p className="text-2xl font-bold text-purple-600">{points}</p>
          </div>
        </div>
      </section>

      {encouragement && showResult && (
        <div className="max-w-md mx-auto mb-4 text-center animate-bounce-in">
          <span className="text-lg font-bold text-gray-700">{encouragement}</span>
        </div>
      )}

      {/* 单词卡片 + 选项 + 结果 */}
      <section className={`max-w-md mx-auto mb-8 transition-all duration-250 ${
        cardTransition ? 'opacity-0 translate-y-2 scale-[0.98]' : 'opacity-100 translate-y-0 scale-100'
      }`}>
        <WordCard
          word={currentWord?.word || ''}
          phonetic={currentWord?.phonetic}
          isCorrect={showResult ? isCorrect : null}
          className="mb-6"
        />

        <p className="text-center text-gray-700 mb-4 font-medium text-lg">选出正确的中文意思：</p>

        <OptionGrid
          options={currentOptions}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentWord?.meaning || ''}
          showResult={showResult}
          onSelect={handleAnswerSelect}
        />

        {showResult && (
          <div className="mt-6">
            <ResultCard
              isCorrect={isCorrect}
              correctMeaning={currentWord?.meaning || ''}
              phrase={currentWord?.phrase}
              errorTags={currentWord?.error_tags}
              onNext={handleNext}
              isLast={currentIndex >= reviewWords.length - 1}
            />
          </div>
        )}
      </section>

      <footer className="text-center text-gray-500 text-sm pb-8">
        <p>错题复习帮你巩固薄弱环节</p>
      </footer>
    </main>
  )
}
