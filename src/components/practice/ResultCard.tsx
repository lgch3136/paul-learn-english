'use client'

interface ResultCardProps {
  isCorrect: boolean
  correctMeaning: string
  phrase?: string[]
  errorTags?: string[]
  onNext: () => void
  isLast: boolean
}

export default function ResultCard({ isCorrect, correctMeaning, phrase, errorTags, onNext, isLast }: ResultCardProps) {
  return (
    <div className="animate-bounce-in">
      <div className={`relative overflow-hidden rounded-2xl shadow-xl ${
        isCorrect
          ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'
          : 'bg-gradient-to-br from-orange-400 via-red-400 to-pink-500'
      }`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

        <div className="relative p-6 text-white text-center">
          <span className="text-5xl mb-3 block">{isCorrect ? '🎉' : '💪'}</span>
          <h3 className="text-2xl font-bold mb-2">
            {isCorrect ? '太棒了！' : '加油，再想想！'}
          </h3>
          <p className="opacity-90 text-lg mb-4">
            {isCorrect
              ? '你已经掌握了这个单词的意思！'
              : `正确答案是：${correctMeaning}`
            }
          </p>

          {isCorrect && phrase && phrase.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-sm font-medium mb-1 opacity-90">📝 常见短语：</p>
              <p className="text-white">{phrase.slice(0, 3).join('、')}</p>
            </div>
          )}

          {!isCorrect && errorTags && errorTags.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-sm font-bold mb-2">💡 错因分析：</p>
              <div className="bg-white/30 rounded-lg p-3">
                <p className="font-medium text-lg">{errorTags[0]}</p>
              </div>
            </div>
          )}

          <button
            onClick={onNext}
            className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 shadow-lg"
          >
            {isLast ? '完成练习 🎊' : '下一题 →'}
          </button>
        </div>
      </div>
    </div>
  )
}
