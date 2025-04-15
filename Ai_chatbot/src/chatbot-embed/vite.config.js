import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.jsx',
      name: 'Chatbot',
      fileName: 'chatbot.bundle'
    },
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'chatbot.bundle.js'
      }
    }
  }
});