'use client'

import { useState, useEffect, useRef } from 'react'
import { sounds } from '@/lib/sounds'
import { createConfetti } from '@/lib/animations'
import SpeedMultiplier from './SpeedMultiplier'

interface Word {
  word: string
  meaning: string
  phonetic: string
}

interface SpeedModeProps {
  words: Word[]
  onComplete: (score: number, totalWords: number) => void
  onBack: () => void
}

export default function SpeedMode({ words, onComplete, onBack }: SpeedModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(6)
  const [isActive, setIsActive] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [streak, setStreak] = useState(0)
  const [showMultiplier, setShowMultiplier] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentWord = words[currentIndex]

  useEffect(() => {
    if (currentWord && words.length > 0) {
      const allMeanings = words.map(w => w.meaning)
      const correctMeaning = currentWord.meaning
      const otherMeanings = allMeanings.filter(m => m !== correctMeaning)
      const newOptions = [correctMeaning]
      while (newOptions.length < 4 && otherMeanings.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherMeanings.length)
        newOptions.push(otherMeanings[randomIndex])
        otherMeanings.splice(randomIndex, 1)
      }
      setOptions(newOptions.sort(() => Math.random() - 0.5))
    }
  }, [currentIndex, currentWord, words])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      handleTimeUp()
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isActive, timeLeft])

  const startGame = () => {
    if (words.length === 0) return
    setIsActive(true)
    setScore(0)
    setStreak(0)
    setCurrentIndex(0)
    setGameOver(false)
    setTimeLeft(6)
    setShowResult(false)
    setSelectedAnswer(null)
    setShowMultiplier(false)
    setWrongFlash(false)
  }

  const handleTimeUp = () => {
    setShowResult(true)
    setSelectedAnswer(null)
    setStreak(0)
    sounds.wrong()
    setWrongFlash(true)

    setTimeout(() => {
      setWrongFlash(false)
      moveToNext()
    }, 1800)
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult || !isActive || !currentWord) return
    setSelectedAnswer(answer)
    setShowResult(true)
    setIsActive(false)

    if (answer === currentWord.meaning) {
      const newStreak = streak + 1
      setScore(score + 1)
      setStreak(newStreak)
      sounds.correct()

      if (newStreak >= 2) {
        setShowMultiplier(true)
      }

      setTimeout(() => {
        setShowMultiplier(false)
        moveToNext()
      }, 1400)
    } else {
      setStreak(0)
      sounds.wrong()
      setWrongFlash(true)

      setTimeout(() => {
        setWrongFlash(false)
        moveToNext()
      }, 2000)
    }
  }

  const moveToNext = () => {
    if (words.length === 0) return
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowResult(false)
      setSelectedAnswer(null)
      setTimeLeft(6)
      setIsActive(true)
    } else {
      setGameOver(true)
      setIsActive(false)
      if (score >= words.length * 0.7) {
        sounds.complete()
        if (containerRef.current) createConfetti(containerRef.current, 50)
      }
    }
  }

  if (gameOver) {
    const percentage = Math.round((score / words.length) * 100)
    const grade = percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D'
    return (
      <div ref={containerRef} className="max-w-md mx-auto text-center">
        <div className="card animate-bounce-in">
          <span className="text-6xl mb-4 block">{percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">挑战完成！</h2>
          <div className="my-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">{grade}</div>
            <p className="text-gray-600">答对 <span className="font-bold text-green-600">{score}</span> / {words.length} 题</p>
            <p className="text-gray-600">正确率 <span className="font-bold">{percentage}%</span></p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onBack} className="btn-primary">返回</button>
            <button onClick={startGame} className="btn-success">再来一次</button>
          </div>
        </div>
      </div>
    )
  }

  if (!isActive && !showResult) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card">
          <span className="text-5xl mb-4 block">⚡</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">闪电速度模式</h2>
          <p className="text-gray-600 mb-6">每题限时 6 秒，快速选出正确答案！</p>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-orange-800 font-medium">🔥 连续答对触发倍数加成！</p>
            <p className="text-xs text-orange-600 mt-1">×2 ×3 ×4... 越连越多越刺激！</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">⚠️ 时间紧迫，考验你的反应速度！</p>
          </div>
          <button onClick={startGame} className="btn-primary text-lg px-8 py-4">开始挑战 🚀</button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="max-w-md mx-auto relative">
      {/* 倍数连击特效 */}
      <SpeedMultiplier
        streak={streak}
        visible={showMultiplier}
        onDone={() => setShowMultiplier(false)}
      />

      {/* 错误闪卡 - 显示正确答案 */}
      {wrongFlash && (
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 106, animation: 'wrongFlashIn 0.3s ease-out' }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 rounded-3xl shadow-2xl p-8 mx-6 max-w-sm w-full text-center overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full" />
            <div className="relative">
              <span className="text-7xl block mb-4" style={{ animation: 'wrongShake 0.5s ease-in-out' }}>
                {timeLeft === 0 ? '⏰' : '❌'}
              </span>
              <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
                {timeLeft === 0 ? '时间到！' : '答错啦！'}
              </h2>
              {currentWord && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/80 text-sm mb-1">正确答案</p>
                  <p className="text-white text-2xl font-bold">{currentWord.meaning}</p>
                  <p className="text-white/70 mt-1">{currentWord.word}</p>
                </div>
              )}
              <p className="text-white/60 text-sm mt-4">连击已重置</p>
            </div>
          </div>
        </div>
      )}

      {/* 计时器和进度 */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">进度: {currentIndex + 1} / {words.length}</div>
        <div className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
          ⏱️ {timeLeft}s
        </div>
        <div className="text-sm font-bold">
          得分: <span className="text-green-600">{score}</span>
        </div>
      </div>

      {/* 连击显示 */}
      {streak >= 2 && (
        <div className="mb-4 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold shadow-lg ${
            streak >= 6 ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' :
            streak >= 4 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
            'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}>
            <span className="text-xl">🔥</span>
            <span className="text-lg">×{streak} 连击！</span>
          </div>
        </div>
      )}

      {/* 进度条 */}
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} />
      </div>

      {/* 单词卡片 */}
      <div className={`card mb-6 transition-all duration-300 ${
        showResult
          ? selectedAnswer === currentWord?.meaning
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
            : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'
          : ''
      }`}>
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentWord?.word || ''}</h3>
          <p className="text-gray-500">{currentWord?.phonetic || ''}</p>
        </div>
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={showResult}
            className={`p-4 rounded-xl border-2 transition-all duration-300 transform ${
              showResult
                ? option === currentWord?.meaning
                  ? 'bg-green-100 border-green-500 text-green-700 scale-105 shadow-lg'
                  : option === selectedAnswer
                  ? 'bg-red-100 border-red-500 text-red-700 scale-95'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
                : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:scale-105 active:scale-95'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* 时间条 */}
      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 linear ${
            timeLeft <= 3 ? 'bg-red-500' : timeLeft <= 6 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${(timeLeft / 10) * 100}%` }}
        />
      </div>

      <style jsx>{`
        @keyframes wrongFlashIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes wrongShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-8px) rotate(-5deg); }
          40% { transform: translateX(8px) rotate(5deg); }
          60% { transform: translateX(-6px) rotate(-3deg); }
          80% { transform: translateX(6px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
