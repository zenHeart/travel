import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
  assetsInclude: ['**/*.md', '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif'],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  server: {
    fs: {
      // 允许访问项目根目录之外的文件
      allow: ['..']
    }
  }
})
