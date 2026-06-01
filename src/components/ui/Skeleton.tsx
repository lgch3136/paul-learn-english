'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'circle' | 'rect'
  count?: number
}

export default function Skeleton({ className = '', variant = 'text', count = 1 }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gray-200 rounded'

  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-2xl',
    circle: 'h-12 w-12 rounded-full',
    rect: 'h-6 w-24 rounded',
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${baseClass} ${variants[variant]} ${className}`} />
      ))}
    </>
  )
}

// 预制的骨架屏组合
export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton variant="circle" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  )
}

export function WordCardSkeleton() {
  return (
    <div className="card space-y-4 p-6">
      <div className="text-center space-y-2">
        <Skeleton variant="text" className="h-10 w-48 mx-auto" />
        <Skeleton variant="text" className="h-4 w-32 mx-auto" />
      </div>
      <div className="h-px bg-gray-100" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="rect" className="h-14" />
        <Skeleton variant="rect" className="h-14" />
        <Skeleton variant="rect" className="h-14" />
        <Skeleton variant="rect" className="h-14" />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3">
          <Skeleton variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="text-center mb-8 space-y-3">
        <Skeleton variant="rect" className="h-8 w-48 mx-auto" />
        <Skeleton variant="text" className="w-64 mx-auto" />
      </div>
      <div className="max-w-md mx-auto">
        <CardSkeleton />
      </div>
    </div>
  )
}
