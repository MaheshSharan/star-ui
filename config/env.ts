/**
 * Environment configuration validation schema and defaults
 * Used by both server and client (with VITE_ prefix for client)
 */

export const envSchema = {
    type: "object",
    required: ["VITE_TMDB_API_KEY"],
    properties: {
        // Server environment
        NODE_ENV: {
            type: "string",
            enum: ["development", "production", "test"],
            default: "development",
        },
        BACKEND_CORS_ORIGIN: {
            type: "string",
            default: "http://localhost:5173",
        },

        // TMDB Configuration
        VITE_TMDB_API_KEY: {
            type: "string",
            description: "The Movie Database API Key",
        },

        // OMSS Configuration (optional)
        VITE_OMSS_API_URL: {
            type: "string",
            default: "",
        },
    },
}

export interface EnvConfig {
    NODE_ENV: "development" | "production" | "test"
    BACKEND_CORS_ORIGIN: string
    VITE_TMDB_API_KEY: string
    VITE_OMSS_API_URL?: string
}
