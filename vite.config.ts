import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  // 🛡️ SECURITY & PRODUCTION HARDENING (Anti-Cloning & Code Obfuscation)
  build: {
    // 1. Disables source maps so Chrome DevTools cannot reconstruct TypeScript source code
    sourcemap: false,
    // 2. High-compression minification & variable name mangling
    minify: 'esbuild',
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          motion: ['motion/react'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  esbuild: {
    // 3. Automatically strips internal console.logs and debuggers in production build
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
})
