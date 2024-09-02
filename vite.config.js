import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/csvs': {
        target: 'https://j-ometry.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy will be an instance of 'http-proxy'
        },
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'game.html'),
        contestant: resolve(__dirname, 'contestant.html'),
        period: resolve(__dirname, 'period.html'),
        period_games: resolve(__dirname, 'period_games.html'),
        contestantIndex: resolve(__dirname, 'contestant_index.html'),
        about: resolve(__dirname, 'about.html'),
        glossary: resolve(__dirname, 'glossary.html'),
        blog: resolve(__dirname, 'blog.html')
      }
    }
  }
})
