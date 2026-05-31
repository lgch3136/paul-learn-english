'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeedMultiplierProps {
  streak: number
  visible: boolean
  onDone?: () => void
}

export default function SpeedMultiplier({ streak, visible, onDone }: SpeedMultiplierProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!visible) return
    requestAnimationFrame(() => setPhase('show'))
    const exitTimer = setTimeout(() => setPhase('exit'), 1200)
    const doneTimer = setTimeout(() => onDone?.(), 1600)
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer) }
  }, [visible, onDone])

  useEffect(() => {
    if (visible && streak >= 4) {
      createParticles()
    }
  }, [visible, streak])

  const createParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#FFD700', '#FF6B6B', '#FF4500', '#FFA500', '#FF1493', '#00CED1']
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; life: number }> = []
    const count = streak >= 6 ? 60 : 40
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 4,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1
      })
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15
        p.life -= 0.018
        p.alpha = p.life
        if (p.life > 0) {
          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })
      if (particles.some(p => p.life > 0)) requestAnimationFrame(animate)
    }
    animate()
  }, [streak])

  if (!visible) return null

  const getStreakTier = () => {
    if (streak >= 8) return { level: 6, emoji: '💎', label: 'LEGENDARY' }
    if (streak >= 6) return { level: 5, emoji: '🔥', label: 'ON FIRE' }
    if (streak >= 5) return { level: 4, emoji: '⚡', label: 'UNSTOPPABLE' }
    if (streak >= 4) return { level: 3, emoji: '💥', label: 'AMAZING' }
    if (streak >= 3) return { level: 2, emoji: '🌟', label: 'GREAT' }
    return { level: 1, emoji: '✨', label: 'NICE' }
  }

  const tier = getStreakTier()
  const baseFontSize = Math.min(48 + streak * 12, 120)

  return (
    <>
      {streak >= 4 && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 104 }}
        />
      )}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{
          zIndex: 105,
          opacity: phase === 'show' ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
        }}
      >
        <div className="relative text-center">
          {streak >= 6 && (
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-50"
              style={{
                background: streak >= 8
                  ? 'radial-gradient(circle, #9333ea, #ec4899, #f59e0b)'
                  : 'radial-gradient(circle, #ef4444, #f97316, #eab308)',
                transform: phase === 'show' ? 'scale(2)' : 'scale(0)',
                transition: 'transform 0.5s ease-out',
              }}
            />
          )}

          <div
            style={{
              transform: phase === 'show' ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-20deg)',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              opacity: phase === 'show' ? 1 : 0,
            }}
          >
            <span className="text-6xl block mb-2 drop-shadow-lg"
              style={{ animation: phase === 'show' ? 'speedPop 0.5s ease-out' : 'none' }}>
              {tier.emoji}
            </span>
          </div>

          <div
            style={{
              transform: phase === 'show' ? 'scale(1) translateY(0)' : 'scale(0.3) translateY(30px)',
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
              opacity: phase === 'show' ? 1 : 0,
            }}
          >
            <span
              className="font-black drop-shadow-lg block"
              style={{
                fontSize: `${baseFontSize}px`,
                lineHeight: 1.1,
                background: streak >= 8
                  ? 'linear-gradient(135deg, #fbbf24, #ec4899, #9333ea)'
                  : streak >= 5
                  ? 'linear-gradient(135deg, #ef4444, #f97316, #fbbf24)'
                  : 'linear-gradient(135deg, #f97316, #eab308)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: phase === 'show' ? 'speedPulse 0.6s ease-in-out 0.2s 2' : 'none',
              }}
            >
              ×{streak}
            </span>
          </div>

          <div
            style={{
              transform: phase === 'show' ? 'scale(1) translateY(0)' : 'scale(0) translateY(20px)',
              transition: 'transform 0.4s ease-out 0.25s',
              opacity: phase === 'show' ? 1 : 0,
            }}
          >
            <span
              className="text-xl font-bold tracking-widest block mt-2"
              style={{
                color: streak >= 8 ? '#a855f7' : streak >= 5 ? '#ef4444' : '#f97316',
                textShadow: streak >= 5 ? '0 0 20px rgba(239,68,68,0.5)' : 'none',
              }}
            >
              {tier.label}!
            </span>
          </div>

          {streak >= 7 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                animation: 'speedScreenShake 0.3s ease-out 0.15s',
              }}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes speedPop {
          0% { transform: scale(0) rotate(-15deg); }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes speedPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes speedScreenShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px) rotate(-1deg); }
          40% { transform: translateX(3px) rotate(1deg); }
          60% { transform: translateX(-2px) rotate(-0.5deg); }
          80% { transform: translateX(2px) rotate(0.5deg); }
        }
      `}</style>
    </>
  )
}
