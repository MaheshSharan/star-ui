/**
 * Environment configuration plugin
 * Validates and loads environment variables
 */
import type { FastifyInstance } from "fastify"
import env from "@fastify/env"

const schema = {
    type: "object",
    required: ["VITE_TMDB_API_KEY", "PORT", "HOST"],
    properties: {
        PORT: {
            type: "number",
        },
        HOST: {
            type: "string",
        },
        VITE_TMDB_API_KEY: {
            type: "string",
        },
        VITE_OMSS_API_URL: {
            type: "string",
        },
        VITE_STANDALONE: {
            type: "boolean",
        },
        ALLOWED_HOSTS: {
            type: "string",
            separator: ",",
        },
        TRUST_PROXY: {
            type: "boolean",
        },
    },
}

export async function registerConfigPlugin(app: FastifyInstance) {
    const options = {
        confKey: "config",
        schema: schema,
        dotenv: {
            quiet: true,
        },
    }

    await app.register(env, options)
}
