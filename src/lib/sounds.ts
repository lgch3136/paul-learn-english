// 音效工具库
// 使用 Web Audio API 生成简单音效，无需外部音频文件

class SoundManager {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  // 播放音符
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.audioContext) return

    // iOS Safari 等浏览器在用户交互前 AudioContext 处于 suspended 状态
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // 点击音效
  click() {
    this.playTone(800, 0.1, 'sine', 0.2)
  }

  // 正确答案音效 - 欢快的上升音阶
  correct() {
    const notes = [523, 659, 784] // C5, E5, G5
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', 0.3)
      }, index * 100)
    })
  }

  // 错误答案音效 - 温柔的提示音
  wrong() {
    this.playTone(300, 0.2, 'sine', 0.2)
    setTimeout(() => {
      this.playTone(250, 0.3, 'sine', 0.15)
    }, 200)
  }

  // 完成练习音效 - 胜利音效
  complete() {
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine', 0.3)
      }, index * 150)
    })
  }

  // 连续正确音效 - 奖励音效
  streak() {
    const notes = [784, 988, 1175, 1319] // G5, B5, D6, E6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.1, 'triangle', 0.25)
      }, index * 80)
    })
  }

  // 升级音效
  levelUp() {
    const notes = [440, 554, 659, 880] // A4, C#5, E5, A5
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'square', 0.2)
      }, index * 120)
    })
  }
}

// 导出单例
export const sounds = new SoundManager()