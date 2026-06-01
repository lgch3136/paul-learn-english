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
  const hasInitRef = useRef(false)

  // 使用 ref 存储 onClose，避免 effect 重跑
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    // 防止同一次挂载中 effect 被调用两次（非 StrictMode 场景）
    if (hasInitRef.current) return
    hasInitRef.current = true

    console.log('[AchievementPopup] 成就弹窗已挂载:', achievement.id, achievement.title)

    // 播放成就音效
    try { sounds.levelUp() } catch (e) { console.warn('音效播放失败:', e) }

    // 显示动画
    const showTimer = setTimeout(() => setIsVisible(true), 100)

    // 粒子效果
    const particleTimer = setTimeout(() => {
      setShowParticles(true)
      createParticleEffect()
    }, 500)

    // 自动关闭（使用 ref 获取最新回调）
    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onCloseRef.current(), 500)
    }, 5000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(particleTimer)
      clearTimeout(autoCloseTimer)
      // 重置 ref，使 StrictMode 重新挂载时能正常执行
      hasInitRef.current = false
    }
  }, [achievement.id]) // 只依赖 achievement.id

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
        particle.vy += 0.1
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
      if (particles.some(p => p.life > 0)) requestAnimationFrame(animate)
    }
    animate()
  }

  const handleClose = () => {
    try { sounds.click() } catch (e) {}
    setIsVisible(false)
    setTimeout(() => onCloseRef.current(), 500)
  }

  return (
    <>
      {/* 粒子画布 */}
      {showParticles && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[120] pointer-events-none"
          style={{ position: 'fixed', top: 0, left: 0 }}
        />
      )}

      {/* 弹窗 */}
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

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

            {/* 成就图标 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <span className="text-5xl">{achievement.icon}</span>
                </div>
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
              onClick={handleClose}
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
