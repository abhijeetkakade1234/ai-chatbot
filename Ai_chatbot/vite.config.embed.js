import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/chatbot-embed/index.jsx'), // 👈 correct path now
      name: 'Chatbot',
      fileName: () => 'chatbot.bundle.js',
    },
    rollupOptions: {
      output: {
        format: 'iife', // 👌 for embedding
      },
    },
  },
});
