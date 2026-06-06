'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { sounds } from '@/lib/sounds'
import { vibrate, createConfetti } from '@/lib/animations'

interface Word {
  word: string
  meaning: string
  phonetic: string
  word_id?: string
}

interface WordShootingModeProps {
  words: Word[]
  onComplete: (score: number, totalWords: number) => void
  onBack: () => void
  onAnswer?: (wordId: string, isCorrect: boolean) => void
  onCombo?: (combo: number) => void
}

interface Target {
  id: string
  word: string
  wordId: string
  x: number
  y: number
  baseX: number
  baseY: number
  radius: number
  isCorrect: boolean
  type: 'normal' | 'gold' | 'diamond'
  hit: boolean
  hitTime: number
  hitByProjectile: boolean
  wobble: number
  showCorrect: boolean
  floatPhaseX: number
  floatPhaseY: number
  floatSpeedX: number
  floatSpeedY: number
  floatAmpX: number
  floatAmpY: number
  driftSpeed: number
  driftDir: number
}

// 粒子系统
interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; color: string; size: number
  type: 'spark' | 'dust' | 'confetti' | 'leaf' | 'star'
  rotation: number; rotationSpeed: number
}

// 飘动云朵
interface Cloud {
  x: number; y: number; speed: number; scale: number; opacity: number
}

type Phase = 'start' | 'ready' | 'aiming' | 'flying' | 'hit' | 'miss' | 'complete'

const TARGET_TYPES = {
  normal: { points: 1, color: '#ef4444', bgColor: '#fef2f2', ring1: '#dc2626', ring2: '#fca5a5' },
  gold: { points: 2, color: '#f59e0b', bgColor: '#fffbeb', ring1: '#d97706', ring2: '#fde68a' },
  diamond: { points: 3, color: '#8b5cf6', bgColor: '#f5f3ff', ring1: '#7c3aed', ring2: '#c4b5fd' },
}

const CANVAS_W = 440
const CANVAS_H = 560
const GROUND_Y = 480
const RIVER_Y = 410          // 河流顶部（弹弓正前方）
const RIVER_H = 55           // 河流高度
const GRAVITY = 0.35
const DRAG_POWER = 0.32
const MAX_DRAG = 120
const MAX_LIVES = 5
const PROJECTILE_RADIUS = 13

// 弩几何（底部居中，向下拖拽弦发射）
const SLING_BASE_X = 220
const SLING_BASE_Y = 477
const SLING_JOINT_X = 220             // 弩臂中心
const SLING_JOINT_Y = 418             // 弦上端
const SLING_REST_X = 220              // 弦静止中心
const SLING_REST_Y = 433              // 弦静止Y
const SLING_LAUNCH_X = SLING_REST_X   // 发射起点X
const SLING_LAUNCH_Y = SLING_REST_Y   // 发射起点Y
const BOW_LIMB_LEN = 52               // 弩臂长度
const BOW_LIMB_DROP = 8               // 弩臂尖端下弯
const SLING_FORK_L_X = SLING_JOINT_X - BOW_LIMB_LEN
const SLING_FORK_L_Y = SLING_JOINT_Y + BOW_LIMB_DROP
const SLING_FORK_R_X = SLING_JOINT_X + BOW_LIMB_LEN
const SLING_FORK_R_Y = SLING_JOINT_Y + BOW_LIMB_DROP

// 靶子预设位置（漂浮在河对岸空中）
const PRESET_POSITIONS = [
  { x: 66,  y: 90 },  { x: 220, y: 80 },  { x: 374, y: 90 },
  { x: 143, y: 230 }, { x: 297, y: 230 },
  { x: 66,  y: 350 }, { x: 374, y: 350 },
]

// 排行榜数据
interface LeaderboardEntry {
  name: string
  combo: number
  time: number
  date: string
}
const LEADERBOARD_KEY = 'paul_english_shooting_leaderboard'

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {}
  return []
}

