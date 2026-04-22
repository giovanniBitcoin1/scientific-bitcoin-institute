import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/' is correct for a custom domain (scientificbitcoininstitute.org).
  // If you ever deploy to username.github.io/repo-name instead, change to '/repo-name/'.
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
