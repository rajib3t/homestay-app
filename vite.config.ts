import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.VITE_PORT
    ? parseInt(env.VITE_PORT, 10)
    : env.PORT
      ? parseInt(env.PORT, 10)
      : 3030



  return {
    plugins: [
      // Only enable devtools in development
      mode === 'development' && devtools(),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      viteReact(),
      tailwindcss(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Provide a browser-friendly implementation of the Node `events` module
        // so Vite does not externalize it when dependencies import it.
        events: 'events',
      },
    },
    // Ensure the browser `events` package is pre-bundled by Vite
    optimizeDeps: {
      include: ['events'],
    },
    build: {
      // Optimize build output
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['@tanstack/react-router'],
            'query-vendor': ['@tanstack/react-query'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable minification
      minify: 'esbuild',
      // Generate sourcemaps only in development
      sourcemap: mode === 'development',
    },
    preview: {
      port,
    },
    server: {
      port,
      proxy: {
        "/api/v1": env.VITE_API_BASE_URL
      },
      allowedHosts: [
        'localhost', '127.0.0.1', 'telemedicine-app.test'],

    },
  }
})
