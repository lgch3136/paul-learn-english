// 动画工具库

// 粒子效果配置
export const confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']

// 创建简单的粒子效果
export function createConfetti(container: HTMLElement, count: number = 50) {
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti-particle'
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      opacity: 1;
      transform: rotate(${Math.random() * 360}deg);
      animation: confettiFall ${2 + Math.random() * 3}s ease-in forwards;
      z-index: 1000;
      pointer-events: none;
    `
    container.appendChild(confetti)

    // 动画结束后移除
    setTimeout(() => {
      confetti.remove()
    }, 5000)
  }
}

// 添加粒子动画样式
export function addConfettiStyle() {
  if (typeof document === 'undefined') return

  const styleId = 'confetti-style'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    @keyframes confettiFall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }

    @keyframes bounceIn {
      0% {
        transform: scale(0.3);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
      }
      50% {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
      }
    }

    .animate-bounce-in {
      animation: bounceIn 0.6s ease-out;
    }

    .animate-pulse-once {
      animation: pulse 0.5s ease-in-out;
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .animate-glow {
      animation: glow 2s ease-in-out infinite;
    }
  `
  document.head.appendChild(style)
}

// 触发震动效果（如果设备支持）
export function vibrate(duration: number = 50) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration)
  }
}

// 数字滚动动画
export function animateNumber(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number = 1000
) {
  const startTime = performance.now()
  const diff = end - start

  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(start + diff * easeOut)

    element.textContent = current.toString()

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

// 进度条动画
export function animateProgress(
  element: HTMLElement,
  targetWidth: number,
  duration: number = 800
) {
  element.style.transition = `width ${duration}ms ease-out`
  element.style.width = `${targetWidth}%`
}