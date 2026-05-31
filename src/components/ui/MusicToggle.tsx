'use client'

import { useState, useEffect } from 'react'
import { music } from '@/lib/music'

export default function MusicToggle({ className = '' }: { className?: string }) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const sync = () => setPlaying(music.getIsPlaying())
    sync()
    const timer = setInterval(sync, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggle = async () => {
    const ok = await music.toggle()
    setPlaying(ok)
  }

  return (
    <button
      onClick={toggle}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
        playing
          ? 'bg-purple-500 text-white shadow-lg animate-pulse'
          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
      } ${className}`}
      title={playing ? '关闭音乐' : '开启音乐'}
    >
      {playing ? '🎵' : '🔇'}
    </button>
  )
}
