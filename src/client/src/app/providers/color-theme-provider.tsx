import React, { useState, useCallback, useEffect } from "react"
import { ColorThemeContext, type ColorThemeId, colorThemes } from "@/hooks/use-color-theme"

const STORAGE_KEY = "app.colorTheme"

function isColorThemeId(value: unknown): value is ColorThemeId {
    return typeof value === "string" && colorThemes.some((t) => t.id === value)
}

function applyColorTheme(theme: ColorThemeId) {
    if (theme === "orange") {
        document.documentElement.removeAttribute("data-color-theme")
    } else {
        document.documentElement.setAttribute("data-color-theme", theme)
    }
}

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
    const [colorTheme, setColorThemeState] = useState<ColorThemeId>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const parsed = raw ? JSON.parse(raw) : null
            if (isColorThemeId(parsed)) return parsed
        } catch {}
        return "orange"
    })

    useEffect(() => {
        applyColorTheme(colorTheme)
    }, [colorTheme])

    const setColorTheme = useCallback((theme: ColorThemeId) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
        } catch {}
        setColorThemeState(theme)
    }, [])

    return <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>{children}</ColorThemeContext.Provider>
}
