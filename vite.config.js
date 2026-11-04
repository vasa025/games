import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/games/',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'tileflow-icon-192.png', 'tileflow-icon-512.png'],
            manifest: {
                name: 'TileFlow',
                short_name: 'TileFlow',
                description: 'A sleek number-merging puzzle game inspired by TileFlow.',
                theme_color: '#121826',
                background_color: '#121826',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './',
                scope: './',
                icons: [
                    {
                        src: './tileflow-icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: './tileflow-icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
                navigateFallback: 'index.html'
            }
        })
    ],
    server: {
        host: '0.0.0.0',
        port: 5173
    },
    preview: {
        host: '0.0.0.0',
        port: 4173
    }
});
