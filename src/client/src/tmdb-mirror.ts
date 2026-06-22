const TMDB_MIRROR = "https://db.videasy.to/3"

const originalFetch = globalThis.fetch

globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url

  if (url.startsWith("https://api.themoviedb.org/3")) {
    return originalFetch(url.replace("https://api.themoviedb.org/3", TMDB_MIRROR), init)
  }

  return originalFetch(input, init)
}