function saveLeaderboard(combo: number): LeaderboardEntry[] {
  if (combo < 2) return loadLeaderboard()
  const list = loadLeaderboard()
  const petName = (() => { try { return localStorage.getItem('paul_english_pet_name') || 'Player' } catch { return 'Player' } })()
  const now = new Date()
  list.push({
    name: petName,
    combo,
    time: Math.round((Date.now() - (window as any).__comboStartTime) / 1000) || 0,
    date: `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
  })
  list.sort((a, b) => b.combo - a.combo)
  const top10 = list.slice(0, 10)
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10)) } catch (e) {}
  return top10
}

function getCurrentRank(combo: number): number {
  if (combo < 2) return -1
  const list = loadLeaderboard()
  // 找到 combo 在排行榜中的位置 (1-based)
  let rank = 1
  for (const entry of list) {
    if (combo > entry.combo) break
    rank++
  }
  return Math.min(rank, 11) // 最多显示第11名（不在榜上）
}

export default function WordShootingMode({ words, onComplete, onBack, onAnswer, onCombo }: WordShootingModeProps) {
  const [phase, setPhase] = useState<Phase>('start')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [maxCombo, setMaxCombo] = useState(0)
  const [comboDisplay, setComboDisplay] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [comboText, setComboText] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(loadLeaderboard())
  const [showRecord, setShowRecord] = useState(false)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef<Phase>('start')
  const scoreRef = useRef(0)
  const correctCountRef = useRef(0)
  const streakRef = useRef(0)
  const livesRef = useRef(MAX_LIVES)
  const maxComboRef = useRef(0)
  const comboStartTimeRef = useRef(0)
  const levelRef = useRef(1)
  const answeredRef = useRef(0)
  const targetsRef = useRef<Target[]>([])
  const currentMeaningRef = useRef('')
  const correctWordRef = useRef('')
  const correctWordIdRef = useRef('')

  // 拖拽状态
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const dragCurrentRef = useRef({ x: 0, y: 0 })

  // 弹射物状态
  const projectileRef = useRef({ x: SLING_LAUNCH_X, y: SLING_LAUNCH_Y, vx: 0, vy: 0, active: false, rotation: 0 })
  const projectileTrailRef = useRef<{ x: number; y: number; alpha: number; size: number }[]>([])

  // 爆炸动画
  const explosionsRef = useRef<{ x: number; y: number; time: number; color: string; text: string; particles?: { x: number; y: number; vx: number; vy: number }[] }[]>([])

  // 粒子系统
  const particlesRef = useRef<Particle[]>([])

  // 飘动云朵
  const cloudsRef = useRef<Cloud[]>([])

  // 全局动画时间
  const animTimeRef = useRef(0)

  // 弹弓叉架旋转角度
  const slingAngleRef = useRef(0)

  // 击中冲击波 + 屏幕闪白
  const shockwavesRef = useRef<{ x: number; y: number; time: number; color: string }[]>([])
  const screenFlashRef = useRef<{ time: number; color: string } | null>(null)

  const gameLoopRef = useRef<number>(0)
  const lastTimeRef = useRef(0)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null)

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
    return a
  }

  // 生成粒子
  const spawnParticles = useCallback((x: number, y: number, count: number, color: string, type: Particle['type'] = 'spark', speed = 3) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const spd = (Math.random() * 0.7 + 0.3) * speed
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * spd + (Math.random() - 0.5) * 1.5,
        vy: Math.sin(angle) * spd - Math.random() * 2,
        life: 1, maxLife: 1,
        color, size: type === 'confetti' ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      })
    }
  }, [])

  // 初始化云朵
  const initClouds = useCallback(() => {
    cloudsRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * CANVAS_W,
      y: 20 + Math.random() * 80,
      speed: 0.15 + Math.random() * 0.25,
      scale: 0.5 + Math.random() * 0.8,
      opacity: 0.4 + Math.random() * 0.4,
    }))
  }, [])

  // 准备新题目
  const prepareQuestion = useCallback(() => {
    const word = words[Math.floor(Math.random() * words.length)]
    currentMeaningRef.current = word.meaning
    correctWordRef.current = word.word
    correctWordIdRef.current = word.word_id || ''

    const count = Math.min(3 + Math.floor(levelRef.current / 2), 7)
    const wrongPool = shuffleArray(words.filter(w => w.word !== word.word)).slice(0, count - 1)
    const allWords = shuffleArray([word, ...wrongPool])
    const positions = shuffleArray([...PRESET_POSITIONS]).slice(0, allWords.length)

    targetsRef.current = allWords.map((w, i) => {
      const typeRand = Math.random()
      const type = typeRand < 0.55 ? 'normal' : typeRand < 0.82 ? 'gold' : 'diamond'
      const bx = positions[i].x, by = positions[i].y
      return {
        id: `t-${Date.now()}-${i}`,
        word: w.word, wordId: w.word_id || '',
        x: bx, y: by, baseX: bx, baseY: by,
        radius: 32, isCorrect: w.word === word.word,
        type, hit: false, hitTime: 0, hitByProjectile: false,
        wobble: Math.random() * Math.PI * 2, showCorrect: false,
        floatPhaseX: Math.random() * Math.PI * 2,
        floatPhaseY: Math.random() * Math.PI * 2,
        floatSpeedX: 0.6 + Math.random() * 1.0,
        floatSpeedY: 0.8 + Math.random() * 1.2,
        floatAmpX: 18 + Math.random() * 22,
        floatAmpY: 10 + Math.random() * 18,
        driftSpeed: (Math.random() - 0.5) * 0.4,
        driftDir: Math.random() > 0.5 ? 1 : -1,
      }
    })

    projectileRef.current = { x: SLING_LAUNCH_X, y: SLING_LAUNCH_Y, vx: 0, vy: 0, active: false, rotation: 0 }
    projectileTrailRef.current = []
    phaseRef.current = 'ready'
    setPhase('ready')
  }, [words])

  // 结束游戏
  const endGame = useCallback(() => {
    phaseRef.current = 'complete'
    setPhase('complete')
    cancelAnimationFrame(gameLoopRef.current)
    if (correctCountRef.current >= words.length * 0.5) sounds.complete()
    // 保存排行榜
    saveLeaderboard(maxComboRef.current)
    onComplete(correctCountRef.current, words.length)
  }, [onComplete, words.length])
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) { gameLoopRef.current = requestAnimationFrame(gameLoop); return }
    const ctx = canvas.getContext('2d')
    if (!ctx) { gameLoopRef.current = requestAnimationFrame(gameLoop); return }

    const now = Date.now()
    const dt = lastTimeRef.current ? Math.min((now - lastTimeRef.current) / 16.67, 3) : 1
    lastTimeRef.current = now
    animTimeRef.current += dt * 0.016

    // ===== 物理更新 =====
    const proj = projectileRef.current
    if (proj.active && phaseRef.current === 'flying') {
      proj.x += proj.vx * dt; proj.y += proj.vy * dt
      // 直线飞行，无重力
      proj.rotation = Math.atan2(proj.vy, proj.vx)
      projectileTrailRef.current.push({ x: proj.x, y: proj.y, alpha: 1, size: PROJECTILE_RADIUS * 0.8 })
      if (projectileTrailRef.current.length > 30) projectileTrailRef.current.shift()

      // 碰撞检测
      for (const t of targetsRef.current) {
        if (t.hit) continue
        const dist = Math.hypot(proj.x - t.x, proj.y - t.y)
        if (dist < t.radius + PROJECTILE_RADIUS) {
          t.hit = true; t.hitTime = now; t.hitByProjectile = true
          proj.active = false

          if (t.isCorrect) {
            t.showCorrect = true
            const newStreak = streakRef.current + 1
            streakRef.current = newStreak
            // 连击追踪：始终更新当前连击显示
            if (newStreak === 1) comboStartTimeRef.current = now
            setComboDisplay(newStreak)
            if (newStreak > maxComboRef.current) {
              maxComboRef.current = newStreak
              setMaxCombo(newStreak)
              ;(window as any).__comboStartTime = comboStartTimeRef.current
              // 破纪录提示
              setShowRecord(true)
              if (recordTimerRef.current) clearTimeout(recordTimerRef.current)
              recordTimerRef.current = setTimeout(() => setShowRecord(false), 1800)
            }
            const bonus = newStreak >= 3 ? 2 : 0
            const pts = TARGET_TYPES[t.type].points + bonus
            scoreRef.current += pts; correctCountRef.current += 1; answeredRef.current += 1
            setScore(scoreRef.current); setCorrectCount(correctCountRef.current); setStreak(newStreak)

            sounds.correct(); vibrate(100)
            screenFlashRef.current = { time: now, color: 'rgba(255,255,255,0.3)' }
            if (onAnswer && t.wordId) onAnswer(t.wordId, true)

            // 击中特效
            explosionsRef.current.push({ x: t.x, y: t.y, time: now, color: '#22c55e', text: `+${pts}` })
            shockwavesRef.current.push({ x: t.x, y: t.y, time: now, color: '#22c55e' })
            spawnParticles(t.x, t.y, 20, '#4ade80', 'spark', 4)
            spawnParticles(t.x, t.y, 12, '#fbbf24', 'confetti', 3)
            spawnParticles(t.x, t.y, 8, '#8d6e63', 'dust', 2.5) // 木屑飞溅

            if (newStreak >= 3) {
              const texts: Record<number, string> = { 3: '🔥 三连中！', 5: '⚡ 五连中！', 7: '💥 超级连中！', 10: '🌟 神射手！' }
              setComboText(texts[Math.min(newStreak, 10)] || `💫 ×${newStreak} 连中！`)
              setShowCombo(true); sounds.streak()
              if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
              comboTimerRef.current = setTimeout(() => setShowCombo(false), 1200)
              onCombo?.(newStreak)
            }

            if (answeredRef.current % 6 === 0) levelRef.current += 1
            if (canvasRef.current) createConfetti(canvasRef.current, 30)
            phaseRef.current = 'hit'; setPhase('hit')
            setTimeout(() => { if (phaseRef.current === 'hit') prepareQuestion() }, 1200)
          } else {
            t.showCorrect = true
            streakRef.current = 0; setStreak(0); setComboDisplay(0)
            livesRef.current -= 1; setLives(livesRef.current)
            sounds.wrong(); vibrate(200)
            if (onAnswer && t.wordId) onAnswer(t.wordId, false)
            explosionsRef.current.push({ x: t.x, y: t.y, time: now, color: '#ef4444', text: '❌' })
            shockwavesRef.current.push({ x: t.x, y: t.y, time: now, color: '#ef4444' })
            spawnParticles(t.x, t.y, 15, '#ef4444', 'spark', 3)
            // 显示正确靶子
            targetsRef.current.forEach(tgt => { if (tgt.isCorrect) tgt.showCorrect = true })
            if (livesRef.current <= 0) { setTimeout(() => endGame(), 800); return }
            phaseRef.current = 'miss'; setPhase('miss')
            setTimeout(() => { if (phaseRef.current === 'miss') prepareQuestion() }, 1500)
          }
          break
        }
      }

      // 墙壁反弹（左、右、上边缘）
      const BOUNCE_DAMP = 0.82
      if (proj.active && proj.x < PROJECTILE_RADIUS) {
        proj.x = PROJECTILE_RADIUS; proj.vx = Math.abs(proj.vx) * BOUNCE_DAMP
        sounds.click(); vibrate(30)
        spawnParticles(PROJECTILE_RADIUS, proj.y, 6, '#90caf9', 'spark', 2)
      }
      if (proj.active && proj.x > CANVAS_W - PROJECTILE_RADIUS) {
        proj.x = CANVAS_W - PROJECTILE_RADIUS; proj.vx = -Math.abs(proj.vx) * BOUNCE_DAMP
        sounds.click(); vibrate(30)
        spawnParticles(CANVAS_W - PROJECTILE_RADIUS, proj.y, 6, '#90caf9', 'spark', 2)
      }
      if (proj.active && proj.y < PROJECTILE_RADIUS) {
        proj.y = PROJECTILE_RADIUS; proj.vy = Math.abs(proj.vy) * BOUNCE_DAMP
        sounds.click(); vibrate(30)
        spawnParticles(proj.x, PROJECTILE_RADIUS, 6, '#90caf9', 'spark', 2)
      }
      // 脱靶：飞出底部（弹弓下方）
      if (proj.active && proj.y > GROUND_Y + 40) {
        proj.active = false
        streakRef.current = 0; setStreak(0); setComboDisplay(0)
        sounds.wrong(); vibrate(100)
        livesRef.current -= 1; setLives(livesRef.current)
        targetsRef.current.forEach(t => { if (t.isCorrect) t.showCorrect = true })
        explosionsRef.current.push({ x: Math.min(Math.max(proj.x, 20), CANVAS_W - 20), y: GROUND_Y - 15, time: now, color: '#6b7280', text: '脱靶！' })
        spawnParticles(Math.min(Math.max(proj.x, 20), CANVAS_W - 20), GROUND_Y - 15, 10, '#9ca3af', 'dust', 2)
        if (livesRef.current <= 0) { setTimeout(() => endGame(), 800); return }
        phaseRef.current = 'miss'; setPhase('miss')
        setTimeout(() => { if (phaseRef.current === 'miss') prepareQuestion() }, 1200)
      }
    }

    // 轨迹衰减
    projectileTrailRef.current = projectileTrailRef.current.filter(t => { t.alpha -= 0.035; t.size *= 0.96; return t.alpha > 0 })
    explosionsRef.current = explosionsRef.current.filter(e => now - e.time < 1200)
    shockwavesRef.current = shockwavesRef.current.filter(s => now - s.time < 600)

    // 粒子更新
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt
      p.vy += 0.08 * dt // 轻微重力
      p.life -= 0.02 * dt
      p.rotation += p.rotationSpeed * dt
      return p.life > 0
    })

    // 云朵移动
    for (const c of cloudsRef.current) {
      c.x += c.speed * dt
      if (c.x > CANVAS_W + 60) c.x = -80
    }

    // 环境粒子（飘落的叶子 + 阳光尘埃）
    if (Math.random() < 0.02) {
      const leafColors = ['#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9']
      particlesRef.current.push({
        x: Math.random() * CANVAS_W, y: -5,
        vx: (Math.random() - 0.5) * 0.5, vy: 0.3 + Math.random() * 0.4,
        life: 1, maxLife: 1,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        size: 2 + Math.random() * 3, type: 'leaf',
        rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.08,
      })
    }
    // 阳光尘埃（缓慢漂浮的微小光点）
    if (Math.random() < 0.04) {
      particlesRef.current.push({
        x: Math.random() * CANVAS_W, y: 30 + Math.random() * 300,
        vx: (Math.random() - 0.5) * 0.15, vy: -0.05 + Math.random() * 0.1,
        life: 1, maxLife: 1,
        color: '#fff8e1', size: 1 + Math.random() * 1.5, type: 'star',
        rotation: 0, rotationSpeed: 0,
      })
    }

    // 靶子空中漂浮移动
    for (const t of targetsRef.current) {
      t.wobble += 0.015 * dt
      // 正弦浮动 + 缓慢漂移
      t.floatPhaseX += t.floatSpeedX * 0.025 * dt
      t.floatPhaseY += t.floatSpeedY * 0.025 * dt
      const floatX = Math.sin(t.floatPhaseX) * t.floatAmpX + Math.cos(t.floatPhaseX * 0.7) * t.floatAmpX * 0.3
      const floatY = Math.sin(t.floatPhaseY) * t.floatAmpY + Math.cos(t.floatPhaseY * 1.3) * t.floatAmpY * 0.25
      // 缓慢的水平漂移（带方向反转）
      t.baseX += t.driftSpeed * t.driftDir * dt
      if (t.baseX < 40) { t.baseX = 40; t.driftDir = 1 }
      if (t.baseX > CANVAS_W - 40) { t.baseX = CANVAS_W - 40; t.driftDir = -1 }
      // 缓慢改变漂移方向
      if (Math.random() < 0.002 * dt) { t.driftDir *= -1 }
      // 垂直方向浮动范围限制
      const minY = 50
      const maxY = RIVER_Y - t.radius - 15
      const newY = t.baseY + floatY
      t.x = t.baseX + floatX
      t.y = Math.max(minY, Math.min(maxY, newY))
    }

    // 弩臂跟随瞄准方向旋转
    let targetAngle = 0
    if (phaseRef.current === 'aiming' && isDraggingRef.current) {
      const dp = dragCurrentRef.current
      const ddx = dp.x - SLING_JOINT_X
      const ddy = dp.y - SLING_JOINT_Y
      const dragDist = Math.hypot(ddx, ddy)
      if (dragDist > 10) {
        const rawAngle = Math.atan2(-ddx, ddy)
        targetAngle = Math.max(-55 * Math.PI / 180, Math.min(55 * Math.PI / 180, rawAngle))
      }
    } else {
      targetAngle = Math.sin(animTimeRef.current * 1.5) * 2 * Math.PI / 180
    }
    slingAngleRef.current += (targetAngle - slingAngleRef.current) * 0.25 * dt

    // ===== 绘制 =====
    const W = CANVAS_W
    const H = CANVAS_H
    const t = animTimeRef.current

    // --- 1. 天空背景（多层渐变 + 微妙的光线散射） ---
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H)
    skyGrad.addColorStop(0, '#3a7bd5')
    skyGrad.addColorStop(0.15, '#6db3f2')
    skyGrad.addColorStop(0.35, '#87ceeb')
    skyGrad.addColorStop(0.55, '#b0dfef')
    skyGrad.addColorStop(0.7, '#c8e6c9')
    skyGrad.addColorStop(0.85, '#a5d6a7')
    skyGrad.addColorStop(1, '#81c784')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, W, H)

    // 天空大气散射（太阳方向的暖光渐变）
    const atmGrad = ctx.createRadialGradient(W - 60, 45, 10, W - 60, 180, 280)
    atmGrad.addColorStop(0, 'rgba(255,245,200,0.18)')
    atmGrad.addColorStop(0.4, 'rgba(255,230,170,0.08)')
    atmGrad.addColorStop(1, 'rgba(255,220,150,0)')
    ctx.fillStyle = atmGrad; ctx.fillRect(0, 0, W, H * 0.7)

    // --- 2. 太阳光晕（多层辉光） ---
    const sunX = W - 55, sunY = 42
    // 外层大辉光
    const sunGlow3 = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 90)
    sunGlow3.addColorStop(0, 'rgba(255,250,200,0.35)')
    sunGlow3.addColorStop(0.3, 'rgba(255,240,180,0.15)')
    sunGlow3.addColorStop(1, 'rgba(255,220,100,0)')
    ctx.fillStyle = sunGlow3; ctx.fillRect(sunX - 95, sunY - 95, 190, 190)
    // 中层辉光
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 45)
    sunGlow.addColorStop(0, 'rgba(255,255,240,0.8)')
    sunGlow.addColorStop(0.4, 'rgba(255,240,180,0.3)')
    sunGlow.addColorStop(1, 'rgba(255,220,100,0)')
    ctx.fillStyle = sunGlow; ctx.fillRect(sunX - 50, sunY - 50, 100, 100)
    // 太阳本体（带光晕）
    ctx.beginPath(); ctx.arc(sunX, sunY, 18, 0, Math.PI * 2)
    const sunGrad = ctx.createRadialGradient(sunX - 4, sunY - 4, 0, sunX, sunY, 18)
    sunGrad.addColorStop(0, '#fffef0'); sunGrad.addColorStop(0.5, '#fff8c4')
    sunGrad.addColorStop(0.8, '#ffe082'); sunGrad.addColorStop(1, '#ffc107')
    ctx.fillStyle = sunGrad; ctx.fill()
    // 太阳光芒
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 1.5
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 0.2
      ctx.beginPath()
      ctx.moveTo(sunX + Math.cos(a) * 22, sunY + Math.sin(a) * 22)
      ctx.lineTo(sunX + Math.cos(a) * 38, sunY + Math.sin(a) * 38)
      ctx.stroke()
    }
    ctx.restore()

    // --- 3. 远山（更柔和，带空气透视） ---
    // 最远山（大气蓝灰色调）
    ctx.fillStyle = 'rgba(120,170,190,0.18)'
    ctx.beginPath(); ctx.moveTo(-10, 290)
    ctx.bezierCurveTo(40, 210, 100, 230, 160, 255)
    ctx.bezierCurveTo(220, 235, 280, 220, 340, 245)
    ctx.bezierCurveTo(370, 235, 400, 240, 420, 248)
    ctx.bezierCurveTo(430, 250, 435, 258, 440, 265)
    ctx.lineTo(440, 320); ctx.lineTo(-10, 320); ctx.fill()
    // 雪顶
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.beginPath(); ctx.moveTo(70, 225); ctx.bezierCurveTo(75, 210, 82, 212, 92, 218); ctx.closePath(); ctx.fill()
    ctx.beginPath(); ctx.moveTo(335, 240); ctx.bezierCurveTo(340, 228, 348, 232, 352, 238); ctx.closePath(); ctx.fill()

    // 中山（翠绿，更立体）
    const midMtnGrad = ctx.createLinearGradient(0, 270, 0, 340)
    midMtnGrad.addColorStop(0, 'rgba(76,145,90,0.35)')
    midMtnGrad.addColorStop(1, 'rgba(60,120,70,0.25)')
    ctx.fillStyle = midMtnGrad
    ctx.beginPath(); ctx.moveTo(-10, 315)
    ctx.bezierCurveTo(50, 275, 100, 290, 150, 295)
    ctx.bezierCurveTo(200, 270, 250, 280, 300, 290)
    ctx.bezierCurveTo(350, 275, 380, 280, 420, 290)
    ctx.bezierCurveTo(435, 293, 440, 300, 440, 305)
    ctx.lineTo(440, 350); ctx.lineTo(-10, 350); ctx.fill()
    // 中山高光面（阳光侧）
    ctx.fillStyle = 'rgba(100,180,110,0.12)'
    ctx.beginPath(); ctx.moveTo(180, 278)
    ctx.bezierCurveTo(200, 270, 220, 272, 240, 278)
    ctx.lineTo(240, 310); ctx.lineTo(180, 310); ctx.fill()
    // 中山雪顶
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath(); ctx.moveTo(193, 277); ctx.bezierCurveTo(198, 268, 206, 270, 212, 275); ctx.closePath(); ctx.fill()

    // --- 3.5 远景树木（带光影层次） ---
    const drawTree = (tx: number, ty: number, trunkH: number, crownR: number, color: string, shadowColor: string) => {
      // 树干阴影
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.beginPath(); ctx.roundRect(tx - 1, ty - trunkH + 1, 5, trunkH, 1); ctx.fill()
      // 树干
      const trunkGrad = ctx.createLinearGradient(tx - 2, 0, tx + 3, 0)
      trunkGrad.addColorStop(0, '#5d4037'); trunkGrad.addColorStop(0.5, '#795548'); trunkGrad.addColorStop(1, '#4e342e')
      ctx.fillStyle = trunkGrad
      ctx.beginPath(); ctx.roundRect(tx - 2, ty - trunkH, 5, trunkH + 2, 1); ctx.fill()
      // 树冠阴影
      ctx.fillStyle = shadowColor
      ctx.beginPath(); ctx.arc(tx + 2, ty - trunkH - crownR * 0.35, crownR * 0.72, 0, Math.PI * 2); ctx.fill()
      // 树冠（多层叠合，更饱满）
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(tx, ty - trunkH - crownR * 0.4, crownR * 0.72, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(tx - crownR * 0.5, ty - trunkH - crownR * 0.1, crownR * 0.55, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(tx + crownR * 0.45, ty - trunkH - crownR * 0.12, crownR * 0.52, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(tx, ty - trunkH - crownR * 0.85, crownR * 0.48, 0, Math.PI * 2); ctx.fill()
      // 树冠高光（阳光面）
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath(); ctx.arc(tx - crownR * 0.2, ty - trunkH - crownR * 0.6, crownR * 0.35, 0, Math.PI * 2); ctx.fill()
    }
    drawTree(25, GROUND_Y - 4, 24, 18, 'rgba(56,142,60,0.35)', 'rgba(30,90,35,0.15)')
    drawTree(75, GROUND_Y - 2, 20, 14, 'rgba(67,160,71,0.3)', 'rgba(40,100,45,0.12)')
    drawTree(410, GROUND_Y - 3, 22, 16, 'rgba(46,125,50,0.35)', 'rgba(25,80,30,0.15)')
    drawTree(170, GROUND_Y - 1, 14, 10, 'rgba(76,165,80,0.2)', 'rgba(50,110,55,0.08)')
    drawTree(230, GROUND_Y, 12, 9, 'rgba(80,170,85,0.18)', 'rgba(50,110,55,0.06)')
    drawTree(320, GROUND_Y - 2, 15, 11, 'rgba(55,140,55,0.22)', 'rgba(35,90,40,0.09)')

    // --- 4. 云朵（漂浮动画，带阴影） ---
    const drawCloudShape = (cx: number, cy: number, s: number, opacity: number) => {
      // 云朵阴影
      ctx.save(); ctx.globalAlpha = opacity * 0.15
      ctx.fillStyle = '#607d8b'
      ctx.beginPath(); ctx.arc(cx + 3, cy + 8, 20 * s, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 20 * s + 3, cy - 4, 15 * s, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx - 16 * s + 3, cy + 1, 13 * s, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      // 云朵本体（带渐变）
      ctx.save(); ctx.globalAlpha = opacity
      const cg = ctx.createRadialGradient(cx, cy - 8 * s, 0, cx, cy, 25 * s)
      cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#e8f0f8')
      ctx.fillStyle = cg
      ctx.beginPath(); ctx.arc(cx, cy, 22 * s, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 20 * s, cy - 10 * s, 17 * s, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx - 18 * s, cy - 5 * s, 15 * s, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 8 * s, cy - 18 * s, 13 * s, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx - 8 * s, cy - 14 * s, 11 * s, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
    for (const c of cloudsRef.current) {
      drawCloudShape(c.x, c.y, c.scale, c.opacity)
    }

    // 飞鸟（带投影）
    const drawBird = (bx: number, by: number, wingPhase: number, size: number) => {
      const wing = Math.sin(wingPhase) * 4.5 * size
      // 鸟影
      ctx.strokeStyle = 'rgba(60,60,80,0.15)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(bx - 7 * size, by + wing + 1)
      ctx.quadraticCurveTo(bx - 2 * size, by - 2.5 * size + 1, bx, by + 1)
      ctx.quadraticCurveTo(bx + 2 * size, by - 2.5 * size + 1, bx + 7 * size, by + wing + 1)
      ctx.stroke()
      // 鸟本体
      ctx.strokeStyle = 'rgba(50,50,70,0.45)'; ctx.lineWidth = 1.3
      ctx.beginPath()
      ctx.moveTo(bx - 7 * size, by + wing)
      ctx.quadraticCurveTo(bx - 2 * size, by - 2.5 * size, bx, by)
      ctx.quadraticCurveTo(bx + 2 * size, by - 2.5 * size, bx + 7 * size, by + wing)
      ctx.stroke()
    }
    drawBird(180 + (t * 15) % 120, 52 + Math.sin(t * 0.8) * 5, t * 6, 1)
    drawBird(260 + (t * 12) % 100, 32 + Math.sin(t * 0.6 + 1) * 4, t * 5 + 1, 0.75)
    drawBird(95 + (t * 18) % 150, 70 + Math.sin(t * 0.9 + 2) * 3, t * 7 + 2, 0.85)

    // --- 5. 草地 + 地面（更自然的层次） ---
    // 草地阴影（地表过渡带）
    const grassShadow = ctx.createLinearGradient(0, GROUND_Y - 8, 0, GROUND_Y + 2)
    grassShadow.addColorStop(0, 'rgba(0,0,0,0)')
    grassShadow.addColorStop(1, 'rgba(0,0,0,0.05)')
    ctx.fillStyle = grassShadow
    ctx.fillRect(0, GROUND_Y - 8, W, 10)

    // 草地（带渐变，更丰富的绿色层次）
    const grassGrad = ctx.createLinearGradient(0, GROUND_Y - 18, 0, GROUND_Y + 12)
    grassGrad.addColorStop(0, '#6bc96b')
    grassGrad.addColorStop(0.3, '#5cb85c')
    grassGrad.addColorStop(0.6, '#4CAF50')
    grassGrad.addColorStop(1, '#3d8b3d')
    ctx.fillStyle = grassGrad
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y)
    // 微微起伏的草地
    for (let x = 0; x <= W; x += 4) {
      ctx.lineTo(x, GROUND_Y - 3 + Math.sin(x * 0.05 + animTimeRef.current * 2) * 2.5 + Math.sin(x * 0.12) * 1)
    }
    ctx.lineTo(W, GROUND_Y + 20); ctx.lineTo(0, GROUND_Y + 20); ctx.fill()

    // 草地高光带
    ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = '#c8e6c9'
    ctx.beginPath()
    for (let x = 0; x <= W; x += 4) {
      ctx.lineTo(x, GROUND_Y - 2 + Math.sin(x * 0.08 + t * 1.5) * 1.5)
    }
    ctx.lineTo(W, GROUND_Y + 5); ctx.lineTo(0, GROUND_Y + 5); ctx.fill()
    ctx.restore()

    // 土地
    const dirtGrad = ctx.createLinearGradient(0, GROUND_Y + 5, 0, H)
    dirtGrad.addColorStop(0, '#8B6914')
    dirtGrad.addColorStop(0.2, '#7a5c18')
    dirtGrad.addColorStop(0.5, '#6d5420')
    dirtGrad.addColorStop(1, '#4a3a14')
    ctx.fillStyle = dirtGrad
    ctx.fillRect(0, GROUND_Y + 5, W, H - GROUND_Y - 5)

    // 土地纹理线条（更自然）
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
    for (let y = GROUND_Y + 14; y < H; y += 8) {
      ctx.beginPath()
      for (let x = 0; x < W; x += 4) {
        ctx.lineTo(x, y + Math.sin(x * 0.08 + y * 0.3) * 2)
      }
      ctx.stroke()
    }
    // 土地暗纹
    ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.8
    for (let y = GROUND_Y + 18; y < H; y += 12) {
      ctx.beginPath()
      for (let x = 0; x < W; x += 5) {
        ctx.lineTo(x, y + 1 + Math.sin(x * 0.1 + y * 0.5) * 1.5)
      }
      ctx.stroke()
    }

    // 小石子（带阴影）
    const pebbles: [number, number, number][] = [[25, GROUND_Y + 18, 4], [120, GROUND_Y + 22, 3], [220, GROUND_Y + 15, 5],
                     [310, GROUND_Y + 20, 3.5], [385, GROUND_Y + 25, 4], [425, GROUND_Y + 22, 3.5], [55, GROUND_Y + 30, 3]]
    for (const [px, py, pr] of pebbles) {
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.beginPath(); ctx.ellipse(px + 1, py + 1, pr, pr * 0.6, (px * 0.1) % 1, 0, Math.PI * 2); ctx.fill()
      const pg = ctx.createRadialGradient(px - 1, py - 1, 0, px, py, pr)
      pg.addColorStop(0, 'rgba(210,190,160,0.4)'); pg.addColorStop(1, 'rgba(170,150,120,0.25)')
      ctx.fillStyle = pg
      ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 0.6, (px * 0.1) % 1, 0, Math.PI * 2); ctx.fill()
    }

    // 小蘑菇（带阴影和高光）
    const drawMushroom = (mx: number, my: number) => {
      // 影子
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.beginPath(); ctx.ellipse(mx + 1, my, 5, 2, 0, 0, Math.PI * 2); ctx.fill()
      // 柄
      const stemGrad = ctx.createLinearGradient(mx - 1, 0, mx + 2, 0)
      stemGrad.addColorStop(0, '#d7ccc8'); stemGrad.addColorStop(1, '#bcaaa4')
      ctx.fillStyle = stemGrad; ctx.beginPath(); ctx.roundRect(mx - 1.5, my - 5, 3, 5, 1); ctx.fill()
      // 帽（渐变）
      const capGrad = ctx.createRadialGradient(mx - 1, my - 7, 0, mx, my - 5, 5)
      capGrad.addColorStop(0, '#f44336'); capGrad.addColorStop(0.7, '#d32f2f'); capGrad.addColorStop(1, '#b71c1c')
      ctx.fillStyle = capGrad
      ctx.beginPath(); ctx.arc(mx, my - 6, 5, Math.PI, 0); ctx.fill()
      // 白点
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.beginPath(); ctx.arc(mx - 1.5, my - 7.5, 1.2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(mx + 2, my - 6.8, 0.9, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(mx, my - 8.5, 0.7, 0, Math.PI * 2); ctx.fill()
    }
    drawMushroom(140, GROUND_Y)
    drawMushroom(350, GROUND_Y + 1)
    drawMushroom(200, GROUND_Y - 1)

    // 小草装饰（多种高度和颜色，更飘逸）
    const grassColors = ['#4caf50', '#66bb6a', '#81c784', '#43a047', '#7cb342', '#558b2f']
    for (let i = 0; i < 28; i++) {
      const gx = (i * 15 + 3) % W
      const gy = GROUND_Y - 1
      const sway = Math.sin(animTimeRef.current * 2.5 + i * 0.85) * 4
      const h = 8 + (i * 7) % 10
      const c = grassColors[i % grassColors.length]
      // 阴影
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(gx + 1, gy + 1)
      ctx.quadraticCurveTo(gx + sway + 1, gy - h * 0.6 + 1, gx + sway * 1.3 + 1, gy - h + 1)
      ctx.stroke()
      // 草叶
      ctx.strokeStyle = c; ctx.lineWidth = 1.1 + (i % 3) * 0.3
      ctx.beginPath(); ctx.moveTo(gx, gy)
      ctx.quadraticCurveTo(gx + sway, gy - h * 0.6, gx + sway * 1.3, gy - h)
      ctx.stroke()
    }
    ctx.lineCap = 'butt'

    // 小花（更精致）
    const drawFlower = (fx: number, fy: number, petalColor: string, s = 1) => {
      // 茎
      ctx.strokeStyle = '#388e3c'; ctx.lineWidth = 1.2 * s; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + Math.sin(t + fx) * 2, fy - 5 * s, fx, fy - 8 * s); ctx.stroke()
      ctx.lineCap = 'butt'
      // 叶子
      ctx.fillStyle = '#4caf50'
      ctx.beginPath(); ctx.ellipse(fx + 3 * s, fy - 4 * s, 2.5 * s, 1 * s, 0.4, 0, Math.PI * 2); ctx.fill()
      // 花瓣
      for (let a = 0; a < 5; a++) {
        const angle = (a / 5) * Math.PI * 2 - t * 0.2
        const px2 = fx + Math.cos(angle) * 3.2 * s
        const py2 = fy - 10 * s + Math.sin(angle) * 3.2 * s
        // 花瓣阴影
        ctx.fillStyle = 'rgba(0,0,0,0.06)'
        ctx.beginPath(); ctx.arc(px2 + 0.5, py2 + 0.5, 2.4 * s, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = petalColor
        ctx.beginPath(); ctx.arc(px2, py2, 2.4 * s, 0, Math.PI * 2); ctx.fill()
      }
      // 花蕊
      ctx.fillStyle = '#ffeb3b'
      ctx.beginPath(); ctx.arc(fx, fy - 10 * s, 2 * s, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fbc02d'
      ctx.beginPath(); ctx.arc(fx, fy - 10 * s, 1 * s, 0, Math.PI * 2); ctx.fill()
    }
    drawFlower(25, GROUND_Y, '#ff7043', 1)
    drawFlower(90, GROUND_Y + 1, '#ec407a', 0.9)
    drawFlower(155, GROUND_Y - 1, '#ab47bc', 1.1)
    drawFlower(280, GROUND_Y, '#42a5f5', 0.95)
    drawFlower(340, GROUND_Y + 2, '#ff7043', 0.85)
    drawFlower(395, GROUND_Y, '#ec407a', 0.75)
    drawFlower(425, GROUND_Y + 1, '#ab47bc', 0.8)

    // 蝴蝶
    const bfX = 160 + Math.sin(t * 0.7) * 50
    const bfY = 140 + Math.sin(t * 1.1) * 30
    const bfWing = Math.sin(t * 8) * 0.3
    ctx.save()
    ctx.translate(bfX, bfY)
    ctx.globalAlpha = 0.5
    ctx.fillStyle = '#ff80ab'
    ctx.beginPath(); ctx.ellipse(-4, 0, 5 * (0.5 + bfWing), 3, -0.3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(4, 0, 5 * (0.5 - bfWing), 3, 0.3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#f48fb1'
    ctx.beginPath(); ctx.ellipse(-3, 2, 3 * (0.5 + bfWing), 2, -0.2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(3, 2, 3 * (0.5 - bfWing), 2, 0.2, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // --- 5.5 河流（弹弓正前方，更真实的水面） ---
    const riverTop = RIVER_Y
    const riverBot = RIVER_Y + RIVER_H

    // 河岸上缘草地阴影
    ctx.fillStyle = 'rgba(0,0,0,0.06)'
    ctx.beginPath(); ctx.moveTo(0, riverTop - 2)
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, riverTop - 2 + Math.sin(x * 0.03) * 1.5)
    ctx.lineTo(W, riverTop + 3); ctx.lineTo(0, riverTop + 3); ctx.fill()

    // 上岸草坡
    const bankGrass = ctx.createLinearGradient(0, riverTop - 6, 0, riverTop + 4)
    bankGrass.addColorStop(0, '#66bb6a'); bankGrass.addColorStop(1, '#4CAF50')
    ctx.fillStyle = bankGrass
    ctx.beginPath(); ctx.moveTo(0, riverTop - 5)
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, riverTop - 5 + Math.sin(x * 0.03 + 0.2) * 2)
    ctx.lineTo(W, riverTop + 4); ctx.lineTo(0, riverTop + 4); ctx.fill()
    // 上岸泥土
    ctx.fillStyle = '#7a5c18'
    ctx.beginPath(); ctx.moveTo(0, riverTop)
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, riverTop + Math.sin(x * 0.04 + 0.5) * 1.5)
    ctx.lineTo(W, riverTop + 5); ctx.lineTo(0, riverTop + 5); ctx.fill()

    // 河水（双层渐变 + 水底反光）
    // 水底反光
    ctx.save(); ctx.globalAlpha = 0.08
    const waterBottom = ctx.createLinearGradient(0, riverTop, W, riverTop)
    waterBottom.addColorStop(0, '#81d4fa'); waterBottom.addColorStop(0.5, '#4fc3f7'); waterBottom.addColorStop(1, '#81d4fa')
    ctx.fillStyle = waterBottom
    ctx.fillRect(0, riverTop + 4, W, RIVER_H - 4)
    ctx.restore()
    // 主水面
    const waterGrad = ctx.createLinearGradient(0, riverTop + 2, 0, riverBot)
    waterGrad.addColorStop(0, '#42a5f5'); waterGrad.addColorStop(0.2, '#29b6f6')
    waterGrad.addColorStop(0.5, '#039be5'); waterGrad.addColorStop(0.8, '#0277bd')
    waterGrad.addColorStop(1, '#01579b')
    ctx.fillStyle = waterGrad
    ctx.beginPath(); ctx.moveTo(0, riverTop + 4)
    for (let x = 0; x <= W; x += 2) {
      const wave = Math.sin(x * 0.07 + t * 2.8) * 2.2 + Math.sin(x * 0.15 + t * 1.8) * 0.9 + Math.sin(x * 0.03 + t * 0.8) * 1.5
      ctx.lineTo(x, riverTop + 4 + wave)
    }
    ctx.lineTo(W, riverBot + 2); ctx.lineTo(0, riverBot + 2); ctx.fill()
    // 水面纹理横线（明暗交替）
    ctx.save(); ctx.globalAlpha = 0.05
    for (let i = 0; i < 4; i++) {
      const ly = riverTop + 10 + i * 7
      ctx.strokeStyle = i % 2 === 0 ? '#fff' : '#000'
      ctx.lineWidth = 0.8; ctx.beginPath()
      for (let x = 0; x < W; x += 3) {
        ctx.lineTo(x, ly + Math.sin(x * 0.1 + t * 3 + i) * 1.5)
      }
      ctx.stroke()
    }
    ctx.restore()
    // 水面高光（快速移动的亮斑）
    ctx.save(); ctx.globalAlpha = 0.2
    ctx.fillStyle = '#fff'
    for (let i = 0; i < 7; i++) {
      const sx = ((t * 28 + i * 65) % (W + 60)) - 30
      const sy = riverTop + 10 + (i * 5) % (RIVER_H - 10)
      const sw = 12 + (i % 3) * 6
      ctx.beginPath(); ctx.ellipse(sx, sy, sw, 1.2, Math.sin(t + i) * 0.1, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
    // 波光粼粼（小光点）
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff'
    for (let i = 0; i < 14; i++) {
      const rx = ((t * 18 + i * 32) % (W + 30)) - 15
      const ry = riverTop + 7 + (i % 6) * 5
      const rs = 2 + Math.sin(t * 3 + i * 2) * 1
      ctx.beginPath(); ctx.arc(rx, ry, rs, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
    // 天空在水面的倒影
    ctx.save(); ctx.globalAlpha = 0.04; ctx.fillStyle = '#fff'
    ctx.beginPath()
    for (let x = 0; x < W; x += 3) {
      ctx.lineTo(x, riverTop + 6 + Math.sin(x * 0.06 + t * 2) * 1.5)
    }
    ctx.lineTo(W, riverTop + 18); ctx.lineTo(0, riverTop + 18); ctx.fill()
    ctx.restore()

    // 下岸
    ctx.fillStyle = '#7a5c18'
    ctx.beginPath(); ctx.moveTo(0, riverBot - 1)
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, riverBot - 1 + Math.sin(x * 0.04 + 1) * 1.5)
    ctx.lineTo(W, riverBot + 4); ctx.lineTo(0, riverBot + 4); ctx.fill()
    const bankGrass2 = ctx.createLinearGradient(0, riverBot + 2, 0, riverBot + 10)
    bankGrass2.addColorStop(0, '#4CAF50'); bankGrass2.addColorStop(1, '#66bb6a')
    ctx.fillStyle = bankGrass2
    ctx.beginPath(); ctx.moveTo(0, riverBot + 2)
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, riverBot + 2 + Math.sin(x * 0.03 + 2) * 2)
    ctx.lineTo(W, riverBot + 10); ctx.lineTo(0, riverBot + 10); ctx.fill()

    // 芦苇（河岸边）
    for (let i = 0; i < 8; i++) {
      const rx = 25 + i * 50 + (i * 13) % 20
      const ry = riverTop - 3
      const rSway = Math.sin(t * 1.8 + i * 1.2) * 3
      ctx.strokeStyle = '#558b2f'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(rx, ry + 4)
      ctx.quadraticCurveTo(rx + rSway * 0.5, ry - 10, rx + rSway, ry - 18 - (i % 3) * 4)
      ctx.stroke()
      // 芦苇穗
      ctx.fillStyle = '#8d6e63'
      ctx.beginPath(); ctx.ellipse(rx + rSway, ry - 20 - (i % 3) * 4, 2, 4, 0, 0, Math.PI * 2); ctx.fill()
    }
    ctx.lineCap = 'butt'

    // --- 6. 绘制靶子（漂浮靶：只画空中阴影 + 靶心） ---

    // === 空中投影阴影（随靶子高度变化） ===
    for (const tgt of targetsRef.current) {
      if (tgt.hit && tgt.hitByProjectile) continue
      const wobbleX = Math.sin(tgt.wobble) * 2
      const tx = tgt.x + wobbleX
      const ty = tgt.y
      const r = tgt.radius

      // 地面投影（靶子越高投影越淡越大）
      const heightRatio = Math.max(0, Math.min(1, (RIVER_Y - ty - r) / (RIVER_Y - 50)))
      const shadowAlpha = 0.04 + heightRatio * 0.08
      const shadowScale = 0.6 + heightRatio * 0.4
      ctx.save(); ctx.globalAlpha = shadowAlpha
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.ellipse(tx, RIVER_Y + 5, r * shadowScale, 4, 0, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    // === 靶心圆 + 文字 ===
    for (const tgt of targetsRef.current) {
      const wobbleX = Math.sin(tgt.wobble) * 2
      const tx = tgt.x + wobbleX
      const ty = tgt.y
      const r = tgt.radius
      const config = TARGET_TYPES[tgt.type]

      // 命中消散动画
      if (tgt.hit && tgt.hitByProjectile) {
        const elapsed = (now - tgt.hitTime) / 800
        if (elapsed < 1) {
          ctx.save()
          ctx.globalAlpha = 1 - elapsed
          const scale = 1 + elapsed * 0.5
          ctx.translate(tx, ty)
          ctx.scale(scale, scale)
          ctx.beginPath(); ctx.arc(0, 0, r + 10, 0, Math.PI * 2)
          ctx.fillStyle = tgt.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
          ctx.fill()
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2)
          ctx.fillStyle = tgt.isCorrect ? '#22c55e' : config.color
          ctx.fill()
          ctx.fillStyle = '#fff'; ctx.font = `bold ${r * 0.6}px "PingFang SC", sans-serif`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(tgt.word, 0, 0)
          ctx.restore()
        }
        continue
      }

      const isShowingCorrect = tgt.showCorrect && tgt.isCorrect
      const baseColor = isShowingCorrect ? '#22c55e' : config.color
      const lightColor = isShowingCorrect ? '#86efac' : config.ring2
      const darkColor = isShowingCorrect ? '#16a34a' : config.ring1

      // 正确靶子脉冲高亮
      if (isShowingCorrect) {
        const glow = ctx.createRadialGradient(tx, ty, r, tx, ty, r + 22)
        glow.addColorStop(0, 'rgba(34,197,94,0.45)')
        glow.addColorStop(1, 'rgba(34,197,94,0)')
        ctx.fillStyle = glow
        ctx.beginPath(); ctx.arc(tx, ty, r + 22, 0, Math.PI * 2); ctx.fill()
        const pulsePhase = (animTimeRef.current * 3) % 1
        const pulseR = r + 5 + pulsePhase * 22
        ctx.beginPath(); ctx.arc(tx, ty, pulseR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(34,197,94,${(1 - pulsePhase) * 0.5})`
        ctx.lineWidth = 3 * (1 - pulsePhase); ctx.stroke()
      }

      // 靶子整体投影
      ctx.save(); ctx.globalAlpha = 0.15
      ctx.beginPath(); ctx.arc(tx + 3, ty + 4, r + 4, 0, Math.PI * 2)
      ctx.fillStyle = '#000'; ctx.fill()
      ctx.restore()

      // 最外圈白色底（带微妙的外圈阴影边）
      ctx.beginPath(); ctx.arc(tx, ty, r + 5, 0, Math.PI * 2)
      ctx.fillStyle = '#f5f5f5'; ctx.fill()
      ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 1; ctx.stroke()
      // 外圈细阴影环
      ctx.beginPath(); ctx.arc(tx, ty, r + 4, 0, Math.PI * 2)
      ctx.fillStyle = '#fafafa'; ctx.fill()

      // 外环（双层渐变更立体）
      const outerGrad = ctx.createRadialGradient(tx - r * 0.25, ty - r * 0.25, r * 0.3, tx, ty, r + 1)
      outerGrad.addColorStop(0, lightColor); outerGrad.addColorStop(0.5, baseColor)
      outerGrad.addColorStop(0.8, darkColor); outerGrad.addColorStop(1, darkColor)
      ctx.beginPath(); ctx.arc(tx, ty, r + 1, 0, Math.PI * 2)
      ctx.fillStyle = outerGrad; ctx.fill()

      // 中环
      ctx.beginPath(); ctx.arc(tx, ty, r * 0.78, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'; ctx.fill()

      // 内环（带渐变）
      const innerGrad = ctx.createRadialGradient(tx - r * 0.12, ty - r * 0.12, 0, tx, ty, r * 0.58)
      innerGrad.addColorStop(0, '#fff'); innerGrad.addColorStop(0.25, lightColor); innerGrad.addColorStop(1, baseColor)
      ctx.beginPath(); ctx.arc(tx, ty, r * 0.58, 0, Math.PI * 2)
      ctx.fillStyle = innerGrad; ctx.fill()

      // 靶心
      const centerGrad = ctx.createRadialGradient(tx - 2, ty - 2, 0, tx, ty, r * 0.35)
      centerGrad.addColorStop(0, '#fff'); centerGrad.addColorStop(0.35, lightColor); centerGrad.addColorStop(1, baseColor)
      ctx.beginPath(); ctx.arc(tx, ty, r * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = centerGrad; ctx.fill()

      // 全局闪光
      ctx.save()
      ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2); ctx.clip()
      const shineGrad = ctx.createLinearGradient(tx - r * 1.2, ty - r * 1.2, tx + r * 0.3, ty + r * 0.3)
      shineGrad.addColorStop(0, 'rgba(255,255,255,0.32)')
      shineGrad.addColorStop(0.3, 'rgba(255,255,255,0.1)')
      shineGrad.addColorStop(0.5, 'rgba(255,255,255,0)')
      shineGrad.addColorStop(1, 'rgba(0,0,0,0.04)')
      ctx.fillStyle = shineGrad
      ctx.fillRect(tx - r, ty - r, r * 2, r * 2)
      ctx.restore()

      // 底部阴影弧
      ctx.beginPath(); ctx.arc(tx, ty, r + 1, Math.PI * 0.75, Math.PI * 1.85)
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; ctx.stroke()

      // 类型角标
      if (tgt.type !== 'normal' && !isShowingCorrect) {
        const badgeX = tx + r + 2, badgeY = ty - r - 2
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.beginPath(); ctx.arc(badgeX + 1, badgeY + 1, 11, 0, Math.PI * 2); ctx.fill()
        const badgeGrad = ctx.createRadialGradient(badgeX - 2, badgeY - 2, 0, badgeX, badgeY, 11)
        badgeGrad.addColorStop(0, tgt.type === 'diamond' ? '#a78bfa' : '#fbbf24')
        badgeGrad.addColorStop(1, tgt.type === 'diamond' ? '#7c3aed' : '#d97706')
        ctx.fillStyle = badgeGrad
        ctx.beginPath(); ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        ctx.fillText(tgt.type === 'diamond' ? '💎' : '⭐', badgeX, badgeY)
      }

      // 分值标签
      if (tgt.type !== 'normal' && !isShowingCorrect) {
        const labelY = ty + r + 20
        ctx.font = 'bold 10px "PingFang SC", sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const pts = TARGET_TYPES[tgt.type].points
        const labelW = 24
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.beginPath(); ctx.roundRect(tx - labelW / 2 + 1, labelY - 5, labelW, 13, 5); ctx.fill()
        const labelGrad = ctx.createLinearGradient(0, labelY - 6, 0, labelY + 6)
        if (tgt.type === 'diamond') { labelGrad.addColorStop(0, '#8b5cf6'); labelGrad.addColorStop(1, '#6d28d9') }
        else { labelGrad.addColorStop(0, '#f59e0b'); labelGrad.addColorStop(1, '#d97706') }
        ctx.fillStyle = labelGrad
        ctx.beginPath(); ctx.roundRect(tx - labelW / 2, labelY - 6, labelW, 14, 5); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillText(`${pts}分`, tx, labelY)
      }

      // 单词文字（多重描边 + 填充）
      const fontSize = tgt.word.length > 10 ? 13 : tgt.word.length > 7 ? 15 : tgt.word.length > 5 ? 17 : 19
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = `900 ${fontSize}px "PingFang SC", "Helvetica Neue", sans-serif`
      ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 5; ctx.lineJoin = 'round'
      ctx.strokeText(tgt.word, tx, ty)
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2.5
      ctx.strokeText(tgt.word, tx, ty)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(tgt.word, tx, ty)
      // 文字顶部高光
      ctx.save()
      ctx.beginPath(); ctx.arc(tx, ty, r * 0.35, -Math.PI * 0.1, Math.PI * 1.1); ctx.clip()
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.font = `900 ${fontSize}px "PingFang SC", "Helvetica Neue", sans-serif`
      ctx.fillText(tgt.word, tx, ty - 1)
      ctx.restore()
    }

    // --- 7. 弩（底部居中，高端金属质感：暗铬+金色+铂金） ---
    const jX = SLING_JOINT_X, jY = SLING_JOINT_Y

    // 弓箭绘制函数（金属箭头 + 碳纤维箭杆）
    const drawArrow = (px: number, py: number, angle: number, alpha = 1) => {
      ctx.save(); ctx.globalAlpha = alpha
      ctx.translate(px, py)
      ctx.rotate(angle)
      // 箭杆阴影
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 5; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(1, 2); ctx.lineTo(-28, 2); ctx.stroke()
      // 碳纤维箭杆（深灰+高光条纹）
      const arrowGrad = ctx.createLinearGradient(20, -2, -25, -2)
      arrowGrad.addColorStop(0, '#404040'); arrowGrad.addColorStop(0.3, '#555555')
      arrowGrad.addColorStop(0.5, '#606060'); arrowGrad.addColorStop(0.7, '#4a4a4a')
      arrowGrad.addColorStop(1, '#383838')
      ctx.strokeStyle = arrowGrad; ctx.lineWidth = 3.5; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-25, 0); ctx.stroke()
      // 碳纹高光
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(16, -1); ctx.lineTo(-24, -1); ctx.stroke()
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(16, 1); ctx.lineTo(-24, 1); ctx.stroke()
      // 金色箭头
      const tipGrad = ctx.createLinearGradient(26, -5, 16, 0)
      tipGrad.addColorStop(0, '#ffd700'); tipGrad.addColorStop(0.4, '#daa520')
      tipGrad.addColorStop(0.7, '#b8860b'); tipGrad.addColorStop(1, '#8b6914')
      ctx.fillStyle = tipGrad
      ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(16, -5.5); ctx.lineTo(16, 5.5); ctx.closePath(); ctx.fill()
      ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 0.6; ctx.stroke()
      // 箭头高光
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath(); ctx.moveTo(26, -1); ctx.lineTo(17, -4.5); ctx.lineTo(17, 0); ctx.closePath(); ctx.fill()
      // 尾羽（深红+金色边缘）
      ctx.strokeStyle = '#c62828'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(-24, 5); ctx.lineTo(-30, 0); ctx.lineTo(-24, -5); ctx.stroke()
      ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(-25, 4); ctx.lineTo(-30, 0); ctx.lineTo(-25, -4); ctx.stroke()
      ctx.lineCap = 'butt'
      ctx.restore()
    }

    // 弩的弓臂尖端（跟随瞄准方向旋转）
    const sa = slingAngleRef.current
    const cosA = Math.cos(sa), sinA = Math.sin(sa)
    const rotTip = (lx: number, ly: number) => ({
      x: jX + lx * cosA - ly * sinA,
      y: jY + lx * sinA + ly * cosA,
    })
    const fL = rotTip(SLING_FORK_L_X - jX, SLING_FORK_L_Y - jY)
    const fR = rotTip(SLING_FORK_R_X - jX, SLING_FORK_R_Y - jY)

    // === 3D 圆柱发光底座（弩架在上面，有立体感） ===
    const bx = SLING_BASE_X, by = SLING_BASE_Y
    const pulse = Math.sin(t * 3) * 0.5 + 0.5
    const pulse2 = Math.sin(t * 2.2 + 1) * 0.5 + 0.5

    // 几何参数：从下到上
    // GROUND_Y=480, jY=418(弩关节), 需要：底盘→柱→顶盘→枪托→关节
    const baseR = 55         // 底盘半径
    const baseY = GROUND_Y   // 底盘贴地
    const diskH = 8          // 底盘高度
    const diskTopY = baseY - diskH // 底盘顶面
    const mountH = 6         // 顶盘高度
    const mountTopY = 430    // 顶盘顶面（枪托底部）
    const pillarBotY = diskTopY  // 柱底
    const pillarTopY = mountTopY + mountH // 柱顶（接顶盘底面）
    const pillarTopR = 20    // 柱顶半径
    const pillarBotR = 30    // 柱底半径
    const mountR = 26        // 顶盘半径

    // —— 地面投影 ——
    ctx.save(); ctx.globalAlpha = 0.3
    const shGrad = ctx.createRadialGradient(bx, baseY + 3, 0, bx, baseY + 3, baseR + 8)
    shGrad.addColorStop(0, 'rgba(0,0,0,0.5)'); shGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = shGrad
    ctx.beginPath(); ctx.ellipse(bx, baseY + 3, baseR + 8, 12, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // —— 1. 底盘（扁圆柱，贴地） ——
    // 底盘侧面
    ctx.fillStyle = '#12122a'
    ctx.beginPath(); ctx.ellipse(bx, baseY, baseR, diskH, 0, 0, Math.PI * 2); ctx.fill()
    // 底盘顶面
    const diskTopGrad = ctx.createRadialGradient(bx - 10, baseY - diskH - 3, 0, bx, baseY - diskH, baseR)
    diskTopGrad.addColorStop(0, '#303060'); diskTopGrad.addColorStop(0.5, '#222248')
    diskTopGrad.addColorStop(0.8, '#1a1a38'); diskTopGrad.addColorStop(1, '#141430')
    ctx.fillStyle = diskTopGrad
    ctx.beginPath(); ctx.ellipse(bx, baseY - diskH, baseR, diskH, 0, 0, Math.PI * 2); ctx.fill()
    // 底盘边缘金环
    ctx.strokeStyle = `rgba(255,200,50,${0.4 + pulse * 0.25})`; ctx.lineWidth = 2
    ctx.beginPath(); ctx.ellipse(bx, baseY - diskH, baseR, diskH, 0, Math.PI, Math.PI * 2); ctx.stroke()
    // 辉光
    ctx.save(); ctx.globalAlpha = 0.2 + pulse * 0.15
    ctx.shadowColor = '#ffc832'; ctx.shadowBlur = 10
    ctx.strokeStyle = '#ffc832'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.ellipse(bx, baseY - diskH, baseR, diskH, 0, Math.PI, Math.PI * 2); ctx.stroke()
    ctx.shadowBlur = 0; ctx.restore()
    // 底盘装饰环纹
    ctx.strokeStyle = 'rgba(255,200,50,0.06)'; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.ellipse(bx, baseY - diskH, baseR * 0.7, diskH * 0.7, 0, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(bx, baseY - diskH, baseR * 0.45, diskH * 0.45, 0, 0, Math.PI * 2); ctx.stroke()

    // —— 2. 中央立柱（梯形台体，从底盘到弩底） ——
    // 柱体侧面（左面暗，右面亮，模拟光线方向）
    // 左侧面（暗）
    const pGradL = ctx.createLinearGradient(bx - pillarBotR, 0, bx, 0)
    pGradL.addColorStop(0, '#14142a'); pGradL.addColorStop(0.5, '#1e1e3e'); pGradL.addColorStop(1, '#252548')
    ctx.fillStyle = pGradL
    ctx.beginPath()
    ctx.moveTo(bx - pillarBotR, pillarBotY); ctx.lineTo(bx - pillarTopR, pillarTopY)
    ctx.lineTo(bx, pillarTopY); ctx.lineTo(bx, pillarBotY)
    ctx.closePath(); ctx.fill()
    // 右侧面（亮）
    const pGradR = ctx.createLinearGradient(bx, 0, bx + pillarBotR, 0)
    pGradR.addColorStop(0, '#252548'); pGradR.addColorStop(0.5, '#303060'); pGradR.addColorStop(1, '#1e1e3e')
    ctx.fillStyle = pGradR
    ctx.beginPath()
    ctx.moveTo(bx, pillarBotY); ctx.lineTo(bx, pillarTopY)
    ctx.lineTo(bx + pillarTopR, pillarTopY); ctx.lineTo(bx + pillarBotR, pillarBotY)
    ctx.closePath(); ctx.fill()
    // 柱体高光条（右侧边缘）
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(bx + pillarBotR - 2, pillarBotY); ctx.lineTo(bx + pillarTopR - 2, pillarTopY); ctx.stroke()
    // 柱体暗边（左侧）
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(bx - pillarBotR + 1, pillarBotY); ctx.lineTo(bx - pillarTopR + 1, pillarTopY); ctx.stroke()
    // 柱身金色中腰环
    const midPillarY = (pillarTopY + pillarBotY) / 2
    const midPillarR = (pillarTopR + pillarBotR) / 2
    const bandGrad = ctx.createLinearGradient(bx - midPillarR, 0, bx + midPillarR, 0)
    bandGrad.addColorStop(0, '#8b6914'); bandGrad.addColorStop(0.3, '#daa520')
    bandGrad.addColorStop(0.5, '#ffd700'); bandGrad.addColorStop(0.7, '#daa520'); bandGrad.addColorStop(1, '#8b6914')
    ctx.fillStyle = bandGrad
    ctx.beginPath()
    ctx.moveTo(bx - midPillarR - 2, midPillarY - 2); ctx.lineTo(bx + midPillarR + 2, midPillarY - 2)
    ctx.lineTo(bx + midPillarR + 1, midPillarY + 2); ctx.lineTo(bx - midPillarR - 1, midPillarY + 2)
    ctx.closePath(); ctx.fill()
    // 金环高光
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.beginPath()
    ctx.moveTo(bx - midPillarR, midPillarY - 2); ctx.lineTo(bx + midPillarR, midPillarY - 2)
    ctx.lineTo(bx + midPillarR, midPillarY - 1); ctx.lineTo(bx - midPillarR, midPillarY - 1)
    ctx.closePath(); ctx.fill()

    // —— 3. 顶盘（弩枪托底座圆盘） ——
    // 顶盘侧面
    ctx.fillStyle = '#1a1a38'
    ctx.beginPath(); ctx.ellipse(bx, pillarTopY, mountR, mountH, 0, 0, Math.PI * 2); ctx.fill()
    // 顶盘顶面
    const mountTopGrad = ctx.createRadialGradient(bx - 5, pillarTopY - mountH - 2, 0, bx, pillarTopY - mountH, mountR)
    mountTopGrad.addColorStop(0, '#3a3a68'); mountTopGrad.addColorStop(0.5, '#2a2a52')
    mountTopGrad.addColorStop(1, '#1e1e3e')
    ctx.fillStyle = mountTopGrad
    ctx.beginPath(); ctx.ellipse(bx, pillarTopY - mountH, mountR, mountH, 0, 0, Math.PI * 2); ctx.fill()
    // 顶盘边缘金环（最亮的装饰环）
    const topEdgeAlpha = 0.7 + pulse * 0.3
    ctx.strokeStyle = `rgba(255,210,60,${topEdgeAlpha})`; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.ellipse(bx, pillarTopY - mountH, mountR, mountH, 0, Math.PI, Math.PI * 2); ctx.stroke()
    // 顶盘辉光
    ctx.save(); ctx.globalAlpha = 0.3 + pulse * 0.2
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 14
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.ellipse(bx, pillarTopY - mountH, mountR, mountH, 0, Math.PI, Math.PI * 2); ctx.stroke()
    ctx.shadowBlur = 0; ctx.restore()
    // 顶盘内部装饰圆
    ctx.strokeStyle = `rgba(255,200,50,${0.12 + pulse * 0.08})`; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.ellipse(bx, pillarTopY - mountH, mountR * 0.6, mountH * 0.6, 0, 0, Math.PI * 2); ctx.stroke()
    // 顶盘中心发光核心
    const coreG = ctx.createRadialGradient(bx, pillarTopY - mountH - 2, 0, bx, pillarTopY - mountH, 18)
    coreG.addColorStop(0, `rgba(255,220,80,${0.2 + pulse * 0.2})`)
    coreG.addColorStop(0.5, `rgba(255,180,40,${0.08 + pulse * 0.06})`)
    coreG.addColorStop(1, 'rgba(255,150,0,0)')
    ctx.fillStyle = coreG
    ctx.beginPath(); ctx.arc(bx, pillarTopY - mountH, 18, 0, Math.PI * 2); ctx.fill()

    // —— 4. 环境光效 ——
    // 底盘下方地光
    const floorGlow = ctx.createRadialGradient(bx, baseY + 2, 5, bx, baseY + 2, baseR + 15)
    floorGlow.addColorStop(0, `rgba(255,180,50,${0.08 + pulse * 0.05})`)
    floorGlow.addColorStop(1, 'rgba(255,150,0,0)')
    ctx.fillStyle = floorGlow
    ctx.beginPath(); ctx.ellipse(bx, baseY + 2, baseR + 15, 20, 0, 0, Math.PI * 2); ctx.fill()

    // 能量粒子（沿柱体上升）
    for (let pi = 0; pi < 6; pi++) {
      const pAngle = (t * 0.6 + pi * 1.047) % (Math.PI * 2)
      const pOrbitR = 20 + Math.sin(t * 1.5 + pi * 2) * 8
      const riseProg = ((t * 20 + pi * 16) % 60) / 60
      const px2 = bx + Math.cos(pAngle) * pOrbitR
      const py2 = baseY - diskH - riseProg * (baseY - diskH - pillarTopY + 20)
      const pAlpha = Math.sin(riseProg * Math.PI) * 0.5
      ctx.save(); ctx.globalAlpha = pAlpha
      ctx.fillStyle = '#ffd54f'
      ctx.beginPath(); ctx.arc(px2, py2, 1.5, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = pAlpha * 0.2
      ctx.beginPath(); ctx.arc(px2, py2, 4, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    // 底盘四角光点
    for (const a of [0.3, 1.3, 1.85, 2.85, 3.6, 4.6, 5.2, 5.9]) {
      const cx = bx + Math.cos(a) * (baseR - 8)
      const cy = baseY - diskH + Math.sin(a) * (diskH - 2) * 0.5
      const cAlpha = 0.3 + pulse2 * 0.35
      ctx.fillStyle = `rgba(255,200,50,${cAlpha})`
      ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI * 2); ctx.fill()
      const cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5)
      cG.addColorStop(0, `rgba(255,200,50,${cAlpha * 0.3})`)
      cG.addColorStop(1, 'rgba(255,200,50,0)')
      ctx.fillStyle = cG
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill()
    }

    // === 高端金属弩身 ===

    // 枪托从顶盘表面开始
    const stockBottomY = mountTopY  // = 430

    // 暗铬枪身渐变（深邃的金属光泽）
    const stockGrad = ctx.createLinearGradient(SLING_BASE_X - 10, 0, SLING_BASE_X + 10, 0)
    stockGrad.addColorStop(0, '#1a1a2e'); stockGrad.addColorStop(0.12, '#2d2d44')
    stockGrad.addColorStop(0.3, '#3d3d5c'); stockGrad.addColorStop(0.45, '#4a4a6a')
    stockGrad.addColorStop(0.55, '#3d3d5c'); stockGrad.addColorStop(0.75, '#2d2d44')
    stockGrad.addColorStop(1, '#1a1a2e')

    // 枪托阴影
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 18; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(SLING_BASE_X + 2, stockBottomY + 3); ctx.lineTo(jX + 2, jY + 3); ctx.stroke()
    // 枪托主体（暗铬）
    ctx.strokeStyle = stockGrad; ctx.lineWidth = 16; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(SLING_BASE_X, stockBottomY + 2); ctx.lineTo(jX, jY); ctx.stroke()
    // 枪托高光线（铂金色）
    ctx.strokeStyle = 'rgba(220,220,215,0.15)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(SLING_BASE_X - 4, stockBottomY + 1); ctx.lineTo(jX - 4, jY + 1); ctx.stroke()
    // 枪托暗面线
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(SLING_BASE_X + 4, stockBottomY + 2); ctx.lineTo(jX + 4, jY + 2); ctx.stroke()

    // 金色装饰箍（高端感的关键细节）
    const goldBandGrad = ctx.createLinearGradient(SLING_BASE_X - 9, 0, SLING_BASE_X + 9, 0)
    goldBandGrad.addColorStop(0, '#8b6914'); goldBandGrad.addColorStop(0.2, '#b8860b')
    goldBandGrad.addColorStop(0.4, '#daa520'); goldBandGrad.addColorStop(0.5, '#ffd700')
    goldBandGrad.addColorStop(0.6, '#daa520'); goldBandGrad.addColorStop(0.8, '#b8860b')
    goldBandGrad.addColorStop(1, '#8b6914')
    const stockLen = stockBottomY - jY  // 42
    const bandY1 = stockBottomY - 8, bandY2 = jY + stockLen * 0.5, bandY3 = jY + 8
    for (const by of [bandY1, bandY2, bandY3]) {
      // 金箍阴影
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.beginPath(); ctx.roundRect(SLING_BASE_X - 9, by - 1, 18, 5, 1); ctx.fill()
      // 金箍本体
      ctx.fillStyle = goldBandGrad
      ctx.beginPath(); ctx.roundRect(SLING_BASE_X - 8, by - 1, 16, 4, 1); ctx.fill()
      // 金箍高光
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.beginPath(); ctx.roundRect(SLING_BASE_X - 6, by - 1, 12, 1.5, 0.5); ctx.fill()
    }

    // 握把（黑色橡胶+金色环）
    const gripY = stockBottomY - (stockBottomY - jY) * 0.4
    const gripGrad = ctx.createLinearGradient(SLING_BASE_X - 8, 0, SLING_BASE_X + 8, 0)
    gripGrad.addColorStop(0, '#1a1a1a'); gripGrad.addColorStop(0.2, '#2a2a2a')
    gripGrad.addColorStop(0.45, '#333333'); gripGrad.addColorStop(0.55, '#2a2a2a')
    gripGrad.addColorStop(1, '#1a1a1a')
    ctx.strokeStyle = gripGrad; ctx.lineWidth = 17; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(SLING_BASE_X, gripY + 13); ctx.lineTo(SLING_BASE_X, gripY - 13); ctx.stroke()
    // 橡胶纹理（菱形防滑纹）
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.6
    for (let gy = gripY - 11; gy < gripY + 11; gy += 3) {
      ctx.beginPath(); ctx.moveTo(SLING_BASE_X - 7, gy); ctx.lineTo(SLING_BASE_X + 7, gy + 1.5); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(SLING_BASE_X + 7, gy); ctx.lineTo(SLING_BASE_X - 7, gy + 1.5); ctx.stroke()
    }
    // 握把上的金色装饰环
    for (const gy of [gripY - 8, gripY + 8]) {
      ctx.fillStyle = goldBandGrad
      ctx.beginPath(); ctx.roundRect(SLING_BASE_X - 8, gy - 0.5, 16, 2, 0.5); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.beginPath(); ctx.roundRect(SLING_BASE_X - 6, gy - 0.5, 12, 0.8, 0.3); ctx.fill()
    }

    // 弩臂（铂金+暗铬双色金属弓臂）
    // 弩臂阴影
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 14; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(jX + 2, jY + 2); ctx.lineTo(fL.x + 2, fL.y + 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(jX + 2, jY + 2); ctx.lineTo(fR.x + 2, fR.y + 2); ctx.stroke()

    // 弩臂渐变（从根部暗铬到尖端铂金）
    const limbGradL = ctx.createLinearGradient(jX, jY, fL.x, fL.y)
    limbGradL.addColorStop(0, '#2d2d44'); limbGradL.addColorStop(0.3, '#3d3d5c')
    limbGradL.addColorStop(0.6, '#6a6a8a'); limbGradL.addColorStop(0.85, '#c0c0d0')
    limbGradL.addColorStop(1, '#e0e0e8')
    const limbGradR = ctx.createLinearGradient(jX, jY, fR.x, fR.y)
    limbGradR.addColorStop(0, '#2d2d44'); limbGradR.addColorStop(0.3, '#3d3d5c')
    limbGradR.addColorStop(0.6, '#6a6a8a'); limbGradR.addColorStop(0.85, '#c0c0d0')
    limbGradR.addColorStop(1, '#e0e0e8')

    // 左弩臂
    ctx.strokeStyle = limbGradL; ctx.lineWidth = 12; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(jX, jY); ctx.lineTo(fL.x, fL.y); ctx.stroke()
    // 弩臂高光线
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(jX, jY - 3); ctx.lineTo(fL.x, fL.y - 3); ctx.stroke()
    // 左臂尖端（金色球头）
    const tipGradL = ctx.createRadialGradient(fL.x - 2, fL.y - 2, 0, fL.x, fL.y, 9)
    tipGradL.addColorStop(0, '#ffd700'); tipGradL.addColorStop(0.4, '#daa520')
    tipGradL.addColorStop(0.7, '#b8860b'); tipGradL.addColorStop(1, '#8b6914')
    ctx.fillStyle = tipGradL
    ctx.beginPath(); ctx.arc(fL.x, fL.y, 9, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 1; ctx.stroke()
    // 尖端高光
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.beginPath(); ctx.arc(fL.x - 2, fL.y - 2, 3.5, 0, Math.PI * 2); ctx.fill()

    // 右弩臂
    ctx.strokeStyle = limbGradR; ctx.lineWidth = 12; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(jX, jY); ctx.lineTo(fR.x, fR.y); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(jX, jY - 3); ctx.lineTo(fR.x, fR.y - 3); ctx.stroke()
    // 右臂尖端（金色球头）
    const tipGradR = ctx.createRadialGradient(fR.x - 2, fR.y - 2, 0, fR.x, fR.y, 9)
    tipGradR.addColorStop(0, '#ffd700'); tipGradR.addColorStop(0.4, '#daa520')
    tipGradR.addColorStop(0.7, '#b8860b'); tipGradR.addColorStop(1, '#8b6914')
    ctx.fillStyle = tipGradR
    ctx.beginPath(); ctx.arc(fR.x, fR.y, 9, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.beginPath(); ctx.arc(fR.x - 2, fR.y - 2, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.lineCap = 'butt'

    // 弓弦（凯夫拉纤维，深色高强度弦）
    const ballPos = (phaseRef.current === 'aiming' && isDraggingRef.current)
      ? dragCurrentRef.current
      : (!proj.active ? { x: SLING_REST_X, y: SLING_REST_Y } : null)
    if (ballPos) {
      // 弦阴影
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 4; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(fR.x + 1, fR.y + 2); ctx.lineTo(ballPos.x + 1, ballPos.y + 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(fL.x + 1, fL.y + 2); ctx.lineTo(ballPos.x + 1, ballPos.y + 2); ctx.stroke()
      // 弦主体（凯夫拉深灰）
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 3; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(fR.x, fR.y); ctx.lineTo(ballPos.x, ballPos.y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(fL.x, fL.y); ctx.lineTo(ballPos.x, ballPos.y); ctx.stroke()
      // 弦高光（纤维光泽）
      ctx.strokeStyle = 'rgba(200,200,200,0.12)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(fR.x, fR.y - 1); ctx.lineTo(ballPos.x, ballPos.y - 1); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(fL.x, fL.y - 1); ctx.lineTo(ballPos.x, ballPos.y - 1); ctx.stroke()
      ctx.lineCap = 'butt'

      // 弩箭（弦中心 → 弩关节中间线方向）
      if (!proj.active) {
        const arrowLen = 45
        const adx = SLING_JOINT_X - ballPos.x
        const ady = SLING_JOINT_Y - ballPos.y
        const aDist = Math.hypot(adx, ady)
        const aDirX = aDist > 1 ? adx / aDist : 0
        const aDirY = aDist > 1 ? ady / aDist : -1
        const arrowEndX = ballPos.x + aDirX * arrowLen
        const arrowEndY = ballPos.y + aDirY * arrowLen
        // 箭杆阴影
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 4; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(ballPos.x + 1, ballPos.y + 2); ctx.lineTo(arrowEndX + 1, arrowEndY + 2); ctx.stroke()
        // 碳纤维箭杆
        const arrGrad = ctx.createLinearGradient(ballPos.x, ballPos.y, arrowEndX, arrowEndY)
        arrGrad.addColorStop(0, '#404040'); arrGrad.addColorStop(0.5, '#555555'); arrGrad.addColorStop(1, '#383838')
        ctx.strokeStyle = arrGrad; ctx.lineWidth = 3.5; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(ballPos.x, ballPos.y); ctx.lineTo(arrowEndX, arrowEndY); ctx.stroke()
        // 碳纹
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.7
        ctx.beginPath(); ctx.moveTo(ballPos.x, ballPos.y - 1); ctx.lineTo(arrowEndX, arrowEndY - 1); ctx.stroke()
        // 尾羽
        const tailX = ballPos.x + aDirX * 5
        const tailY = ballPos.y + aDirY * 5
        const perpX = -aDirY, perpY = aDirX
        ctx.strokeStyle = '#c62828'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(tailX + perpX * 5, tailY + perpY * 5)
        ctx.lineTo(tailX - aDirX * 6, tailY - aDirY * 6)
        ctx.lineTo(tailX - perpX * 5, tailY - perpY * 5); ctx.stroke()
        // 箭头（金属箭尖）
        ctx.fillStyle = '#78909c'
        ctx.beginPath()
        ctx.moveTo(arrowEndX + aDirX * 8, arrowEndY + aDirY * 8)
        ctx.lineTo(arrowEndX + perpX * 4, arrowEndY + perpY * 4)
        ctx.lineTo(arrowEndX - perpX * 4, arrowEndY - perpY * 4)
        ctx.closePath(); ctx.fill()
        ctx.strokeStyle = '#455a64'; ctx.lineWidth = 0.8; ctx.stroke()
      }
    }

    // 弓箭（拉弦时在弦中心显示箭，指向弩关节中间线）
    if (ballPos && !proj.active) {
      const adx = SLING_JOINT_X - ballPos.x
      const ady = SLING_JOINT_Y - ballPos.y
      const aDist = Math.hypot(adx, ady)
      const aimAngle = aDist > 5 ? Math.atan2(ady, adx) : -Math.PI / 2
      drawArrow(ballPos.x, ballPos.y, aimAngle)
    }

    // --- 8. 弹射轨迹（更精致的火焰尾迹 + 光晕） ---
    if (proj.active) {
      const streak = streakRef.current
      const trailColors: [string, string, string] = streak >= 5
        ? ['rgba(200,100,255,', 'rgba(255,50,150,', 'rgba(255,200,50,']   // 紫红金
        : streak >= 3
        ? ['rgba(100,200,255,', 'rgba(50,150,255,', 'rgba(255,220,80,']   // 蓝金
        : ['rgba(255,220,80,', 'rgba(255,150,30,', 'rgba(255,80,0,']      // 火焰
      // 尾焰粒子（带光晕）
      for (let i = 0; i < projectileTrailRef.current.length; i++) {
        const dot = projectileTrailRef.current[i]
        const dotR = dot.size * (1 + streak * 0.06)
        // 外层光晕
        const outerGlow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dotR * 1.5)
        outerGlow.addColorStop(0, `${trailColors[0]}${dot.alpha * 0.3})`)
        outerGlow.addColorStop(1, `${trailColors[2]}${dot.alpha * 0.02})`)
        ctx.fillStyle = outerGlow
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR * 1.5, 0, Math.PI * 2); ctx.fill()
        // 核心
        const tGrad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dotR)
        tGrad.addColorStop(0, `${trailColors[0]}${dot.alpha * 0.95})`)
        tGrad.addColorStop(0.35, `${trailColors[1]}${dot.alpha * 0.6})`)
        tGrad.addColorStop(1, `${trailColors[2]}${dot.alpha * 0.1})`)
        ctx.fillStyle = tGrad
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR, 0, Math.PI * 2); ctx.fill()
      }
      // 飞行弹丸光晕（更明显的动态光晕）
      const speed = Math.hypot(proj.vx, proj.vy)
      if (speed > 1.5) {
        const glowSize = PROJECTILE_RADIUS * (2.5 + streakRef.current * 0.3)
        const glowAlpha = 0.15 + streakRef.current * 0.04
        const trailGlow = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, glowSize)
        trailGlow.addColorStop(0, `rgba(255,220,80,${glowAlpha})`)
        trailGlow.addColorStop(0.5, `rgba(255,150,30,${glowAlpha * 0.4})`)
        trailGlow.addColorStop(1, 'rgba(255,100,0,0)')
        ctx.fillStyle = trailGlow
        ctx.beginPath(); ctx.arc(proj.x, proj.y, glowSize, 0, Math.PI * 2); ctx.fill()
      }
      drawArrow(proj.x, proj.y, proj.rotation)
    }

    // --- 9. 瞄准预览轨迹（弓箭延长线，从箭尖开始，与箭方向一致） ---
    if (phaseRef.current === 'aiming' && isDraggingRef.current) {
      // 射击方向：从拉弦点指向弩关节（与箭方向一致）
      const sdx = SLING_JOINT_X - dragCurrentRef.current.x
      const sdy = SLING_JOINT_Y - dragCurrentRef.current.y
      const sDist = Math.hypot(sdx, sdy)
      const sDirX = sDist > 1 ? sdx / sDist : 0
      const sDirY = sDist > 1 ? sdy / sDist : -1
      const pvx = sdx * DRAG_POWER
      const pvy = sdy * DRAG_POWER
      // 从箭尖位置开始（跳过箭身，避免覆盖弓箭）
      const arrowTipOffset = 58  // arrowLen(45) + tip(8) + 余量(5)
      let px = dragCurrentRef.current.x + sDirX * arrowTipOffset
      let py = dragCurrentRef.current.y + sDirY * arrowTipOffset
      let vx = pvx, vy = pvy
      const BOUNCE = 0.82
      const R = PROJECTILE_RADIUS
      const maxSteps = 150
      const aimAngle = Math.atan2(pvy, pvx)
      // 存储轨迹点（用于绘制连线）
      const trailPts: { x: number; y: number; step: number }[] = []
      // 引导线反弹边界对齐画面框体内缘（bw=6, 加2px余量）
      const FRAME = 8
      let bounceCount = 0
      const maxBounces = 2
      for (let i = 0; i < maxSteps; i++) {
        px += vx; py += vy
        let bounced = false
        if (px < FRAME) { px = FRAME; vx = Math.abs(vx) * BOUNCE; bounced = true }
        if (px > W - FRAME) { px = W - FRAME; vx = -Math.abs(vx) * BOUNCE; bounced = true }
        if (py < FRAME) { py = FRAME; vy = Math.abs(vy) * BOUNCE; bounced = true }
        if (bounced) { bounceCount++; if (bounceCount > maxBounces) break }
        trailPts.push({ x: px, y: py, step: i })
        if (py > GROUND_Y + 20) break
      }

      // 外层辉光（宽光晕）
      if (trailPts.length > 2) {
        ctx.save(); ctx.globalAlpha = 0.2
        ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 7; ctx.lineCap = 'round'
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 12
        ctx.beginPath(); ctx.moveTo(trailPts[0].x, trailPts[0].y)
        for (let i = 1; i < trailPts.length; i += 2) {
          ctx.lineTo(trailPts[i].x, trailPts[i].y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0; ctx.restore()
      }

      // 中层亮线
      if (trailPts.length > 2) {
        ctx.save(); ctx.globalAlpha = 0.55
        ctx.strokeStyle = '#7cfffe'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 6
        ctx.beginPath(); ctx.moveTo(trailPts[0].x, trailPts[0].y)
        for (let i = 1; i < trailPts.length; i += 2) {
          ctx.lineTo(trailPts[i].x, trailPts[i].y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0; ctx.restore()
      }

      // 核心白线（最亮）
      if (trailPts.length > 2) {
        ctx.save(); ctx.globalAlpha = 0.75
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(trailPts[0].x, trailPts[0].y)
        for (let i = 1; i < trailPts.length; i += 2) {
          ctx.lineTo(trailPts[i].x, trailPts[i].y)
        }
        ctx.stroke(); ctx.restore()
      }

      // 虚线脉冲光点（沿轨迹移动的亮斑）
      const pulsePhase = (t * 8) % 1
      for (let i = 0; i < trailPts.length; i += 12) {
        const pt = trailPts[i]
        const distFromPulse = Math.abs((i / trailPts.length) - pulsePhase)
        const pulseAlpha = distFromPulse < 0.08 ? (1 - distFromPulse / 0.08) * 0.8 : 0
        if (pulseAlpha > 0.01) {
          ctx.save(); ctx.globalAlpha = pulseAlpha
          ctx.fillStyle = '#00e5ff'
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2); ctx.fill()
          ctx.globalAlpha = pulseAlpha * 0.3
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2); ctx.fill()
          ctx.restore()
        }
      }

      // 绘制箭头形虚线标记（霓虹风格）
      for (let i = 0; i < trailPts.length; i += 4) {
        const pt = trailPts[i]
        const ratio = pt.step / maxSteps
        const alpha = (1 - ratio * 0.5) * 0.8
        const dotSize = 4 - ratio * 1.5
        // 箭头辉光
        ctx.save(); ctx.globalAlpha = alpha * 0.3
        ctx.translate(pt.x, pt.y)
        ctx.rotate(aimAngle)
        ctx.fillStyle = '#00e5ff'
        ctx.beginPath()
        ctx.moveTo(dotSize + 3, 0)
        ctx.lineTo(-dotSize - 1, -(dotSize + 1) * 0.7)
        ctx.lineTo(-dotSize - 1, (dotSize + 1) * 0.7)
        ctx.closePath(); ctx.fill()
        ctx.restore()
        // 箭头本体
        ctx.save(); ctx.globalAlpha = alpha
        ctx.translate(pt.x, pt.y)
        ctx.rotate(aimAngle)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.moveTo(dotSize + 2, 0)
        ctx.lineTo(-dotSize, -dotSize * 0.7)
        ctx.lineTo(-dotSize, dotSize * 0.7)
        ctx.closePath(); ctx.fill()
        ctx.restore()
      }
    }

    // --- 10. 冲击波效果 ---
    for (const sw of shockwavesRef.current) {
      const progress = (now - sw.time) / 600
      if (progress < 1) {
        const radius = 10 + progress * 50
        ctx.beginPath(); ctx.arc(sw.x, sw.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = sw.color
        ctx.lineWidth = 3 * (1 - progress)
        ctx.globalAlpha = 1 - progress
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    // --- 11. 粒子系统 ---
    for (const p of particlesRef.current) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.life

      if (p.type === 'confetti') {
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      } else if (p.type === 'spark') {
        ctx.beginPath(); ctx.arc(0, 0, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.fill()
        // 发光
        ctx.globalAlpha = p.life * 0.3
        ctx.beginPath(); ctx.arc(0, 0, p.size * p.life * 1.8, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.fill()
      } else if (p.type === 'dust') {
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(150,130,100,${p.life * 0.5})`; ctx.fill()
      } else if (p.type === 'leaf') {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.type === 'star') {
        // 阳光尘埃微光
        const sAlpha = p.life * 0.6
        ctx.fillStyle = p.color
        ctx.globalAlpha = sAlpha
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill()
        // 十字闪光
        ctx.globalAlpha = sAlpha * 0.4
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(-p.size * 2, 0); ctx.lineTo(p.size * 2, 0); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, -p.size * 2); ctx.lineTo(0, p.size * 2); ctx.stroke()
      } else {
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
    }

    // --- 12. 爆炸文字动画（带胶囊 + 缩放 + 阴影） ---
    for (const exp of explosionsRef.current) {
      const progress = (now - exp.time) / 1200
      if (progress < 1) {
        ctx.save()
        const eased = 1 - Math.pow(1 - progress, 2)
        const scale = progress < 0.15 ? 0.5 + (progress / 0.15) * 0.6 : 1.1 - (progress - 0.15) * 0.12
        ctx.globalAlpha = 1 - Math.pow(progress, 1.5)
        const ey = exp.y - 30 - eased * 50
        const fontSize = 21 + eased * 8
        ctx.translate(exp.x, ey)
        ctx.scale(scale, scale)
        ctx.font = `900 ${fontSize}px "PingFang SC", sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const tw = ctx.measureText(exp.text).width
        // 胶囊阴影
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.beginPath(); ctx.roundRect(-tw / 2 - 9, -fontSize / 2 - 3, tw + 18, fontSize + 10, fontSize / 2 + 3); ctx.fill()
        // 胶囊背景
        const capGrad = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2)
        if (exp.color === '#22c55e') {
          capGrad.addColorStop(0, 'rgba(34,197,94,0.95)'); capGrad.addColorStop(1, 'rgba(22,163,74,0.95)')
        } else if (exp.color === '#ef4444') {
          capGrad.addColorStop(0, 'rgba(239,68,68,0.95)'); capGrad.addColorStop(1, 'rgba(185,28,28,0.95)')
        } else {
          capGrad.addColorStop(0, 'rgba(120,120,120,0.85)'); capGrad.addColorStop(1, 'rgba(80,80,80,0.85)')
        }
        ctx.fillStyle = capGrad
        ctx.beginPath(); ctx.roundRect(-tw / 2 - 8, -fontSize / 2 - 4, tw + 16, fontSize + 8, fontSize / 2 + 2); ctx.fill()
        // 胶囊高光
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath(); ctx.roundRect(-tw / 2 - 6, -fontSize / 2 - 3, tw + 12, fontSize * 0.4, fontSize / 3); ctx.fill()
        // 文字（带描边）
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'
        ctx.strokeText(exp.text, 0, 0)
        ctx.fillStyle = '#fff'
        ctx.fillText(exp.text, 0, 0)
        ctx.restore()
      }
    }

    // --- 13. 氛围效果（更柔和的光影） ---
    // 顶部暖光（太阳方向更明显）
    const topGlow = ctx.createLinearGradient(0, 0, 0, 60)
    topGlow.addColorStop(0, 'rgba(255,248,200,0.15)')
    topGlow.addColorStop(0.5, 'rgba(255,245,200,0.05)')
    topGlow.addColorStop(1, 'rgba(255,245,200,0)')
    ctx.fillStyle = topGlow; ctx.fillRect(0, 0, W, 60)

    // 太阳光束（从右上角的光散射）
    ctx.save(); ctx.globalAlpha = 0.04
    const lightBeam = ctx.createLinearGradient(W, 0, W * 0.3, H * 0.5)
    lightBeam.addColorStop(0, '#fff8e1'); lightBeam.addColorStop(0.3, '#fff8e1')
    lightBeam.addColorStop(1, 'transparent')
    ctx.fillStyle = lightBeam
    ctx.beginPath()
    ctx.moveTo(W, 0); ctx.lineTo(W * 0.7, 0); ctx.lineTo(W * 0.2, H * 0.6); ctx.lineTo(W * 0.5, H * 0.6)
    ctx.closePath(); ctx.fill()
    ctx.restore()

    // 暗角（vignette，更微妙）
    const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.8)
    vig.addColorStop(0, 'rgba(0,0,0,0)')
    vig.addColorStop(0.7, 'rgba(0,0,0,0)')
    vig.addColorStop(1, 'rgba(0,0,0,0.15)')
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

    // 底部弩区域暖光
    const slingGlow = ctx.createRadialGradient(SLING_BASE_X, SLING_BASE_Y - 30, 10, SLING_BASE_X, SLING_BASE_Y - 30, 90)
    slingGlow.addColorStop(0, 'rgba(255,210,120,0.1)')
    slingGlow.addColorStop(0.5, 'rgba(255,200,100,0.04)')
    slingGlow.addColorStop(1, 'rgba(255,200,100,0)')
    ctx.fillStyle = slingGlow
    ctx.fillRect(SLING_BASE_X - 100, SLING_BASE_Y - 110, 200, 120)

    // 命中屏幕闪白
    if (screenFlashRef.current) {
      const fp = (now - screenFlashRef.current.time) / 250
      if (fp < 1) {
        ctx.save(); ctx.globalAlpha = (1 - fp) * 0.3
        ctx.fillStyle = screenFlashRef.current.color
        ctx.fillRect(0, 0, W, H); ctx.restore()
      } else {
        screenFlashRef.current = null
      }
    }

    // --- 14. 金属反射边框（更精致的画框效果） ---
    const bw = 6 // 边框宽度
    // 外层阴影
    ctx.save(); ctx.globalAlpha = 0.2
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = bw + 2; ctx.lineJoin = 'round'
    ctx.strokeRect(bw / 2 - 1, bw / 2 - 1, W - bw + 2, H - bw + 2)
    ctx.restore()
    // 底层深色
    ctx.strokeStyle = '#37474f'; ctx.lineWidth = bw; ctx.lineJoin = 'round'
    ctx.strokeRect(bw / 2, bw / 2, W - bw, H - bw)
    // 金属渐变（更丰富的光泽变化）
    const frameGrad = ctx.createLinearGradient(0, 0, W, H)
    frameGrad.addColorStop(0, '#90a4ae'); frameGrad.addColorStop(0.08, '#cfd8dc')
    frameGrad.addColorStop(0.15, '#eceff1'); frameGrad.addColorStop(0.25, '#b0bec5')
    frameGrad.addColorStop(0.4, '#eceff1'); frameGrad.addColorStop(0.5, '#78909c')
    frameGrad.addColorStop(0.65, '#eceff1'); frameGrad.addColorStop(0.75, '#b0bec5')
    frameGrad.addColorStop(0.88, '#eceff1'); frameGrad.addColorStop(1, '#90a4ae')
    ctx.strokeStyle = frameGrad; ctx.lineWidth = bw - 1.5
    ctx.strokeRect(bw / 2, bw / 2, W - bw, H - bw)
    // 顶部高光线（更亮）
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(bw + 2, bw); ctx.lineTo(W - bw - 2, bw); ctx.stroke()
    // 左侧高光
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(bw, bw + 2); ctx.lineTo(bw, H - bw - 2); ctx.stroke()
    // 底部暗线（更柔和）
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(bw + 2, H - bw); ctx.lineTo(W - bw - 2, H - bw); ctx.stroke()
    // 右侧暗线
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.beginPath(); ctx.moveTo(W - bw, bw + 2); ctx.lineTo(W - bw, H - bw - 2); ctx.stroke()
    // 角部高光点
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath(); ctx.arc(bw + 2, bw + 2, 1.5, 0, Math.PI * 2); ctx.fill()
    // 内部微弱发光边
    ctx.save(); ctx.globalAlpha = 0.04
    const innerGlow = ctx.createLinearGradient(bw, bw, bw, bw + 20)
    innerGlow.addColorStop(0, '#fff'); innerGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = innerGlow; ctx.fillRect(bw, bw, W - bw * 2, 20)
    ctx.restore()

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [prepareQuestion, endGame, onAnswer, spawnParticles])

  // 开始游戏
  const startGame = useCallback(() => {
    scoreRef.current = 0; correctCountRef.current = 0; streakRef.current = 0
    livesRef.current = MAX_LIVES; maxComboRef.current = 0
    comboStartTimeRef.current = 0
    levelRef.current = 1; answeredRef.current = 0
    targetsRef.current = []; explosionsRef.current = []
    projectileTrailRef.current = []; particlesRef.current = []
    shockwavesRef.current = []
    isDraggingRef.current = false
    animTimeRef.current = 0

    setScore(0); setCorrectCount(0); setStreak(0)
    setLives(MAX_LIVES); setMaxCombo(0); setComboDisplay(0); setShowCombo(false); setShowRecord(false)
    setLeaderboardData(loadLeaderboard())

    const canvas = canvasRef.current
    if (canvas) { canvas.width = CANVAS_W; canvas.height = CANVAS_H }

    initClouds()
    prepareQuestion()

    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop, prepareQuestion, initClouds])

  // 获取 canvas 坐标
  const getCanvasPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }, [])

  // 拖拽开始
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (phaseRef.current !== 'ready') return
    let cx: number, cy: number
    if ('touches' in e) { if (!e.touches.length) return; cx = e.touches[0].clientX; cy = e.touches[0].clientY }
    else { cx = e.clientX; cy = e.clientY }
    const pos = getCanvasPos(cx, cy)
    const dist = Math.hypot(pos.x - SLING_REST_X, pos.y - SLING_REST_Y)
    if (dist < 70) {
      isDraggingRef.current = true
      dragStartRef.current = { x: SLING_REST_X, y: SLING_REST_Y }
      dragCurrentRef.current = pos
      phaseRef.current = 'aiming'
      setPhase('aiming')
      sounds.click()
    }
  }, [getCanvasPos])

  // 拖拽移动
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return
    let cx: number, cy: number
    if ('touches' in e) { if (!e.touches.length) return; cx = e.touches[0].clientX; cy = e.touches[0].clientY }
    else { cx = e.clientX; cy = e.clientY }
    const pos = getCanvasPos(cx, cy)
    const dx = pos.x - dragStartRef.current.x
    const dy = pos.y - dragStartRef.current.y
    const dist = Math.hypot(dx, dy)
    if (dist > MAX_DRAG) {
      const scale = MAX_DRAG / dist
      dragCurrentRef.current = { x: dragStartRef.current.x + dx * scale, y: dragStartRef.current.y + dy * scale }
    } else {
      dragCurrentRef.current = pos
    }
  }, [getCanvasPos])

  // 释放弹射（从球的位置直线射出）
  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current || phaseRef.current !== 'aiming') return
    isDraggingRef.current = false
    // 射击方向：从拉弦点指向弩关节（与箭、引导线方向一致）
    const dx = SLING_JOINT_X - dragCurrentRef.current.x
    const dy = SLING_JOINT_Y - dragCurrentRef.current.y
    if (Math.hypot(dx, dy) < 15) { phaseRef.current = 'ready'; setPhase('ready'); return }

    const proj = projectileRef.current
    // 从箭尖位置发射（与引导线起点一致）
    const sDist = Math.hypot(dx, dy)
    const sDirX = sDist > 1 ? dx / sDist : 0
    const sDirY = sDist > 1 ? dy / sDist : -1
    const arrowTipOffset = 58
    proj.x = dragCurrentRef.current.x + sDirX * arrowTipOffset
    proj.y = dragCurrentRef.current.y + sDirY * arrowTipOffset
    proj.vx = dx * DRAG_POWER; proj.vy = dy * DRAG_POWER
    proj.active = true
    projectileTrailRef.current = []

    phaseRef.current = 'flying'; setPhase('flying')
    sounds.streak(); vibrate(50)
  }, [])


  // 清理
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
      if (recordTimerRef.current) clearTimeout(recordTimerRef.current)
    }
  }, [])

  // ===== 开始界面 =====
  if (phase === 'start') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          {/* 背景 */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-300" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-green-400/30" />
          {/* 装饰 */}
          <div className="absolute top-4 right-6 text-6xl opacity-20">🏹</div>
          <div className="absolute bottom-20 left-4 text-4xl opacity-15">🌳</div>
          <div className="absolute bottom-16 right-8 text-3xl opacity-15">🎯</div>

          <div className="relative p-8">
            <div className="mb-6">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-lg">
                <span className="text-7xl block">🏹</span>
              </div>
              <h2 className="text-3xl font-black text-white drop-shadow-lg mb-2">单词弹射</h2>
              <p className="text-white/80 text-sm drop-shadow">拉动弩弦，射向正确的英文靶子！</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 mb-5 text-left shadow-lg">
              <p className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-1.5">
                <span className="text-base">🎮</span> 游戏规则
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                {[
                  { icon: '👆', text: '向下拖拽弩弦上的球，松手直线发射' },
                  { icon: '📖', text: '跨过面前的河，命中对岸的英文靶子' },
                  { icon: '🔄', text: '碰到墙壁会反弹，利用反弹打到角落靶子！' },
                  { icon: '⭐', text: '普通靶 1 分 · 金靶 2 分 · 钻石靶 3 分' },
                  { icon: '❤️', text: '5 条命，脱靶扣 1 条，扣完结束' },
                  { icon: '🔥', text: '连续命中触发连击加倍得分！' },
                  { icon: '🏆', text: '挑战最高连击数，冲击排行榜！' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-base mt-0.5 shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-400/30 backdrop-blur-sm rounded-xl px-4 py-2.5 mb-6">
              <p className="text-xs text-white font-medium">💡 小技巧：向下拉得越远，射速越快！瞄准方向就是发射方向</p>
            </div>

            <button onClick={startGame}
              className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-black text-xl px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95">
              开始弹射 🏹
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 完成界面 =====
  if (phase === 'complete') {
    const pct = words.length > 0 ? Math.round((correctCountRef.current / words.length) * 100) : 0
    const grade = pct >= 90 ? 'S' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D'
    const gradeColor = pct >= 90 ? 'from-yellow-400 to-orange-500' : pct >= 75 ? 'from-green-400 to-emerald-500' : pct >= 60 ? 'from-blue-400 to-indigo-500' : 'from-gray-400 to-gray-500'
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="animate-bounce-in relative overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative p-8">
            <span className="text-7xl mb-3 block">{pct >= 80 ? '🏆' : pct >= 50 ? '🎉' : '💪'}</span>
            <h2 className="text-2xl font-black text-white drop-shadow-lg mb-1">
              🏹 弹射完成！
            </h2>
            <p className="text-white/70 text-sm mb-5">精彩表现！</p>

            {/* 评级 */}
            <div className="mb-6">
              <div className={`inline-block bg-gradient-to-br ${gradeColor} text-white text-6xl font-black w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center mb-4`}>
                {grade}
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <p className="text-2xl font-black text-white">{correctCountRef.current}</p>
                <p className="text-xs text-white/70">命中靶子</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <p className="text-2xl font-black text-white">{scoreRef.current}</p>
                <p className="text-xs text-white/70">总得分</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <p className="text-2xl font-black text-yellow-300">{correctCountRef.current * 12}</p>
                <p className="text-xs text-white/70">积分 ⭐</p>
              </div>
            </div>

            {/* 正确率 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 mb-6">
              <p className="text-sm text-white font-medium">
                正确率 {pct}%
                {pct >= 90 ? ' · 神射手！🌟' : pct >= 75 ? ' · 非常棒！🎉' : pct >= 50 ? ' · 继续加油！💪' : ' · 多练习就好了！📚'}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={onBack} className="flex-1 bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl transition-all hover:bg-white/30">返回</button>
              <button onClick={startGame} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95">再射一次 🏹</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== 游戏界面 =====
  return (
    <div className="max-w-lg mx-auto relative select-none">
      {/* 顶部信息栏：生命值 + 连击大字居中 + 得分 + 排行 */}
      <div className="relative flex items-center justify-between mb-1.5 overflow-visible" style={{ minHeight: '4.5rem' }}>
        {/* 生命值 */}
        <div className="flex items-center gap-0.5 z-10">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} className={`text-base transition-all duration-300 ${i < lives ? 'drop-shadow' : 'grayscale opacity-30'} ${i < lives && lives <= 2 ? 'animate-pulse' : ''}`}>
              {i < lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
        {/* 连击数（绝对居中，限宽防溢出） */}
        <div className="absolute left-1/2 -translate-x-1/2 overflow-hidden" style={{ maxWidth: '50%' }}>
          <span
            key={comboDisplay}
            className={`block font-black tracking-tighter leading-[0.85] whitespace-nowrap transition-all duration-200 ${
              comboDisplay >= 8 ? 'text-7xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]' :
              comboDisplay >= 5 ? 'text-6xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]' :
              comboDisplay >= 3 ? 'text-4xl text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]' :
              comboDisplay >= 1 ? 'text-2xl text-yellow-600' :
              'text-2xl text-gray-300'
            } animate-combo-pop`}
          >
            🔥 {comboDisplay > 0 ? comboDisplay : '0'}
          </span>
        </div>
        {/* 得分 + 排行名次 */}
        <div className="flex items-center gap-1.5 z-10">
          <div className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full shadow-sm">
            <span className="text-sm font-black text-amber-600">⭐ {score}</span>
          </div>
          <button
            onClick={() => { setLeaderboardData(loadLeaderboard()); setShowLeaderboard(true) }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 shadow-sm hover:bg-white hover:scale-105 transition-all text-xs font-bold text-gray-500"
            title="查看排行榜"
          >
            🏆 {(() => {
              const rank = getCurrentRank(maxCombo)
              return rank > 0 && rank <= 10 ? `#${rank}` : '-'
            })()}
          </button>
        </div>
      </div>

      {/* 当前题目 */}
      <div className="relative rounded-2xl overflow-hidden mb-2 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="relative p-3 text-white text-center">
          <p className="text-xs opacity-80 mb-0.5 tracking-wide">🏹 射击正确的靶子</p>
          <h2 className="text-xl font-black drop-shadow-lg tracking-wide">{currentMeaningRef.current}</h2>
        </div>
      </div>

      {/* 画布 */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full cursor-crosshair"
          style={{ touchAction: 'none' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
        {/* 连击浮层 */}
        {showCombo && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-2.5 rounded-full shadow-2xl border-2 border-white/30">
              <span className="text-lg font-black drop-shadow-md">{comboText}</span>
            </div>
          </div>
        )}
        {/* 破纪录提示 */}
        {showRecord && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in pointer-events-none">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-yellow-300/50 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-sm font-black drop-shadow-md">New Record!</p>
                <p className="text-xs opacity-90">最高连击 {maxCombo}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 排行榜弹窗 */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLeaderboard(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-bounce-in overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-4 text-white text-center">
              <span className="text-3xl mb-1 block">🏆</span>
              <h2 className="text-xl font-black">Combo Leaderboard</h2>
              <p className="text-xs opacity-80">Top 10 Players</p>
            </div>
            <div className="p-4 max-h-[360px] overflow-y-auto">
              {leaderboardData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-4xl block mb-2">🎯</span>
                  <p className="text-sm">No records yet!</p>
                  <p className="text-xs">Be the first to make a combo!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboardData.map((entry, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-xl ${
                      idx === 0 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300' :
                      idx === 1 ? 'bg-gray-100 border border-gray-200' :
                      idx === 2 ? 'bg-orange-50 border border-orange-200' :
                      'bg-gray-50'
                    }`}>
                      <span className={`text-lg font-black w-8 text-center ${
                        idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-400">{entry.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-orange-500">🔥 ×{entry.combo}</p>
                        {entry.time > 0 && <p className="text-xs text-gray-400">{entry.time}s</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="flex justify-between items-center mt-2.5 px-1">
        <span className="text-xs text-gray-400 font-medium">Lv.{levelRef.current}</span>
        <span className={`text-xs font-bold transition-colors ${
          phase === 'aiming' ? 'text-orange-500' : 'text-gray-400'
        }`}>
          {phase === 'aiming' ? '🎯 松手发射！' : '👇 向下拖拽弩弦发射'}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          🏆 最佳 {maxCombo > 0 ? maxCombo : '-'}
        </span>
      </div>
    </div>
  )
}
