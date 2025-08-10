import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    host: true,
    port: 8520,
    strictPort: true,
    hmr: {
      timeout: 60000, // Increased to 60 seconds
      overlay: false // Disable error overlay
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'react', 'react-dom'],
    exclude: []
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});