'use client'

import { useState } from 'react'
import { sounds } from '@/lib/sounds'

export type PracticeMode =
  | 'classic'      // 经典模式：看词选义
  | 'listening'    // 听力模式：听音选词
  | 'spelling'     // 拼写模式：看义拼词
  | 'speed'        // 速度模式：限时答题
  | 'challenge'    // 挑战模式：连续闯关
  | 'review'       // 复习模式：错题重练
  | 'shooting'     // 单词打靶：射击飞靶
  | 'fishing'      // 单词钓鱼：水中抓鱼
  | 'scramble'     // 字母拼拼乐：拼字母

interface ModeOption {
  id: PracticeMode
  icon: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  funFactor: number // 1-5 趣味度
}

const modes: ModeOption[] = [
  {
    id: 'fishing',
    icon: '🎣',
    title: '单词钓鱼',
    description: '点击正确的鱼，钓起来！',
    difficulty: 'medium',
    funFactor: 5
  },
  {
    id: 'scramble',
    icon: '🔤',
    title: '字母拼拼乐',
    description: '把打乱的字母拼成单词！',
    difficulty: 'medium',
    funFactor: 5
  },
  {
    id: 'shooting',
    icon: '🏹',
    title: '单词弹射',
    description: '拉动弹弓，射向正确单词！',
    difficulty: 'hard',
    funFactor: 5
  },
  {
    id: 'speed',
    icon: '⚡',
    title: '闪电速度',
    description: '限时 6 秒，快速答题',
    difficulty: 'medium',
    funFactor: 5
  },
  {
    id: 'challenge',
    icon: '🏆',
    title: '闯关挑战',
    description: '连续答对 8 题通关',
    difficulty: 'hard',
    funFactor: 5
  },
  {
    id: 'classic',
    icon: '📖',
    title: '经典模式',
    description: '看单词，选中文意思',
    difficulty: 'easy',
    funFactor: 3
  },
  {
    id: 'listening',
    icon: '🎧',
    title: '听力挑战',
    description: '听发音，选出正确的单词',
    difficulty: 'easy',
    funFactor: 4
  },
  {
    id: 'spelling',
    icon: '✍️',
    title: '拼写达人',
    description: '看中文，拼出英文单词',
    difficulty: 'hard',
    funFactor: 4
  },
  {
    id: 'review',
    icon: '🔄',
    title: '错题复习',
    description: '专门练习之前做错的题',
    difficulty: 'easy',
    funFactor: 3
  }
]

interface PracticeModeSelectorProps {
  onSelect: (mode: PracticeMode) => void
  currentMode?: PracticeMode
}

export default function PracticeModeSelector({ onSelect, currentMode }: PracticeModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<PracticeMode | null>(null)

  const handleSelect = (mode: PracticeMode) => {
    sounds.click()
    onSelect(mode)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return ''
    }
  }

  const getFunStars = (count: number) => {
    return '⭐'.repeat(count) + '☆'.repeat(5 - count)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        🎮 选择练习模式
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modes.map((mode, index) => {
          const gradients = [
            'from-sky-400 to-blue-600',        // fishing - 钓鱼蓝
            'from-amber-400 to-orange-600',    // scramble - 拼写琥珀
            'from-rose-500 to-red-600',        // shooting - 打靶红
            'from-yellow-400 to-orange-500',   // speed - 闪电黄橙
            'from-purple-400 to-pink-500',     // challenge - 挑战紫粉
            'from-blue-400 to-indigo-500',     // classic - 经典蓝靛
            'from-green-400 to-emerald-500',   // listening - 听力绿
            'from-cyan-400 to-blue-500',       // spelling - 拼写青蓝
            'from-gray-400 to-gray-600',       // review - 复习灰
          ]
          const gradient = gradients[index % gradients.length]

          return (
            <button
              key={mode.id}
              onClick={() => handleSelect(mode.id)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                currentMode === mode.id ? 'ring-4 ring-white ring-opacity-50' : ''
              } ${hoveredMode === mode.id ? 'animate-pulse-once' : ''}`}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-300" />

              <div className="relative flex items-start gap-4">
                <span className="text-4xl drop-shadow-lg">{mode.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg drop-shadow-md">{mode.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      {getDifficultyLabel(mode.difficulty)}
                    </span>
                  </div>
                  <p className="text-sm opacity-90 mb-2">{mode.description}</p>
                  <div className="text-xs opacity-75">
                    趣味度: {getFunStars(mode.funFactor)}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 提示 */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>💡 建议：每天尝试不同的模式，保持新鲜感！</p>
      </div>
    </div>
  )
}