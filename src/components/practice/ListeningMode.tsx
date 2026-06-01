'use client'

import { useState, useEffect, useRef } from 'react'
import { sounds } from '@/lib/sounds'
import { createConfetti } from '@/lib/animations'

interface Word {
  word: string
  meaning: string
  phonetic: string
  word_id?: string
}

interface ListeningModeProps {
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

function generateOptions(correctWord: string, allWords: Word[]): string[] {
  const options = [correctWord]
  const others = allWords.filter(w => w.word !== correctWord)
  while (options.length < 4 && others.length > 0) {
    const idx = Math.floor(Math.random() * others.length)
    options.push(others[idx].word)
    others.splice(idx, 1)
  }
  return shuffleArray(options)
}

export default function ListeningMode({ words, onComplete, onBack, onAnswer }: ListeningModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<Word[]>([])
  const [started, setStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [animClass, setAnimClass] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const currentWord = shuffledWords[currentIndex]

  // 预加载语音列表
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  // Speak the word using Web Speech API with best available voice
  const speakWord = (word: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.75
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // 尝试选择最佳英文语音
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen'))
    ) || voices.find(v => v.lang.startsWith('en-US'))
    || voices.find(v => v.lang.startsWith('en'))

    if (preferred) utterance.voice = preferred
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (started && currentWord) {
      speakWord(currentWord.word)
      setOptions(generateOptions(currentWord.word, shuffledWords))
    }
  }, [currentIndex, started])

  const startGame = () => {
    const shuffled = shuffleArray(words)
    setShuffledWords(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setGameOver(false)
    setStarted(true)
    setShowFeedback(false)
    setAnimClass('')
  }

  const handleReplay = () => {
    if (currentWord) speakWord(currentWord.word)
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult || !currentWord) return
    setSelectedAnswer(answer)
    setShowResult(true)

    const correct = answer === currentWord.word
    if (correct) {
      setScore(score + 1)
      sounds.correct()
      setAnimClass('animate-bounce-result')
    } else {
      sounds.wrong()
      setAnimClass('animate-shake-result')
    }
    // 通知父组件记录答题表现（用于成就统计）
    if (onAnswer && currentWord.word_id) onAnswer(currentWord.word_id, correct)
  }

  const handleNext = () => {
    setAnimClass('')
    setShowFeedback(false)
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowResult(false)
      setSelectedAnswer(null)
    } else {
      setGameOver(true)
      if (score >= shuffledWords.length * 0.7) {
        sounds.complete()
        if (containerRef.current) createConfetti(containerRef.current, 50)
      }
      onComplete(score, shuffledWords.length)
    }
  }

  if (!started) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card">
          <span className="text-5xl mb-4 block">🎧</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">听力挑战模式</h2>
          <p className="text-gray-600 mb-6">
            听单词发音，选出正确的英文单词！
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              🔊 系统会朗读英文单词，你需要从四个选项中选出正确的拼写
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">听力挑战完成！</h2>
          <div className="my-6">
            <p className="text-gray-600">
              答对 <span className="font-bold text-green-600 text-2xl">{score}</span> / {shuffledWords.length} 题
            </p>
            <p className="text-gray-600 mt-1">
              正确率 <span className="font-bold text-blue-600 text-xl">{percentage}%</span>
            </p>
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
    <div ref={containerRef} className="max-w-md mx-auto relative">
      {/* Feedback popup */}
      {showFeedback && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in ${
          selectedAnswer === currentWord?.word ? 'text-green-500' : 'text-red-500'
        }`}>
          <div className={`px-6 py-3 rounded-full shadow-xl text-white font-bold text-lg ${
            selectedAnswer === currentWord?.word
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-red-400 to-pink-500'
          }`}>
            {selectedAnswer === currentWord?.word ? '🎉 正确！' : `❌ 答案是: ${currentWord?.word}`}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">进度: {currentIndex + 1} / {shuffledWords.length}</span>
        <span className="text-sm text-gray-600">得分: {score}</span>
      </div>
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }} />
      </div>

      {/* Word display with replay */}
      <div className={`card mb-6 text-center transition-all duration-300 ${animClass}`}>
        <span className="text-4xl mb-4 block">🎧</span>
        <p className="text-gray-600 mb-2">听发音，选出正确的单词：</p>
        <button
          onClick={handleReplay}
          className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-blue-600 transition-all active:scale-95"
        >
          🔊 再听一次
        </button>
        {!showResult && (
          <p className="text-sm text-gray-400 mt-2">仔细听发音，选出正确的单词</p>
        )}
        {showResult && (
          <p className="text-sm text-gray-500 mt-2">{currentWord?.meaning}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const grads = ['from-blue-400 to-blue-500', 'from-purple-400 to-purple-500', 'from-green-400 to-green-500', 'from-orange-400 to-orange-500']
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showResult}
              className={`p-4 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                showResult
                  ? option === currentWord?.word
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-105'
                    : option === selectedAnswer
                    ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  : `bg-gradient-to-br ${grads[index]} text-white shadow-md hover:shadow-xl`
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {/* 结果反馈 */}
      {showResult && (
        <div className="mt-4 animate-bounce-in">
          <div className={`rounded-2xl shadow-xl p-5 text-white text-center ${
            selectedAnswer === currentWord?.word
              ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-br from-orange-400 via-red-400 to-pink-500'
          }`}>
            <span className="text-4xl mb-2 block">{selectedAnswer === currentWord?.word ? '🎉' : '❌'}</span>
            <h3 className="text-xl font-bold mb-1">{selectedAnswer === currentWord?.word ? '答对了！' : '答错了！'}</h3>
            <p className="opacity-90 mb-1">正确答案：<span className="font-bold text-lg">{currentWord?.word}</span></p>
            <p className="opacity-75 text-sm mb-3">{currentWord?.meaning}</p>
            <button
              onClick={handleNext}
              className="w-full bg-white text-gray-800 font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              {currentIndex < shuffledWords.length - 1 ? '下一题 →' : '完成练习 🎊'}
            </button>
          </div>
        </div>
      )}

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
        .animate-bounce-result { animation: bounceResult 0.5s ease-in-out; }
        .animate-shake-result { animation: shakeResult 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}
