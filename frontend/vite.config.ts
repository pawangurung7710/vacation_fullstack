import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 'hidden' emits .map files (so error-tracking / Lighthouse can resolve stacks)
    // without appending the sourceMappingURL comment that ships them to every visitor.
    sourcemap: 'hidden',
    // Split rarely-changing vendor code into its own long-cached chunk so an app-code
    // deploy doesn't force every visitor to re-download React, the router, etc.
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
