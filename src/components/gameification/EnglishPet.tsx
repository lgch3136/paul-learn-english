'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// 可选的宠物皮肤
export interface PetSkin {
  id: string
  emoji: string
  name: string
  description: string
}
export const PET_SKINS: PetSkin[] = [
  { id: 'cat', emoji: '🐱', name: 'Kitty', description: 'A cute kitten' },
  { id: 'dog', emoji: '🐶', name: 'Puppy', description: 'A loyal puppy' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny', description: 'A hopping bunny' },
  { id: 'panda', emoji: '🐼', name: 'Panda', description: 'A cuddly panda' },
  { id: 'fox', emoji: '🦊', name: 'Fox', description: 'A clever fox' },
  { id: 'owl', emoji: '🦉', name: 'Owl', description: 'A wise owl' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', description: 'A magical unicorn' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', description: 'A friendly dragon' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', description: 'A cool penguin' },
  { id: 'frog', emoji: '🐸', name: 'Frog', description: 'A jumpy frog' },
  { id: 'monkey', emoji: '🐵', name: 'Monkey', description: 'A playful monkey' },
  { id: 'tiger', emoji: '🐯', name: 'Tiger', description: 'A brave tiger' },
]

// 每种皮肤的进化形态（按等级范围，同物种内演化）
// Baby(1-3) → Teen(4-6) → Adult(7-10) → Ultimate(11+)
const PET_EVOLUTIONS: Record<string, string[]> = {
  cat:      ['🐱', '😺', '😸', '🐈'],
  dog:      ['🐶', '🐕', '🦮', '🐩'],
  bunny:    ['🐰', '🐇', '🐹', '🐿️'],
  panda:    ['🐼', '🐨', '🐻', '🐻‍❄️'],
  fox:      ['🦊', '🐺', '🐩', '🦝'],
  owl:      ['🦉', '🐦', '🦅', '🦆'],
  unicorn:  ['🦄', '🐴', '🐎', '🪽'],
  dragon:   ['🐉', '🦎', '🐊', '🦖'],
  penguin:  ['🐧', '🐦', '🦆', '🦩'],
  frog:     ['🐸', '🦎', '🐢', '🐊'],
  monkey:   ['🐵', '🐒', '🦧', '🦍'],
  tiger:    ['🐯', '🐱', '🐆', '🐅'],
}

// 根据皮肤和等级获取当前形态 emoji
function getPetEmoji(skinId: string, level: number): string {
  const forms = PET_EVOLUTIONS[skinId] || PET_EVOLUTIONS.cat
  if (level <= 3) return forms[0]
  if (level <= 6) return forms[1]
  if (level <= 10) return forms[2]
  return forms[3]
}

// 成长阶段（基于积分，无上限，难度递增）
interface PetStage {
  level: number
  title: string
  minPoints: number
  size: number
  glowColor: string
}

const GLOW_COLORS = [
  '#ffb74d', '#81c784', '#64b5f6', '#ba68c8', '#f06292',
  '#ffd54f', '#4dd0e1', '#ff8a65', '#aed581', '#7986cb',
  '#e57373', '#4db6ac', '#ffb74d', '#9575cd', '#4fc3f7',
]

const STAGE_TITLES = [
  'Baby', 'Toddler', 'Kid', 'Teen', 'Adult', 'Hero', 'Legend',
  'Star', 'Master', 'Champion', 'Guardian', 'Mythic',
]

function getPetStage(points: number): PetStage {
  // 动态计算等级：每级所需积分递增 35% + 80
  let level = 1
  let minPoints = 0
  let nextThreshold = 100
  while (points >= nextThreshold) {
    level++
    minPoints = nextThreshold
    nextThreshold = Math.floor(nextThreshold * 1.35 + 80)
  }
  // 大小随等级增长，上限 100px
  const size = Math.min(50 + (level - 1) * 4, 100)
  const glowColor = GLOW_COLORS[(level - 1) % GLOW_COLORS.length]
  const titleIdx = Math.min(level - 1, STAGE_TITLES.length - 1)
  const titleSuffix = level > STAGE_TITLES.length ? ` Lv.${level}` : ''
  const title = STAGE_TITLES[titleIdx] + titleSuffix
  return { level, title, minPoints, size, glowColor }
}

function getNextStageThreshold(points: number): number | null {
  let threshold = 100
  while (points >= threshold) {
    threshold = Math.floor(threshold * 1.35 + 80)
  }
  // 没有上限，始终有下一级
  return threshold
}

// 宠物动作类型
type PetAction = 'idle' | 'bounce' | 'spin' | 'wiggle' | 'jump' | 'dance' | 'wave' | 'sleep'

// 英文短语库
interface WordEntry { word: string; emoji: string }
const ENGLISH_WORDS: WordEntry[] = [
  { word: 'apple', emoji: '🍎' }, { word: 'book', emoji: '📚' },
  { word: 'cat', emoji: '🐱' }, { word: 'dog', emoji: '🐶' },
  { word: 'sun', emoji: '☀️' }, { word: 'moon', emoji: '🌙' },
  { word: 'star', emoji: '⭐' }, { word: 'fish', emoji: '🐟' },
  { word: 'bird', emoji: '🐦' }, { word: 'tree', emoji: '🌳' },
  { word: 'flower', emoji: '🌸' }, { word: 'heart', emoji: '❤️' },
  { word: 'happy', emoji: '😊' }, { word: 'smile', emoji: '😄' },
  { word: 'love', emoji: '💕' }, { word: 'dream', emoji: '💭' },
  { word: 'rainbow', emoji: '🌈' }, { word: 'music', emoji: '🎵' },
  { word: 'school', emoji: '🏫' }, { word: 'pencil', emoji: '✏️' },
  { word: 'water', emoji: '💧' }, { word: 'friend', emoji: '🤝' },
  { word: 'house', emoji: '🏠' }, { word: 'play', emoji: '🎯' },
]

const ENGLISH_PHRASES: Record<string, string[]> = {
  greet: [
    'Hello! 👋', 'Hi friend! ✨', 'Good to see you! 😊',
    'How are you? 🌈', 'Nice day to learn! 💫', 'Hey there! 🎈',
  ],
  correct: [
    'Great job! 🎉', "You're amazing! ⭐", 'Keep it up! 💪',
    'Wonderful! 🌟', 'So proud! 🏆', 'You rock! 🤘',
    'Awesome! 💎', 'Brilliant! ✨', 'Perfect! 💯',
  ],
  wrong: [
    "Don't give up! 💪", 'Try again! 🌟', 'You can do it! 💫',
    'Almost there! 🎯', 'Keep trying! 📚', 'Next time! 😊',
  ],
  combo: [
    'On fire! 🔥', 'Unstoppable! ⚡', 'Amazing streak! 🌟',
    'So cool! 😎', 'Legendary! 👑', 'Wow wow wow! 🎊',
  ],
  idle: [
    'English is fun! 📖', 'I love words! 🔤', 'Learning rocks! 🎸',
    'Words are magic! 🪄', 'Read with me! 📚', 'Let\'s play! 🎮',
    'What\'s your favorite word? 🤔', 'I like stories! 📕',
  ],
  click: [
    'That tickles! 😆', 'Hee hee! 🤭', 'You found me! 🙈',
    'Again! Again! 🎉', 'So fun! 🥳', 'I like you! 💕',
    'Pet me more! 🐾', 'Yay! 🎊',
  ],
}

interface EnglishPetProps {
  points?: number
  onCorrect?: number
  onWrong?: number
  onCombo?: number
  mode?: 'inline' | 'floating'
}

export default function EnglishPet({ points: externalPoints, onCorrect, onWrong, onCombo, mode = 'floating' }: EnglishPetProps) {
  const [petPoints, setPetPoints] = useState(0)
  const [petName, setPetName] = useState('')
  const [skinId, setSkinId] = useState('cat')
  const [showNameInput, setShowNameInput] = useState(false)
  const [showSkinPicker, setShowSkinPicker] = useState(false)
  const [speech, setSpeech] = useState<string | null>(null)
  const [speechType, setSpeechType] = useState<'word' | 'phrase' | 'reaction'>('phrase')
  const [showSpeech, setShowSpeech] = useState(false)
  const [action, setAction] = useState<PetAction>('idle')
  const [petScale, setPetScale] = useState(1)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  const heartIdRef = useRef(0)
  // 拖拽状态
  const [petPos, setPetPos] = useState<{ x: number; y: number } | null>(null)
  const dragRef = useRef<{ active: boolean; moved: boolean; startX: number; startY: number; origX: number; origY: number }>({ active: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 })
  const floatingRef = useRef<HTMLDivElement>(null)
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null)
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prevCorrectRef = useRef(0)
  const prevWrongRef = useRef(0)
  const prevComboRef = useRef(0)

  // 加载持久化数据
  useEffect(() => {
    try {
      const savedPoints = localStorage.getItem('paul_english_points')
      if (savedPoints) setPetPoints(parseInt(savedPoints))
      const savedName = localStorage.getItem('paul_english_pet_name')
      if (savedName) setPetName(savedName)
      const savedSkin = localStorage.getItem('paul_english_pet_skin')
      if (savedSkin) setSkinId(savedSkin)
    } catch (e) {}
  }, [])

  // 同步外部积分
  useEffect(() => {
    if (externalPoints !== undefined) setPetPoints(externalPoints)
    else {
      try {
        const saved = localStorage.getItem('paul_english_points')
        if (saved) setPetPoints(parseInt(saved))
      } catch (e) {}
    }
  }, [externalPoints])

  // 保存名字
  const saveName = (name: string) => {
    setPetName(name)
    setShowNameInput(false)
    try { localStorage.setItem('paul_english_pet_name', name) } catch (e) {}
  }

  // 保存皮肤
  const saveSkin = (id: string) => {
    setSkinId(id)
    setShowSkinPicker(false)
    try { localStorage.setItem('paul_english_pet_skin', id) } catch (e) {}
  }

  const skin = PET_SKINS.find(s => s.id === skinId) || PET_SKINS[0]

  // 当前阶段（动态计算，无上限）
  const currentStage = getPetStage(petPoints)
  const nextThreshold = getNextStageThreshold(petPoints)
  const evolvedEmoji = getPetEmoji(skinId, currentStage.level)
  const stageProgress = nextThreshold !== null
    ? Math.round(((petPoints - currentStage.minPoints) / (nextThreshold - currentStage.minPoints)) * 100)
    : 100

  // 显示气泡
  const showBubble = useCallback((text: string, type: 'word' | 'phrase' | 'reaction', duration = 3500) => {
    setSpeech(text)
    setSpeechType(type)
    setShowSpeech(true)
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
    speechTimerRef.current = setTimeout(() => setShowSpeech(false), duration)
  }, [])

  // 触发动作
  const triggerAction = useCallback((act: PetAction, duration = 1500) => {
    setAction(act)
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current)
    actionTimerRef.current = setTimeout(() => setAction('idle'), duration)
  }, [])

  // 答对反应
  useEffect(() => {
    if (onCorrect !== undefined && onCorrect !== prevCorrectRef.current && onCorrect > 0) {
      prevCorrectRef.current = onCorrect
      const phrases = ENGLISH_PHRASES.correct
      showBubble(phrases[Math.floor(Math.random() * phrases.length)], 'reaction')
      const actions: PetAction[] = ['bounce', 'jump', 'dance', 'spin']
      triggerAction(actions[Math.floor(Math.random() * actions.length)])
      // 爱心特效
      const hId = heartIdRef.current++
      setHearts(prev => [...prev.slice(-5), { id: hId, x: Math.random() * 40 - 20, y: -20 }])
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== hId)), 1500)
    }
  }, [onCorrect, showBubble, triggerAction])

  // 答错反应
  useEffect(() => {
    if (onWrong !== undefined && onWrong !== prevWrongRef.current && onWrong > 0) {
      prevWrongRef.current = onWrong
      const phrases = ENGLISH_PHRASES.wrong
      showBubble(phrases[Math.floor(Math.random() * phrases.length)], 'reaction', 2500)
      triggerAction('wiggle')
    }
  }, [onWrong, showBubble, triggerAction])

  // 连击反应
  useEffect(() => {
    if (onCombo !== undefined && onCombo !== prevComboRef.current && onCombo >= 3) {
      prevComboRef.current = onCombo
      const phrases = ENGLISH_PHRASES.combo
      showBubble(phrases[Math.floor(Math.random() * phrases.length)], 'reaction')
      triggerAction('dance', 2500)
    }
  }, [onCombo, showBubble, triggerAction])

  // 自动聊天
  useEffect(() => {
    const schedule = () => {
      const delay = 10000 + Math.random() * 15000
      return setTimeout(() => {
        const rand = Math.random()
        if (rand < 0.3) {
          const w = ENGLISH_WORDS[Math.floor(Math.random() * ENGLISH_WORDS.length)]
          showBubble(`${w.emoji} ${w.word}`, 'word', 4000)
        } else if (rand < 0.6) {
          const p = ENGLISH_PHRASES.idle[Math.floor(Math.random() * ENGLISH_PHRASES.idle.length)]
          showBubble(p, 'phrase')
        } else {
          const displayName = petName || skin.name
          showBubble(`${displayName} wants to learn! 📖`, 'phrase')
        }
        // 随机动作
        if (Math.random() < 0.4) {
          const actions: PetAction[] = ['wave', 'spin', 'bounce']
          triggerAction(actions[Math.floor(Math.random() * actions.length)], 1000)
        }
        speechTimerRef.current = schedule()
      }, delay)
    }
    speechTimerRef.current = schedule()
    return () => { if (speechTimerRef.current) clearTimeout(speechTimerRef.current) }
  }, [showBubble, triggerAction, petName, skin])

  // 清理
  useEffect(() => {
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current)
    }
  }, [])

  // 点击互动（拖拽时不触发）
  const handlePetClick = () => {
    if (dragRef.current.moved) return
    setPetScale(1.2)
    setTimeout(() => setPetScale(1), 150)
    const phrases = ENGLISH_PHRASES.click
    showBubble(phrases[Math.floor(Math.random() * phrases.length)], 'reaction', 2500)
    const actions: PetAction[] = ['bounce', 'spin', 'jump', 'dance', 'wave']
    triggerAction(actions[Math.floor(Math.random() * actions.length)])
    // 爱心
    const hId = heartIdRef.current++
    setHearts(prev => [...prev.slice(-5), { id: hId, x: Math.random() * 30 - 15, y: -15 }])
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== hId)), 1200)
  }

  // 拖拽处理（仅 floating 模式）
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'floating') return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    // 首次拖动时从 DOM 读取真实位置，避免跳到 (0,0)
    let origX = petPos?.x
    let origY = petPos?.y
    if (origX === undefined && floatingRef.current) {
      const rect = floatingRef.current.getBoundingClientRect()
      origX = rect.left
      origY = rect.top
    }
    dragRef.current = {
      active: true,
      moved: false,
      startX: clientX,
      startY: clientY,
      origX: origX ?? 0,
      origY: origY ?? 0,
    }
  }, [mode, petPos])

  useEffect(() => {
    if (mode !== 'floating') return
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.active) return
      e.preventDefault()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const dx = clientX - dragRef.current.startX
      const dy = clientY - dragRef.current.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true
      }
      // 约束在视口内（留 20px 边距）
      const petW = 160, petH = 200
      const newX = Math.max(0, Math.min(window.innerWidth - petW, dragRef.current.origX + dx))
      const newY = Math.max(0, Math.min(window.innerHeight - petH, dragRef.current.origY + dy))
      setPetPos({ x: newX, y: newY })
    }
    const handleEnd = () => {
      dragRef.current.active = false
      dragRef.current.moved = false
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [mode])

  // 动作 CSS 类
  const actionClass = {
    idle: 'animate-float',
    bounce: 'animate-pet-bounce',
    spin: 'animate-pet-spin',
    wiggle: 'animate-pet-wiggle',
    jump: 'animate-pet-jump',
    dance: 'animate-pet-dance',
    wave: 'animate-pet-wave',
    sleep: 'animate-float',
  }[action]

  const petContent = (
    <div className="relative select-none" style={{ transform: `scale(${petScale})`, transition: 'transform 0.15s ease-out' }}>
      {/* 爱心特效 */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="absolute text-lg pointer-events-none animate-heart-float"
          style={{ left: `calc(50% + ${h.x}px)`, top: `calc(50% + ${h.y}px)` }}
        >
          ❤️
        </span>
      ))}

      {/* 宠物主体 */}
      <button
        onClick={handlePetClick}
        className={`relative cursor-pointer focus:outline-none ${actionClass} transition-all duration-300`}
        title={`${petName || skin.name} - Lv.${currentStage.level} - ${petPoints} pts`}
      >
        {/* 外围光晕 */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-25"
          style={{
            background: `radial-gradient(circle, ${currentStage.glowColor}, transparent)`,
            width: currentStage.size + 35,
            height: currentStage.size + 35,
            left: -17.5,
            top: -17.5,
          }}
        />
        {/* 影子 */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-3 bg-black/10 rounded-full blur-sm" />
        {/* 表情 */}
        <span
          className="block drop-shadow-lg"
          style={{ fontSize: `${currentStage.size}px`, lineHeight: 1 }}
        >
          {evolvedEmoji}
        </span>
      </button>

      {/* 对话气泡 */}
      {showSpeech && speech && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 animate-bubble-in z-50 pointer-events-none">
          <div className={`
            relative px-4 py-2.5 rounded-2xl shadow-lg border-2 border-white/50 max-w-[220px]
            ${speechType === 'word'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : speechType === 'reaction'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
              : 'bg-white text-gray-800'
            }
          `}>
            <p className={`text-sm font-bold text-center ${speechType === 'word' ? 'text-lg tracking-wide' : ''}`}>
              {speech}
            </p>
            <div className={`
              absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45
              ${speechType === 'word' ? 'bg-purple-600' : speechType === 'reaction' ? 'bg-orange-500' : 'bg-white border-r-2 border-b-2 border-white/50'}
            `} />
          </div>
        </div>
      )}

      {/* 信息标签栏 */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-1">
        {/* 名字按钮 */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowNameInput(true) }}
          className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/80 shadow-sm hover:bg-white transition-colors"
        >
          {petName ? `✏️ ${petName}` : '✏️ Name me!'}
        </button>
        {/* 皮肤按钮 */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowSkinPicker(true) }}
          className="px-2 py-0.5 rounded-full text-xs bg-white/80 shadow-sm hover:bg-white transition-colors"
        >
          🎨
        </button>
      </div>

      {/* 等级标签 */}
      <div className="absolute -top-4 -right-2">
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white shadow-sm border" style={{ borderColor: currentStage.glowColor }}>
          Lv.{currentStage.level}
        </span>
      </div>

      {/* 命名弹窗 */}
      {showNameInput && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full -mt-2 z-50">
          <div className="bg-white rounded-xl shadow-xl p-3 border-2 border-purple-200 min-w-[160px]">
            <p className="text-xs font-bold text-purple-600 mb-2 text-center">Give me a name! 🌟</p>
            <input
              autoFocus
              defaultValue={petName}
              placeholder="Your name?"
              className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
              maxLength={12}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName((e.target as HTMLInputElement).value || skin.name)
                if (e.key === 'Escape') setShowNameInput(false)
              }}
            />
            <div className="flex gap-2">
              <button onClick={() => {
                const input = document.querySelector('.pet-name-input') as HTMLInputElement
                saveName(input?.value || skin.name)
              }} className="flex-1 bg-purple-500 text-white text-xs rounded-lg py-1 font-bold hover:bg-purple-600">
                OK!
              </button>
              <button onClick={() => setShowNameInput(false)} className="flex-1 bg-gray-200 text-gray-600 text-xs rounded-lg py-1 hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 皮肤选择弹窗 */}
      {showSkinPicker && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full -mt-2 z-50">
          <div className="bg-white rounded-xl shadow-xl p-3 border-2 border-pink-200 min-w-[200px]">
            <p className="text-xs font-bold text-pink-600 mb-2 text-center">Choose your friend! 🎨</p>
            <div className="grid grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto mb-2">
              {PET_SKINS.map(s => (
                <button
                  key={s.id}
                  onClick={() => saveSkin(s.id)}
                  className={`text-2xl p-1.5 rounded-lg transition-all hover:scale-110 ${skinId === s.id ? 'bg-purple-100 ring-2 ring-purple-400 scale-110' : 'hover:bg-gray-100'}`}
                  title={s.description}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            <button onClick={() => setShowSkinPicker(false)} className="w-full bg-gray-200 text-gray-600 text-xs rounded-lg py-1 hover:bg-gray-300">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // 进度条（无上限，始终有下一级）
  const nextStageForBar = nextThreshold !== null ? getPetStage(nextThreshold) : null
  const progressBar = (
    <div className="mt-1">
      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
        <span>{currentStage.title}</span>
        <span>→ {nextStageForBar ? nextStageForBar.title : '...'}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(stageProgress, 100)}%`, background: `linear-gradient(90deg, ${currentStage.glowColor}, ${nextStageForBar ? nextStageForBar.glowColor : currentStage.glowColor})` }}
        />
      </div>
    </div>
  )

  if (mode === 'floating') {
    const posStyle = petPos ? {
      left: `${petPos.x}px`,
      top: `${petPos.y}px`,
      right: 'auto',
      bottom: 'auto',
    } : {
      right: '1.5rem',
      bottom: '1.5rem',
    }
    return (
      <div
        ref={floatingRef}
        className="fixed z-40 select-none"
        style={{
          ...posStyle,
          cursor: dragRef.current.active ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div style={{ width: currentStage.size + 50, height: currentStage.size + 130 }}>
          {petContent}
          <div className="absolute bottom-0 left-0 right-0 px-1">
            <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
              <span>⭐ {petPoints}</span>
              <span>{stageProgress}%</span>
            </div>
            {progressBar}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div style={{ width: currentStage.size + 40, height: currentStage.size + 80 }}>
        {petContent}
      </div>
      <div className="flex-1 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-gray-800 text-sm">
            {evolvedEmoji} {petName || skin.name}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: currentStage.glowColor + '30', color: currentStage.glowColor }}>
            Lv.{currentStage.level}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <span>⭐ {petPoints} pts</span>
          <span>·</span>
          <span>{currentStage.title}</span>
        </div>
        {progressBar}
      </div>
    </div>
  )
}
