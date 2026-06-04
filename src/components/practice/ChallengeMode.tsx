'use client'

import { useState, useEffect, useRef } from 'react'
import { sounds } from '@/lib/sounds'
import { createConfetti, addConfettiStyle } from '@/lib/animations'

interface Word {
  word: string
  meaning: string
  phonetic: string
  word_id?: string
}

interface ChallengeModeProps {
  words: Word[]
  onComplete: (success: boolean, streak: number) => void
  onBack: () => void
  onAnswer?: (wordId: string, isCorrect: boolean) => void
}

const TARGET_STREAK = 8

export default function ChallengeMode({ words, onComplete, onBack, onAnswer }: ChallengeModeProps) {
  const [options, setOptions] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gameState, setGameState] = useState<'start' | 'playing' | 'success' | 'failed' | 'wrong_popup'>('start')
  const [shakeWrong, setShakeWrong] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const wordPoolRef = useRef<Word[]>([])
  const poolIndexRef = useRef(0)

  // 创建打乱的单词池，避免重复
  const shufflePool = () => {
    wordPoolRef.current = [...words].sort(() => Math.random() - 0.5)
    poolIndexRef.current = 0
  }

  const getRandomWord = () => {
    // 如果池用完了，重新打乱
    if (wordPoolRef.current.length === 0 || poolIndexRef.current >= wordPoolRef.current.length) {
      shufflePool()
    }
    const idx = poolIndexRef.current
    const word = wordPoolRef.current[idx]
    poolIndexRef.current = idx + 1
    return { word, index: idx }
  }

  const [currentWord, setCurrentWord] = useState<{ word: Word; index: number } | null>(null)

  useEffect(() => {
    if (currentWord) {
      const allMeanings = words.map(w => w.meaning)
      const correctMeaning = currentWord.word.meaning
      const otherMeanings = allMeanings.filter(m => m !== correctMeaning)
      const newOptions = [correctMeaning]
      while (newOptions.length < 4 && otherMeanings.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherMeanings.length)
        newOptions.push(otherMeanings[randomIndex])
        otherMeanings.splice(randomIndex, 1)
      }
      setOptions(newOptions.sort(() => Math.random() - 0.5))
    }
  }, [currentWord, words])

  useEffect(() => {
    addConfettiStyle()
  }, [])

  const startGame = () => {
    shufflePool()
    const firstWord = getRandomWord()
    setCurrentWord(firstWord)
    setStreak(0)
    setBestStreak(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setGameState('playing')
    setShakeWrong(false)
    setShowParticles(false)
    setFireworks([])
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult || gameState !== 'playing' || !currentWord) return
    setSelectedAnswer(answer)
    setShowResult(true)

    const correct = answer === currentWord.word.meaning
    if (onAnswer && currentWord.word.word_id) onAnswer(currentWord.word.word_id, correct)

    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setBestStreak(prev => Math.max(prev, newStreak))
      sounds.correct()

      if (newStreak >= TARGET_STREAK) {
        setTimeout(() => {
          setGameState('success')
          sounds.complete()
          setShowParticles(true)
          createFireworks()
          if (containerRef.current) createConfetti(containerRef.current, 100)
          onComplete(true, newStreak)
        }, 500)
      } else {
        setTimeout(() => moveToNext(), 600)
      }
    } else {
      // 答错了 - 显示弹窗
      sounds.wrong()
      setShakeWrong(true)
      setTimeout(() => {
        setShakeWrong(false)
        // 切换到 wrong_popup 状态而不是直接 failed
        setGameState('wrong_popup')
      }, 600)
    }
  }

  // 点击弹窗空白处或确认按钮 -> 进入失败总结页
  const handleWrongPopupDismiss = () => {
    setGameState('failed')
    onComplete(false, streak)
  }

  const moveToNext = () => {
    const nextWord = getRandomWord()
    setCurrentWord(nextWord)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  const createFireworks = () => {
    const newFireworks = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 60 + 20
    }))
    setFireworks(newFireworks)
    setTimeout(() => setFireworks([]), 2000)
  }

  // 开始界面
  if (gameState === 'start') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card">
          <span className="text-6xl mb-4 block">🏆</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">闯关挑战模式</h2>
          <p className="text-gray-600 mb-6">
            连续答对 <span className="font-bold text-blue-600">{TARGET_STREAK} 题</span> 即可通关！
          </p>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-orange-800">⚠️ <span className="font-bold">紧张刺激！</span></p>
            <p className="text-sm text-orange-700 mt-1">一旦答错，立即失败！考验你的综合实力！</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">🎯 挑战规则</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>✅ 连续答对 {TARGET_STREAK} 题 = 通关成功</li>
              <li>❌ 答错任意一题 = 挑战失败</li>
              <li>⏱️ 每题无时间限制，仔细思考</li>
              <li>🔄 失败后可以无限重试</li>
            </ul>
          </div>
          <button onClick={startGame} className="btn-primary text-lg px-8 py-4 w-full">开始挑战 🚀</button>
        </div>
      </div>
    )
  }

  // 通关成功界面
  if (gameState === 'success') {
    return (
      <div ref={containerRef} className="max-w-md mx-auto text-center relative">
        {fireworks.map(fw => (
          <div key={fw.id} className="absolute text-4xl animate-bounce" style={{ left: `${fw.x}%`, top: `${fw.y}%`, animation: 'firework 1s ease-out forwards' }}>🎆</div>
        ))}
        <div className="card animate-bounce-in">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 -m-6 mb-6 p-6 rounded-t-2xl">
            <span className="text-7xl block mb-3">🏆</span>
            <h2 className="text-3xl font-bold text-white">恭喜通关！</h2>
          </div>
          <div className="mb-6">
            <div className="text-5xl font-bold text-green-600 mb-2">{TARGET_STREAK} 连击！</div>
            <p className="text-gray-600 text-lg">太厉害了！你成功闯过了所有关卡！</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">连续答对</p><p className="text-2xl font-bold text-green-600">{streak} 题</p></div>
              <div><p className="text-sm text-gray-600">评价</p><p className="text-2xl font-bold text-yellow-600">S 级</p></div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 font-medium">🌟 你是英语小达人！继续保持！</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all hover:bg-gray-200">返回</button>
            <button onClick={startGame} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all hover:shadow-lg">再来一次 🎮</button>
          </div>
        </div>
        <style jsx>{`
          @keyframes firework {
            0% { transform: scale(0) translateY(0); opacity: 1; }
            50% { transform: scale(1.5) translateY(-50px); opacity: 1; }
            100% { transform: scale(0.5) translateY(-100px); opacity: 0; }
          }
        `}</style>
      </div>
    )
  }

  // 答错弹窗 - 展示正确答案，需要点击才进入总结页
  if (gameState === 'wrong_popup') {
    return (
      <div className="max-w-md mx-auto text-center">
        {/* 答错弹窗遮罩 */}
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 110 }}
          onClick={handleWrongPopupDismiss}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* 弹窗卡片 */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
            style={{ animation: 'wrongPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 红色顶部装饰 */}
            <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-6 text-center">
              <span className="text-7xl block mb-3" style={{ animation: 'wrongBounce 0.5s ease-in-out' }}>😤</span>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">挑战失败！</h2>
            </div>

            <div className="p-6">
              {/* 本次成绩 */}
              <div className="bg-red-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">本次连击</p>
                    <p className="text-2xl font-bold text-red-600">{streak} 题</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">最佳连击</p>
                    <p className="text-2xl font-bold text-orange-600">{bestStreak} 题</p>
                  </div>
                </div>
              </div>

              {/* 正确答案展示 */}
              {currentWord && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border-2 border-amber-200">
                  <p className="text-sm text-amber-700 font-medium mb-2">📖 正确答案：</p>
                  <p className="text-3xl font-bold text-gray-800 mb-1">{currentWord.word.word}</p>
                  <p className="text-sm text-gray-500 mb-2">{currentWord.word.phonetic}</p>
                  <div className="h-px bg-amber-200 my-2" />
                  <p className="text-xl font-bold text-amber-800">{currentWord.word.meaning}</p>
                </div>
              )}

              {/* 距离目标 */}
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-blue-600 mb-1">距离通关</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2.5 transition-all" style={{ width: `${(streak / TARGET_STREAK) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-blue-600">{streak}/{TARGET_STREAK}</span>
                </div>
              </div>

              {/* 鼓励语 */}
              <div className="bg-yellow-50 rounded-xl p-3 mb-5">
                <p className="text-yellow-800 text-sm font-medium">
                  {streak >= 7 ? '💪 就差一点点！你已经很棒了！' : streak >= 4 ? '🌟 继续加油！下次一定能成功！' : '📚 多练习一下，你可以的！'}
                </p>
              </div>

              {/* 确认按钮 */}
              <button
                onClick={handleWrongPopupDismiss}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg"
              >
                我知道了 💪
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes wrongPopIn {
            0% { transform: scale(0.5) translateY(30px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes wrongBounce {
            0% { transform: scale(0) rotate(-10deg); }
            60% { transform: scale(1.2) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </div>
    )
  }

  // 失败总结界面
  if (gameState === 'failed') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card animate-shake">
          <span className="text-6xl mb-4 block">😤</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">挑战失败！</h2>
          <p className="text-gray-600 mb-6">差一点就成功了！再试一次吧！</p>
          <div className="bg-red-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">本次连击</p><p className="text-2xl font-bold text-red-600">{streak} 题</p></div>
              <div><p className="text-sm text-gray-600">最佳连击</p><p className="text-2xl font-bold text-orange-600">{bestStreak} 题</p></div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-600 mb-2">距离通关</p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-3 transition-all" style={{ width: `${(streak / TARGET_STREAK) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-blue-600">{streak}/{TARGET_STREAK}</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">还需要连续答对 <span className="font-bold">{TARGET_STREAK - streak}</span> 题</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              {streak >= 7 ? '💪 就差一点点！你已经很棒了！' : streak >= 4 ? '🌟 继续加油！下次一定能成功！' : '📚 多练习一下，你可以的！'}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all hover:bg-gray-200">返回</button>
            <button onClick={startGame} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all hover:shadow-lg">再来一次 💪</button>
          </div>
        </div>
      </div>
    )
  }

  // 游戏进行中
  return (
    <div ref={containerRef} className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">连击</span>
          <span className={`text-2xl font-bold ${streak >= 7 ? 'text-orange-500 animate-pulse' : 'text-blue-600'}`}>{streak}</span>
          <span className="text-sm text-gray-400">/ {TARGET_STREAK}</span>
        </div>
        <div className="flex items-center gap-2">
          {streak >= 3 && (
            <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full animate-bounce">🔥 连击中！</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>0</span><span>{TARGET_STREAK}</span></div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${streak >= 8 ? 'bg-gradient-to-r from-orange-400 to-red-500' : streak >= 5 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} style={{ width: `${(streak / TARGET_STREAK) * 100}%` }} />
        </div>
        {streak >= 8 && (
          <p className="text-center text-sm text-orange-600 font-bold mt-1 animate-pulse">🔥 就差 {TARGET_STREAK - streak} 题了！</p>
        )}
      </div>

      <div className={`card mb-6 transition-all duration-300 ${shakeWrong ? 'animate-shake bg-red-50 border-2 border-red-300' : ''} ${showResult ? (selectedAnswer === currentWord?.word.meaning ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300') : ''}`}>
        <div className="text-center">
          <h3 className="text-4xl font-bold text-gray-800 mb-2">{currentWord?.word.word}</h3>
          <p className="text-gray-500 text-lg">{currentWord?.word.phonetic}</p>
        </div>
      </div>

      <p className="text-center text-gray-700 mb-4 font-medium">选出正确的中文意思：</p>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const gradients = ['from-blue-400 to-blue-500', 'from-purple-400 to-purple-500', 'from-green-400 to-green-500', 'from-orange-400 to-orange-500']
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showResult}
              className={`relative overflow-hidden p-4 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                showResult
                  ? option === currentWord?.word.meaning
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-105'
                    : option === selectedAnswer
                    ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  : `bg-gradient-to-br ${gradients[index]} text-white shadow-md hover:shadow-xl`
              }`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <span className="relative">{option}</span>
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className={`mt-4 p-4 rounded-xl text-center animate-bounce-in ${selectedAnswer === currentWord?.word.meaning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {selectedAnswer === currentWord?.word.meaning ? (
            <p className="font-bold">✅ 太棒了！{streak >= TARGET_STREAK - 1 ? '🎉 即将通关！' : `继续！还差 ${TARGET_STREAK - streak} 题`}</p>
          ) : (
            <div><p className="font-bold mb-1">❌ 答错了！</p><p className="text-sm">正确答案：{currentWord?.word.meaning}</p></div>
          )}
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">💡 答错任意一题就会失败，仔细思考再选择！</p>
      </div>
    </div>
  )
}
