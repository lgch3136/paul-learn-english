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

const units = [
  { id: 'Unit 1', title: 'What do you do?', icon: '🎯', color: 'from-blue-400 to-blue-600' },
  { id: 'Unit 2', title: 'How do you come to school?', icon: '🚌', color: 'from-purple-400 to-purple-600' },
  { id: 'Unit 3', title: 'Asking the way', icon: '🗺️', color: 'from-green-400 to-green-600' },
  { id: 'Unit 4', title: 'Seeing the doctor', icon: '🏥', color: 'from-red-400 to-red-600' },
  { id: 'Unit 5', title: 'Helping our parents', icon: '👨‍👩‍👧', color: 'from-orange-400 to-orange-600' },
  { id: 'Unit 6', title: 'In the kitchen', icon: '🍳', color: 'from-yellow-400 to-yellow-600' },
  { id: 'Unit 7', title: 'Chinese festivals', icon: '🧧', color: 'from-pink-400 to-pink-600' },
  { id: 'Unit 8', title: 'Birthdays', icon: '🎂', color: 'from-cyan-400 to-cyan-600' },
]

const quickOptions = [
  {
    type: 'semester' as const,
    title: '本学期全部',
    description: '复习本学期所有单元',
    icon: '📚',
    gradient: 'from-indigo-400 to-purple-600'
  },
  {
    type: 'all' as const,
    title: '历史所有',
    description: '包含三四年级内容',
    icon: '🌍',
    gradient: 'from-emerald-400 to-teal-600'
  },
]

const questionCounts = [
  { count: 10, label: '10题', icon: '⚡', description: '快速练习', color: 'from-green-400 to-emerald-500' },
  { count: 20, label: '20题', icon: '📚', description: '标准练习', color: 'from-blue-400 to-indigo-500' },
  { count: 30, label: '30题', icon: '💪', description: '强化练习', color: 'from-purple-400 to-pink-500' },
  { count: 50, label: '50题', icon: '🔥', description: '极限挑战', color: 'from-orange-400 to-red-500' },
]

export default function UnitSelector({ onSelect, currentScope }: UnitSelectorProps) {
  const [selectedUnits, setSelectedUnits] = useState<string[]>(currentScope?.units || [])
  const [selectedCount, setSelectedCount] = useState(10)

  const handleQuickSelect = (type: 'semester' | 'all') => {
    sounds.click()
    if (type === 'semester') {
      onSelect({
        type: 'semester',
        units: units.map(u => u.id),
        label: '本学期全部',
        questionCount: selectedCount
      })
    } else {
      onSelect({
        type: 'all',
        units: ['all'],
        label: '历史所有',
        questionCount: selectedCount
      })
    }
  }

  const handleUnitToggle = (unitId: string) => {
    sounds.click()
    setSelectedUnits(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId)
      } else {
        return [...prev, unitId]
      }
    })
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
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        📖 选择练习范围
      </h2>

      {/* 快速选择 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {quickOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleQuickSelect(option.type)}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${option.gradient} p-6 text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-300" />
            <div className="relative">
              <span className="text-4xl mb-2 block">{option.icon}</span>
              <h3 className="font-bold text-lg mb-1">{option.title}</h3>
              <p className="text-sm opacity-90">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 分隔线 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 text-sm">选择单元</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 单元选择 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {units.map((unit) => {
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
              <p className={`text-xs mt-1 ${isSelected ? 'opacity-90' : 'text-gray-500'}`}>
                {unit.title}
              </p>
            </button>
          )
        })}
      </div>

      {/* 题目数量选择 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">选择题量</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {questionCounts.map((item) => (
            <button
              key={item.count}
              onClick={() => {
                sounds.click()
                setSelectedCount(item.count)
              }}
              className={`p-3 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                selectedCount === item.count
                  ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
              }`}
            >
              <span className="text-2xl block mb-1">{item.icon}</span>
              <p className="font-bold">{item.label}</p>
              <p className={`text-xs ${selectedCount === item.count ? 'opacity-90' : 'text-gray-500'}`}>
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 确认按钮 */}
      {selectedUnits.length > 0 && (
        <div className="text-center animate-bounce-in">
          <button
            onClick={handleCustomConfirm}
            className="btn-primary text-lg px-8 py-4"
          >
            开始练习 {selectedCount} 题 🚀
          </button>
          <p className="text-sm text-gray-500 mt-2">
            已选择: {selectedUnits.join(', ')} · {selectedCount} 题
          </p>
        </div>
      )}

      {/* 提示 */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>💡 建议：选择多个单元可以进行综合复习</p>
      </div>
    </div>
  )
}
