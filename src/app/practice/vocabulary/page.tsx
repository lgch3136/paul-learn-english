'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { sounds } from '@/lib/sounds'
import { createConfetti, addConfettiStyle, vibrate } from '@/lib/animations'
import {
  achievements,
  checkAchievements,
  getRandomEncouragement,
  PlayerStats,
  Achievement,
  getCurrentLevel,
  getLevelProgress
} from '@/lib/gameification'
import {
  WordPerformance,
  initializePerformance,
  updatePerformance,
  selectNextQuestion,
  generatePracticeSequence,
  getPerformanceSummary,
  savePerformances,
  loadPerformances
} from '@/lib/question-scheduler'
import PracticeModeSelector, { PracticeMode } from '@/components/practice/PracticeModeSelector'
import UnitSelector, { GameScope } from '@/components/practice/UnitSelector'
import SpeedMode from '@/components/practice/SpeedMode'
import ChallengeMode from '@/components/practice/ChallengeMode'
import ListeningMode from '@/components/practice/ListeningMode'
import SpellingMode from '@/components/practice/SpellingMode'
import AchievementPopup from '@/components/gameification/AchievementPopup'
import PointsReward from '@/components/gameification/PointsReward'
import BackButton from '@/components/ui/BackButton'
import AnswerFeedback from '@/components/practice/AnswerFeedback'
import StreakCombo from '@/components/practice/StreakCombo'

// 生成干扰选项
function generateOptions(correctMeaning: string, allMeanings: string[]): string[] {
  const options = [correctMeaning]
  const otherMeanings = allMeanings.filter(m => m !== correctMeaning)

  while (options.length < 4 && otherMeanings.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherMeanings.length)
    options.push(otherMeanings[randomIndex])
    otherMeanings.splice(randomIndex, 1)
  }

  return options.sort(() => Math.random() - 0.5)
}

// 随机打乱数组
function shuffleArray<T extends unknown>(array: T[]): T[] {
  const shuffled: T[] = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1))
    const temp: T = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}

