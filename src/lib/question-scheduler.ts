// 智能题目调度系统 - 核心算法
// 基于艾宾浩斯遗忘曲线 + 间隔重复理论，针对小学生特点优化

export interface WordPerformance {
  wordId: string
  correctCount: number
  wrongCount: number
  consecutiveCorrect: number
  consecutiveWrong: number
  lastSeen: number // timestamp
  lastCorrect: boolean
  totalSeen: number
}

export interface SchedulerState {
  performances: Map<string, WordPerformance>
  currentSession: {
    startTime: number
    questionsAnswered: number
    correctAnswers: number
    wrongAnswers: number
  }
}

// 初始化单词表现记录
export function initializePerformance(wordId: string): WordPerformance {
  return {
    wordId,
    correctCount: 0,
    wrongCount: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    lastSeen: 0,
    lastCorrect: false,
    totalSeen: 0
  }
}

// 更新单词表现
export function updatePerformance(
  perf: WordPerformance,
  isCorrect: boolean
): WordPerformance {
  const now = Date.now()
  return {
    ...perf,
    correctCount: isCorrect ? perf.correctCount + 1 : perf.correctCount,
    wrongCount: isCorrect ? perf.wrongCount : perf.wrongCount + 1,
    consecutiveCorrect: isCorrect ? perf.consecutiveCorrect + 1 : 0,
    consecutiveWrong: isCorrect ? 0 : perf.consecutiveWrong + 1,
    lastSeen: now,
    lastCorrect: isCorrect,
    totalSeen: perf.totalSeen + 1
  }
}

// 计算单词权重 - 基于遗忘曲线的间隔重复算法
// 权重越高 = 越需要练习
export function calculateWeight(perf: WordPerformance): number {
  // 1. 从未见过的单词 - 最高优先级
  if (perf.totalSeen === 0) {
    return 100
  }

  let weight = 10 // 基础权重

  // 2. 连续错误 - 紧急复习（小学生容易反复错同一个词）
  if (perf.consecutiveWrong >= 3) {
    weight += 90  // 非常紧急
  } else if (perf.consecutiveWrong >= 2) {
    weight += 70  // 紧急
  } else if (perf.consecutiveWrong >= 1) {
    weight += 45  // 需要关注
  }

  // 3. 累计错误率 - 反映长期薄弱点
  const total = perf.correctCount + perf.wrongCount
  if (total > 0) {
    const errorRate = perf.wrongCount / total
    weight += errorRate * 55  // 最高+55（100%错误率时）
  }

  // 4. 最近答错 - 短期记忆需要巩固
  if (!perf.lastCorrect && perf.wrongCount > 0) {
    weight += 35
  }

  // 5. 已掌握的词 - 大幅降低但仍保留少量权重用于定期复习
  //    小学生需要5次连续正确才算真正掌握（比成人更高）
  if (perf.consecutiveCorrect >= 5) {
    weight -= 35  // 掌握了，但仍偶尔复习
  } else if (perf.consecutiveCorrect >= 3) {
    weight -= 15  // 接近掌握，仍需巩固
  }

  // 6. 基于遗忘曲线的时间因素
  //    艾宾浩斯：20分钟后遗忘42%，1小时后遗忘56%，1天后遗忘74%
  //    小学生遗忘更快，间隔应更短
  const timeSinceLastSeen = Date.now() - perf.lastSeen
  const minutesSince = timeSinceLastSeen / (1000 * 60)

  if (minutesSince > 1440) {        // 超过1天
    weight += 40                     // 强制复习
  } else if (minutesSince > 720) {   // 超过12小时
    weight += 30
  } else if (minutesSince > 240) {   // 超过4小时
    weight += 20
  } else if (minutesSince > 60) {    // 超过1小时
    weight += 10
  }

  // 7. 答对次数越多，长期权重越低（但不会降到0，保证偶尔复习）
  if (perf.correctCount >= 10 && perf.consecutiveCorrect >= 3) {
    weight *= 0.3  // 高频正确词，权重降到30%
  } else if (perf.correctCount >= 5 && perf.consecutiveCorrect >= 3) {
    weight *= 0.5  // 中频正确词，权重降到50%
  }

  return Math.max(weight, 1) // 最低权重为1
}

// 将单词分类：新词 / 需要复习 / 已掌握
export function classifyWords(
  words: any[],
  performances: Map<string, WordPerformance>
): { newWords: any[]; reviewWords: any[]; masteredWords: any[] } {
  const newWords: any[] = []
  const reviewWords: any[] = []
  const masteredWords: any[] = []

  for (const word of words) {
    const perf = performances.get(word.word_id)
    if (!perf || perf.totalSeen === 0) {
      newWords.push(word)
    } else if (perf.consecutiveCorrect >= 5 && perf.correctCount >= 5) {
      masteredWords.push(word)
    } else {
      reviewWords.push(word)
    }
  }

  return { newWords, reviewWords, masteredWords }
}

// 加权随机选择算法
export function weightedRandomSelect<T>(
  items: T[],
  weights: number[]
): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  if (totalWeight <= 0) return items[0]
  let random = Math.random() * totalWeight

  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }

  return items[items.length - 1]
}

// 智能选择下一题
export function selectNextQuestion(
  words: any[],
  performances: Map<string, WordPerformance>,
  excludeWordId?: string
): any {
  const weights = words.map(word => {
    const perf = performances.get(word.word_id)
    if (!perf) return 100
    return calculateWeight(perf)
  })

  if (excludeWordId) {
    const excludeIndex = words.findIndex(w => w.word_id === excludeWordId)
    if (excludeIndex !== -1) {
      weights[excludeIndex] = 0
    }
  }

  return weightedRandomSelect(words, weights)
}

