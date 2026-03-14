/**
 * FILE: components/ui/AppCard.tsx
 * ZONE: Green
 * PURPOSE: Reusable card component with consistent styling across the platform
 * EXPORTS: AppCard, AppCardProps
 * DEPENDS ON: react
 * CONSUMED BY: All modules requiring card containers
 * TESTS: components/ui/tests/AppCard.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

import { HTMLAttributes, forwardRef } from "react"

export interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: "none" | "sm" | "md" | "lg"
  as?: "div" | "button" | "article"
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
}

export const AppCard = forwardRef<HTMLDivElement, AppCardProps>(
  (
    {
      children,
      className = "",
      hoverable = false,
      padding = "md",
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = hoverable || !!onClick

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          bg-[#1A1A2E]
          border border-[#2a2a3e]
          rounded-2xl
          ${paddingStyles[padding]}
          ${
            isClickable
              ? `
            cursor-pointer
            transition-all duration-150
            hover:border-[#2C5F2E]/50
            hover:bg-[#1f1f38]
            active:scale-[0.99]
          `
              : ""
          }
          ${className}
        `}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AppCard.displayName = "AppCard"