export default function VocabularyPractice() {
  const [vocabularyData, setVocabularyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null)
  const [gameScope, setGameScope] = useState<GameScope | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [encouragement, setEncouragement] = useState('')
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([])
  const [pointsReward, setPointsReward] = useState<{ points: number; message: string; icon: string } | null>(null)
  const [points, setPoints] = useState(0)
  const [stats, setStats] = useState<PlayerStats>({
    totalWords: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    streak: 0,
    maxStreak: 0,
    totalTime: 0,
    daysStudied: 1,
    perfectRounds: 0
  })
  const [performances, setPerformances] = useState<Map<string, WordPerformance>>(new Map())
  const [practiceSequence, setPracticeSequence] = useState<any[]>([])
  const [showStreakCombo, setShowStreakCombo] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState<{ isCorrect: boolean; message?: string; detail?: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 稳定的成就弹窗关闭回调（避免 onClosure 引用变化导致 useEffect 重置）
  const handleAchievementClose = useCallback(() => {
    // 保存成就到 localStorage（弹窗关闭后才保存，避免期间新答案重复触发）
    const pending = pendingAchievementRef.current
    if (pending) {
      pendingAchievementRef.current = null
      try {
        const saved = localStorage.getItem('paul_english_achievements')
        let currentUnlockedIds: string[] = saved ? JSON.parse(saved) : []
        if (!currentUnlockedIds.includes(pending.id)) {
          currentUnlockedIds.push(pending.id)
          localStorage.setItem('paul_english_achievements', JSON.stringify(currentUnlockedIds))
          setUnlockedAchievementIds(currentUnlockedIds)
        }
      } catch (e) {
        console.error('保存成就失败:', e)
      }
    }
    setUnlockedAchievement(null)
  }, [])

  // 初始化
  useEffect(() => {
    addConfettiStyle()
    const savedPerformances = loadPerformances()
    setPerformances(savedPerformances)

    // 加载已解锁的成就和积分
    try {
      const savedAchievements = localStorage.getItem('paul_english_achievements')
      if (savedAchievements) {
        setUnlockedAchievementIds(JSON.parse(savedAchievements))
      }
      const savedPoints = localStorage.getItem('paul_english_points')
      if (savedPoints) {
        setPoints(parseInt(savedPoints))
      }
    } catch (e) {
      console.error('加载成就数据失败:', e)
    }
  }, [])

  // 持久化积分
  useEffect(() => {
    if (points > 0) {
      try {
        localStorage.setItem('paul_english_points', points.toString())
      } catch (e) { /* ignore */ }
    }
  }, [points])

  // 加载单词数据
  const loadVocabulary = async (scope: GameScope) => {
    try {
      setLoading(true)
      let allVocabulary: any[] = []

      const unitsToLoad = scope.units
      for (const unit of unitsToLoad) {
        try {
          const response = await fetch(`/api/vocabulary?unit=${encodeURIComponent(unit)}`)
          const data = await response.json()
          if (data.success && data.vocabulary) {
            allVocabulary = [...allVocabulary, ...data.vocabulary]
          }
        } catch (e) {
          console.error(`加载 ${unit} 失败:`, e)
        }
      }

      // 去重
      const seen = new Set<string>()
      const unique = allVocabulary.filter(w => {
        if (seen.has(w.word_id)) return false
        seen.add(w.word_id)
        return true
      })

      if (unique.length > 0) {
        const shuffled = shuffleArray(unique)
        setVocabularyData(shuffled)

        const count = Math.min(scope.questionCount, shuffled.length)
        const sequence = generatePracticeSequence(shuffled, performances, count)
        setPracticeSequence(sequence)

        if (sequence.length > 0) {
          const allMeanings = shuffled.map(v => v.meaning)
          setCurrentOptions(generateOptions(sequence[0].meaning, allMeanings))
        }
      }
    } catch (error) {
      console.error('加载单词数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 重新生成练习序列（切换模式时调用，确保每次随机不同）
  const regenerateSequence = () => {
    if (vocabularyData.length === 0 || !gameScope) return
    const shuffled = shuffleArray(vocabularyData)
    setVocabularyData(shuffled)
    const count = Math.min(gameScope.questionCount, shuffled.length)
    const sequence = generatePracticeSequence(shuffled, performances, count)
    setPracticeSequence(sequence)
    if (sequence.length > 0) {
      const allMeanings = shuffled.map(v => v.meaning)
      setCurrentOptions(generateOptions(sequence[0].meaning, allMeanings))
    }
  }

  // 处理范围选择
  const handleScopeSelect = (scope: GameScope) => {
    sounds.correct()
    setGameScope(scope)
    loadVocabulary(scope)
  }

  const currentWord = practiceSequence[currentIndex]

  // 获取累计统计数据（结合历史性能数据和本次会话）
  const getCumulativeStats = (sessionStats: PlayerStats, latestPerformances: Map<string, WordPerformance>): PlayerStats => {
    let totalCorrect = 0
    let totalWrong = 0
    let maxConsecutive = 0
    latestPerformances.forEach(p => {
      totalCorrect += p.correctCount
      totalWrong += p.wrongCount
      maxConsecutive = Math.max(maxConsecutive, p.consecutiveCorrect)
    })
    maxConsecutive = Math.max(maxConsecutive, sessionStats.maxStreak)

    // 计算连续学习天数
    let daysStudied = 1
    try {
      const streakStr = localStorage.getItem('paul_english_streak')
      if (streakStr) daysStudied = parseInt(streakStr)
    } catch (e) {}

    return {
      totalWords: latestPerformances.size,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      streak: sessionStats.streak,
      maxStreak: maxConsecutive,
      totalTime: sessionStats.totalTime,
      daysStudied,
      perfectRounds: sessionStats.perfectRounds
    }
  }

  // 待展示的成就（用于延迟弹窗显示，避免在弹窗前就保存 localStorage）
  const pendingAchievementRef = useRef<Achievement | null>(null)

  // 检查成就 - 只弹出新解锁的成就
  const checkForAchievements = (sessionStats: PlayerStats, currentPoints: number, latestPerformances: Map<string, WordPerformance>) => {
    const cumulativeStats = getCumulativeStats(sessionStats, latestPerformances)
    console.log('[成就] 累计统计:', cumulativeStats)
    const allMatching = checkAchievements(cumulativeStats)
    console.log('[成就] 符合条件:', allMatching.map(a => a.id))
    // 重新从 localStorage 读取最新解锁状态，避免闭包陈旧
    let currentUnlockedIds: string[] = []
    try {
      const saved = localStorage.getItem('paul_english_achievements')
      if (saved) currentUnlockedIds = JSON.parse(saved)
    } catch (e) {}
    // 过滤出尚未解锁的新成就
    const newlyUnlocked = allMatching.filter(a => !currentUnlockedIds.includes(a.id))
    console.log('[成就] 新解锁:', newlyUnlocked.map(a => a.id), '已有:', currentUnlockedIds)

    if (newlyUnlocked.length > 0) {
      const latestAchievement = newlyUnlocked[newlyUnlocked.length - 1]

      // 延迟显示成就弹窗，等 AnswerFeedback 先播放完毕
      setTimeout(() => {
        console.log('[成就] 显示弹窗:', latestAchievement.id)
        setUnlockedAchievement(latestAchievement)
      }, 1500)

      // 更新积分（立即）
      const rewardPoints = newlyUnlocked.reduce((sum, a) => sum + a.reward, 0)
      const newPoints = currentPoints + rewardPoints
      setPoints(newPoints)

      // 标记待展示的成就（在弹窗关闭后再保存到 localStorage，避免期间新答案重复触发）
      pendingAchievementRef.current = latestAchievement
    }
  }

  // 处理答案选择
  const handleAnswerSelect = (answer: string) => {
    if (showResult || !currentWord) return

    sounds.click()
    vibrate(30)

    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === currentWord.meaning

    // 更新单词表现记录
    const wordId = currentWord.word_id
    const currentPerf = performances.get(wordId) || initializePerformance(wordId)
    const updatedPerf = updatePerformance(currentPerf, isCorrect)
    const newPerformances = new Map(performances)
    newPerformances.set(wordId, updatedPerf)
    setPerformances(newPerformances)
    savePerformances(newPerformances)

    if (isCorrect) {
      const newStreak = streak + 1
      const earnedPoints = 10 + (newStreak >= 3 ? 5 : 0)
      setScore(score + 1)
      setStreak(newStreak)
      setPoints(points + earnedPoints)
      setEncouragement(getRandomEncouragement('correct'))

      setAnswerFeedback({
        isCorrect: true,
        message: newStreak >= 3 ? `🔥 ${newStreak}连击！` : '答对了！',
      })

      const newStats: PlayerStats = {
        ...stats,
        totalWords: stats.totalWords + 1,
        correctAnswers: stats.correctAnswers + 1,
        streak: newStreak,
        maxStreak: Math.max(stats.maxStreak, newStreak)
      }
      setStats(newStats)
      checkForAchievements(newStats, points + earnedPoints, newPerformances)

      sounds.correct()
      vibrate(100)

      if (newStreak >= 3) {
        setTimeout(() => {
          sounds.streak()
          setShowStreakCombo(true)
          setEncouragement(getRandomEncouragement('streak'))
        }, 800)
      }

      if (currentIndex === practiceSequence.length - 1) {
        const perfectStats: PlayerStats = {
          ...newStats,
          perfectRounds: stats.perfectRounds + 1
        }
        setStats(perfectStats)
        checkForAchievements(perfectStats, points + earnedPoints, newPerformances)

        setTimeout(() => {
          sounds.complete()
          setShowConfetti(true)
          setEncouragement(getRandomEncouragement('complete'))
          if (containerRef.current) {
            createConfetti(containerRef.current, 100)
          }
        }, 500)
      }
    } else {
      setStreak(0)
      setEncouragement(getRandomEncouragement('wrong'))

      setAnswerFeedback({
        isCorrect: false,
        message: '答错了！',
        detail: `正确答案：${currentWord.meaning}`
      })

      const newStats: PlayerStats = {
        ...stats,
        wrongAnswers: stats.wrongAnswers + 1,
        streak: 0
      }
      setStats(newStats)

      sounds.wrong()
      vibrate(200)
    }
  }

  // 下一题
  const handleNext = () => {
    if (currentIndex < practiceSequence.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedAnswer(null)
      setShowResult(false)
      setEncouragement('')

      // 生成下一题的选项
      const nextWord = practiceSequence[nextIndex]
      const allMeanings = vocabularyData.map(v => v.meaning)
      setCurrentOptions(generateOptions(nextWord.meaning, allMeanings))
    }
  }

  // 重新开始
  const handleRestart = () => {
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setShowConfetti(false)
    setSelectedAnswer(null)
    setShowResult(false)
    setEncouragement('')

    // 重新随机打乱
    const shuffled = shuffleArray(vocabularyData)
    setVocabularyData(shuffled)
    
    const count = Math.min(gameScope?.questionCount || 10, shuffled.length)
    const sequence = generatePracticeSequence(shuffled, performances, count)
    setPracticeSequence(sequence)

    const allMeanings = shuffled.map(v => v.meaning)
    setCurrentOptions(generateOptions(sequence[0].meaning, allMeanings))
  }

  const isCorrect = currentWord ? selectedAnswer === currentWord.meaning : false
  const currentLevel = getCurrentLevel(points)
  const levelProgress = getLevelProgress(points)
  const performanceSummary = getPerformanceSummary(performances)

  // 范围选择界面
  if (!gameScope) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <BackButton href="/" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🔤 单词闯关
          </h1>
          <p className="text-gray-600">选择练习范围和题量</p>
        </header>

        <UnitSelector onSelect={handleScopeSelect} />
      </main>
    )
  }

  // 模式选择界面
  if (!practiceMode) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setGameScope(null)}
              className="text-blue-500 hover:text-blue-600"
            >
              ← 切换范围
            </button>
            <BackButton href="/" label="首页" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🔤 单词闯关
          </h1>
          <p className="text-gray-600">{gameScope.label} · {gameScope.questionCount} 题 · 选择练习模式</p>
        </header>

        {/* 学习统计卡片 */}
        <div className="max-w-md mx-auto mb-6">
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{performanceSummary.mastered}</p>
                <p className="text-xs text-gray-600">已掌握</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{performanceSummary.learning}</p>
                <p className="text-xs text-gray-600">学习中</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{performanceSummary.struggling}</p>
                <p className="text-xs text-gray-600">需加强</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{performanceSummary.unseen}</p>
                <p className="text-xs text-gray-600">未学习</p>
              </div>
            </div>
          </div>
        </div>

        {/* 积分和等级 */}
        <div className="max-w-md mx-auto mb-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentLevel.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">Lv.{currentLevel.level} {currentLevel.title}</span>
                  <span className="text-blue-600 font-semibold">{points} 积分</span>
                </div>
                <div className="progress-bar h-2">
                  <div className="progress-fill" style={{ width: `${levelProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PracticeModeSelector onSelect={(mode) => {
          regenerateSequence()
          setPracticeMode(mode)
        }} />
      </main>
    )
  }

  // 听力模式
  if (practiceMode === 'listening') {
    return (
      <ListeningMode
        words={practiceSequence.map(v => ({ word: v.word, meaning: v.meaning, phonetic: v.phonetic }))}
        onComplete={(score, total) => {
          console.log('听力模式完成:', score, total)
        }}
        onBack={() => setPracticeMode(null)}
      />
    )
  }

  // 拼写模式
  if (practiceMode === 'spelling') {
    return (
      <SpellingMode
        words={practiceSequence.map(v => ({ word: v.word, meaning: v.meaning, phonetic: v.phonetic }))}
        onComplete={(score, total) => {
          console.log('拼写模式完成:', score, total)
        }}
        onBack={() => setPracticeMode(null)}
      />
    )
  }

  // 速度模式
  if (practiceMode === 'speed') {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <button
            onClick={() => setPracticeMode(null)}
            className="text-blue-500 hover:text-blue-600 mb-4"
          >
            ← 返回模式选择
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            ⚡ 闪电速度模式
          </h1>
          <p className="text-gray-600">限时 10 秒，快速答题</p>
        </header>

        <SpeedMode
          words={practiceSequence.map(v => ({ word: v.word, meaning: v.meaning, phonetic: v.phonetic }))}
          onComplete={(score, total) => {
            console.log('速度模式完成:', score, total)
          }}
          onBack={() => setPracticeMode(null)}
        />
      </main>
    )
  }

  // 挑战模式
  if (practiceMode === 'challenge') {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <button
            onClick={() => setPracticeMode(null)}
            className="text-blue-500 hover:text-blue-600 mb-4"
          >
            ← 返回模式选择
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🏆 闯关挑战模式
          </h1>
          <p className="text-gray-600">连续答对 10 题通关</p>
        </header>

        <ChallengeMode
          words={practiceSequence.map(v => ({ word: v.word, meaning: v.meaning, phonetic: v.phonetic }))}
          onComplete={(success, streak) => {
            if (success) {
              sounds.complete()
              const earnedPoints = 50 + streak * 5
              setPoints(points + earnedPoints)
              setPointsReward({
                points: earnedPoints,
                message: '恭喜通关！',
                icon: '🏆'
              })
            }
          }}
          onBack={() => setPracticeMode(null)}
        />
      </main>
    )
  }

  // 复习模式 - 筛选错题重练
  if (practiceMode === 'review') {
    const wrongWords = practiceSequence.filter(v => {
      const p = performances.get(v.word_id)
      return p && (p.consecutiveWrong >= 1 || (p.wrongCount > 0 && p.wrongCount / (p.correctCount + p.wrongCount) > 0.3))
    })

    if (wrongWords.length === 0) {
      return (
        <main className="min-h-screen p-4 sm:p-8">
          <header className="text-center mb-8">
            <button onClick={() => setPracticeMode(null)} className="text-blue-500 hover:text-blue-600 mb-4">
              ← 返回模式选择
            </button>
          </header>
          <div className="max-w-md mx-auto card text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h2 className="text-xl font-bold text-gray-800 mb-4">没有错题！</h2>
            <p className="text-gray-600 mb-6">你当前范围内没有需要复习的错词，太棒了！</p>
            <button onClick={() => setPracticeMode(null)} className="btn-primary">返回模式选择</button>
          </div>
        </main>
      )
    }

    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <button onClick={() => setPracticeMode(null)} className="text-blue-500 hover:text-blue-600 mb-4">
            ← 返回模式选择
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🔄 错题复习</h1>
          <p className="text-gray-600">找到 {wrongWords.length} 个需要复习的词</p>
        </header>
        <div className="max-w-md mx-auto">
          <div className="space-y-3 mb-6">
            {wrongWords.slice(0, 10).map((v, i) => {
              const p = performances.get(v.word_id)
              const errorRate = p ? Math.round((p.wrongCount / (p.correctCount + p.wrongCount)) * 100) : 0
              return (
                <div key={v.word_id} className="card flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">{v.word}</span>
                    <span className="text-gray-500 ml-2">{v.meaning}</span>
                  </div>
                  <span className="text-sm text-red-600">错误率 {errorRate}%</span>
                </div>
              )
            })}
          </div>
          <div className="text-center">
            <button onClick={() => setPracticeMode(null)} className="btn-primary">返回模式选择</button>
          </div>
        </div>
      </main>
    )
  }

  // 加载中
  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载单词数据...</p>
        </div>
      </main>
    )
  }

  if (vocabularyData.length === 0) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-600">未找到单词数据</p>
          <Link href="/" className="btn-primary inline-block mt-4">返回首页</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 sm:p-8" ref={containerRef}>
      {/* 连击动效 */}
      {showStreakCombo && streak >= 3 && (
        <StreakCombo streak={streak} visible={showStreakCombo} onDone={() => setShowStreakCombo(false)} />
      )}

      {/* 成就弹窗 */}
      {unlockedAchievement && (
        <AchievementPopup
          achievement={unlockedAchievement}
          onClose={handleAchievementClose}
        />
      )}

      {/* 积分奖励 */}
      {pointsReward && (
        <PointsReward
          points={pointsReward.points}
          message={pointsReward.message}
          icon={pointsReward.icon}
          onComplete={() => setPointsReward(null)}
        />
      )}

      {/* 答题反馈弹窗 */}
      {answerFeedback && (
        <AnswerFeedback
          isCorrect={answerFeedback.isCorrect}
          message={answerFeedback.message}
          detail={answerFeedback.detail}
          onDone={() => setAnswerFeedback(null)}
        />
      )}

      {/* 头部 */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setPracticeMode(null)}
            className="text-blue-500 hover:text-blue-600"
          >
            ← 切换模式
          </button>
          <BackButton href="/" label="首页" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          🔤 单词闯关
        </h1>
        <p className="text-gray-600">{gameScope?.label} · 经典模式</p>
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
                <div className="progress-fill" style={{ width: `${levelProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 连续正确提示 */}
      {streak >= 3 && showResult && isCorrect && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold">🔥 连续 {streak} 个正确！太厉害了！</span>
          </div>
        </div>
      )}

      {/* 鼓励语 */}
      {encouragement && showResult && (
        <div className="max-w-md mx-auto mb-4 text-center animate-bounce-in">
          <span className="text-lg font-bold text-gray-700">{encouragement}</span>
        </div>
      )}

      {/* 进度条 */}
      <section className="max-w-md mx-auto mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>进度</span>
          <span>{currentIndex + 1} / {practiceSequence.length}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / practiceSequence.length) * 100}%` }}
          ></div>
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

      {/* 单词卡片 */}
      <section className="max-w-md mx-auto mb-8">
        <div className={`card transition-all duration-500 ${
          showResult
            ? isCorrect
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 animate-pulse-once'
              : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 animate-shake'
            : 'bg-gradient-to-br from-white to-gray-50'
        }`}>
          <div className="text-center mb-6">
            <div className="inline-block">
              <h2 className="text-5xl font-bold text-gray-800 mb-2 drop-shadow-sm">
                {currentWord?.word || ''}
              </h2>
              <p className="text-lg text-gray-500 font-medium">{currentWord?.phonetic || ''}</p>
            </div>
            <p className="text-gray-600 mt-4 italic text-lg">
              "{currentWord?.sentence || ''}"
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

          <p className="text-center text-gray-700 mb-4 font-medium text-lg">
            选出正确的中文意思：
          </p>

          <div className="grid grid-cols-2 gap-3">
            {currentOptions.map((option, index) => {
              const optionGradients = [
                'from-blue-400 to-blue-500',
                'from-purple-400 to-purple-500',
                'from-green-400 to-green-500',
                'from-orange-400 to-orange-500',
              ]

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
                      : `bg-gradient-to-br ${optionGradients[index]} text-white shadow-md hover:shadow-xl`
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

      {/* 结果反馈 */}
      {showResult && (
        <section className="max-w-md mx-auto mb-8 animate-bounce-in">
          <div className={`relative overflow-hidden rounded-2xl shadow-xl ${
            isCorrect
              ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-br from-orange-400 via-red-400 to-pink-500'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

            <div className="relative p-6 text-white text-center">
              <span className="text-5xl mb-3 block">
                {isCorrect ? '🎉' : '💪'}
              </span>
              <h3 className="text-2xl font-bold mb-2">
                {isCorrect ? '太棒了！' : '加油，再想想！'}
              </h3>
              <p className="opacity-90 text-lg mb-4">
                {isCorrect
                  ? '你已经掌握了这个单词的意思！'
                  : `正确答案是：${currentWord?.meaning || ''}`
                }
              </p>

              {currentWord?.phrase && currentWord.phrase.length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium mb-1 opacity-90">📝 常见短语：</p>
                  <p className="text-white">
                    {currentWord.phrase.slice(0, 3).join('、')}
                  </p>
                </div>
              )}

              {!isCorrect && currentWord?.error_tags && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <p className="text-sm font-bold mb-2">💡 错因分析：</p>
                  <div className="bg-white/30 rounded-lg p-3">
                    <p className="font-medium text-lg">{currentWord.error_tags[0]}</p>
                  </div>
                  <p className="text-sm mt-2 opacity-90">这个词明天还会再出现，到时候一定能记住！</p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 shadow-lg"
              >
                {currentIndex < practiceSequence.length - 1 ? '下一题 →' : '完成练习 🎊'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 庆祝完成 */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-bounce-in overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 text-white text-center">
              <span className="text-6xl mb-3 block">🏆</span>
              <h2 className="text-2xl font-bold">练习完成！</h2>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3 text-center">📊 学习统计</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{score}</p>
                    <p className="text-sm text-gray-600">答对题数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{points}</p>
                    <p className="text-sm text-gray-600">获得积分</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 text-center">📈 掌握情况</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">已掌握：{performanceSummary.mastered} 个</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600">学习中：{performanceSummary.learning} 个</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">需加强：{performanceSummary.struggling} 个</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-600">未学习：{performanceSummary.unseen} 个</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 hover:bg-gray-200"
                >
                  返回首页
                </Link>
                <button
                  onClick={handleRestart}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  再练一次
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-gray-500 text-sm pb-8">
        <p>完成练习后，系统会自动记录你的掌握情况</p>
      </footer>
    </main>
  )
}
