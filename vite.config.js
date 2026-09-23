import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/modern-portfolio/',
  // three.js lives in its own lazily-loaded chunk (src/three), fetched only
  // when a 3D scene nears the viewport, so its size doesn't block first paint.
  build: { chunkSizeWarningLimit: 700 },
})
