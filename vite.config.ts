import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from "@sentry/vite-plugin";


export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: false,
      routesDirectory: './src/react-app/routes',
      generatedRouteTree: './src/react-app/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    cloudflare(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'vite.svg'],
      manifest: {
        name: 'Playground WebMCP',
        short_name: 'WebMCP',
        description: 'A playground for WebMCP with PGLite database',
        theme_color: '#6366F1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        categories: ['developer', 'tools', 'productivity'],
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/pwa-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/pwa-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/pwa-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Open WebMCP',
            short_name: 'WebMCP',
            description: 'Open the WebMCP playground',
            url: '/',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // Only cache WASM and data files (PGLite) - let JS/CSS/HTML come fresh from network
        globPatterns: ['**/*.{wasm,data}'],
        navigateFallback: undefined,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        runtimeCaching: []
      },
      devOptions: {
        enabled: false
      }
    }),
    // Sentry plugin for source map uploads (only active when SENTRY_AUTH_TOKEN is set)
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/react-app"),
    },
  },
    optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  build: {
    target: 'esnext',
    // Only generate source maps when SENTRY_AUTH_TOKEN is set (for CI/CD uploads)
    // Using 'hidden' so sourceMappingURL comments aren't included in production bundles
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
  },
});
