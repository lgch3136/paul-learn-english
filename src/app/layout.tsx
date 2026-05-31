import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AudioInitializer from '@/components/AudioInitializer'
import MusicToggle from '@/components/ui/MusicToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '英语小达人 - 让学习更有趣',
  description: '专为小学生设计的英语学习助手，每天10分钟，轻松掌握单词和语法',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AudioInitializer />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          {children}
        </div>
        {/* 全局浮动音乐按钮 */}
        <div className="fixed bottom-6 right-6 z-[90]">
          <MusicToggle />
        </div>
      </body>
    </html>
  )
}