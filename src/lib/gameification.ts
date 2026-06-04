// 游戏化激励系统

// 从 achievements-data.ts 导入并重导出核心类型和数据
import type { Achievement, PlayerStats } from '@/lib/achievements-data'
import { achievements as _achievements, achievementCategories as _achievementCategories } from '@/lib/achievements-data'
export type { Achievement, PlayerStats }
export const achievements = _achievements
export const achievementCategories = _achievementCategories

export interface Reward {
  type: 'points' | 'badge' | 'title' | 'unlock'
  value: string
  amount?: number
}
// 积分等级 - 扩充到 15 级
export const levels = [
  { level: 1, title: '英语新手', minPoints: 0, icon: '🌱' },
  { level: 2, title: '学习新星', minPoints: 50, icon: '⭐' },
  { level: 3, title: '进步达人', minPoints: 150, icon: '📈' },
  { level: 4, title: '词汇小将', minPoints: 300, icon: '📝' },
  { level: 5, title: '词汇高手', minPoints: 500, icon: '📚' },
  { level: 6, title: '语法新秀', minPoints: 800, icon: '✏️' },
  { level: 7, title: '语法大师', minPoints: 1200, icon: '🎓' },
  { level: 8, title: '英语学霸', minPoints: 1800, icon: '🏆' },
  { level: 9, title: '语言天才', minPoints: 2500, icon: '👑' },
  { level: 10, title: '英语之王', minPoints: 3500, icon: '👸' },
  { level: 11, title: '传说学者', minPoints: 5000, icon: '🌟' },
  { level: 12, title: '传奇大师', minPoints: 7000, icon: '💫' },
  { level: 13, title: '至高无上', minPoints: 10000, icon: '✨' },
  { level: 14, title: '英语之神', minPoints: 15000, icon: '🌈' },
  { level: 15, title: '超越极限', minPoints: 25000, icon: '🎆' },
]

// 检查解锁的成就
export function checkAchievements(stats: PlayerStats): Achievement[] {
  const result: Achievement[] = []
  for (const a of achievements) {
    try {
      if (a.condition(stats)) {
        result.push(a)
      }
    } catch (e) {
      // skip broken condition
    }
  }
  return result
}

// 获取当前等级
export function getCurrentLevel(points: number) {
  let currentLevel = levels[0]
  for (const level of levels) {
    if (points >= level.minPoints) {
      currentLevel = level
    } else {
      break
    }
  }
  return currentLevel
}

// 获取下一等级
export function getNextLevel(points: number) {
  for (const level of levels) {
    if (points < level.minPoints) {
      return level
    }
  }
  return null
}

// 计算等级进度
export function getLevelProgress(points: number): number {
  const currentLevel = getCurrentLevel(points)
  const nextLevel = getNextLevel(points)
  
  if (!nextLevel) return 100
  
  const pointsInLevel = points - currentLevel.minPoints
  const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints
  
  return Math.round((pointsInLevel / pointsNeeded) * 100)
}

// 激励语句
export const encouragements = {
  correct: [
    '太棒了！🎉',
    '正确！继续加油！💪',
    '答对了！你真聪明！🧠',
    '完美！🌟',
    '好厉害！👏',
    '太强了！🔥',
    '没错！就是这样！✅',
    '你做到了！🎊',
  ],
  wrong: [
    '没关系，再试一次！💪',
    '加油，你能行的！🌟',
    '别灰心，下次一定行！🌈',
    '错误是学习的机会！📚',
    '继续努力，你会进步的！📈',
    '相信自己！✨',
  ],
  streak: [
    '连续答对，太厉害了！🔥',
    '势如破竹！⚡',
    '保持这个势头！💎',
    '你太强了！🏆',
    '无人能挡！👑',
  ],
  complete: [
    '恭喜完成练习！🎉',
    '太棒了，全部完成！🌟',
    '你真的很努力！💪',
    '今天又进步了！📈',
    '为你骄傲！🏆',
  ]
}

// 随机获取鼓励语
export function getRandomEncouragement(type: keyof typeof encouragements): string {
  const list = encouragements[type]
  return list[Math.floor(Math.random() * list.length)]
}

