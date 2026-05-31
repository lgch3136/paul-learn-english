'use client'

import { useEffect } from 'react'
import { music } from '@/lib/music'

export default function AudioInitializer() {
  useEffect(() => {
    let started = false

    const startMusic = () => {
      if (started) return
      started = true
      music.play().then(ok => {
        if (ok) console.log('🎵 背景音乐已自动播放')
      }).catch(() => { started = false })
    }

    // 页面可见时尝试播放（覆盖打开APP、切回APP等场景）
    const tryPlay = () => {
      if (!document.hidden) startMusic()
    }

    // 立即尝试
    startMusic()

    // 页面从后台切回前台
    document.addEventListener('visibilitychange', tryPlay)
    // 页面从bfcache恢复
    window.addEventListener('pageshow', tryPlay)
    // 窗口获得焦点
    window.addEventListener('focus', tryPlay)
    // 首次用户交互（兜底，浏览器阻止自动播放时）
    const fallback = () => { startMusic() }
    document.addEventListener('pointerdown', fallback, { once: true })
    document.addEventListener('keydown', fallback, { once: true })

    return () => {
      document.removeEventListener('visibilitychange', tryPlay)
      window.removeEventListener('pageshow', tryPlay)
      window.removeEventListener('focus', tryPlay)
      document.removeEventListener('pointerdown', fallback)
      document.removeEventListener('keydown', fallback)
    }
  }, [])

  return null
}