import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Check, Settings, Captions, Volume2, HardDrive } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaWatchContext } from "./providers/MediaWatchProvider"
import { useSubtitles } from "./hooks/useSubtitles"
import { useAudioTracks } from "./hooks/useAudioTracks"
import { Badge } from "@/components/ui/badge"
import { normalizeQuality } from "@/lib/strings.utils.ts"

export function PlayerSettings() {
    const { t } = useTranslation("player")
    const { state, selectSource } = useMediaWatchContext()
    const { subtitles, selectedSubtitle, selectSubtitle } = useSubtitles()
    const { audioTracks, selectedAudioTrack, selectAudioTrack } = useAudioTracks()

    const sources = useMemo(() => {
        return state.media?.playback.sources.reverse() || []
    }, [state.media?.playback.sources])

    const selectedSource = state.media?.playback.selectedSource

    const groupedSources = useMemo(() => {
        return sources.reduce<Record<string, typeof sources>>((acc, source) => {
            const provider = source.provider.name
            if (!acc[provider]) {
                acc[provider] = []
            }
            acc[provider].push(source)
            return acc
        }, {})
    }, [sources])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" title={t("controls.settings")}>
                    <Settings className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 border-zinc-800 bg-zinc-900/95 text-zinc-100 backdrop-blur-md p-0 overflow-hidden">
                <Tabs defaultValue="source" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b border-zinc-800 bg-transparent p-0">
                        <TabsTrigger value="source" className="rounded-none data-[state=active]:bg-zinc-800">
                            <HardDrive className="size-4 mr-2" />
                            {t("settings.tabs.source")}
                        </TabsTrigger>
                        <TabsTrigger value="subtitles" className="rounded-none data-[state=active]:bg-zinc-800">
                            <Captions className="size-4 mr-2" />
                            {t("settings.tabs.subtitles")}
                        </TabsTrigger>
                        <TabsTrigger value="audio" className="rounded-none data-[state=active]:bg-zinc-800">
                            <Volume2 className="size-4 mr-2" />
                            {t("settings.tabs.audio")}
                        </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-72">
                        <TabsContent value="source" className="m-0 p-2">
                            {Object.entries(groupedSources).map(([provider, providerSources]) => (
                                <div key={provider} className="mb-4 last:mb-0">
                                    <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        {provider}
                                    </div>
                                    <div className="space-y-1 mt-1">
                                        {providerSources.map((source, idx) => {
                                            const isSelected = selectedSource?.url === source.url
                                            return (
                                                <button
                                                    key={`${source.provider.id}-${idx}`}
                                                    onClick={() => selectSource(source)}
                                                    className={`w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors ${
                                                        isSelected ? "bg-primary/20 text-primary" : "hover:bg-zinc-800 text-zinc-300"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">
                                                            {t("selectors.sourceNumber", { number: idx + 1 })}
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px] py-0 border-zinc-700">
                                                            {normalizeQuality(source.quality)}
                                                        </Badge>
                                                    </div>
                                                    {isSelected && <Check className="size-4" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="subtitles" className="m-0 p-2">
                            <button
                                onClick={() => selectSubtitle(undefined)}
                                className={`w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors ${
                                    !selectedSubtitle ? "bg-primary/20 text-primary" : "hover:bg-zinc-800 text-zinc-300"
                                }`}
                            >
                                <span className="text-sm font-medium">{t("selectors.subtitlesOff")}</span>
                                {!selectedSubtitle && <Check className="size-4" />}
                            </button>
                            {subtitles.map((sub, idx) => (
                                <button
                                    key={`${sub.url}-${idx}`}
                                    onClick={() => selectSubtitle(sub)}
                                    className={`w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors ${
                                        selectedSubtitle?.url === sub.url ? "bg-primary/20 text-primary" : "hover:bg-zinc-800 text-zinc-300"
                                    }`}
                                >
                                    <span className="text-sm font-medium">{sub.label}</span>
                                    {selectedSubtitle?.url === sub.url && <Check className="size-4" />}
                                </button>
                            ))}
                        </TabsContent>

                        <TabsContent value="audio" className="m-0 p-2">
                            {audioTracks.length > 0 ? (
                                audioTracks.map((track, idx) => (
                                    <button
                                        key={`${track.language}-${idx}`}
                                        onClick={() => selectAudioTrack(track)}
                                        className={`w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors ${
                                            selectedAudioTrack?.language === track.language ? "bg-primary/20 text-primary" : "hover:bg-zinc-800 text-zinc-300"
                                        }`}
                                    >
                                        <span className="text-sm font-medium">{track.label || track.language}</span>
                                        {selectedAudioTrack?.language === track.language && <Check className="size-4" />}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-zinc-500 text-sm">
                                    {t("settings.noAudioTracks")}
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </PopoverContent>
        </Popover>
    )
}
