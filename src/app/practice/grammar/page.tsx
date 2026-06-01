'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'
import GrammarScopeSelector, { GrammarScope } from '@/components/practice/GrammarScopeSelector'
import { sounds } from '@/lib/sounds'

interface GrammarPoint {
  grammar_id: string
  grammar_point: string
  student_explanation: string
  correct_examples: { sentence: string; translation: string }[]
  wrong_examples: { sentence: string; correction: string }[]
  error_tags: string[]
}

export default function GrammarPractice() {
  const [grammarData, setGrammarData] = useState<GrammarPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<GrammarScope | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [selectedExample, setSelectedExample] = useState<'correct' | 'wrong' | null>(null)
  const [score, setScore] = useState(0)

  const loadGrammar = async (scope: GrammarScope) => {
    try {
      setLoading(true)
      let allPoints: GrammarPoint[] = []
      for (const unit of scope.units) {
        try {
          const response = await fetch(`/api/grammar?unit=${encodeURIComponent(unit)}`)
          const data = await response.json()
          if (data.success && data.grammar_points) {
            allPoints = [...allPoints, ...data.grammar_points]
          }
        } catch (e) {
          console.error(`加载 ${unit} 失败:`, e)
        }
      }
      // 去重
      const seen = new Set<string>()
      const unique = allPoints.filter(p => {
        if (seen.has(p.grammar_id)) return false
        seen.add(p.grammar_id)
        return true
      })
      // 随机打乱
      const shuffled = [...unique].sort(() => Math.random() - 0.5)
      setGrammarData(shuffled)
      setCurrentIndex(0)
      setScore(0)
      setShowExplanation(false)
      setSelectedExample(null)
    } catch (error) {
      console.error('加载语法数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScopeSelect = (newScope: GrammarScope) => {
    sounds.correct()
    setScope(newScope)
    loadGrammar(newScope)
  }

  const currentGrammar = grammarData[currentIndex]

  const handleExampleSelect = (type: 'correct' | 'wrong') => {
    if (!currentGrammar) return
    sounds.click()
    setSelectedExample(type)
    setShowExplanation(true)
    if (type === 'correct') {
      setScore(score + 1)
      sounds.correct()
    } else {
      sounds.wrong()
    }
  }

  const handleNext = () => {
    if (grammarData.length === 0) return
    if (currentIndex < grammarData.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowExplanation(false)
      setSelectedExample(null)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setScore(0)
    setShowExplanation(false)
    setSelectedExample(null)
    if (scope) loadGrammar(scope)
  }

  // 范围选择界面
  if (!scope) {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <header className="text-center mb-8">
          <BackButton href="/" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">📝 语法小练</h1>
          <p className="text-gray-600">选择要练习的语法范围</p>
        </header>
        <GrammarScopeSelector onSelect={handleScopeSelect} />
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载语法数据...</p>
        </div>
      </main>
    )
  }

  if (grammarData.length === 0) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-600 mb-4">未找到语法数据</p>
          <button onClick={() => setScope(null)} className="btn-primary">重新选择范围</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* 头部 */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => { sounds.click(); setScope(null); setGrammarData([]) }} className="text-blue-500 hover:text-blue-600">
            ← 切换范围
          </button>
          <BackButton href="/" label="首页" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">📝 语法小练</h1>
        <p className="text-gray-600">{scope.label} · 学习语法规则</p>
      </header>

      {/* 进度和得分 */}
      <div className="max-w-md mx-auto mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center py-3">
            <p className="text-xs text-gray-600">进度</p>
            <p className="text-2xl font-bold text-blue-600">{currentIndex + 1}/{grammarData.length}</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xs text-gray-600">得分</p>
            <p className="text-2xl font-bold text-green-600">{score}</p>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-md mx-auto mb-6">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIndex + 1) / grammarData.length) * 100}%` }} />
        </div>
      </div>

      {/* 语法点卡片 */}
      <div className="max-w-md mx-auto mb-6">
        <div className="card">
          <div className="text-center mb-4">
            <span className="text-4xl mb-2 block">📚</span>
            <h2 className="text-xl font-bold text-gray-800">{currentGrammar?.grammar_point || ''}</h2>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium mb-1">💡 小学生解释：</p>
            <p className="text-blue-700">{currentGrammar?.student_explanation || ''}</p>
          </div>
        </div>
      </div>

      {/* 例句对比 */}
      <div className="max-w-md mx-auto mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">哪个句子是正确的？</h3>
        <div className="space-y-3">
          {currentGrammar?.correct_examples?.slice(0, 1).map((example, index) => (
            <button
              key={`correct-${index}`}
              onClick={() => handleExampleSelect('correct')}
              disabled={showExplanation}
              className={`w-full card text-left transition-all duration-300 ${
                showExplanation
                  ? selectedExample === 'correct'
                    ? 'bg-green-50 border-2 border-green-500 scale-105'
                    : 'bg-green-50 border-2 border-green-300'
                  : 'hover:scale-105 hover:shadow-lg'
              }`}
            >
              <p className="font-medium text-gray-800">{example.sentence}</p>
              <p className="text-sm text-gray-600 mt-1">{example.translation}</p>
              {showExplanation && selectedExample === 'correct' && (
                <p className="text-sm text-green-600 mt-2 font-medium">✅ 正确！</p>
              )}
            </button>
          ))}

          {currentGrammar?.wrong_examples?.slice(0, 1).map((example, index) => (
            <button
              key={`wrong-${index}`}
              onClick={() => handleExampleSelect('wrong')}
              disabled={showExplanation}
              className={`w-full card text-left transition-all duration-300 ${
                showExplanation
                  ? selectedExample === 'wrong'
                    ? 'bg-red-50 border-2 border-red-500'
                    : 'bg-red-50 border-2 border-red-300'
                  : 'hover:scale-105 hover:shadow-lg'
              }`}
            >
              <p className="font-medium text-gray-800">{example.sentence}</p>
              {showExplanation && (
                <div className="mt-2">
                  <p className="text-sm text-red-600">❌ 错误</p>
                  <p className="text-sm text-green-600 mt-1">正确：{example.correction}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 详细解释 */}
      {showExplanation && (
        <div className="max-w-md mx-auto mb-6 animate-bounce-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
            <div className="relative p-6 text-white">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="text-2xl">📝</span> 语法要点
              </h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="font-medium text-lg leading-relaxed">{currentGrammar?.student_explanation || ''}</p>
              </div>
              {currentGrammar?.error_tags && currentGrammar.error_tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 opacity-90">⚠️ 常见错误：</p>
                  <div className="flex flex-wrap gap-2">
                    {currentGrammar.error_tags.map((tag, index) => (
                      <span key={index} className="bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 下一题按钮 */}
      {showExplanation && (
        <div className="max-w-md mx-auto mb-8 text-center">
          <button onClick={handleNext} className="btn-primary text-lg px-8 py-3">
            {currentIndex < grammarData.length - 1 ? '下一题 →' : '完成练习 🎊'}
          </button>
        </div>
      )}

      {/* 完成提示 */}
      {currentIndex === grammarData.length - 1 && showExplanation && (
        <div className="max-w-md mx-auto mb-8 animate-bounce-in">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 p-6 text-white text-center">
              <span className="text-5xl mb-3 block">🎉</span>
              <h2 className="text-2xl font-bold">语法练习完成！</h2>
            </div>
            <div className="bg-white p-6">
              <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-600 mb-1">答对题数</p>
                <p className="text-4xl font-bold text-green-600">{score}/{grammarData.length}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/" className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 hover:bg-gray-200">返回首页</Link>
                <button onClick={handleRestart} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg">再练一次</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-gray-500 text-sm pb-8">
        <p>学习语法，让英语更准确！</p>
      </footer>
    </main>
  )
}