// 生成练习题目序列 - 教育学优化版
// 遵循"复习→新词→混合巩固"的三段式结构
export function generatePracticeSequence(
  words: any[],
  performances: Map<string, WordPerformance>,
  count: number = 10
): any[] {
  const actualCount = Math.min(count, words.length)
  const { newWords, reviewWords, masteredWords } = classifyWords(words, performances)

  // 比例分配：30% 新词 + 50% 需复习 + 20% 已掌握（巩固）
  // 但如果新词不够，多分配给复习
  let newCount = Math.ceil(actualCount * 0.3)
  let reviewCount = Math.ceil(actualCount * 0.5)
  let masterCount = actualCount - newCount - reviewCount

  // 调整：新词不够时补充到复习
  if (newWords.length < newCount) {
    const diff = newCount - newWords.length
    newCount = newWords.length
    reviewCount += diff
  }
  // 复习词不够时补充到已掌握
  if (reviewWords.length < reviewCount) {
    const diff = reviewCount - reviewWords.length
    reviewCount = reviewWords.length
    masterCount += diff
  }
  // 已掌握词不够时补充到复习
  if (masteredWords.length < masterCount) {
    reviewCount += masterCount - masteredWords.length
    masterCount = masteredWords.length
  }

  // 按权重从各组选词
  const pickWeighted = (pool: any[], n: number, usedSet: Set<string>): any[] => {
    if (pool.length === 0 || n <= 0) return []
    const available = pool.filter(w => !usedSet.has(w.word_id))
    if (available.length === 0) return []
    const pickCount = Math.min(n, available.length)
    const result: any[] = []
    const remaining = [...available]
    for (let i = 0; i < pickCount; i++) {
      const weights = remaining.map(w => {
        const perf = performances.get(w.word_id)
        return perf ? calculateWeight(perf) : 100
      })
      const selected = weightedRandomSelect(remaining, weights)
      result.push(selected)
      usedSet.add(selected.word_id)
      const idx = remaining.indexOf(selected)
      if (idx !== -1) remaining.splice(idx, 1)
    }
    return result
  }

  const usedIds = new Set<string>()

  // 第一段：先来2-3个复习热身词（唤醒记忆）
  const warmupCount = Math.min(2, reviewCount)
  const warmup = pickWeighted(reviewWords, warmupCount, usedIds)

  // 第二段：新词 + 剩余复习词交替排列
  const newPicks = pickWeighted(newWords, newCount, usedIds)
  const reviewPicks = pickWeighted(reviewWords, reviewCount - warmupCount, usedIds)
  const masterPicks = pickWeighted(masteredWords, masterCount, usedIds)

  // 交替排列新词和复习词（避免连续出现同类）
  const middle: any[] = []
  const allMixed = [...newPicks, ...reviewPicks]
  // 简单的交错：每2个复习词插1个新词
  let ni = 0, ri = 0
  let reviewBatch = 0
  while (ni < newPicks.length || ri < reviewPicks.length) {
    if (reviewBatch < 2 && ri < reviewPicks.length) {
      middle.push(reviewPicks[ri++])
      reviewBatch++
    } else if (ni < newPicks.length) {
      middle.push(newPicks[ni++])
      reviewBatch = 0
    } else if (ri < reviewPicks.length) {
      middle.push(reviewPicks[ri++])
      reviewBatch++
    }
  }

  // 第三段：已掌握词混入末尾巩固
  const sequence = [...warmup, ...middle, ...masterPicks]

  // 如果总数不够，用权重随机补满
  if (sequence.length < actualCount) {
    const usedSet = new Set(sequence.map(w => w.word_id))
    const remaining = words.filter(w => !usedSet.has(w.word_id))
    const extra = pickWeighted(remaining, actualCount - sequence.length, usedSet)
    sequence.push(...extra)
  }

  return sequence.slice(0, actualCount)
}

// 获取学习统计摘要
// "掌握"门槛提高到连续答对5次（小学生需要更多巩固）
export function getPerformanceSummary(
  performances: Map<string, WordPerformance>
): {
  mastered: number      // 连续答对5次以上且总答对5次以上
  learning: number      // 正在学习中
  struggling: number    // 连续答错2次以上
  unseen: number        // 从未见过
  total: number
} {
  let mastered = 0
  let learning = 0
  let struggling = 0
  let unseen = 0

  performances.forEach(perf => {
    if (perf.totalSeen === 0) {
      unseen++
    } else if (perf.consecutiveCorrect >= 5 && perf.correctCount >= 5) {
      mastered++
    } else if (perf.consecutiveWrong >= 2) {
      struggling++
    } else {
      learning++
    }
  })

  return {
    mastered,
    learning,
    struggling,
    unseen,
    total: performances.size
  }
}

// 本地存储管理
const STORAGE_KEY = 'paul_english_performances'

export function savePerformances(performances: Map<string, WordPerformance>): void {
  try {
    const data = Object.fromEntries(performances)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存学习记录失败:', e)
  }
}

export function loadPerformances(): Map<string, WordPerformance> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return new Map(Object.entries(parsed))
    }
  } catch (e) {
    console.error('加载学习记录失败:', e)
  }
  return new Map()
}
