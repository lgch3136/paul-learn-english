'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { sounds } from '@/lib/sounds'
import { vibrate, createConfetti } from '@/lib/animations'

interface Word {
  word: string
  meaning: string
  phonetic: string
  word_id?: string
}

interface WordFishingModeProps {
  words: Word[]
  onComplete: (score: number, totalWords: number) => void
  onBack: () => void
  onAnswer?: (wordId: string, isCorrect: boolean) => void
  paused?: boolean
}

interface Fish {
  id: string
  word: string
  wordId?: string
  x: number
  y: number
  speed: number
  direction: 1 | -1 // 1=向右游, -1=向左游
  color: string
  emoji: string
  caught: boolean
  size: number
  wobble: number // 上下摆动幅度
  wobbleSpeed: number
}

const FISH_COLORS = [
  'from-blue-400 to-cyan-500',
  'from-orange-400 to-yellow-500',
  'from-pink-400 to-rose-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
  'from-red-400 to-orange-500',
  'from-teal-400 to-blue-500',
  'from-amber-400 to-orange-500',
]

const FISH_EMOJIS = ['🐟', '🐠', '🐡', '🦈', '🐳', '🐬', '🦐', '🦀']

const BUBBLE_COLORS = ['rgba(255,255,255,0.3)', 'rgba(173,216,230,0.3)', 'rgba(135,206,250,0.3)']

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function WordFishingMode({ words, onComplete, onBack, onAnswer, paused = false }: WordFishingModeProps) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'complete'>('start')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(5)
  const [fishes, setFishes] = useState<Fish[]>([])
  const [shuffledWords, setShuffledWords] = useState<Word[]>([])
  const [selectedFishId, setSelectedFishId] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; word: string; meaning: string } | null>(null)
  const [caughtAnimation, setCaughtAnimation] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([])
  const [showCombo, setShowCombo] = useState(false)
  const [comboText, setComboText] = useState('')
  const [lifeLostFlash, setLifeLostFlash] = useState(false)
  const [gameSpeed, setGameSpeed] = useState(1)
  const [totalCaught, setTotalCaught] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const fishIdCounter = useRef(0)
  const bubbleIdCounter = useRef(0)
  const scoreRef = useRef(0)
  const correctCountRef = useRef(0) // 实际答对题数（不含加分）
  const livesRef = useRef(5)
  const streakRef = useRef(0)
  const currentIndexRef = useRef(0)
  const pausedRef = useRef(false)
  const phaseRef = useRef<'start' | 'playing' | 'complete'>('start')
  const processingRef = useRef(false)

  // 同步 ref
  pausedRef.current = paused
  phaseRef.current = phase

  // 生成鱼的初始数据
  const createFish = useCallback((word: Word, containerWidth: number): Fish => {
    fishIdCounter.current += 1
    const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1
    const speed = (0.5 + Math.random() * 1.5) * gameSpeed
    const size = 0.8 + Math.random() * 0.4 // 0.8-1.2 scale
    return {
      id: `fish-${fishIdCounter.current}`,
      word: word.word,
      wordId: word.word_id,
      x: direction === 1 ? -150 : containerWidth + 150,
      y: 80 + Math.random() * 300, // 垂直位置随机
      speed,
      direction,
      color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
      emoji: FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)],
      caught: false,
      size,
      wobble: 10 + Math.random() * 20,
      wobbleSpeed: 1 + Math.random() * 2,
    }
  }, [gameSpeed])

  // 生成当前题目的鱼群
  const spawnFishes = useCallback((wordIndex: number, containerWidth: number) => {
    if (wordIndex >= shuffledWords.length) return
    const correctWord = shuffledWords[wordIndex]
    // 选取干扰词
    const others = shuffledWords.filter((_, i) => i !== wordIndex)
    const distractors = shuffleArray(others).slice(0, 3)
    const allOptions = shuffleArray([correctWord, ...distractors])

    // 为每个词生成鱼，均匀分布在不同高度
    const newFishes = allOptions.map((w, i) => {
      const fish = createFish(w, containerWidth)
      fish.y = 80 + i * 90 + Math.random() * 30
      return fish
    })
    setFishes(newFishes)
  }, [shuffledWords, createFish])

  // 开始游戏
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(words)
    setShuffledWords(shuffled)
    setCurrentIndex(0)
    currentIndexRef.current = 0
    setScore(0)
    scoreRef.current = 0
    correctCountRef.current = 0
    setStreak(0)
    streakRef.current = 0
    setLives(5)
    livesRef.current = 5
    setGameSpeed(1)
    setTotalCaught(0)
    setSelectedFishId(null)
    setShowFeedback(null)
    setCaughtAnimation(null)
    setShowCombo(false)
    processingRef.current = false

    // 延迟生成鱼，确保容器已渲染
    setTimeout(() => {
      const container = containerRef.current
      const width = container?.clientWidth || 400
      setPhase('playing')
      // 生成第一题的鱼
      if (shuffled.length > 0) {
        const correctWord = shuffled[0]
        const others = shuffled.filter((_, i) => i !== 0)
        const distractors = shuffleArray(others).slice(0, 3)
        const allOptions = shuffleArray([correctWord, ...distractors])
        fishIdCounter.current = 0
        const newFishes = allOptions.map((w, i) => {
          fishIdCounter.current += 1
          const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1
          return {
            id: `fish-${fishIdCounter.current}`,
            word: w.word,
            wordId: w.word_id,
            x: direction === 1 ? -150 : width + 150,
            y: 80 + i * 90 + Math.random() * 30,
            speed: (0.5 + Math.random() * 1.5),
            direction,
            color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
            emoji: FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)],
            caught: false,
            size: 0.8 + Math.random() * 0.4,
            wobble: 10 + Math.random() * 20,
            wobbleSpeed: 1 + Math.random() * 2,
          }
        })
        setFishes(newFishes)
      }
    }, 100)
  }, [words])

  // 鱼的游动动画
  useEffect(() => {
    if (phase !== 'playing' || paused) return
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      if (phaseRef.current !== 'playing' || pausedRef.current) return

      const delta = (currentTime - lastTime) / 16.67 // normalize to ~60fps
      lastTime = currentTime

      setFishes(prev => {
        const container = containerRef.current
        const width = container?.clientWidth || 400
        return prev.map(fish => {
          if (fish.caught) return fish
          let newX = fish.x + fish.speed * fish.direction * delta
          let newY = fish.y
          // 鱼游出屏幕后从另一侧回来，y轴随机偏移
          if (fish.direction === 1 && newX > width + 100) {
            newX = -150
            newY = 60 + Math.random() * 280
          } else if (fish.direction === -1 && newX < -200) {
            newX = width + 100
            newY = 60 + Math.random() * 280
          }
          return { ...fish, x: newX, y: newY }
        })
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [phase, paused])

  // 生成气泡动画
  useEffect(() => {
    if (phase !== 'playing') return
    const interval = setInterval(() => {
      bubbleIdCounter.current += 1
      setBubbles(prev => {
        const newBubbles = [...prev]
        // 限制气泡数量
        if (newBubbles.length > 15) newBubbles.shift()
        newBubbles.push({
          id: bubbleIdCounter.current,
          x: 10 + Math.random() * 80, // % position
          y: 100, // start from bottom %
          size: 4 + Math.random() * 8,
          speed: 0.3 + Math.random() * 0.5,
        })
        return newBubbles
      })
    }, 800)
    return () => clearInterval(interval)
  }, [phase])

  // 气泡上升动画
  useEffect(() => {
    if (phase !== 'playing') return
    const interval = setInterval(() => {
      setBubbles(prev =>
        prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -10)
      )
    }, 50)
    return () => clearInterval(interval)
  }, [phase])

  // 处理点击鱼
  const handleFishClick = useCallback((fish: Fish) => {
    if (phase !== 'playing' || fish.caught || showFeedback || processingRef.current) return
    processingRef.current = true

    setSelectedFishId(fish.id)
    const correctWord = shuffledWords[currentIndexRef.current]
    const isCorrect = fish.word === correctWord.word

    if (isCorrect) {
      // 答对！
      sounds.correct()
      vibrate(100)

      const newStreak = streakRef.current + 1
      streakRef.current = newStreak
      correctCountRef.current += 1
      const newScore = scoreRef.current + (newStreak >= 3 ? 2 : 1)
      scoreRef.current = newScore
      setScore(newScore)
      setStreak(newStreak)
      setTotalCaught(prev => prev + 1)

      // 标记鱼被捕获
      setCaughtAnimation(fish.id)
      setFishes(prev => prev.map(f => f.id === fish.id ? { ...f, caught: true } : f))

      // 通知父组件
      if (onAnswer && correctWord.word_id) onAnswer(correctWord.word_id, true)

      setShowFeedback({ correct: true, word: correctWord.word, meaning: correctWord.meaning })

      // 连击特效
      if (newStreak >= 3) {
        const comboTexts: Record<number, string> = {
          3: '🔥 三连击！',
          5: '⚡ 五连击！',
          7: '💥 超级连击！',
          10: '🌟 无人能挡！',
        }
        const text = comboTexts[Math.min(newStreak, 10)] || `💫 ×${newStreak} 连击！`
        setComboText(text)
        setShowCombo(true)
        sounds.streak()
        setTimeout(() => setShowCombo(false), 1200)
      }

      // 自动进入下一题
      setTimeout(() => {
        setShowFeedback(null)
        setSelectedFishId(null)
        setCaughtAnimation(null)
        processingRef.current = false

        const nextIdx = currentIndexRef.current + 1
        if (nextIdx >= shuffledWords.length) {
          // 游戏结束
          setPhase('complete')
          if (correctCountRef.current >= shuffledWords.length * 0.7) {
            sounds.complete()
            if (containerRef.current) createConfetti(containerRef.current, 60)
          }
          onComplete(correctCountRef.current, shuffledWords.length)
        } else {
          currentIndexRef.current = nextIdx
          setCurrentIndex(nextIdx)

          // 每5题增加速度
          if (nextIdx % 5 === 0) {
            setGameSpeed(prev => Math.min(prev + 0.2, 2.5))
          }

          // 生成下一题的鱼
          const container = containerRef.current
          const width = container?.clientWidth || 400
          const nextWord = shuffledWords[nextIdx]
          const others = shuffledWords.filter((_, i) => i !== nextIdx)
          const distractors = shuffleArray(others).slice(0, 3)
          const allOptions = shuffleArray([nextWord, ...distractors])
          const newFishes = allOptions.map((w, i) => {
            fishIdCounter.current += 1
            const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1
            const speed = (0.5 + Math.random() * 1.5) * Math.min(1 + nextIdx * 0.04, 2.5)
            return {
              id: `fish-${fishIdCounter.current}`,
              word: w.word,
              wordId: w.word_id,
              x: direction === 1 ? -150 : width + 150,
              y: 80 + i * 90 + Math.random() * 30,
              speed,
              direction,
              color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
              emoji: FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)],
              caught: false,
              size: 0.8 + Math.random() * 0.4,
              wobble: 10 + Math.random() * 20,
              wobbleSpeed: 1 + Math.random() * 2,
            }
          })
          setFishes(newFishes)
        }
      }, 1200)
    } else {
      // 答错！
      sounds.wrong()
      vibrate(200)
      streakRef.current = 0
      setStreak(0)
      livesRef.current -= 1
      const newLives = livesRef.current
      setLives(newLives)
      setLifeLostFlash(true)
      setTimeout(() => setLifeLostFlash(false), 600)

      if (onAnswer && correctWord.word_id) onAnswer(correctWord.word_id, false)

      setShowFeedback({ correct: false, word: correctWord.word, meaning: correctWord.meaning })

      if (newLives <= 0) {
        // 游戏结束 - 没命了
        setTimeout(() => {
          setPhase('complete')
          onComplete(correctCountRef.current, shuffledWords.length)
          processingRef.current = false
        }, 1500)
      } else {
        setTimeout(() => {
          setShowFeedback(null)
          setSelectedFishId(null)
          processingRef.current = false
        }, 1500)
      }
    }
  }, [phase, showFeedback, shuffledWords, onAnswer, onComplete])

  // ===== 开始界面 =====
  if (phase === 'start') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card relative overflow-hidden">
          {/* 水波纹背景 */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-200 to-blue-400 opacity-30" />
          <div className="relative">
            <div className="text-6xl mb-4 animate-bounce">🎣</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">单词钓鱼</h2>
            <p className="text-gray-600 mb-4">看中文意思，点击正确的英文鱼！</p>

            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">🎯 游戏规则：</p>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>🐟 屏幕上方显示中文意思，水中有多条鱼游过</li>
                <li>🎯 点击/触摸写有正确英文单词的鱼</li>
                <li>❤️ 你有 5 条命，答错扣 1 条</li>
                <li>🔥 连续答对触发连击加分！</li>
                <li>⚡ 每 5 题鱼会游得更快！</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-3 mb-6">
              <p className="text-xs text-yellow-800">💡 小技巧：鱼游得快时别着急，先看清中文意思再下手！</p>
            </div>

            <button onClick={startGame} className="btn-primary text-lg px-8 py-4">
              开始钓鱼 🎣
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 完成界面 =====
  if (phase === 'complete') {
    const actualCorrect = correctCountRef.current
    const percentage = Math.round((actualCorrect / shuffledWords.length) * 100)
    const grade = percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D'

    return (
      <div ref={containerRef} className="max-w-md mx-auto text-center">
        <div className="card animate-bounce-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-blue-100 opacity-50" />
          <div className="relative">
            <span className="text-6xl mb-4 block">
              {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : lives <= 0 ? '💀' : '💪'}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {lives <= 0 ? '钓鱼结束！' : '钓鱼完成！'}
            </h2>

            <div className="my-6">
              <div className="text-6xl font-bold text-blue-600 mb-2">{grade}</div>
              <p className="text-gray-600">
                钓到 <span className="font-bold text-green-600 text-2xl">{actualCorrect}</span> / {shuffledWords.length} 条鱼
              </p>
              <p className="text-gray-600 mt-1">
                正确率 <span className="font-bold text-blue-600 text-xl">{percentage}%</span>
              </p>
              {lives <= 0 && (
                <p className="text-red-500 text-sm mt-2">❤️ 生命耗尽，下次注意选择哦！</p>
              )}
            </div>

            {/* 钓到的鱼展示 */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium mb-2">🐟 本次收获</p>
              <div className="flex flex-wrap justify-center gap-1 text-2xl">
                {Array.from({ length: Math.min(totalCaught, 30) }).map((_, i) => (
                  <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 50}ms` }}>
                    {FISH_EMOJIS[i % FISH_EMOJIS.length]}
                  </span>
                ))}
                {totalCaught > 30 && <span className="text-sm text-blue-600">+{totalCaught - 30}</span>}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={onBack} className="btn-primary">返回</button>
              <button onClick={startGame} className="btn-success">再钓一次 🎣</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== 游戏界面 =====
  const currentWord = shuffledWords[currentIndex]
  const progressPercent = ((currentIndex + 1) / shuffledWords.length) * 100

  return (
    <div ref={containerRef} className="max-w-md mx-auto relative select-none">
      {/* 顶部信息栏 */}
      <div className="flex justify-between items-center mb-3">
        {/* 生命值 */}
        <div className={`flex items-center gap-0.5 transition-all ${lifeLostFlash ? 'animate-shake' : ''}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-base transition-all duration-300 ${
                i < lives ? 'scale-100 opacity-100' : 'scale-75 opacity-30'
              }`}
            >
              {i < lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>

        {/* 进度 */}
        <span className="text-sm text-gray-600 font-medium">
          🐟 {currentIndex + 1}/{shuffledWords.length}
        </span>

        {/* 得分 */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-blue-600">⭐ {score}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-3">
        <div
          className="progress-fill bg-gradient-to-r from-blue-400 to-cyan-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 连击显示 */}
      {streak >= 2 && (
        <div className="text-center mb-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg ${
            streak >= 6 ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' :
            streak >= 4 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
            'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}>
            🔥 ×{streak}
          </span>
        </div>
      )}

      {/* 中文意思提示栏 */}
      <div className="relative mb-3">
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-2xl p-4 text-white text-center shadow-lg">
          <p className="text-xs opacity-80 mb-1">🎣 找到这个词的鱼：</p>
          <h2 className="text-2xl font-black drop-shadow-lg">{currentWord?.meaning || ''}</h2>
        </div>
      </div>

      {/* 水族馆区域 */}
      <div
        className="relative overflow-hidden rounded-2xl border-4 border-blue-300 shadow-xl"
        style={{
          height: '360px',
          background: 'linear-gradient(180deg, #87CEEB 0%, #4A90D9 30%, #2563EB 60%, #1E40AF 80%, #1E3A5F 100%)',
        }}
      >
        {/* 水面光线 */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/20 to-transparent" />

        {/* 气泡 */}
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full border border-white/30"
            style={{
              left: `${bubble.x}%`,
              bottom: `${100 - bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* 水底装饰 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around pointer-events-none">
          <span className="text-2xl opacity-60">🌊</span>
          <span className="text-xl opacity-40">🪸</span>
          <span className="text-2xl opacity-50">🌿</span>
          <span className="text-xl opacity-40">🪨</span>
          <span className="text-2xl opacity-60">🐚</span>
        </div>

        {/* 鱼 */}
        {fishes.map(fish => (
          <div
            key={fish.id}
            onClick={() => handleFishClick(fish)}
            className={`absolute cursor-pointer transition-opacity duration-300 ${
              fish.caught ? 'opacity-0 scale-0' : 'opacity-100'
            } ${selectedFishId === fish.id && !fish.caught ? 'ring-4 ring-yellow-400 rounded-full' : ''}`}
            style={{
              left: `${fish.x}px`,
              top: `${fish.y}px`,
              transform: `scale(${fish.size}) ${fish.direction === -1 ? 'scaleX(-1)' : ''}`,
              transition: fish.caught ? 'all 0.5s ease-out' : 'none',
              zIndex: 10,
            }}
          >
            {/* 鱼身体 */}
            <div className="relative flex flex-col items-center">
              {/* 鱼 emoji */}
              <span
                className="text-4xl block"
                style={{
                  animation: `fishWobble ${fish.wobbleSpeed}s ease-in-out infinite`,
                  filter: fish.caught ? 'brightness(1.5)' : 'none',
                }}
              >
                {fish.emoji}
              </span>
              {/* 单词标签 */}
              <div
                className={`mt-1 px-2.5 py-1 rounded-lg bg-gradient-to-r ${fish.color} text-white text-xs font-bold shadow-md whitespace-nowrap`}
                style={{ transform: `scaleX(${fish.direction === -1 ? -1 : 1})` }}
              >
                {fish.word}
              </div>
            </div>

            {/* 被捕获特效 */}
            {caughtAnimation === fish.id && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-5xl animate-bounce">✨</span>
              </div>
            )}
          </div>
        ))}

        {/* 答对/答错反馈覆盖层 */}
        {showFeedback && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-20 ${
              showFeedback.correct ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            <div className={`text-center animate-bounce-in ${
              showFeedback.correct ? 'text-green-100' : 'text-red-100'
            }`}>
              <span className="text-5xl block mb-2">
                {showFeedback.correct ? '🎉' : '❌'}
              </span>
              <p className="text-lg font-bold text-white drop-shadow-lg">
                {showFeedback.correct ? '钓到了！' : `正确：${showFeedback.word}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 连击特效弹窗 */}
      {showCombo && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-xl">
            <span className="text-lg font-black">{comboText}</span>
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-400">
          🎯 点击正确的鱼 · 🐟 鱼越游越快 · ❤️ 答错扣命（共5条）
        </p>
      </div>

      <style jsx>{`
        @keyframes fishWobble {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(2deg); }
          75% { transform: translateY(5px) rotate(-2deg); }
        }
      `}</style>
    </div>
  )
}
