<template>
  <div class="detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 博客内容 -->
    <div v-else-if="blog" class="blog-content">
      <h1>{{ blog.title }}</h1>
      <div class="meta">{{ formatDate(blog.createdAt) }}</div>
      <div class="content">{{ blog.content }}</div>
      <router-link to="/" class="back-btn">← 返回首页</router-link>
    </div>

    <!-- 404 -->
    <div v-else class="not-found">
      <h2>博客不存在</h2>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'  // 用于获取 URL 参数
import { getBlogById } from '../api/blog'

const route = useRoute()
const blog = ref(null)
const loading = ref(true)

// 格式化日期（和首页保持一致）
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取博客详情
const fetchBlog = async () => {
  loading.value = true
  try {
    const id = route.params.id
    console.log('正在获取博客,ID:', id)
    
    const data = await getBlogById(id)
    console.log('获取到的数据:', data)  // 看这里打印什么
    
    blog.value = data
  } catch (error) {
    console.error('获取博客失败:', error)
    blog.value = null
  } finally {
    loading.value = false
  }
}

// 组件挂载时自动获取数据
onMounted(() => {
  fetchBlog()
})
</script>

<style scoped>
.detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.blog-content {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

h1 {
  margin: 0 0 10px;
  color: #333;
}

.meta {
  color: #888;
  font-size: 14px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.content {
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
}

.back-btn {
  display: inline-block;
  margin-top: 30px;
  color: #0066cc;
  text-decoration: none;
}

.back-btn:hover {
  text-decoration: underline;
}

.not-found {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 10px;
}

.not-found h2 {
  margin-bottom: 20px;
  color: #666;
}

.not-found a {
  color: #0066ccd8;
  text-decoration: none;
}
</style>