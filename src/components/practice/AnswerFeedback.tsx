'use client'

import { useEffect, useState, useRef } from 'react'

interface AnswerFeedbackProps {
  isCorrect: boolean
  message?: string
  detail?: string
  onDone: () => void
}

export default function AnswerFeedback({ isCorrect, message, detail, onDone }: AnswerFeedbackProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter')
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    requestAnimationFrame(() => setPhase('show'))
    const exitTimer = setTimeout(() => setPhase('exit'), 1000)
    const doneTimer = setTimeout(() => onDoneRef.current(), 1400)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, []) // 不依赖 onDone，用 ref 代替

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      style={{
        opacity: phase === 'show' ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: phase === 'show'
            ? `radial-gradient(circle at center, ${isCorrect ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'} 0%, rgba(0,0,0,0.15) 100%)`
            : 'transparent',
          backdropFilter: phase === 'show' ? 'blur(8px)' : 'blur(0px)',
        }}
      />

      {/* 弹窗主体 */}
      <div
        className="relative transform transition-all ease-out"
        style={{
          transform: phase === 'show' ? 'scale(1) translateY(0)' : 'scale(0.3) translateY(80px)',
          transitionDuration: phase === 'show' ? '0.35s' : '0.25s',
          transitionTimingFunction: phase === 'show' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ease-in',
        }}
      >
        {/* 外发光 */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
          style={{
            background: isCorrect
              ? 'linear-gradient(135deg, #22c55e, #10b981)'
              : 'linear-gradient(135deg, #ef4444, #f43f5e)',
            transform: phase === 'show' ? 'scale(1.15)' : 'scale(0.8)',
            transition: 'transform 0.3s ease-out',
          }}
        />

        {/* 卡片 */}
        <div
          className={`relative overflow-hidden rounded-3xl shadow-2xl ${
            isCorrect
              ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500'
              : 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-500'
          }`}
          style={{ minWidth: '320px', maxWidth: '90vw' }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative px-10 py-8 text-center">
            <div
              className="mb-4"
              style={{
                animation: phase === 'show' ? 'feedbackBounce 0.6s ease-out 0.15s both' : 'none',
              }}
            >
              <span className="text-7xl block drop-shadow-lg">
                {isCorrect ? '✅' : '❌'}
              </span>
            </div>

            <h2
              className="text-4xl font-black text-white mb-2 drop-shadow-lg"
              style={{
                animation: phase === 'show' ? 'feedbackSlideUp 0.4s ease-out 0.2s both' : 'none',
              }}
            >
              {message || (isCorrect ? '答对啦！' : '答错啦！')}
            </h2>

            {detail && (
              <p
                className="text-xl text-white/90 font-semibold"
                style={{
                  animation: phase === 'show' ? 'feedbackSlideUp 0.4s ease-out 0.3s both' : 'none',
                }}
              >
                {detail}
              </p>
            )}

            <div
              className="mt-4 h-1 bg-white/30 rounded-full mx-auto"
              style={{
                width: phase === 'show' ? '60%' : '0%',
                transition: 'width 0.8s ease-out 0.4s',
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes feedbackBounce {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes feedbackSlideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
