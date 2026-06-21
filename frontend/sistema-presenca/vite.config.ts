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
        target: 'http://backend:5249', // A porta do seu backend C#
        changeOrigin: true,
        secure: false,
      }
    }
  }
})