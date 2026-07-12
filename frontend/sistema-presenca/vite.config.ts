import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // NOVA CONFIGURAÇÃO DE SERVIDOR
  server: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:5249', // Usa env var no Docker, ou localhost fora dele
        changeOrigin: true,
        secure: false,
      }
    }
  }
})