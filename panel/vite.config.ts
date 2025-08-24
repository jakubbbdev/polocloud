import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/polocloud': {
                target: `${process.env.VITE_BACKEND_PROTOCOL || 'http'}://${process.env.VITE_BACKEND_IP || '37.114.53.223'}:${process.env.VITE_BACKEND_PORT || '8080'}`,
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
                ws: true,
                configure: (proxy) => {
                    proxy.on('proxyRes', () => {
                    });
                }
            }
        }
    }
});
