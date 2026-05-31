'use client'

import Link from 'next/link'
import { sounds } from '@/lib/sounds'

interface BackButtonProps {
  href?: string
  onClick?: () => void
  label?: string
  className?: string
}

export default function BackButton({ href, onClick, label = '返回首页', className = '' }: BackButtonProps) {
  const handleClick = () => {
    sounds.click()
    if (onClick) onClick()
  }

  const content = (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 font-semibold text-sm shadow-sm hover:shadow-md hover:bg-white hover:border-gray-300 transition-all duration-300 transform hover:-translate-x-0.5 active:scale-95 ${className}`}
    >
      <span className="text-lg">←</span>
      {label}
    </span>
  )

  if (href) {
    return <Link href={href} onClick={() => sounds.click()}>{content}</Link>
  }

  return <button onClick={handleClick}>{content}</button>
}
