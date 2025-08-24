import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const backendProtocol = env.VITE_BACKEND_PROTOCOL || 'http';
    const backendIP = env.VITE_BACKEND_IP || 'localhost';
    const backendPort = env.VITE_BACKEND_PORT || '8080';
    
    // Only throw error in development mode
    if (mode === 'development' && !env.VITE_BACKEND_IP) {
        console.warn('VITE_BACKEND_IP ist nicht gesetzt, verwende localhost als Fallback');
    }

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            proxy: {
                '/polocloud': {
                    target: `${backendProtocol}://${backendIP}:${backendPort}`,
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
    };
});
