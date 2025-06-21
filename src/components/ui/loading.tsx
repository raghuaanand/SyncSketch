import React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)}>
      <div className="border-2 border-current border-t-transparent rounded-full w-full h-full" />
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  description?: string
  className?: string
}

export function LoadingState({ 
  message = "Loading...", 
  description,
  className 
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 p-8", className)}>
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
          <LoadingSpinner size="md" className="text-white" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{message}</h3>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
      </div>
    </div>
  )
}
