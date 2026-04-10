// Osobna konfiguracja Vite tylko dla aplikacji Radio PWA
// Używana przez Netlify: npm run build:radio
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist-radio',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        radio: resolve(__dirname, 'radio.html'),
      },
    },
  },
})
