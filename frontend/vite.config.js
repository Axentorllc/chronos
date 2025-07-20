import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import frappeui from 'frappe-ui/vite'

export default defineConfig({
  plugins: [frappeui(), vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: `../${path.basename(path.resolve('..'))}/public/frontend`,
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['frappe-ui'],
          utils: ['dayjs']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'frappe-ui > feather-icons', 
      'showdown', 
      'engine.io-client',
      'dayjs',
      'dayjs/plugin/utc',
      'dayjs/plugin/timezone',
      'dayjs/plugin/weekday',
      'dayjs/plugin/isoWeek',
      'dayjs/plugin/customParseFormat',
      'dayjs/plugin/relativeTime',
      'dayjs/plugin/duration'
    ],
  },
})