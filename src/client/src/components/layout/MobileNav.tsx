import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Search, Settings, MoreHorizontal, ArrowLeft, X, ChevronRight, Film, Tv } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAppSettings } from "@/hooks/use-appsettings.ts"
import { cn } from "@/lib/utils.ts"

type PanelType = "more" | null

interface PanelProps {
    title: string
    items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]
    isOpen: boolean
    onClose: () => void
}

const NavigationPanel = ({ title, items, isOpen, onClose }: PanelProps) => {
    const location = useLocation()
    const navigate = useNavigate()

    const handleItemClick = (href: string) => {
        onClose()
        navigate(href)
    }

    return (
        <div
            className={cn(
                "fixed inset-0 z-[60] transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-background",
                isOpen ? "translate-y-0" : "translate-y-full"
            )}
            style={{ height: "100dvh" }}
            aria-hidden={!isOpen}
        >
            <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 border-b border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors -ml-1 p-1"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close panel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable items */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                    <div className="space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.href
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => handleItemClick(item.href)}
                                    className={cn(
                                        "flex w-full items-center gap-4 px-4 py-3.5 rounded-xl transition-colors duration-200 group border border-transparent",
                                        isActive
                                            ? "bg-primary/10 border-primary/20 text-primary"
                                            : "hover:bg-muted/60 active:bg-muted/80 text-foreground"
                                    )}
                                    aria-label={`Go to ${item.label}`}
                                >
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[15px] font-medium flex-1 text-left">
                                        {item.label}
                                    </span>
                                    <ChevronRight
                                        className={cn(
                                            "w-4 h-4 flex-shrink-0 transition-colors",
                                            isActive ? "text-primary/60" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                    />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Safe area bottom spacer */}
                <div className="pb-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    )
}

export default function MobileNav() {
    const [activePanel, setActivePanel] = React.useState<PanelType>(null)
    const location = useLocation()
    const { t } = useTranslation(["common", "header"])
    const { setShowSearch } = useAppSettings()

    // Lock body scroll when panel is open
    React.useEffect(() => {
        if (activePanel) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [activePanel])

    // Close panel on route change
    React.useEffect(() => {
        setActivePanel(null)
    }, [location.pathname])

    const togglePanel = React.useCallback((panel: PanelType) => {
        setActivePanel((prev) => (prev === panel ? null : panel))
    }, [])

    const closePanel = React.useCallback(() => {
        setActivePanel(null)
    }, [])

    const moreItems = [
        { label: t("movie.plural"), href: "/movies", icon: Film },
        { label: t("tvShow.plural"), href: "/shows", icon: Tv },
    ]

    const isHome = location.pathname === "/"
    const isSettings = location.pathname === "/settings"

    return (
        <>
            {/* Overlay panels */}
            <NavigationPanel
                title={t("more", "More")}
                items={moreItems}
                isOpen={activePanel === "more"}
                onClose={closePanel}
            />

            {/* Backdrop when panel is open */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300",
                    activePanel ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={closePanel}
                aria-hidden="true"
            />

            <nav
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)] bg-background/95 backdrop-blur-md border-t border-border"
                role="navigation"
                aria-label="Mobile navigation"
            >
                <div className="flex items-center justify-around py-2 px-2">
                    {/* Home */}
                    <Link
                        to="/"
                        className="flex flex-col items-center gap-1 py-1 px-4 group"
                        aria-label="Home"
                    >
                        <Home
                            className={cn(
                                "w-5 h-5 transition-colors duration-200",
                                isHome && !activePanel ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                            strokeWidth={isHome && !activePanel ? 2.5 : 2}
                        />
                        <span
                            className={cn(
                                "text-[10px] font-medium tracking-wide transition-colors duration-200",
                                isHome && !activePanel ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                        >
                            {t("home")}
                        </span>
                    </Link>

                    {/* Search */}
                    <button
                        type="button"
                        onClick={() => setShowSearch(true)}
                        className="flex flex-col items-center gap-1 py-1 px-4 group"
                        aria-label="Search"
                    >
                        <Search
                            className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
                            strokeWidth={2}
                        />
                        <span className="text-[10px] font-medium tracking-wide text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                            {t("search", "Search")}
                        </span>
                    </button>

                    {/* Settings */}
                    <Link
                        to="/settings"
                        className="flex flex-col items-center gap-1 py-1 px-4 group"
                        aria-label="Settings"
                    >
                        <Settings
                            className={cn(
                                "w-5 h-5 transition-colors duration-200",
                                isSettings && !activePanel ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                            strokeWidth={isSettings && !activePanel ? 2.5 : 2}
                        />
                        <span
                            className={cn(
                                "text-[10px] font-medium tracking-wide transition-colors duration-200",
                                isSettings && !activePanel ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                        >
                            {t("settings")}
                        </span>
                    </Link>

                    {/* More */}
                    <button
                        type="button"
                        onClick={() => togglePanel("more")}
                        className="flex flex-col items-center gap-1 py-1 px-4 group"
                        aria-label="Open more options"
                    >
                        <MoreHorizontal
                            className={cn(
                                "w-5 h-5 transition-colors duration-200",
                                activePanel === "more" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                            strokeWidth={activePanel === "more" ? 2.5 : 2}
                        />
                        <span
                            className={cn(
                                "text-[10px] font-medium tracking-wide transition-colors duration-200",
                                activePanel === "more" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                        >
                            {t("more", "More")}
                        </span>
                    </button>
                </div>
            </nav>
        </>
    )
}
