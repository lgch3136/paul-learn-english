'use client'

import { useEffect, useState } from 'react'

interface StreakComboProps {
  streak: number
  visible: boolean
  onDone?: () => void
}

const streakData: Record<number, { label: string; icon: string; color: string; glow: string; size: string }> = {
  3:  { label: '三连击！',     icon: '🔥', color: 'from-orange-400 to-red-500',   glow: 'shadow-orange-400/50', size: 'text-3xl' },
  5:  { label: '五连击！！',   icon: '🔥🔥', color: 'from-red-500 to-pink-600',    glow: 'shadow-red-500/60',    size: 'text-4xl' },
  7:  { label: '七连击！！！', icon: '💥🔥', color: 'from-pink-500 to-purple-600', glow: 'shadow-pink-500/70',   size: 'text-5xl' },
  10: { label: '超神！！！',   icon: '⚡🔥💥', color: 'from-yellow-400 via-red-500 to-purple-700', glow: 'shadow-yellow-400/80', size: 'text-6xl' },
  15: { label: '无人能挡！！', icon: '🌟⚡🔥💥', color: 'from-white via-yellow-400 to-red-600', glow: 'shadow-white/80', size: 'text-7xl' },
}

function getStreakLevel(streak: number): number {
  if (streak >= 15) return 15
  if (streak >= 10) return 10
  if (streak >= 7) return 7
  if (streak >= 5) return 5
  if (streak >= 3) return 3
  return 0
}

export default function StreakCombo({ streak, visible, onDone }: StreakComboProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter')
  const [shaking, setShaking] = useState(false)

  const level = getStreakLevel(streak)
  const data = streakData[level]

  useEffect(() => {
    if (!visible || !data) return
    requestAnimationFrame(() => setPhase('show'))

    // 高连击时屏幕震动
    if (level >= 7) {
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }

    const exitTimer = setTimeout(() => setPhase('exit'), 1200)
    const doneTimer = setTimeout(() => onDone?.(), 1600)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [visible, level])

  if (!visible || !data) return null

  const bgOverlay = level >= 10
    ? 'bg-gradient-to-b from-yellow-500/30 via-red-500/20 to-transparent'
    : level >= 7
    ? 'bg-red-500/15'
    : level >= 5
    ? 'bg-orange-500/10'
    : 'bg-transparent'

  return (
    <div
      className={`fixed inset-0 z-[95] flex items-start justify-center pt-24 pointer-events-none ${
        shaking ? 'animate-streak-shake' : ''
      }`}
      style={{ opacity: phase === 'show' ? 1 : 0, transition: 'opacity 0.3s' }}
    >
      {/* 屏幕闪光（高连击） */}
      {level >= 10 && (
        <div
          className={`absolute inset-0 ${bgOverlay}`}
          style={{
            animation: phase === 'show' ? 'streakFlash 0.3s ease-out' : 'none',
          }}
        />
      )}

      {/* 主内容 */}
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: phase === 'show' ? 'scale(1) translateY(0)' : 'scale(0.3) translateY(-60px)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* 粒子背景（高连击） */}
        {level >= 7 && (
          <div className="absolute -inset-12 overflow-hidden">
            {Array.from({ length: Math.min(level * 2, 30) }).map((_, i) => (
              <span
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animation: `streakParticle ${0.8 + Math.random() * 0.5}s ease-out ${Math.random() * 0.3}s both`,
                }}
              >
                {['🔥', '✨', '⚡', '💫', '⭐'][i % 5]}
              </span>
            ))}
          </div>
        )}

        {/* 连击数字 */}
        <div
          className={`relative px-8 py-3 rounded-2xl bg-gradient-to-r ${data.color} shadow-2xl ${data.glow} mb-2`}
          style={{
            animation: phase === 'show' ? 'streakPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
          <span className={`relative font-black text-white drop-shadow-lg ${data.size}`}>
            {streak} COMBO
          </span>
        </div>

        {/* 连击标签 */}
        <div
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg"
          style={{
            animation: phase === 'show' ? 'streakSlideUp 0.4s ease-out 0.2s both' : 'none',
          }}
        >
          <span className="text-2xl">{data.icon}</span>
          <span className={`font-black bg-gradient-to-r ${data.color} bg-clip-text text-transparent text-lg`}>
            {data.label}
          </span>
        </div>

        {/* 底部渐变线 */}
        <div
          className={`h-1 rounded-full mt-2 bg-gradient-to-r ${data.color}`}
          style={{
            width: phase === 'show' ? '120px' : '0px',
            transition: 'width 0.6s ease-out 0.3s',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes streakPop {
          0% { transform: scale(0.2) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes streakSlideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes streakFlash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes streakParticle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${30 + Math.random() * 40}px, -${40 + Math.random() * 60}px) scale(0); opacity: 0; }
        }
        @keyframes streak-shake {
          0%, 100% { transform: translateX(0) translateY(0); }
          10% { transform: translateX(-3px) translateY(1px); }
          20% { transform: translateX(3px) translateY(-1px); }
          30% { transform: translateX(-2px) translateY(2px); }
          40% { transform: translateX(2px) translateY(-2px); }
          50% { transform: translateX(-1px) translateY(1px); }
          60% { transform: translateX(1px) translateY(-1px); }
          70% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          90% { transform: translateX(-1px); }
        }
        .animate-streak-shake {
          animation: streak-shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
