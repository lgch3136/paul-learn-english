'use client'

import { useState, useEffect, useRef } from 'react'
import { sounds } from '@/lib/sounds'
import { createConfetti } from '@/lib/animations'

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
  const [timeLeft, setTimeLeft] = useState(10)
  const [isActive, setIsActive] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [animClass, setAnimClass] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentWord = words[currentIndex]

  // 生成选项
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

  // 计时器
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      // 时间到，自动下一题
      handleTimeUp()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isActive, timeLeft])

  const startGame = () => {
    if (words.length === 0) return
    setIsActive(true)
    setScore(0)
    setCurrentIndex(0)
    setGameOver(false)
    setTimeLeft(10)
    setShowResult(false)
    setSelectedAnswer(null)
    setAnimClass('')
    setShowFeedback(false)
  }

  const handleTimeUp = () => {
    setShowResult(true)
    setSelectedAnswer(null)
    sounds.wrong()
    setAnimClass('animate-shake-result')
    setShowFeedback(true)

    setTimeout(() => {
      setAnimClass('')
      setShowFeedback(false)
      moveToNext()
    }, 1200)
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult || !isActive || !currentWord) return

    setSelectedAnswer(answer)
    setShowResult(true)
    setIsActive(false)

    if (answer === currentWord.meaning) {
      // 答对了 - 弹跳动画
      setScore(score + 1)
      sounds.correct()
      setAnimClass('animate-bounce-result')
      setShowFeedback(true)
    } else {
      // 答错了 - 抖动动画
      sounds.wrong()
      setAnimClass('animate-shake-result')
      setShowFeedback(true)
    }

    setTimeout(() => {
      setAnimClass('')
      setShowFeedback(false)
      moveToNext()
    }, 1000)
  }

  const moveToNext = () => {
    if (words.length === 0) return

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowResult(false)
      setSelectedAnswer(null)
      setTimeLeft(10)
      setIsActive(true)
    } else {
      // 游戏结束
      setGameOver(true)
      setIsActive(false)
      if (score >= words.length * 0.7) {
        sounds.complete()
        if (containerRef.current) {
          createConfetti(containerRef.current, 50)
        }
      }
    }
  }

  if (gameOver) {
    const percentage = Math.round((score / words.length) * 100)
    const grade = percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D'
    
    return (
      <div ref={containerRef} className="max-w-md mx-auto text-center">
        <div className="card animate-bounce-in">
          <span className="text-6xl mb-4 block">
            {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">挑战完成！</h2>
          
          <div className="my-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">{grade}</div>
            <p className="text-gray-600">
              答对 <span className="font-bold text-green-600">{score}</span> / {words.length} 题
            </p>
            <p className="text-gray-600">
              正确率 <span className="font-bold">{percentage}%</span>
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={onBack} className="btn-primary">
              返回
            </button>
            <button onClick={startGame} className="btn-success">
              再来一次
            </button>
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
          <p className="text-gray-600 mb-6">
            每题限时 10 秒，快速选出正确答案！
          </p>
          
          <div className="bg-yellow-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ 时间紧迫，考验你的反应速度！
            </p>
          </div>

          <button onClick={startGame} className="btn-primary text-lg px-8 py-4">
            开始挑战 🚀
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="max-w-md mx-auto relative">
      {/* 反馈提示 */}
      {showFeedback && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in ${
          selectedAnswer === currentWord?.meaning ? 'text-green-500' : 'text-red-500'
        }`}>
          <div className={`px-6 py-3 rounded-full shadow-xl text-white font-bold text-lg ${
            selectedAnswer === currentWord?.meaning
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-red-400 to-pink-500'
          }`}>
            {selectedAnswer === currentWord?.meaning ? '🎉 正确！' : timeLeft === 0 ? '⏰ 时间到！' : '❌ 答错了'}
          </div>
        </div>
      )}

      {/* 计时器和进度 */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          进度: {currentIndex + 1} / {words.length}
        </div>
        <div className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
          ⏱️ {timeLeft}s
        </div>
        <div className="text-sm text-gray-600">
          得分: {score}
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-6">
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        ></div>
      </div>

      {/* 单词卡片 */}
      <div className={`card mb-6 transition-all duration-300 ${animClass} ${
        showResult
          ? selectedAnswer === currentWord?.meaning
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
            : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'
          : ''
      }`}>
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {currentWord?.word || ''}
          </h3>
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
        ></div>
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes bounceResult {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.05); }
          50% { transform: scale(0.95); }
          70% { transform: scale(1.02); }
        }
        @keyframes shakeResult {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-bounce-result {
          animation: bounceResult 0.5s ease-in-out;
        }
        .animate-shake-result {
          animation: shakeResult 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}