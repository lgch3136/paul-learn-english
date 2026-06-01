'use client'

import { useState, useRef } from 'react'
import { sounds } from '@/lib/sounds'
import { createConfetti } from '@/lib/animations'

interface Word {
  word: string
  meaning: string
  phonetic: string
  word_id?: string
}

interface SpellingModeProps {
  words: Word[]
  onComplete: (score: number, totalWords: number) => void
  onBack: () => void
  onAnswer?: (wordId: string, isCorrect: boolean) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function SpellingMode({ words, onComplete, onBack, onAnswer }: SpellingModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<Word[]>([])
  const [started, setStarted] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [streak, setStreak] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentWord = shuffledWords[currentIndex]

  const startGame = () => {
    const shuffled = shuffleArray(words)
    setShuffledWords(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setInputValue('')
    setShowResult(false)
    setIsCorrect(false)
    setGameOver(false)
    setStarted(true)
    setHintsUsed(0)
    setShowHint(false)
    setStreak(0)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSubmit = () => {
    if (!currentWord || showResult) return

    const correct = inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
      setStreak(streak + 1)
      sounds.correct()
    } else {
      setStreak(0)
      sounds.wrong()
    }
    if (onAnswer && currentWord.word_id) onAnswer(currentWord.word_id, correct)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showResult) {
        handleNext()
      } else {
        handleSubmit()
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setInputValue('')
      setShowResult(false)
      setIsCorrect(false)
      setShowHint(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setGameOver(true)
      // score 已经在 handleSubmit 中更新了，直接用 score
      if (score >= shuffledWords.length * 0.7) {
        sounds.complete()
        if (containerRef.current) createConfetti(containerRef.current, 50)
      }
      onComplete(score, shuffledWords.length)
    }
  }

  const handleShowHint = () => {
    setShowHint(true)
    setHintsUsed(hintsUsed + 1)
  }

  // Get hint: show first N letters
  const getHint = () => {
    if (!currentWord) return ''
    const word = currentWord.word
    const showCount = Math.min(2 + hintsUsed, word.length - 1)
    return word.slice(0, showCount) + '_ '.repeat(word.length - showCount)
  }

  if (!started) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card">
          <span className="text-5xl mb-4 block">✍️</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">拼写达人模式</h2>
          <p className="text-gray-600 mb-6">
            看中文意思，拼出正确的英文单词！
          </p>
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-purple-800">
              💡 输入英文单词，系统会告诉你是否正确。可以用提示功能看前几个字母
            </p>
          </div>
          <button onClick={startGame} className="btn-primary text-lg px-8 py-4">
            开始挑战 🚀
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    const percentage = Math.round((score / shuffledWords.length) * 100)
    return (
      <div ref={containerRef} className="max-w-md mx-auto text-center">
        <div className="card animate-bounce-in">
          <span className="text-6xl mb-4 block">
            {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">拼写挑战完成！</h2>
          <div className="my-6">
            <p className="text-gray-600">
              拼对 <span className="font-bold text-green-600 text-2xl">{score}</span> / {shuffledWords.length} 题
            </p>
            <p className="text-gray-600 mt-1">
              正确率 <span className="font-bold text-blue-600 text-xl">{percentage}%</span>
            </p>
            {hintsUsed > 0 && (
              <p className="text-gray-500 text-sm mt-1">使用了 {hintsUsed} 次提示</p>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onBack} className="btn-primary">返回</button>
            <button onClick={startGame} className="btn-success">再来一次</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="max-w-md mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">进度: {currentIndex + 1} / {shuffledWords.length}</span>
        <span className="text-sm text-gray-600">得分: {score}</span>
      </div>
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }} />
      </div>

      {/* Streak */}
      {streak >= 3 && (
        <div className="text-center mb-4">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
            🔥 连续拼对 {streak} 个！
          </span>
        </div>
      )}

      {/* Word card */}
      <div className={`card mb-6 text-center transition-all duration-500 ${
        showResult
          ? isCorrect
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
            : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'
          : 'bg-gradient-to-br from-purple-50 to-blue-50'
      }`}>
        <span className="text-4xl mb-3 block">✍️</span>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentWord?.meaning}</h2>
        <p className="text-gray-500">这个词有 {currentWord?.word.length} 个字母</p>

        {/* Hint */}
        {showHint && (
          <div className="mt-3 bg-yellow-100 rounded-lg px-4 py-2 inline-block">
            <p className="text-yellow-800 font-mono text-lg tracking-wider">{getHint()}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={showResult}
          placeholder="输入英文单词..."
          className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all disabled:bg-gray-50"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-4">
        {!showResult ? (
          <>
            <button onClick={handleShowHint} className="flex-1 bg-yellow-100 text-yellow-800 font-bold py-3 px-4 rounded-xl hover:bg-yellow-200 transition-all">
              💡 提示
            </button>
            <button onClick={handleSubmit} className="flex-1 btn-primary py-3">
              确认 ✓
            </button>
          </>
        ) : (
          <button onClick={handleNext} className="w-full btn-primary py-3 text-lg">
            {currentIndex < shuffledWords.length - 1 ? '下一题 →' : '完成 ✨'}
          </button>
        )}
      </div>

      {/* Result feedback */}
      {showResult && (
        <div className={`card text-center animate-bounce-in ${
          isCorrect
            ? 'bg-green-50 border-2 border-green-200'
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          <span className="text-4xl block mb-2">{isCorrect ? '🎉' : '💪'}</span>
          <h3 className="font-bold text-lg mb-2">
            {isCorrect ? '拼写正确！' : '拼写错误'}
          </h3>
          {!isCorrect && (
            <div>
              <p className="text-gray-600 mb-1">正确答案：</p>
              <p className="text-2xl font-bold text-blue-600">{currentWord?.word}</p>
              <p className="text-gray-500 mt-1">{currentWord?.phonetic}</p>
            </div>
          )}
        </div>
      )}

      {/* Keyboard hint */}
      {!showResult && (
        <p className="text-center text-sm text-gray-400 mt-4">
          按 Enter 确认 · 不区分大小写
        </p>
      )}
    </div>
  )
}
