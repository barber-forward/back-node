import swc from 'unplugin-swc'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      src: resolve(__dirname, './src'),
    },
  },
})
