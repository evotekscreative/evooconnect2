import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Pastikan modul 'path' sudah terinstall (bawaan Node.js)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Mengarah ke folder `src`
    },
  },
});