"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme()

    const handleThemeChange = (checked: boolean) => {
        setTheme(checked ? "dark" : "light")
    }

    // Evita a renderização do componente no servidor para prevenir descompasso de hidratação
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    if (!mounted) {
        return null
    }

    return (
        <div className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <Switch
                id="theme-switch"
                checked={theme === "dark"}
                onCheckedChange={handleThemeChange}
                aria-label="Toggle theme"
            />
            <Moon className="h-5 w-5" />
        </div>
    )
}
