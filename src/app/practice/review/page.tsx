'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sounds } from '@/lib/sounds'
import { createConfetti, addConfettiStyle, vibrate } from '@/lib/animations'
import {
  WordPerformance,
  loadPerformances,
  updatePerformance,
  savePerformances,
} from '@/lib/question-scheduler'
import AchievementPopup from '@/components/gameification/AchievementPopup'
import PointsReward from '@/components/gameification/PointsReward'
import { Achievement, getRandomEncouragement } from '@/lib/gameification'

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
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [encouragement, setEncouragement] = useState('')
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [pointsReward, setPointsReward] = useState<{ points: number; message: string; icon: string } | null>(null)
  const [points, setPoints] = useState(0)
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([])
  const [performances, setPerformances] = useState<Map<string, WordPerformance>>(new Map())

  useEffect(() => {
    addConfettiStyle()
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const perf = loadPerformances()
      setPerformances(perf)

      try {
        const saved = localStorage.getItem('paul_english_achievements')
        if (saved) setUnlockedAchievementIds(JSON.parse(saved))
        const pts = localStorage.getItem('paul_english_points')
        if (pts) setPoints(parseInt(pts))
      } catch (e) { /* ignore */ }

      // Load all vocabulary across all units
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

  const startReview = () => {
    if (reviewWords.length === 0) return
    setStarted(true)
    setCurrentIndex(0)
    setScore(0)
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
    const perf = performances.get(wordId)
    if (perf) {
      const updated = updatePerformance(perf, correct)
      const newPerfs = new Map(performances)
      newPerfs.set(wordId, updated)
      setPerformances(newPerfs)
      savePerformances(newPerfs)
    }

    if (correct) {
      setScore(score + 1)
      sounds.correct()
      setEncouragement(getRandomEncouragement('correct'))
    } else {
      sounds.wrong()
      setEncouragement(getRandomEncouragement('wrong'))
    }
  }

  const handleNext = () => {
    if (currentIndex < reviewWords.length - 1) {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      setSelectedAnswer(null)
      setShowResult(false)
      setEncouragement('')
      const allMeanings = allWords.map(v => v.meaning)
      setCurrentOptions(generateOptions(reviewWords[nextIdx].meaning, allMeanings))
    } else {
      setFinished(true)
      if (score >= reviewWords.length * 0.7) {
        sounds.complete()
      }
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在分析错题...</p>
        </div>
      </main>
    )
  }

  if (reviewWords.length === 0) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🔄 错题复习
          </h1>
        </header>
        <section className="max-w-md mx-auto">
          <div className="card text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h2 className="text-xl font-bold text-gray-800 mb-4">太棒了！没有错题！</h2>
            <p className="text-gray-600 mb-6">
              你之前做的练习都答对了，继续保持！
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800">
                ✅ 继续练习新单词，巩固你的词汇量！
              </p>
            </div>
            <Link href="/practice/vocabulary" className="btn-primary inline-block">
              去练习新单词 →
            </Link>
          </div>
        </section>
      </main>
    )
  }

  if (!started) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🔄 错题复习
          </h1>
          <p className="text-gray-600">专练你做错过的单词</p>
        </header>
        <section className="max-w-md mx-auto">
          <div className="card text-center">
            <span className="text-6xl mb-4 block">📖</span>
            <h2 className="text-xl font-bold text-gray-800 mb-2">找到 {reviewWords.length} 个错词</h2>
            <p className="text-gray-600 mb-6">
              系统已筛选出你之前做错的单词，现在来重新练习吧！
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 重新答对后，系统会自动更新你的掌握情况
              </p>
            </div>
            <button onClick={startReview} className="btn-primary text-lg px-8 py-4">
              开始复习 🚀
            </button>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🔄 错题复习完成
          </h1>
        </header>
        <section className="max-w-md mx-auto">
          <div className="card text-center animate-bounce-in">
            <span className="text-6xl mb-4 block">
              {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">复习完成！</h2>
            <div className="my-6">
              <p className="text-gray-600">
                答对 <span className="font-bold text-green-600 text-2xl">{score}</span> / {reviewWords.length} 题
              </p>
              <p className="text-gray-600 mt-1">
                正确率 <span className="font-bold text-blue-600 text-xl">{percentage}%</span>
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800">
                ✅ 答对的错词已更新掌握记录，下次不会再出现了！
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl text-center hover:bg-gray-200">
                返回首页
              </Link>
              <button onClick={startReview} className="flex-1 btn-primary py-4">
                再练一次
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {unlockedAchievement && (
        <AchievementPopup achievement={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />
      )}
      {pointsReward && (
        <PointsReward points={pointsReward.points} message={pointsReward.message} icon={pointsReward.icon} onComplete={() => setPointsReward(null)} />
      )}

      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => setStarted(false)} className="text-blue-500 hover:text-blue-600">
            ← 返回
          </button>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            首页
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🔄 错题复习</h1>
        <p className="text-gray-600">纠正薄弱环节</p>
      </header>

      <section className="max-w-md mx-auto mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>进度</span>
          <span>{currentIndex + 1} / {reviewWords.length}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}></div>
        </div>
      </section>

      {encouragement && showResult && (
        <div className="max-w-md mx-auto mb-4 text-center animate-bounce-in">
          <span className="text-lg font-bold text-gray-700">{encouragement}</span>
        </div>
      )}

      <section className="max-w-md mx-auto mb-8">
        <div className={`card transition-all duration-500 ${
          showResult
            ? isCorrect
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 animate-pulse-once'
              : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 animate-shake'
            : ''
        }`}>
          <div className="text-center mb-6">
            <h2 className="text-5xl font-bold text-gray-800 mb-2">{currentWord?.word || ''}</h2>
            <p className="text-lg text-gray-500">{currentWord?.phonetic || ''}</p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

          <p className="text-center text-gray-700 mb-4 font-medium text-lg">选出正确的中文意思：</p>

          <div className="grid grid-cols-2 gap-3">
            {currentOptions.map((option, index) => {
              const grads = ['from-blue-400 to-blue-500', 'from-purple-400 to-purple-500', 'from-green-400 to-green-500', 'from-orange-400 to-orange-500']
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`relative overflow-hidden p-4 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    showResult
                      ? option === currentWord?.meaning
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-105'
                        : option === selectedAnswer
                        ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                      : `bg-gradient-to-br ${grads[index]} text-white shadow-md hover:shadow-xl`
                  }`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                  <span className="relative">{option}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {showResult && (
        <section className="max-w-md mx-auto mb-8 animate-bounce-in">
          <div className={`relative overflow-hidden rounded-2xl shadow-xl ${
            isCorrect
              ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-br from-orange-400 via-red-400 to-pink-500'
          }`}>
            <div className="relative p-6 text-white text-center">
              <span className="text-5xl mb-3 block">{isCorrect ? '🎉' : '💪'}</span>
              <h3 className="text-2xl font-bold mb-2">{isCorrect ? '这次记住了！' : '再想想！'}</h3>
              <p className="opacity-90 text-lg mb-4">
                {isCorrect ? '错词已纠正，继续保持！' : `正确答案是：${currentWord?.meaning || ''}`}
              </p>
              <button onClick={handleNext} className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                {currentIndex < reviewWords.length - 1 ? '下一题 →' : '完成复习 🎊'}
              </button>
            </div>
          </div>
        </section>
      )}

      <footer className="text-center text-gray-500 text-sm pb-8">
        <p>错题复习帮你巩固薄弱环节</p>
      </footer>
    </main>
  )
}