// 每日挑战 - 扩充到 8 个挑战
export interface DailyChallenge {
  id: string
  title: string
  description: string
  target: number
  reward: number
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const dailyChallenges: DailyChallenge[] = [
  {
    id: 'daily_5',
    title: '小试牛刀',
    description: '今天学会 5 个单词',
    target: 5,
    reward: 20,
    icon: '🌱',
    difficulty: 'easy'
  },
  {
    id: 'daily_10',
    title: '每日十词',
    description: '今天学会 10 个单词',
    target: 10,
    reward: 50,
    icon: '📖',
    difficulty: 'easy'
  },
  {
    id: 'daily_20',
    title: '词汇冲刺',
    description: '今天学会 20 个单词',
    target: 20,
    reward: 100,
    icon: '📚',
    difficulty: 'medium'
  },
  {
    id: 'daily_streak_3',
    title: '连击入门',
    description: '连续答对 3 题',
    target: 3,
    reward: 20,
    icon: '🔥',
    difficulty: 'easy'
  },
  {
    id: 'daily_streak',
    title: '连击挑战',
    description: '连续答对 5 题',
    target: 5,
    reward: 30,
    icon: '⚡',
    difficulty: 'medium'
  },
  {
    id: 'daily_streak_10',
    title: '连击大师',
    description: '连续答对 10 题',
    target: 10,
    reward: 80,
    icon: '💎',
    difficulty: 'hard'
  },
  {
    id: 'daily_perfect',
    title: '完美主义者',
    description: '一轮练习全部答对',
    target: 1,
    reward: 80,
    icon: '⭐',
    difficulty: 'hard'
  },
  {
    id: 'daily_speed',
    title: '速度之星',
    description: '在 2 分钟内完成 10 题',
    target: 10,
    reward: 60,
    icon: '🏃',
    difficulty: 'medium'
  },
]

// 检查每日挑战完成情况
export function checkDailyChallenge(
  challenge: DailyChallenge,
  todayWords: number,
  maxStreak: number,
  perfectRounds: number,
  totalTime: number,
  lastSessionWords?: number,
  lastSessionTime?: number
): boolean {
  switch (challenge.id) {
    case 'daily_5':
    case 'daily_10':
    case 'daily_20':
      return todayWords >= challenge.target
    case 'daily_streak_3':
    case 'daily_streak':
    case 'daily_streak_10':
      return maxStreak >= challenge.target
    case 'daily_perfect':
      return perfectRounds >= challenge.target
    case 'daily_speed':
      // 速度之星：最近一次练习中答对 >= 10 题且用时 <= 120 秒
      return (lastSessionWords ?? 0) >= challenge.target && (lastSessionTime ?? Infinity) <= 120
    default:
      return false
  }
}

// 称号系统 - 扩充到 15 个称号
export const titles = [
  { id: 'newbie', title: '英语新手', description: '刚开始学习', icon: '🌱' },
  { id: 'first_word', title: '初学者', description: '学会第一个单词', icon: '📝' },
  { id: 'learner', title: '学习者', description: '学习超过 3 天', icon: '📚' },
  { id: 'wordmaster', title: '词汇大师', description: '掌握 50 个单词', icon: '📖' },
  { id: 'streaker', title: '连击王', description: '连击超过 10', icon: '🔥' },
  { id: 'streak_king', title: '连击之王', description: '连击超过 20', icon: '⚡' },
  { id: 'perfecter', title: '完美主义者', description: '完成 5 轮完美练习', icon: '⭐' },
  { id: 'speedster', title: '闪电侠', description: '平均答题少于 3 秒', icon: '🏃' },
  { id: 'scholar', title: '学霸', description: '答对 100 题', icon: '🎓' },
  { id: 'master', title: '学神', description: '答对 200 题', icon: '👑' },
  { id: 'persistent', title: '坚持不懈', description: '连续学习 7 天', icon: '💪' },
  { id: 'dedicated', title: '勤奋好学', description: '连续学习 14 天', icon: '🌟' },
  { id: 'unstoppable', title: '势不可挡', description: '连续学习 30 天', icon: '🏆' },
  { id: 'night_owl', title: '夜猫子', description: '在深夜学习', icon: '🦉' },
  { id: 'early_bird', title: '早起鸟', description: '在清晨学习', icon: '🐦' },
  { id: 'champion', title: '英语冠军', description: '达到最高等级', icon: '👸' },
]

// 获取可用称号
export function getAvailableTitles(stats: PlayerStats): string[] {
  const available: string[] = ['英语新手']

  // 基础称号
  if (stats.totalWords >= 1) available.push('初学者')
  if (stats.daysStudied >= 3) available.push('学习者')

  // 词汇称号
  if (stats.totalWords >= 50) available.push('词汇大师')

  // 连击称号
  if (stats.maxStreak >= 10) available.push('连击王')
  if (stats.maxStreak >= 20) available.push('连击之王')

  // 完美称号
  if (stats.perfectRounds >= 5) available.push('完美主义者')

  // 速度称号
  const total = stats.correctAnswers + stats.wrongAnswers
  if (total > 0 && stats.totalTime / total < 3) available.push('闪电侠')

  // 答题称号
  if (stats.correctAnswers >= 100) available.push('学霸')
  if (stats.correctAnswers >= 200) available.push('学神')

  // 坚持称号
  if (stats.daysStudied >= 7) available.push('坚持不懈')
  if (stats.daysStudied >= 14) available.push('勤奋好学')
  if (stats.daysStudied >= 30) available.push('势不可挡')

  // 时间称号
  const hour = new Date().getHours()
  if (hour >= 22 || hour < 6) available.push('夜猫子')
  if (hour >= 5 && hour < 7) available.push('早起鸟')

  // 最高等级
  const currentLevel = getCurrentLevel(stats.correctAnswers * 10)
  if (currentLevel.level >= 15) available.push('英语冠军')

  return available
}