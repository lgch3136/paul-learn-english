'use client'

interface OptionGridProps {
  options: string[]
  selectedAnswer: string | null
  correctAnswer: string
  showResult: boolean
  onSelect: (option: string) => void
}

export default function OptionGrid({ options, selectedAnswer, correctAnswer, showResult, onSelect }: OptionGridProps) {
  const gradients = [
    'from-blue-400 to-blue-500',
    'from-purple-400 to-purple-500',
    'from-green-400 to-green-500',
    'from-orange-400 to-orange-500',
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option)}
          disabled={showResult}
          className={`relative overflow-hidden p-4 rounded-xl text-base sm:text-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            showResult
              ? option === correctAnswer
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-105'
                : option === selectedAnswer
                ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-400'
              : `bg-gradient-to-br ${gradients[index]} text-white shadow-md hover:shadow-xl`
          }`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <span className="relative">{option}</span>
        </button>
      ))}
    </div>
  )
}
