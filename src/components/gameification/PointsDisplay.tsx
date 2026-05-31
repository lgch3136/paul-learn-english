'use client'

import { getCurrentLevel, getNextLevel, getLevelProgress } from '@/lib/gameification'

interface PointsDisplayProps {
  points: number
  showProgress?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function PointsDisplay({ 
  points, 
  showProgress = true, 
  size = 'medium' 
}: PointsDisplayProps) {
  const currentLevel = getCurrentLevel(points)
  const nextLevel = getNextLevel(points)
  const progress = getLevelProgress(points)

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  }

  return (
    <div className={`flex items-center gap-4 ${sizeClasses[size]}`}>
      {/* 等级图标 */}
      <div className={`${iconSizes[size]} animate-float`}>
        {currentLevel.icon}
      </div>

      <div className="flex-1">
        {/* 等级和积分 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-gray-800">
            Lv.{currentLevel.level} {currentLevel.title}
          </span>
          <span className="text-blue-600 font-semibold">
            {points} 积分
          </span>
        </div>

        {/* 进度条 */}
        {showProgress && nextLevel && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>距离下一等级</span>
              <span>{nextLevel.minPoints - points} 积分</span>
            </div>
            <div className="progress-bar h-2">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 满级提示 */}
        {showProgress && !nextLevel && (
          <div className="text-xs text-yellow-600 font-medium">
            ⭐ 已达到最高等级！
          </div>
        )}
      </div>
    </div>
  )
}