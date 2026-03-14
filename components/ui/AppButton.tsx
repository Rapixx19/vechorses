/**
 * FILE: components/ui/AppButton.tsx
 * ZONE: Green
 * PURPOSE: Reusable button component with consistent styling across the platform
 * EXPORTS: AppButton, AppButtonProps
 * DEPENDS ON: react, lucide-react
 * CONSUMED BY: All modules requiring buttons
 * TESTS: components/ui/tests/AppButton.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

import { Loader2 } from "lucide-react"
import { ButtonHTMLAttributes, forwardRef } from "react"

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "warning"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variants = {
  primary: `
    bg-[#2C5F2E] hover:bg-green-700
    active:bg-green-800 text-white
    border border-transparent`,
  secondary: `
    bg-[#252538] hover:bg-[#2a2a45]
    active:bg-[#1f1f38] text-white
    border border-[#2a2a3e]`,
  outline: `
    bg-transparent hover:bg-[#1A1A2E]
    active:bg-[#252538] text-white
    border border-[#2a2a3e]
    hover:border-[#2C5F2E]`,
  ghost: `
    bg-transparent hover:bg-[#1A1A2E]
    active:bg-[#252538] text-white
    border border-transparent`,
  danger: `
    bg-red-600 hover:bg-red-700
    active:bg-red-800 text-white
    border border-transparent`,
  warning: `
    bg-amber-600 hover:bg-amber-700
    active:bg-amber-800 text-white
    border border-transparent`,
}

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center
          font-medium rounded-xl
          transition-all duration-150
          cursor-pointer
          active:scale-95
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:active:scale-100
          focus:outline-none
          focus:ring-2
          focus:ring-[#2C5F2E]
          focus:ring-offset-2
          focus:ring-offset-[#0F1117]
          min-h-[44px] md:min-h-0
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

AppButton.displayName = "AppButton"
