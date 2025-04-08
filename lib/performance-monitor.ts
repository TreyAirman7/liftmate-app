"use client"

// lib/performance-monitor.ts
// This file provides utilities for monitoring animation performance.

interface AnimationMetrics {
  totalFrames: number
  jankFrames: number
}

let animationFrameCount = 0
let jankFrameCount = 0
let startTime: number | null = null

const frameThreshold = 16.7 // 60 FPS frame budget in milliseconds

export const startAnimationMonitoring = () => {
  animationFrameCount = 0
  jankFrameCount = 0
  startTime = performance.now()
  requestAnimationFrame(animationMonitor)
}

export const stopAnimationMonitoring = (): AnimationMetrics | null => {
  if (!startTime) return null

  const endTime = performance.now()
  const duration = endTime - startTime

  return {
    totalFrames: animationFrameCount,
    jankFrames: jankFrameCount,
  }
}

const animationMonitor = (timestamp: number) => {
  animationFrameCount++

  if (startTime && timestamp - startTime > frameThreshold) {
    jankFrameCount++
  }

  startTime = timestamp
  requestAnimationFrame(animationMonitor)
}

interface AnimationSettings {
  duration: number
  useSimplifiedAnimation: boolean
}

export const getOptimalAnimationSettings = (): AnimationSettings => {
  // This is a placeholder. In a real app, you might use
  // navigator.deviceMemory, navigator.hardwareConcurrency, or other
  // browser APIs to determine the device's capabilities.

  // For now, we'll just return some sensible defaults.
  return {
    duration: 350,
    useSimplifiedAnimation: false,
  }
}

