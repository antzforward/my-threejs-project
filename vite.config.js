import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,  // 开发服务器端口
    open: true   // 自动打开浏览器
  },
  build: {
    outDir: 'dist',  // 构建输出目录
    sourcemap: true  // 生成 sourcemap 用于调试
  }
})