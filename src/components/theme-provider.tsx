"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "chatty-theme",
  attribute = "class",
  enableSystem = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof window !== 'undefined' ? (localStorage.getItem(storageKey) as Theme) : undefined) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    const initialTheme = storedTheme || defaultTheme;
    setTheme(initialTheme);
  }, [storageKey, defaultTheme]);

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let effectiveTheme = theme
    if (theme === "system" && enableSystem) {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    
    root.classList.add(effectiveTheme)

  }, [theme, enableSystem])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
