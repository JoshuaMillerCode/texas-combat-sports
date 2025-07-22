"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center space-x-4 text-center">
      <div className="bg-red-600/20 p-4 rounded-lg border border-red-600/30">
        <div className="text-2xl font-bold text-red-500">{timeLeft.days}</div>
        <div className="text-sm text-gray-400">Days</div>
      </div>
      <div className="bg-red-600/20 p-4 rounded-lg border border-red-600/30">
        <div className="text-2xl font-bold text-red-500">{timeLeft.hours}</div>
        <div className="text-sm text-gray-400">Hours</div>
      </div>
      <div className="bg-red-600/20 p-4 rounded-lg border border-red-600/30">
        <div className="text-2xl font-bold text-red-500">{timeLeft.minutes}</div>
        <div className="text-sm text-gray-400">Minutes</div>
      </div>
      <div className="bg-red-600/20 p-4 rounded-lg border border-red-600/30">
        <div className="text-2xl font-bold text-red-500">{timeLeft.seconds}</div>
        <div className="text-sm text-gray-400">Seconds</div>
      </div>
    </div>
  )
}
