import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [svelte()],
    server: {
      port: 5173,
      proxy: {
        '/pizzabase': {
          target: env.VITE_BASE_URL || 'https://database.pizzaria.foundation/tasks/production',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/pizzabase/, ''),
        }
      }
    },
    build: {
      outDir: 'dist'
    }
  }
})
