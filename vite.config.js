import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true // Für mobile Geräte zugänglich
  },
  build: {
    // PWA Optimierungen
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['./src/utils/storage.js', './src/utils/usePersistedState.js']
        }
      }
    },
    // Komprimierung für bessere Performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Console.log entfernen in Production
        drop_debugger: true
      }
    },
    // Chunk-Größe Warnungen
    chunkSizeWarningLimit: 1000
  },
  // PWA-spezifische Optimierungen
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
