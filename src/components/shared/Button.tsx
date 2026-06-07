import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  loading?: boolean
}

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-dark active:bg-accent-dark shadow-sm',
  secondary:
    'bg-white text-black border border-surface-border hover:bg-surface-alt active:bg-surface-alt',
  ghost:
    'bg-transparent text-black hover:bg-surface-alt active:bg-surface-alt',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-colors duration-150 select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
