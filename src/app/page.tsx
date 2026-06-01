'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { sounds } from '@/lib/sounds'
import { addConfettiStyle } from '@/lib/animations'

export default function Home() {
  // 初始化动画样式
  useEffect(() => {
    addConfettiStyle()
  }, [])

  const handleButtonClick = () => {
    sounds.click()
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* 头部欢迎区域 */}
      <header className="text-center mb-8 sm:mb-12 pt-8">
        <div className="animate-float mb-4">
          <span className="text-7xl">🎓</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          英语小达人
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          让学习更有趣 ✨
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>📚 译林版小学英语</span>
          <span>·</span>
          <span>⏰ 每天10分钟</span>
        </div>
      </header>

      {/* 学生入口 - 主要按钮 */}
      <section className="max-w-md mx-auto mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

          <div className="relative text-center">
            <h2 className="text-2xl font-bold mb-2">开始学习</h2>
            <p className="mb-6 opacity-90 text-lg">
              今天想练习吗？
            </p>
            <Link
              href="/lesson"
              className="inline-block w-full bg-white text-purple-600 font-bold py-5 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 shadow-lg"
              onClick={handleButtonClick}
            >
              🚀 一键开始今日练习
            </Link>
          </div>
        </div>
      </section>

      {/* 快速功能入口 */}
      <section className="max-w-md mx-auto mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">快速入口</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/practice/vocabulary"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={handleButtonClick}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative text-center">
              <span className="text-4xl mb-3 block group-hover:animate-bounce">🔤</span>
              <h3 className="font-bold text-lg">单词闯关</h3>
              <p className="text-sm opacity-90">记忆单词</p>
            </div>
          </Link>

          <Link
            href="/practice/grammar"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={handleButtonClick}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative text-center">
              <span className="text-4xl mb-3 block group-hover:animate-bounce">📝</span>
              <h3 className="font-bold text-lg">语法小练</h3>
              <p className="text-sm opacity-90">攻克语法</p>
            </div>
          </Link>

          <Link
            href="/practice/review"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-400 to-green-600 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={handleButtonClick}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative text-center">
              <span className="text-4xl mb-3 block group-hover:animate-bounce">🔄</span>
              <h3 className="font-bold text-lg">错题复习</h3>
              <p className="text-sm opacity-90">巩固薄弱</p>
            </div>
          </Link>

          <Link
            href="/achievements"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={handleButtonClick}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative text-center">
              <span className="text-4xl mb-3 block group-hover:animate-bounce">🏆</span>
              <h3 className="font-bold text-lg">成就殿堂</h3>
              <p className="text-sm opacity-90">查看所有成就</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 家长入口 */}
      <section className="max-w-md mx-auto mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

          <div className="relative text-center">
            <h2 className="text-2xl font-bold mb-2">👨‍👩‍👧 家长入口</h2>
            <p className="mb-6 opacity-90 text-lg">
              查看孩子的学习情况
            </p>
            <Link
              href="/parent"
              className="inline-block w-full bg-white text-green-600 font-bold py-5 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 shadow-lg"
              onClick={handleButtonClick}
            >
              📋 查看学习报告
            </Link>
          </div>
        </div>
      </section>

      {/* 学习提示 */}
      <section className="max-w-md mx-auto mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-6">
          <div className="text-center">
            <span className="text-3xl mb-3 block">💡</span>
            <h3 className="font-bold text-yellow-800 mb-2 text-lg">学习小贴士</h3>
            <p className="text-yellow-700">
              每天坚持练习 10 分钟，连续 7 天解锁"坚持不懈"成就！
            </p>
          </div>
        </div>
      </section>

      {/* 底部信息 */}
      <footer className="text-center text-gray-500 text-sm mt-12 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎓</span>
            <span className="font-semibold text-gray-600">英语小达人</span>
          </div>
          <p>译林版小学英语 · 三至六年级</p>
          <p className="mt-1 text-gray-400">让孩子爱上学习英语 ❤️</p>
        </div>
      </footer>
    </main>
  )
}