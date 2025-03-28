import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    host: true, // Codespacesで外部アクセスを許可
    port: 3000,
  },
  base: './', // 相対パスでアセットを扱う
});