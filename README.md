# 个人博客前端

基于 Vue 3 + Vite 的个人博客前端界面

## 项目简介
这是个人博客系统的前端部分，采用 Vue 3 组合式 API 开发，与后端 RESTful API 交互，实现博客展示、管理、互动等功能。

## 技术栈
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 构建工具
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端
- **Marked** - Markdown 渲染

## 功能特性

### 公共页面
- 首页博客列表（分页、搜索）
- 博客详情页（Markdown 渲染）
- 赛博展厅（作品展示）

### 管理员功能
- 登录页面
- 发布博客（支持图片上传）
- 编辑博客
- 删除博客
- 作品上传/编辑/删除

### 互动功能
- 留言板（发表、展示）
- 管理员删除留言
- 文件下载

## 详细教程

### 环境要求
- Node.js 18+
- npm 9+
- Git（可选，用来克隆代码）

### 安装依赖
```bash
npm install
```

### 环境配置
根据不同环境创建配置文件（在项目根目录）：
1. 开发环境 (.env.development)
```Code snippet
VITE_API_BASE_URL=http://localhost:8080
```

2. 生产环境 (.env.production)
```
Code snippet
# 生产环境建议使用相对路径，由 Nginx 负责转发
VITE_API_BASE_URL=/api址
```
### 启动开发服务器
```bash
npm run dev
```
成功后会显示：
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 生产环境部署
#### 1. 打包项目：
```Bash
npm run build
```
#### 2.部署建议：
将 `dist` 目录下的内容上传至服务器（如` /var/www/html`），并配合 Nginx 进行反向代理。

#### Nginx 配置示例 (`/etc/nginx/sites-available/default`)：
```Nginx
Nginx
server {
    listen 80;
    server_name 你的服务器IP;

    # 前端静态资源
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端接口转发
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        client_max_body_size 50M; # 允许大文件上传
    }

    # 图片资源映射
    location /uploads/ {
        alias /root/personal-blog/uploads/;
    }
}
```
##  自定义配置

### 修改 GitHub / B站 链接
在 `src/views/HomeView.vue` 中，找到社交按钮部分：

```html
<!-- 社交按钮区域 -->
<div class="social-buttons">
  <a href="https://github.com/你的用户名" target="_blank" class="social-btn github">
    <span class="social-icon">GitHub</span> 
  </a>
  <a href="https://space.bilibili.com/你的UID" target="_blank" class="social-btn bilibili">
    <span class="social-icon">bilibili</span> 
  </a>
</div>
```

将 `你的用户名` 和 `你的UID` 替换为你自己的即可。

### 修改页脚版权信息
在 `HomeView.vue` 底部：

```html
<footer class="footer">
  <p>© 2026 你的名字</p>
</footer>
```

### 修改网站标题
在 `index.html` 中：

```html
<title>你的博客名称</title>
```

## 项目结构
```
src/
├── api/              # API 接口封装
│   ├── blog.js       # 博客相关
│   ├── comment.js    # 留言相关
│   ├── gallery.js    # 展厅相关
│   ├── auth.js       # 登录相关
│   └── request.js    # axios 配置
├── views/            # 页面组件
│   ├── HomeView.vue      # 首页
│   ├── DetailView.vue    # 详情页
│   ├── LoginView.vue     # 登录页
│   ├── AdminNewView.vue  # 发布博客
│   ├── AdminEditView.vue # 编辑博客
│   ├── GalleryView.vue   # 展厅列表
│   └── GalleryForm.vue   # 作品上传/编辑
├── router/           # 路由配置
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## 代理配置（开发环境）
`vite.config.js` 中配置了代理：
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    },
    '/uploads': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 作者
三碳化合物(C3-Sharon)  


## 许可证
MIT
