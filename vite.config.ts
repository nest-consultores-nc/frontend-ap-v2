import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    exclude: [], // Asegúrate de que esté vacío o sin tus módulos locales
    force: true  // Fuerza la re-optimización en cada inicio
  }
})