<template>
  <div class="container">
    <div class="social-buttons">
      <a href="https://github.com/C3-Sharon" target="_blank" class="social-btn github">
        <span class="social-icon">GitHub</span> 
      </a>
      <a href="https://space.bilibili.com/344479806" target="_blank" class="social-btn bilibili">
        <span class="social-icon">bilibili</span> 
      </a>
    </div>

    <h1>三碳化合物的博客</h1>
    
    <div class="search-box">
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索博客..."
        @keyup.enter="handleSearch"
      >
      <button @click="handleSearch">搜索</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="blogs.length > 0" class="blog-list">
      <div v-for="blog in blogs" :key="blog.id" class="blog-card">
        <h2>
          <router-link :to="'/blog/' + blog.id">{{ blog.title }}</router-link>
        </h2>
        <div class="meta">{{ formatDate(blog.createdAt) }}</div>
        <p class="summary">{{ blog.content.substring(0, 100) }}...</p>
        
        <div v-if="isAdmin" class="admin-actions">
          <router-link :to="'/admin/edit/' + blog.id" class="edit-btn">编辑</router-link>
          <button @click="handleDelete(blog.id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      暂无博客文章
    </div>

    <template v-if="totalPages > 1">
      <div class="pagination">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn prev"
        >
          上一页
        </button>
        
        <button 
          v-for="page in displayedPages" 
          :key="page"
          @click="goToPage(page)"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn next"
        >
          下一页
        </button>
      </div>

      <div class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        （共 {{ total }} 篇博客）
      </div>
    </template>

    <footer class="footer">
      <p>© 2026 Sharon</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getBlogs, deleteBlog } from '../api/blog'
import { checkLogin as checkLoginApi } from '../api/auth'

const router = useRouter()
const blogs = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)  
const keyword = ref('')
const isAdmin = ref(false) 

// 格式化日期
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

// 计算显示的页码
const displayedPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 加载博客列表
const loadBlogs = async () => {
  loading.value = true
  try {
    const params = { 
      page: currentPage.value, 
      size: 5 
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    
    const res = await getBlogs(params)
    // 适配后端 PageResult 字段
    blogs.value = res.data || []
    total.value = res.total || 0
    totalPages.value = res.totalPages || 1
    
  } catch (error) {
    console.error('加载博客失败:', error)
    blogs.value = []
  } finally {
    loading.value = false
  }
}

// 检查登录状态
const checkLogin = async () => {
  try {
    const res = await checkLoginApi() 
    console.log('HomeView 登录检查结果:', res)
    // 🚩 核心修正：对齐后端返回的 res.loggedIn 字段
    const loggedIn = res && (res.loggedIn === true || res.isLoggedIn === true)
    isAdmin.value = loggedIn
    
    if (loggedIn) {
      sessionStorage.setItem('adminUser', res.username)
    } else {
      sessionStorage.removeItem('adminUser')
    }
  } catch (error) {
    console.error('HomeView 检查登录异常:', error)
    isAdmin.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadBlogs()
}

const goToPage = (page) => {
  currentPage.value = page
  loadBlogs()
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这篇博客吗？')) return
  try {
    await deleteBlog(id)
    loadBlogs()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败')
  }
}

// 监听路由变化，确保在不同页面间切换时状态同步
watch(() => router.currentRoute.value.path, () => {
  checkLogin()
})

onMounted(() => {
  loadBlogs()
  checkLogin()
})
</script>

<style scoped>
/* 保持你原有的所有样式不变 */
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
h1 { color: #05a8c4f1; margin-bottom: 30px; }
.search-box { display: flex; gap: 10px; margin-bottom: 30px; }
.search-box input { flex: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 5px; }
.search-box button { padding: 10px 25px; background: #408bd6ff; color: white; border: none; border-radius: 5px; cursor: pointer; }
.loading { text-align: center; padding: 50px; color: #666; }
.blog-card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.blog-card h2 a { color: #333; text-decoration: none; font-size: 24px; }
.meta { color: #888; font-size: 14px; margin-bottom: 15px; }
.summary { color: #555; line-height: 1.8; margin-bottom: 20px; }
.admin-actions { display: flex; gap: 10px; border-top: 1px solid #eee; padding-top: 15px; }
.edit-btn, .delete-btn { padding: 5px 15px; border-radius: 5px; font-size: 14px; text-decoration: none; }
.edit-btn { background: #0066cc; color: white; }
.delete-btn { background: #dc3545; color: white; border: none; }
.pagination { display: flex; gap: 8px; justify-content: center; margin: 30px 0 10px; }
.page-btn { padding: 8px 15px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer; }
.page-btn.active { background: #5996d4; color: white; }
.page-info { text-align: center; color: #666; font-size: 14px; }
.social-buttons { display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
.social-btn { padding: 0.6rem 1.5rem; border-radius: 30px; color: white; text-decoration: none; }
.social-btn.github { background: #24292e; }
.social-btn.bilibili { background: #fb7299; }
.footer { text-align: center; padding: 2rem; color: #888; border-top: 1px solid #eee; margin-top: 3rem; }
</style>