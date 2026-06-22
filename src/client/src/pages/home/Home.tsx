import { useEffect, useMemo, useState } from "react"
import { useTmdb } from "@/hooks/use-tmdb"
import { useAppSettings } from "@/hooks/use-appsettings"
import { HeroCarousel } from "@/components/media/HeroCarousel/HeroCarousel"
import { HeroFade } from "@/components/media/HeroCarousel/HeroFade"
import { MediaRail } from "@/components/media/MediaRail/MediaRail"
import { MediaCard } from "@/components/media/MediaRail/MediaCard"
import { Top10MovieRail, Top10TvRail } from "@/components/media/MediaRail/TypedRails.tsx"
import type { MovieResultItem, TVSeriesResultItem, DiscoverMovieSortBy, DiscoverTVSortBy, CountryISO3166_1 } from "@lorenzopant/tmdb"

const PROVIDER_DEFS = [
    { id: "amazon", title: "Amazon Prime Video", provider: "9|119" },
    { id: "disney", title: "Disney+", provider: "337" },
    { id: "hotstar", title: "Hotstar", provider: "122" },
    { id: "hbo", title: "HBO Max", provider: "384" },
    { id: "hulu", title: "Hulu", provider: "15" },
    { id: "paramount", title: "Paramount+", provider: "531|582|633" },
    { id: "apple", title: "Apple TV", provider: "2" },
    { id: "google", title: "Google Play Movies", provider: "3" },
    { id: "youtube", title: "YouTube", provider: "192" },
] as const

interface RailResult {
    key: string
    title: string
    items: (MovieResultItem | TVSeriesResultItem)[]
    isTop10: boolean
}

export function HomePage() {
    const tmdb = useTmdb()
    const { tmdbOptions } = useAppSettings()
    const region = tmdbOptions.region as CountryISO3166_1 | undefined

    const [rails, setRails] = useState<RailResult[]>([])
    const [heroReady, setHeroReady] = useState(false)

    const discoverOpts = useMemo(
        () => ({
            with_watch_monetization_types: "flatrate" as const,
            watch_region: region,
            sort_by: "popularity.desc" as DiscoverMovieSortBy,
        }),
        [region]
    )

    const discoverTvOpts = useMemo(
        () => ({
            with_watch_monetization_types: "flatrate" as const,
            watch_region: region,
            sort_by: "popularity.desc" as DiscoverTVSortBy,
        }),
        [region]
    )

    useEffect(() => {
        let cancelled = false

        async function load() {
            const seen = new Set<number>()

            const [np, tv] = await Promise.all([tmdb.movie_lists.now_playing(), tmdb.tv_lists.popular()])
            ;[...(np.results || []), ...(tv.results || [])].forEach((m) => seen.add(m.id))

            if (cancelled) return
            setHeroReady(true)

            const railDefs: { key: string; title: string; fetch: Promise<any>; isTop10: boolean }[] = [
                { key: "trending", title: "Trending Today", fetch: tmdb.trending.movies({ time_window: "day" }), isTop10: false },
                { key: "netflix_movies", title: "Top 10 Netflix Movies", fetch: tmdb.discover.movie({ ...discoverOpts, with_watch_providers: "8" }), isTop10: true },
                { key: "netflix_tv", title: "Top 10 Netflix TV Shows", fetch: tmdb.discover.tv({ ...discoverTvOpts, with_watch_providers: "8" }), isTop10: true },
                ...PROVIDER_DEFS.map((p) => ({
                    key: p.id,
                    title: p.title,
                    fetch: tmdb.discover.movie({ ...discoverOpts, with_watch_providers: p.provider }),
                    isTop10: false as const,
                })),
            ]

            const results: RailResult[] = []

            for (const def of railDefs) {
                try {
                    const data = await def.fetch
                    const items = (Array.isArray(data) ? data : (data as any).results ?? []) as (MovieResultItem | TVSeriesResultItem)[]
                    const filtered = items.filter((item: any) => !seen.has(item.id))

                    if (filtered.length >= 8 && !cancelled) {
                        const deduped = filtered.slice(0, 10)
                        deduped.forEach((item: any) => seen.add(item.id))
                        results.push({ key: def.key, title: def.title, items: deduped, isTop10: def.isTop10 })
                    }
                } catch {
                    // skip failed rail
                }
            }

            if (!cancelled) setRails(results)
        }

        setRails([])
        setHeroReady(false)
        load()

        return () => {
            cancelled = true
        }
    }, [tmdb, discoverOpts, discoverTvOpts])

    return (
        <div className="min-h-screen overflow-hidden">
            <HeroCarousel tmdb={tmdb} fetcher={() => Promise.all([tmdb.movie_lists.now_playing(), tmdb.tv_lists.popular()])} />

            <HeroFade />

            <section className="flex flex-col gap-8 bg-background p-8">
                {rails.map((rail) => {
                    if (rail.isTop10 && rail.key === "netflix_movies") {
                        return (
                            <Top10MovieRail
                                key={rail.key}
                                title={rail.title}
                                fetcher={() => Promise.resolve(rail.items as MovieResultItem[])}
                                itemsOverride={rail.items as MovieResultItem[]}
                            />
                        )
                    }
                    if (rail.isTop10 && rail.key === "netflix_tv") {
                        return (
                            <Top10TvRail
                                key={rail.key}
                                title={rail.title}
                                fetcher={() => Promise.resolve(rail.items as TVSeriesResultItem[])}
                                itemsOverride={rail.items as TVSeriesResultItem[]}
                            />
                        )
                    }
                    return (
                        <MediaRail
                            key={rail.key}
                            title={rail.title}
                            fetcher={() => Promise.resolve(rail.items as MovieResultItem[])}
                            itemsOverride={rail.items as MovieResultItem[]}
                            getKey={(item: any) => item.id}
                            renderItem={(item: any) => (
                                <MediaCard
                                    title={item.title ?? item.name}
                                    imagePath={item.poster_path}
                                    imageAlt={item.title ?? item.name}
                                    id={item.id}
                                    type={"movie"}
                                    year={new Date(item.release_date ?? item.first_air_date).getFullYear()}
                                    rating={item.vote_average}
                                />
                            )}
                        />
                    )
                })}
            </section>
        </div>
    )
}

export default HomePage
