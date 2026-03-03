import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'], // This tells Vite to treat 3D models as static assets
  server: {
    port: 3000,
    open: true // Automatically opens your browser when you run the app
  }
});