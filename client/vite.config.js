/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 导入默认配置
import { configDefaults } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    // include: [ '**/tests/**'],
    // exclude: [...configDefaults.exclude, 'test_results/**', '**/*.main.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [...configDefaults.coverage.exclude, 'test_results/**', '**/main.js', '**/utils/**', '**/icons/**','**/TreeItem.*', '**/components/**'], 
    },
  },
})


