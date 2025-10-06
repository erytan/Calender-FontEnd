import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env':{}, // Polyfill process.env
  },
   build: {
    outDir: 'dist', // 👈 phải khớp với firebase.json
  },
})
