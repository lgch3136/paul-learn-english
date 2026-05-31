'use client'

import { useEffect, useState } from 'react'

interface AnswerFeedbackProps {
  isCorrect: boolean
  message?: string
  detail?: string
  onDone: () => void
}

export default function AnswerFeedback({ isCorrect, message, detail, onDone }: AnswerFeedbackProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-400 ${
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`absolute inset-0 ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'} backdrop-blur-sm`} />
      <div className={`relative transform transition-all duration-500 ${
        visible ? 'scale-100 translate-y-0' : 'scale-50 translate-y-10'
      }`}>
        <div className={`text-center px-12 py-10 rounded-3xl shadow-2xl ${
          isCorrect
            ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'
            : 'bg-gradient-to-br from-red-400 via-pink-500 to-rose-500'
        }`}>
          <span className="text-8xl block mb-4 animate-bounce">
            {isCorrect ? '🎉' : '😮'}
          </span>
          <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
            {message || (isCorrect ? '答对了！' : '答错了！')}
          </h2>
          {detail && (
            <p className="text-xl text-white/90 font-medium">{detail}</p>
          )}
        </div>
      </div>
    </div>
  )
}
