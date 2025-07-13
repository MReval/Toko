// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/toko-kue-raysa/',
  build: {
    rollupOptions: {
      input: {
        main:  'index.html',
        produk: 'produk.html'
      }
    }
  }
})