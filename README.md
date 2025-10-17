# my-threejs-project

## 设置环境
```shell
# 1. 安装 Node.js (包含 npm)
# 访问 https://nodejs.org/ 下载安装

# 2. 验证安装
node --version    # 应该显示 v16+
npm --version     # 应该显示 8+

# 3. 创建项目目录
mkdir my-threejs-project
cd my-threejs-project

# 4. 初始化项目
npm init -y
```

```shell
# 在项目目录中
npm install three
```

如果安装失败了，考虑下载的问题，添加淘宝镜像源,我是国内用户，当然选淘宝镜像源
```shell
npm config delete proxy #删掉代理
npm config delete https-proxy #删掉代理
# 切换到淘宝镜像源（中国大陆用户推荐） 
npm config set registry https://registry.npmmirror.com 
# 或使用官方源（全球用户） 
npm config set registry https://registry.npmjs.org 
# 重试安装 
npm install three

```

开发工具推荐，嗯 我用的就是vite，浏览器用chrome方便检查
```shell
# 推荐的开发环境
npm install --save-dev vite        # 快速开发服务器
npm install --save-dev @types/three # TypeScript类型定义（可选）

# 启动开发服务器
npx vite

```



## 运行网站
```
npx vite
```

## 隐函数构造Mesh的方式
用MarchingCubes