import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // WebSocket proxy
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
      },
      // 7 Region Edge Proxies
      '/api/edge-sumatera':   { target: 'http://localhost:4001', rewrite: (p) => p.replace(/^\/api\/edge-sumatera/, '/api') },
      '/api/edge-jawa':       { target: 'http://localhost:4002', rewrite: (p) => p.replace(/^\/api\/edge-jawa/, '/api') },
      '/api/edge-kalimantan': { target: 'http://localhost:4003', rewrite: (p) => p.replace(/^\/api\/edge-kalimantan/, '/api') },
      '/api/edge-bali-nusra': { target: 'http://localhost:4004', rewrite: (p) => p.replace(/^\/api\/edge-bali-nusra/, '/api') },
      '/api/edge-sulawesi':   { target: 'http://localhost:4005', rewrite: (p) => p.replace(/^\/api\/edge-sulawesi/, '/api') },
      '/api/edge-maluku':     { target: 'http://localhost:4006', rewrite: (p) => p.replace(/^\/api\/edge-maluku/, '/api') },
      '/api/edge-papua':      { target: 'http://localhost:4007', rewrite: (p) => p.replace(/^\/api\/edge-papua/, '/api') },
      // Central
      '/api': 'http://localhost:4000',
    },
  },
});