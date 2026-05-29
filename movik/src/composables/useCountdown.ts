import { ref, onMounted, onUnmounted } from 'vue'
import type { TimeLeft } from '@/types'

export function useCountdown(targetDate: Date) {
  const timeLeft = ref<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date()
    const difference = targetDate.getTime() - now.getTime()
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((difference / (1000 * 60)) % 60)
    const seconds = Math.floor((difference / 1000) % 60)

    return { days, hours, minutes, seconds }
  }

  let intervalId: number

  onMounted(() => {
    timeLeft.value = calculateTimeLeft()
    intervalId = setInterval(() => {
      timeLeft.value = calculateTimeLeft()
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(intervalId)
  })

  return {
    timeLeft
  }
}
