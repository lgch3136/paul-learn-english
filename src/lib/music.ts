// 背景音乐管理器 - 使用真实音频文件
class MusicManager {
  private audio: HTMLAudioElement | null = null
  private isPlaying: boolean = false
  private volume: number = 0.25
  private initialized: boolean = false

  constructor() {}

  async init(): Promise<boolean> {
    if (this.initialized) return true
    try {
      if (typeof window === 'undefined') return false
      this.audio = new Audio('/audio/background-music.mp3')
      this.audio.loop = true
      this.audio.volume = this.volume
      this.audio.preload = 'auto'
      this.initialized = true
      return true
    } catch (e) {
      console.error('音频初始化失败:', e)
      return false
    }
  }

  async play() {
    if (!this.initialized) {
      const ok = await this.init()
      if (!ok) return false
    }
    if (!this.audio || this.isPlaying) return this.isPlaying
    try {
      await this.audio.play()
      this.isPlaying = true
      return true
    } catch (e) {
      console.error('播放音乐失败:', e)
      return false
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.isPlaying = false
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.audio) this.audio.volume = this.volume
  }

  getVolume(): number { return this.volume }

  async toggle() {
    if (this.isPlaying) {
      this.stop()
      return false
    } else {
      return await this.play()
    }
  }

  getIsPlaying(): boolean { return this.isPlaying }
  isInitialized(): boolean { return this.initialized }
}

export const music = new MusicManager()