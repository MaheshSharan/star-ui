import * as React from "react"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { cn } from "@/lib/utils.ts"
import { useMediaDrawer } from "@/components/media/drawer/hooks/useMediaDrawer"
import { StarRating } from "@/components/media/StarRating"

export interface MediaCardProps {
    title: string
    imagePath?: string | null
    imageAlt?: string
    aspectRatio?: "portrait" | "landscape"
    className?: string
    type: "movie" | "tv"
    id: number
    rating: number
    year: number
    rank?: number
}

const RANK_NUMBER_HEIGHT_RATIO = 0.3
const RANK_OVERLAP_RATIO = 0.5
const RANK_WIDTH_MULTI_1DIGIT = 1.2
const RANK_WIDTH_MULTI_2DIGIT = 1.6

export const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(({ title, imagePath, imageAlt, aspectRatio = "portrait", className, rating, year, id, type, rank }, ref) => {
    const { open } = useMediaDrawer()

    const cardRef = React.useRef<HTMLDivElement>(null)
    const [cardWidth, setCardWidth] = React.useState(0)

    React.useEffect(() => {
        if (!cardRef.current || rank === undefined) return
        const obs = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setCardWidth(entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width)
            }
        })
        obs.observe(cardRef.current)
        return () => obs.disconnect()
    }, [rank])

    const cardHeight = cardWidth * 1.5
    const numberHeight = cardHeight * RANK_NUMBER_HEIGHT_RATIO
    const numberWidth = numberHeight * (rank !== undefined && rank >= 10 ? RANK_WIDTH_MULTI_2DIGIT : RANK_WIDTH_MULTI_1DIGIT)
    const overlap = numberWidth * RANK_OVERLAP_RATIO
    const numberFontSize = numberHeight

    React.useEffect(() => {
        if (!cardRef.current || rank === undefined) return
        const carouselItem = cardRef.current.closest('[data-slot="carousel-item"]') as HTMLElement | null
        if (!carouselItem) return

        if (rank === 1) {
            carouselItem.style.marginLeft = "0px"
            return
        }

        const computedGap = parseFloat(window.getComputedStyle(carouselItem).paddingLeft) || 16
        const shift = overlap + 2 - computedGap
        const margin = Math.max(0, shift)
        carouselItem.style.marginLeft = `${margin}px`

        return () => {
            if (carouselItem) {
                carouselItem.style.marginLeft = ""
            }
        }
    }, [cardWidth, overlap, rank])

    const card = (
        <Card ref={cardRef} className={cn("group overflow-hidden border-none py-0 transition-all cursor-pointer", className)} onClick={() => open({ type: type, id: id })}>
            <CardContent className="p-0">
                <div className={cn("relative overflow-hidden rounded-md bg-muted", aspectRatio === "portrait" ? "aspect-2/3" : "aspect-video")}>
                    <img
                        src={imagePath ?? "/favicon.svg"}
                        alt={imageAlt || title}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.08]"
                        loading="lazy"
                    />

                    <div className="pointer-events-none absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                        <div className="relative z-10 w-full p-3 text-white">
                            <div className="text-sm leading-tight font-semibold">{title}</div>

                            <div className={"mt-1 flex w-full justify-between text-xs font-medium"}>
                                <StarRating rating={rating} />
                                <span>{year}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (rank === undefined) return card

    return (
        <div ref={ref} className="relative group rank-card-wrapper" style={{ width: `calc(100% + ${overlap}px)`, marginLeft: rank === 1 ? 0 : `max(-${overlap}px, calc(2px - var(--carousel-gap)))` }}>
            <div style={{ marginLeft: overlap, width: `calc(100% - ${overlap}px)` }}>
                {card}
            </div>
            <div
                className="absolute bottom-0 left-0 flex items-end justify-center select-none text-white/85 transition-opacity duration-300 group-hover:opacity-0"
                style={{
                    width: numberWidth,
                    height: numberHeight,
                    fontSize: numberFontSize,
                    fontWeight: 900,
                }}
            >
                <span className="translate-y-[0.07em] leading-none">{rank}</span>
            </div>
        </div>
    )
})

MediaCard.displayName = "MediaCard"
