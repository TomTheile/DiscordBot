export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
        output: {
            manualChunks(id) {
                if (id.includes('node_modules/react')) {
                    return 'vendor';
                }
            },
        },
    },
  },
})