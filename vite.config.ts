import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.VITE_PORT
    ? parseInt(env.VITE_PORT, 10)
    : env.PORT
      ? parseInt(env.PORT, 10)
      : 3030

  return {
   plugins: [
  mode === 'development' && devtools(),
  tailwindcss(),
  nitro({
    preset: 'aws_amplify',
    awsAmplify: { runtime: 'nodejs24.x' },
  }),
  tanstackStart(),
  viteReact(),
].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        events: 'events',
      },
    },
    optimizeDeps: {
      include: ['events'],
    },
    // <-- environments.ssr block removed
    preview: {
      port,
    },
    server: {
      port,
      proxy: {
        '/api/v1': env.VITE_API_BASE_URL,
      },
      allowedHosts: ['localhost', '127.0.0.1', 'homestays.local'],
    },
  }
})