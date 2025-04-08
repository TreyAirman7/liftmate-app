"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import LoadingScreen from "@/components/loading-screen"

interface LoadingContextType {
  showLoading: () => void
  hideLoading: () => void
  isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
  isLoading: false,
})

export const useLoading = () => useContext(LoadingContext)

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const showLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      <LoadingScreen isLoading={isLoading} />
    </LoadingContext.Provider>
  )
}

