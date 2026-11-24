import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development the React app runs on Vite's own port and forwards API calls to Express.
    proxy: { '/api': 'http://localhost:3001' },
  },
})
