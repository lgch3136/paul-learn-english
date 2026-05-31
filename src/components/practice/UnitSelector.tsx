'use client'

import { useState } from 'react'
import { sounds } from '@/lib/sounds'

export interface GameScope {
  type: 'single' | 'multiple' | 'semester' | 'all'
  units: string[]
  label: string
  questionCount: number
}

interface UnitSelectorProps {
  onSelect: (scope: GameScope) => void
  currentScope?: GameScope
}

const primaryUnits = [
  { id: 'Unit 1', title: 'What do you do?', icon: '🎯', color: 'from-blue-400 to-blue-600' },
  { id: 'Unit 2', title: 'How do you come to school?', icon: '🚌', color: 'from-purple-400 to-purple-600' },
  { id: 'Unit 3', title: 'Asking the way', icon: '🗺️', color: 'from-green-400 to-green-600' },
  { id: 'Unit 4', title: 'Seeing the doctor', icon: '🏥', color: 'from-red-400 to-red-600' },
  { id: 'Unit 5', title: 'Helping our parents', icon: '👨‍👩‍👧', color: 'from-orange-400 to-orange-600' },
  { id: 'Unit 6', title: 'In the kitchen', icon: '🍳', color: 'from-yellow-400 to-yellow-600' },
  { id: 'Unit 7', title: 'Chinese festivals', icon: '🧧', color: 'from-pink-400 to-pink-600' },
  { id: 'Unit 8', title: 'Birthdays', icon: '🎂', color: 'from-cyan-400 to-cyan-600' },
]

const gradeUnits = [
  { id: 'grade-3-up', title: '三年级上', icon: '📗', color: 'from-lime-400 to-lime-600' },
  { id: 'grade-3-down', title: '三年级下', icon: '📗', color: 'from-teal-400 to-teal-600' },
  { id: 'grade-4-up', title: '四年级上', icon: '📘', color: 'from-sky-400 to-sky-600' },
  { id: 'grade-4-down', title: '四年级下', icon: '📘', color: 'from-indigo-400 to-indigo-600' },
]

const adultStages = [
  { id: 'adult1', title: '基础850词', subtitle: 'Ogden\'s Basic English', icon: '🌍', color: 'from-emerald-400 to-emerald-600' },
  { id: 'adult2', title: '雅思6.5词汇', subtitle: '~1000高频词', icon: '🎓', color: 'from-blue-400 to-indigo-600' },
  { id: 'adult3', title: '专业英语', subtitle: '海外生活工作', icon: '💼', color: 'from-purple-400 to-violet-600' },
]

const questionCounts = [
  { count: 10, label: '10题', icon: '⚡', description: '快速练习', color: 'from-green-400 to-emerald-500' },
  { count: 20, label: '20题', icon: '📚', description: '标准练习', color: 'from-blue-400 to-indigo-500' },
  { count: 30, label: '30题', icon: '💪', description: '强化练习', color: 'from-purple-400 to-pink-500' },
  { count: 50, label: '50题', icon: '🔥', description: '极限挑战', color: 'from-orange-400 to-red-500' },
]

