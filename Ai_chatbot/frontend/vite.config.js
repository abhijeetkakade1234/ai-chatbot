import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb if needed
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'firebase/auth',
            'firebase/app'
          ],
          components: [
            './src/components/Sidebar',
            './src/components/TopHeader',
            './src/components/CustomizationPanel',
            './src/components/ChatbotPreview',
            './src/components/EmbedCodeBlock'
          ]
        }
      }
    }
  }
});
