import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {}
  },
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/chatbot-embed/index.jsx'),
      name: 'ChatbotEmbed',
      fileName: () => 'chatbot.bundle.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        // ✅ Remove externals → we want a self-contained file
      }
    }
  }
});
