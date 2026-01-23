import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'https://gc8l9ijhzc.execute-api.ap-northeast-2.amazonaws.com/dev',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                secure: true,
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
})
