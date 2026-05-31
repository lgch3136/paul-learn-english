'use client'

import { useState, useEffect, useRef } from 'react'
import { Achievement } from '@/lib/gameification'
import { sounds } from '@/lib/sounds'

interface AchievementPopupProps {
  achievement: Achievement
  onClose: () => void
}

export default function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // 播放成就音效
    sounds.levelUp()
    
    // 显示动画
    setTimeout(() => setIsVisible(true), 100)
    
    // 粒子效果
    setTimeout(() => {
      setShowParticles(true)
      createParticleEffect()
    }, 500)

    // 自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 500)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const createParticleEffect = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      alpha: number
      life: number
    }> = []

    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']

    // 创建粒子
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.1 // 重力
        particle.life -= 0.02
        particle.alpha = particle.life

        if (particle.life > 0) {
          ctx.save()
          ctx.globalAlpha = particle.alpha
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      if (particles.some(p => p.life > 0)) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  return (
    <>
      {/* 粒子画布 */}
      {showParticles && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[60] pointer-events-none"
          style={{ position: 'fixed', top: 0, left: 0 }}
        />
      )}

      {/* 弹窗 */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* 成就卡片 */}
        <div className={`relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-700 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-75 translate-y-10'
        }`}>
          {/* 顶部光效 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500" />

          {/* 闪光效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-orange-400/20 animate-pulse" />

          <div className="relative p-8">
            {/* 成就解锁标题 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-bounce">
                🎉 成就解锁！
              </div>
            </div>

            {/* 成就图标 - 带动画 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <span className="text-5xl">{achievement.icon}</span>
                </div>
                {/* 光环效果 */}
                <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-yellow-400" />
              </div>
            </div>

            {/* 成就信息 */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{achievement.title}</h2>
              <p className="text-gray-600">{achievement.description}</p>
            </div>

            {/* 积分奖励 */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <p className="text-sm text-gray-600">获得积分</p>
                  <p className="text-3xl font-bold text-orange-600">+{achievement.reward}</p>
                </div>
              </div>
            </div>

            {/* 确认按钮 */}
            <button
              onClick={() => {
                sounds.click()
                setIsVisible(false)
                setTimeout(onClose, 500)
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg"
            >
              太棒了！继续努力 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
