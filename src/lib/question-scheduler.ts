// 智能题目调度系统 - 核心算法
// 根据学生表现动态调整题目出现频率

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

// 计算单词权重 - 核心算法
// 权重越高，出现概率越大
export function calculateWeight(perf: WordPerformance): number {
  let weight = 10 // 基础权重

  // 1. 从未见过的单词 - 最高优先级
  if (perf.totalSeen === 0) {
    return 100
  }

  // 2. 反复错误的单词 - 高优先级
  // 连续错误3次以上，权重大幅提升
  if (perf.consecutiveWrong >= 3) {
    weight += 80
  } else if (perf.consecutiveWrong >= 2) {
    weight += 60
  } else if (perf.consecutiveWrong >= 1) {
    weight += 40
  }

  // 3. 错误率高的单词 - 中高优先级
  const total = perf.correctCount + perf.wrongCount
  if (total > 0) {
    const errorRate = perf.wrongCount / total
    // 错误率越高，权重越大
    weight += errorRate * 50
  }

  // 4. 最近答错的单词 - 中等优先级
  if (!perf.lastCorrect && perf.wrongCount > 0) {
    weight += 30
  }

  // 5. 已经连续答对多次的单词 - 降低优先级
  if (perf.consecutiveCorrect >= 5) {
    weight -= 30
  } else if (perf.consecutiveCorrect >= 3) {
    weight -= 20
  }

  // 6. 时间因素 - 越久没见，权重略微增加
  const timeSinceLastSeen = Date.now() - perf.lastSeen
  const hoursSince = timeSinceLastSeen / (1000 * 60 * 60)
  if (hoursSince > 24) {
    weight += 15
  } else if (hoursSince > 12) {
    weight += 10
  }

  return Math.max(weight, 1) // 最低权重为1
}

// 加权随机选择算法
export function weightedRandomSelect<T>(
  items: T[],
  weights: number[]
): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
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
  // 计算每个单词的权重
  const weights = words.map(word => {
    const perf = performances.get(word.word_id)
    if (!perf) {
      return 100 // 从未见过，最高权重
    }
    return calculateWeight(perf)
  })

  // 排除刚做过的题目（避免连续出现）
  if (excludeWordId) {
    const excludeIndex = words.findIndex(w => w.word_id === excludeWordId)
    if (excludeIndex !== -1) {
      weights[excludeIndex] = 0
    }
  }

  return weightedRandomSelect(words, weights)
}

// 生成练习题目序列
export function generatePracticeSequence(
  words: any[],
  performances: Map<string, WordPerformance>,
  count: number = 10
): any[] {
  const sequence: any[] = []
  const usedIndices = new Set<number>()

  for (let i = 0; i < Math.min(count, words.length); i++) {
    // 计算权重（排除已选中的）
    const weights = words.map((word, index) => {
      if (usedIndices.has(index)) return 0
      const perf = performances.get(word.word_id)
      if (!perf) return 100
      return calculateWeight(perf)
    })

    // 选择下一个
    const selected = weightedRandomSelect(words, weights)
    const selectedIndex = words.findIndex(w => w.word_id === selected.word_id)

    sequence.push(selected)
    usedIndices.add(selectedIndex)
  }

  return sequence
}

// 获取学习统计摘要
export function getPerformanceSummary(
  performances: Map<string, WordPerformance>
): {
  mastered: number      // 连续答对3次以上
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
    } else if (perf.consecutiveCorrect >= 3) {
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
