import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // One stylesheet, linked from every pre-rendered page, so static HTML is styled before JavaScript loads.
  build: { cssCodeSplit: false },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
