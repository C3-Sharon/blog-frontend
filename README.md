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
创建 `.env` 文件（在项目根目录）：
```env
VITE_API_BASE_URL=http://localhost:8080
```
> 如果你的后端运行在其他端口，请修改这里的地址

### 启动开发服务器
```bash
npm run dev
```
成功后会显示：
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 访问项目
打开浏览器，访问 `http://localhost:5173`


### 生产环境打包
```bash
npm run build
```
打包后的文件在 `dist` 目录

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