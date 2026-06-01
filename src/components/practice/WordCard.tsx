'use client'

interface WordCardProps {
  word: string
  phonetic?: string
  sentence?: string
  isCorrect?: boolean | null // null = 未答, true = 正确, false = 错误
  className?: string
}

export default function WordCard({ word, phonetic, sentence, isCorrect, className = '' }: WordCardProps) {
  const bgColor = isCorrect === true
    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
    : isCorrect === false
    ? 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200'
    : 'bg-gradient-to-br from-white to-gray-50'

  return (
    <div className={`card transition-all duration-500 ${bgColor} ${className}`}>
      <div className="text-center mb-4">
        <div className="inline-block">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2 drop-shadow-sm">
            {word}
          </h2>
          {phonetic && (
            <p className="text-lg text-gray-500 font-medium">{phonetic}</p>
          )}
        </div>
        {sentence && (
          <p className="text-gray-600 mt-3 italic text-base sm:text-lg">
            "{sentence}"
          </p>
        )}
      </div>
    </div>
  )
}
