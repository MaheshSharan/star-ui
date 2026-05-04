import type { FastifyInstance } from "fastify"
import helmet from "@fastify/helmet"

export async function registerHelmetPlugin(app: FastifyInstance) {
    await app.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "https://api.themoviedb.org"],
                imgSrc: ["'self'", "data:", "https://image.tmdb.org"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                scriptSrcElem: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                mediaSrc: ["'self'", "https:"],
                fontSrc: ["'self'", "https:", "data:"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'self'"],
            },
        },
        referrerPolicy: {
            policy: "strict-origin-when-cross-origin",
        },
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "same-origin" },
    })
}
