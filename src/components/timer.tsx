"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Square, RotateCcw, Maximize, Minimize } from "lucide-react"

export default function Timer() {
  const [minutes, setMinutes] = useState<string>("")
  const [seconds, setSeconds] = useState<string>("")
  const [totalSeconds, setTotalSeconds] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsPaused(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const handleStart = () => {
    if (!isRunning && !isPaused) {
      const mins = Number.parseInt(minutes) || 0
      const secs = Number.parseInt(seconds) || 0
      const total = mins * 60 + secs

      if (total > 0) {
        setTotalSeconds(total)
        setTimeLeft(total)
        setIsRunning(true)
      }
    } else if (isPaused) {
      setIsRunning(true)
      setIsPaused(false)
    }
  }

  const handlePause = () => {
    if (isRunning) {
      setIsRunning(false)
      setIsPaused(true)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(totalSeconds)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(0)
    setTotalSeconds(0)
    setMinutes("")
    setSeconds("")
  }

  const toggleFullscreen = async () => {
    if (!cardRef.current) return

    try {
      if (!document.fullscreenElement) {
        await cardRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error)
    }
  }

  const formatTime = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isTimerActive = isRunning || isPaused

  return (
    <Card ref={cardRef} className={`w-full max-w-md ${isFullscreen ? "h-screen flex flex-col justify-center" : ""}`}>
      <CardHeader className="relative">
        <CardTitle>Timer</CardTitle>
        <CardDescription>Set a time and control your countdown</CardDescription>
        <Button
          onClick={toggleFullscreen}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isTimerActive && (
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                min="0"
                className="text-center"
              />
            </div>
            <span className="text-2xl font-semibold">:</span>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Seconds"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                min="0"
                max="59"
                className="text-center"
              />
            </div>
          </div>
        )}

        {isTimerActive && (
          <div className="text-center">
            <div className={`font-mono font-bold tabular-nums ${isFullscreen ? "text-9xl" : "text-6xl"}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleStart}
            disabled={isRunning || (timeLeft === 0 && !minutes && !seconds)}
            className="flex-1"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            {isPaused ? "Resume" : "Start"}
          </Button>

          <Button onClick={handlePause} disabled={!isRunning} variant="secondary" className="flex-1" size="lg">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>

          <Button
            onClick={handleStop}
            disabled={!isTimerActive}
            variant="outline"
            className="flex-1 bg-transparent"
            size="lg"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>

          <Button onClick={handleReset} variant="destructive" size="lg">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
