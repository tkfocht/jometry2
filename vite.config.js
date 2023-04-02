import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
        contestantIndex: resolve(__dirname, 'contestant_index.html'),
        about: resolve(__dirname, 'about.html'),
        glossary: resolve(__dirname, 'glossary.html'),
        blog: resolve(__dirname, 'blog.html')
      }
    }
  }
})
