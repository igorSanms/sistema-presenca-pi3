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
    host: true, // Expõe o Vite para fora do Docker
    port: 5173,
    watch: {
      usePolling: true, // Força o Docker a enxergar quando você salva o arquivo
    },
    hmr: {
      clientPort: 5173, // Garante que o navegador ache a conexão de atualização ao vivo
    },
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:5249', // Usa env var no Docker, ou localhost fora dele
        changeOrigin: true,
        secure: false,
      }
    }
  }
})