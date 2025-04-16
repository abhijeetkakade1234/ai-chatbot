import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'dist/chatbot.bundle.js',
          dest: 'public'  // this is the fix ✅
        }
      ]
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/chatbot-embed/index.jsx'),
      name: 'Chatbot',
      fileName: () => `chatbot.bundle.js`,
      formats: ['iife'],
    }
  }
});
