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

interface WordScrambleModeProps {
  words: Word[]
  onComplete: (score: number, totalWords: number) => void
  onBack: () => void
  onAnswer?: (wordId: string, isCorrect: boolean) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface LetterTile {
  id: string
  letter: string
  selected: boolean
  correctPosition: number // 在正确答案中的位置
}

export default function WordScrambleMode({ words, onComplete, onBack, onAnswer }: WordScrambleModeProps) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'complete'>('start')
  const [shuffledWords, setShuffledWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(5)
  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([])
  const [selectedTiles, setSelectedTiles] = useState<LetterTile[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [comboText, setComboText] = useState('')
  const [lifeLostFlash, setLifeLostFlash] = useState(false)
  const [shakeWrong, setShakeWrong] = useState(false)
  const [perfectRound, setPerfectRound] = useState(true)
  const [showingCorrect, setShowingCorrect] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef(0)
  const correctCountRef = useRef(0)
  const streakRef = useRef(0)
  const livesRef = useRef(5)
  const currentIndexRef = useRef(0)
  const processingRef = useRef(false)
  const perfectRef = useRef(true)

  const currentWord = shuffledWords[currentIndex]

  // 生成打乱的字母瓷砖
  const generateTiles = useCallback((word: string): LetterTile[] => {
    const letters = word.split('')
    const tiles: LetterTile[] = letters.map((letter, i) => ({
      id: `tile-${currentIndexRef.current}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      letter: letter.toUpperCase(),
      selected: false,
      correctPosition: i,
    }))
    return shuffleArray(tiles)
  }, [])

  // 开始游戏
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(words)
    setShuffledWords(shuffled)
    currentIndexRef.current = 0
    setCurrentIndex(0)
    scoreRef.current = 0
    correctCountRef.current = 0
    setScore(0)
    streakRef.current = 0
    setStreak(0)
    livesRef.current = 5
    setLives(5)
    setSelectedTiles([])
    setShowResult(false)
    setIsCorrectAnswer(false)
    setHintsUsed(0)
    setShowCombo(false)
    setLifeLostFlash(false)
    setShakeWrong(false)
    processingRef.current = false
    perfectRef.current = true
    setPerfectRound(true)
    setShowingCorrect(false)

    if (shuffled.length > 0) {
      setLetterTiles(generateTiles(shuffled[0].word))
    }
    setPhase('playing')
  }, [words, generateTiles])

  // 点击字母瓷砖
  const handleTileClick = useCallback((tile: LetterTile) => {
    if (showResult || processingRef.current || tile.selected) return
    sounds.click()
    vibrate(20)

    // 标记为已选
    setLetterTiles(prev => prev.map(t => t.id === tile.id ? { ...t, selected: true } : t))
    setSelectedTiles(prev => [...prev, tile])
  }, [showResult])

  // 移除已选字母（点击已选区域的字母）
  const handleRemoveTile = useCallback((tile: LetterTile) => {
    if (showResult || processingRef.current) return
    sounds.click()
    vibrate(20)

    setLetterTiles(prev => prev.map(t => t.id === tile.id ? { ...t, selected: false } : t))
    setSelectedTiles(prev => prev.filter(t => t.id !== tile.id))
  }, [showResult])

  // 提交答案
  const handleSubmit = useCallback(() => {
    if (showResult || processingRef.current || selectedTiles.length === 0) return
    if (!currentWord) return
    processingRef.current = true

    const userAnswer = selectedTiles.map(t => t.letter).join('').toLowerCase()
    const correctAnswer = currentWord.word.toLowerCase()
    const correct = userAnswer === correctAnswer

    setShowResult(true)
    setIsCorrectAnswer(correct)

    if (correct) {
      // 答对
      const newStreak = streakRef.current + 1
      streakRef.current = newStreak
      correctCountRef.current += 1
      const bonus = newStreak >= 3 ? 2 : 1
      scoreRef.current += bonus
      setScore(scoreRef.current)
      setStreak(newStreak)
      sounds.correct()
      vibrate(100)

      if (onAnswer && currentWord.word_id) onAnswer(currentWord.word_id, true)

      // 连击特效
      if (newStreak >= 3) {
        const texts: Record<number, string> = {
          3: '🔥 三连拼！', 5: '⚡ 五连拼！', 7: '💥 超级连拼！', 10: '🌟 拼写之王！'
        }
        const text = texts[Math.min(newStreak, 10)] || `💫 ×${newStreak} 连拼！`
        setComboText(text)
        setShowCombo(true)
        sounds.streak()
        setTimeout(() => setShowCombo(false), 1200)
      }

      // 自动进入下一题
      setTimeout(() => {
        moveToNext()
      }, 1200)
    } else {
      // 答错
      streakRef.current = 0
      setStreak(0)
      perfectRef.current = false
      setPerfectRound(false)
      livesRef.current -= 1
      setLives(livesRef.current)
      setLifeLostFlash(true)
      setShakeWrong(true)
      sounds.wrong()
      vibrate(200)

      if (onAnswer && currentWord.word_id) onAnswer(currentWord.word_id, false)

      setTimeout(() => {
        setLifeLostFlash(false)
        setShakeWrong(false)
      }, 600)

      if (livesRef.current <= 0) {
        // 最后一命也显示正确拼写
        setTimeout(() => {
          if (currentWord) {
            const correctTiles = currentWord.word.toUpperCase().split('').map((letter, i) => ({
              id: `correct-${i}-${Math.random().toString(36).slice(2, 6)}`,
              letter,
              selected: true,
              correctPosition: i,
            }))
            setSelectedTiles(correctTiles)
            setShowingCorrect(true)
          }
        }, 800)
        setTimeout(() => {
          setPhase('complete')
          if (correctCountRef.current >= shuffledWords.length * 0.7 && containerRef.current) {
            createConfetti(containerRef.current, 60)
          }
          onComplete(correctCountRef.current, shuffledWords.length)
          processingRef.current = false
        }, 2500)
      } else {
        setTimeout(() => {
          // 答错后自动显示正确拼写：用正确字母填充已选区
          if (currentWord) {
            const correctTiles = currentWord.word.toUpperCase().split('').map((letter, i) => ({
              id: `correct-${i}-${Math.random().toString(36).slice(2, 6)}`,
              letter,
              selected: true,
              correctPosition: i,
            }))
            setSelectedTiles(correctTiles)
            setShowingCorrect(true)
          }
        }, 800)
        setTimeout(() => {
          moveToNext()
        }, 2500)
      }
    }
  }, [showResult, selectedTiles, currentWord, shuffledWords, onAnswer, onComplete])

  const moveToNext = useCallback(() => {
    setShowResult(false)
    setIsCorrectAnswer(false)
    setSelectedTiles([])
    setShowingCorrect(false)
    processingRef.current = false

    const nextIdx = currentIndexRef.current + 1
    if (nextIdx >= shuffledWords.length) {
      setPhase('complete')
      if (correctCountRef.current >= shuffledWords.length * 0.7) {
        sounds.complete()
        if (containerRef.current) createConfetti(containerRef.current, 60)
      }
      onComplete(correctCountRef.current, shuffledWords.length)
    } else {
      currentIndexRef.current = nextIdx
      setCurrentIndex(nextIdx)
      setLetterTiles(generateTiles(shuffledWords[nextIdx].word))
      setHintsUsed(0)
    }
  }, [shuffledWords, generateTiles, onComplete])

  // 提示功能
  const handleHint = useCallback(() => {
    if (!currentWord || showResult) return
    sounds.click()

    // 找到下一个应该被选中的字母
    const correctLetters = currentWord.word.toUpperCase().split('')
    const currentSelected = selectedTiles.map(t => t.letter)
    const nextPosition = currentSelected.length

    if (nextPosition >= correctLetters.length) return

    const targetLetter = correctLetters[nextPosition]
    const availableTile = letterTiles.find(t => !t.selected && t.letter === targetLetter && t.correctPosition === nextPosition)

    if (availableTile) {
      setLetterTiles(prev => prev.map(t => t.id === availableTile.id ? { ...t, selected: true } : t))
      setSelectedTiles(prev => [...prev, availableTile])
      setHintsUsed(prev => prev + 1)
    }
  }, [currentWord, showResult, selectedTiles, letterTiles])

  // Enter 键提交答案
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && phase === 'playing' && !showResult && !processingRef.current && selectedTiles.length > 0) {
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, showResult, selectedTiles.length, handleSubmit])

  // ===== 开始界面 =====
  if (phase === 'start') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-100 opacity-30" />
          <div className="relative">
            <div className="text-6xl mb-4">🔤</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">字母拼拼乐</h2>
            <p className="text-gray-600 mb-4">看中文意思，把打乱的字母拼成正确的英文单词！</p>

            <div className="bg-orange-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-orange-800 font-medium mb-2">🎯 游戏规则：</p>
              <ul className="text-xs text-orange-700 space-y-1.5">
                <li>📝 上方显示中文意思和音标</li>
                <li>🔤 下方有打乱顺序的字母瓷砖</li>
                <li>👆 点击字母按正确顺序拼出单词</li>
                <li>❌ 点击已选字母可以撤回</li>
                <li>💡 可以用提示查看下一个字母</li>
                <li>❤️ 5 条命，答错扣 1 条</li>
                <li>🔥 连续拼对触发连击加分！</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-3 mb-6">
              <p className="text-xs text-yellow-800">💡 小技巧：先看清音标，再按发音顺序拼字母！</p>
            </div>

            <button onClick={startGame} className="btn-primary text-lg px-8 py-4">
              开始拼写 🔤
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
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-100 opacity-30" />
          <div className="relative">
            <span className="text-6xl mb-4 block">
              {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : lives <= 0 ? '💀' : '💪'}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {lives <= 0 ? '拼写结束！' : '拼写完成！'}
            </h2>

            <div className="my-6">
              <div className="text-6xl font-bold text-orange-600 mb-2">{grade}</div>
              <p className="text-gray-600">
                拼对 <span className="font-bold text-green-600 text-2xl">{actualCorrect}</span> / {shuffledWords.length} 个词
              </p>
              <p className="text-gray-600 mt-1">
                正确率 <span className="font-bold text-blue-600 text-xl">{percentage}%</span>
              </p>
              <p className="text-orange-500 font-bold mt-1">
                获得 <span className="text-xl">{actualCorrect * 12}</span> 积分 ⭐
              </p>
              {hintsUsed > 0 && (
                <p className="text-gray-500 text-sm mt-1">使用了 {hintsUsed} 次提示</p>
              )}
              {perfectRound && actualCorrect === shuffledWords.length && (
                <p className="text-orange-500 font-bold mt-2 animate-bounce">🌟 全部拼对！完美！</p>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={onBack} className="btn-primary">返回</button>
              <button onClick={startGame} className="btn-success">再拼一次 🔤</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== 游戏界面 =====
  const progressPercent = ((currentIndex + 1) / shuffledWords.length) * 100
  const userWord = selectedTiles.map(t => t.letter).join('')
  const correctWord = currentWord?.word?.toUpperCase() || ''

  return (
    <div ref={containerRef} className="max-w-md mx-auto relative select-none">
      {/* 顶部信息栏 */}
      <div className="flex justify-between items-center mb-3">
        <div className={`flex items-center gap-0.5 transition-all ${lifeLostFlash ? 'animate-shake' : ''}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-base transition-all duration-300 ${i < lives ? 'scale-100 opacity-100' : 'scale-75 opacity-30'}`}>
              {i < lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-600 font-medium">🔤 {currentIndex + 1}/{shuffledWords.length}</span>
        <span className="text-sm font-bold text-orange-600">⭐ {score}</span>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-3">
        <div className="progress-fill bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* 连击显示 */}
      {streak >= 2 && (
        <div className="text-center mb-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg ${
            streak >= 6 ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' :
            streak >= 4 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
            'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}>
            🔥 ×{streak} 连拼
          </span>
        </div>
      )}

      {/* 中文意思提示 */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-2xl p-4 mb-4 text-white text-center shadow-lg">
        <p className="text-xs opacity-80 mb-1">🔤 拼出这个词：</p>
        <h2 className="text-2xl font-black drop-shadow-lg">{currentWord?.meaning || ''}</h2>
        {currentWord?.phonetic && (
          <p className="text-sm opacity-75 mt-1 font-mono">{currentWord.phonetic}</p>
        )}
        <p className="text-xs opacity-60 mt-1">({currentWord?.word?.length || 0} 个字母)</p>
      </div>

      {/* 已选字母区域 */}
      <div className={`bg-white rounded-2xl border-2 p-4 mb-4 min-h-[64px] shadow-inner transition-all duration-300 ${
        shakeWrong ? 'border-red-400 animate-shake' :
        showingCorrect ? 'border-green-400 bg-green-50' :
        showResult && isCorrectAnswer ? 'border-green-400 bg-green-50' :
        showResult && !isCorrectAnswer ? 'border-red-400 bg-red-50' :
        'border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-2 justify-center min-h-[40px] items-center">
          {selectedTiles.length === 0 ? (
            <p className="text-gray-300 text-sm">点击下方字母拼出单词...</p>
          ) : (
            selectedTiles.map((tile, i) => (
              <button
                key={tile.id}
                onClick={() => handleRemoveTile(tile)}
                disabled={showResult}
                className={`w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center transition-all duration-200 ${
                  showingCorrect
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md'
                    : showResult && isCorrectAnswer
                    ? 'bg-green-500 text-white shadow-md'
                    : showResult && !isCorrectAnswer
                    ? 'bg-red-400 text-white'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md hover:scale-110 active:scale-95'
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {tile.letter}
              </button>
            ))
          )}
        </div>

        {/* 答案反馈文字 */}
        {showResult && (
          <div className="mt-2 text-center animate-bounce-in">
            {isCorrectAnswer ? (
              <p className="text-green-600 font-bold text-sm">✅ 拼写正确！</p>
            ) : showingCorrect ? (
              <p className="text-green-700 font-bold text-sm">👆 这是正确拼法，记住了！</p>
            ) : (
              <div>
                <p className="text-red-600 font-bold text-sm">❌ 拼写错误</p>
                <p className="text-gray-600 text-xs mt-0.5">正在显示正确答案...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 字母瓷砖 */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {letterTiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            disabled={tile.selected || showResult}
            className={`w-12 h-12 rounded-xl font-bold text-xl flex items-center justify-center transition-all duration-200 ${
              tile.selected
                ? 'bg-gray-200 text-gray-400 scale-90 opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg hover:scale-110 hover:shadow-xl active:scale-95'
            }`}
          >
            {tile.letter}
          </button>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mb-3">
        {!showResult ? (
          <>
            <button
              onClick={handleHint}
              disabled={selectedTiles.length >= correctWord.length}
              className="flex-1 bg-yellow-100 text-yellow-800 font-bold py-3 px-4 rounded-xl hover:bg-yellow-200 transition-all disabled:opacity-40"
            >
              💡 提示
            </button>
            <button
              onClick={() => {
                // 清空已选
                setLetterTiles(prev => prev.map(t => ({ ...t, selected: false })))
                setSelectedTiles([])
                sounds.click()
              }}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all"
            >
              🔄 重置
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedTiles.length === 0}
              className="flex-1 btn-primary py-3 disabled:opacity-40"
            >
              确认 ✓
            </button>
          </>
        ) : (
          <button onClick={moveToNext} className="w-full btn-primary py-3 text-lg">
            {currentIndex < shuffledWords.length - 1 ? '下一题 →' : '完成 ✨'}
          </button>
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

      <p className="text-center text-xs text-gray-400 mt-2">
        点击字母拼写 · 点击已选字母撤回 · Enter 确认
      </p>
    </div>
  )
}