export default function UnitSelector({ onSelect, currentScope }: UnitSelectorProps) {
  const [tab, setTab] = useState<'primary' | 'adult'>('primary')
  const [selectedUnits, setSelectedUnits] = useState<string[]>(currentScope?.units || [])
  const [selectedCount, setSelectedCount] = useState(10)

  const handleQuickSelect = (units: string[], label: string) => {
    sounds.correct()
    onSelect({
      type: 'semester',
      units,
      label,
      questionCount: selectedCount
    })
  }

  const handleAllSelect = () => {
    sounds.correct()
    onSelect({
      type: 'all',
      units: ['all'],
      label: '全部单词',
      questionCount: selectedCount
    })
  }

  const handleUnitToggle = (unitId: string) => {
    sounds.click()
    setSelectedUnits(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    )
  }

  const handleCustomConfirm = () => {
    if (selectedUnits.length === 0) return
    sounds.correct()
    const label = selectedUnits.length === 1
      ? selectedUnits[0]
      : `${selectedUnits[0]} 等 ${selectedUnits.length} 个单元`
    onSelect({
      type: selectedUnits.length === 1 ? 'single' : 'multiple',
      units: selectedUnits,
      label,
      questionCount: selectedCount
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">📖 选择练习范围</h2>

      {/* Tab切换 */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => { sounds.click(); setTab('primary'); setSelectedUnits([]) }}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            tab === 'primary'
              ? 'bg-white text-blue-600 shadow-lg'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎒 小学组
        </button>
        <button
          onClick={() => { sounds.click(); setTab('adult'); setSelectedUnits([]) }}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            tab === 'adult'
              ? 'bg-white text-purple-600 shadow-lg'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🧑 成人组
        </button>
      </div>

      {tab === 'primary' && (
        <>
          {/* 快速选择 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleQuickSelect(primaryUnits.map(u => u.id), '五年级下册全部')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 p-5 text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
              <span className="text-3xl mb-1 block">📚</span>
              <h3 className="font-bold text-base">五年级下册</h3>
              <p className="text-xs opacity-80">Unit 1-8 全部</p>
            </button>
            <button
              onClick={handleAllSelect}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-5 text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
              <span className="text-3xl mb-1 block">🌍</span>
              <h3 className="font-bold text-base">历史全部</h3>
              <p className="text-xs opacity-80">含三四年级</p>
            </button>
          </div>

          {/* 五年级单元 */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 font-medium mb-3 text-center uppercase tracking-wider">五年级下册单元</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {primaryUnits.map((unit) => {
                const isSelected = selectedUnits.includes(unit.id)
                return (
                  <button
                    key={unit.id}
                    onClick={() => handleUnitToggle(unit.id)}
                    className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? `bg-gradient-to-br ${unit.color} text-white shadow-lg scale-105`
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-500 text-xs font-bold">✓</span>
                      </div>
                    )}
                    <span className="text-2xl mb-1 block">{unit.icon}</span>
                    <p className="font-bold text-sm">{unit.id}</p>
                    <p className={`text-xs mt-1 truncate ${isSelected ? 'opacity-90' : 'text-gray-500'}`}>{unit.title}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 三四年级 */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-medium mb-3 text-center uppercase tracking-wider">三四年级内容</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gradeUnits.map((unit) => {
                const isSelected = selectedUnits.includes(unit.id)
                return (
                  <button
                    key={unit.id}
                    onClick={() => handleUnitToggle(unit.id)}
                    className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? `bg-gradient-to-br ${unit.color} text-white shadow-lg scale-105`
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-500 text-xs font-bold">✓</span>
                      </div>
                    )}
                    <span className="text-2xl mb-1 block">{unit.icon}</span>
                    <p className="font-bold text-sm">{unit.title}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {tab === 'adult' && (
        <div className="space-y-4 mb-6">
          {adultStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => {
                sounds.correct()
                onSelect({
                  type: 'single',
                  units: [stage.id],
                  label: stage.title,
                  questionCount: selectedCount
                })
              }}
              className={`group relative overflow-hidden w-full rounded-2xl bg-gradient-to-br ${stage.color} p-6 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center gap-4">
                <span className="text-5xl">{stage.icon}</span>
                <div className="text-left">
                  <h3 className="font-bold text-xl">{stage.title}</h3>
                  <p className="text-sm opacity-85 mt-1">{stage.subtitle}</p>
                </div>
                <span className="ml-auto text-2xl opacity-60">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 题量选择 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm font-medium">选择题量</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {questionCounts.map((item) => (
            <button
              key={item.count}
              onClick={() => { sounds.click(); setSelectedCount(item.count) }}
              className={`p-3 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                selectedCount === item.count
                  ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
              }`}
            >
              <span className="text-2xl block mb-1">{item.icon}</span>
              <p className="font-bold">{item.label}</p>
              <p className={`text-xs ${selectedCount === item.count ? 'opacity-90' : 'text-gray-500'}`}>{item.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义确认 */}
      {selectedUnits.length > 0 && (
        <div className="text-center animate-bounce-in">
          <button onClick={handleCustomConfirm} className="btn-primary text-lg px-8 py-4">
            开始练习 {selectedCount} 题 🚀
          </button>
          <p className="text-sm text-gray-500 mt-2">
            已选择: {selectedUnits.join(', ')} · {selectedCount} 题
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>💡 选择多个单元可进行综合复习</p>
      </div>
    </div>
  )
}
