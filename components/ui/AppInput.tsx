/**
 * FILE: components/ui/AppInput.tsx
 * ZONE: Green
 * PURPOSE: Reusable input component with consistent styling across the platform
 * EXPORTS: AppInput, AppInputProps
 * DEPENDS ON: react
 * CONSUMED BY: All modules requiring form inputs
 * TESTS: components/ui/tests/AppInput.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

import { InputHTMLAttributes, forwardRef } from "react"

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 px-3
              bg-[#252538]
              border border-[#2a2a3e]
              rounded-xl
              text-white
              placeholder:text-gray-500
              focus:border-[#2C5F2E]
              focus:outline-none
              focus:ring-1
              focus:ring-[#2C5F2E]
              transition-colors
              disabled:opacity-50
              disabled:cursor-not-allowed
              md:text-sm text-base
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    )
  }
)

AppInput.displayName = "AppInput"
