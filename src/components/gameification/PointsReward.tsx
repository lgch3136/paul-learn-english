'use client'

import { useState, useEffect, useRef } from 'react'

interface PointsRewardProps {
  points: number
  message: string
  icon: string
  onComplete: () => void
}

export default function PointsReward({ points, message, icon, onComplete }: PointsRewardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showPoints, setShowPoints] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([])

  useEffect(() => {
    // 显示动画
    setTimeout(() => setIsVisible(true), 100)
    setTimeout(() => setShowPoints(true), 300)
    setTimeout(() => createParticles(), 500)

    // 自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const createParticles = () => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 8 - 2,
    }))
    setParticles(newParticles)

    // 清除粒子
    setTimeout(() => setParticles([]), 1000)
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {/* 粒子效果 */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full bg-yellow-400"
          style={{
            left: '50%',
            top: '50%',
            animation: `particle-${particle.id} 1s ease-out forwards`,
          }}
        />
      ))}

      {/* 奖励卡片 */}
      <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-2xl shadow-2xl p-5 min-w-[220px] overflow-hidden">
        {/* 光效 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        
        <div className="relative flex items-center gap-4">
          {/* 图标 */}
          <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transform -rotate-12">
            <span className="text-3xl">{icon}</span>
          </div>

          <div>
            {/* 消息 */}
            <p className="text-white font-bold text-sm mb-1">{message}</p>
            
            {/* 积分数字 - 带弹跳动画 */}
            <div className={`text-white text-3xl font-bold transition-all duration-500 ${
              showPoints ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}>
              <span className="inline-block animate-bounce">+{points}</span>
              <span className="text-lg ml-1">积分</span>
            </div>
          </div>
        </div>

        {/* 底部闪光条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-white to-yellow-300 opacity-50" />
      </div>

      <style jsx>{`
        ${particles.map((_, i) => `
          @keyframes particle-${i} {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(${particles[i]?.vx * 30}px, ${particles[i]?.vy * 30}px) scale(0);
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  )
}
