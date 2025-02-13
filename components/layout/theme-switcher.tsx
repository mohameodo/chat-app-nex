"use client"

import { useState, useEffect } from "react"
import { themes, type ThemeName } from "@/lib/themes"
import { Button } from "@/components/ui/button"

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeName
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (themeName: ThemeName) => {
    const theme = themes[themeName]
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })
    localStorage.setItem("theme", themeName)
  }

  const changeTheme = (themeName: ThemeName) => {
    setCurrentTheme(themeName)
    applyTheme(themeName)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.keys(themes).map((themeName) => (
        <Button
          key={themeName}
          onClick={() => changeTheme(themeName as ThemeName)}
          variant={currentTheme === themeName ? "default" : "outline"}
          size="sm"
        >
          {themeName}
        </Button>
      ))}
    </div>
  )
}

