import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // Increase the warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          'lottie-player': ['@dotlottie/player-component'],
        }
      }
    }
  }
});
