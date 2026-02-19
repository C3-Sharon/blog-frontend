<template>
   <div class="container">
    <!-- 社交按钮区域 -->
    <div class="social-buttons">
      <a href="https://github.com/C3-Sharon" target="_blank" class="social-btn github">
        <span class="social-icon">GitHub</span> 
      </a>
      <a href="https://space.bilibili.com/344479806" target="_blank" class="social-btn bilibili">
        <span class="social-icon">bilibili</span> 
      </a>
    </div>
  <div class="container">
    <h1>三碳化合物的博客</h1>
    
    <!-- 搜索框 -->
    <div class="search-box">
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="搜索博客..."
        @keyup.enter="handleSearch"
      >
      <button @click="handleSearch">搜索</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 博客列表 -->
    <div v-else-if="blogs.length > 0" class="blog-list">
      <div v-for="blog in blogs" :key="blog.id" class="blog-card">
        <h2>
          <router-link :to="'/blog/' + blog.id">{{ blog.title }}</router-link>
        </h2>
        <div class="meta">{{ formatDate(blog.createdAt) }}</div>
        <p class="summary">{{ blog.content.substring(0, 100) }}...</p>
        
        <!-- 管理员按钮 -->
        <div v-if="isAdmin" class="admin-actions">
          <router-link :to="'/admin/edit/' + blog.id" class="edit-btn">编辑</router-link>
          <button @click="handleDelete(blog.id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-else class="no-data">
      暂无博客文章
    </div>

     <!-- 分页 -->
    <template v-if="totalPages > 1">
      <div class="pagination">
        <!-- 上一页 -->
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn prev"
        >
          上一页
        </button>
        
        <!-- 页码 -->
        <button 
          v-for="page in displayedPages" 
          :key="page"
          @click="goToPage(page)"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
        
        <!-- 下一页 -->
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn next"
        >
          下一页
        </button>
      </div>

      <!-- 分页信息 -->
      <div class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        （共 {{ total }} 篇博客）
      </div>
    </template>

  
  </div>
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
// 计算显示的页码（最多显示5个）
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
    console.log('获取到的数据:', res)
    
    
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

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadBlogs()
}

// 翻页
const goToPage = (page) => {
  currentPage.value = page
  loadBlogs()
}

// 删除博客
const handleDelete = async (id) => {
  if (!confirm('确定要删除这篇博客吗？')) return
  
  try {
    await deleteBlog(id)
    // 删除成功后重新加载当前页
    loadBlogs()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败')
  }
}


// 检查登录状态
const checkLogin = async () => {
  try {
    const res = await checkLoginApi()
    console.log('checkLogin 返回:', res)
      console.log('isLoggedIn 值:', res?.isLoggedIn) 
    if (res && typeof res === 'object') {
      isAdmin.value = res.isLoggedIn || false
      if (res.isLoggedIn) {
        sessionStorage.setItem('adminUser', res.username)
      } else {
        sessionStorage.removeItem('adminUser')
      }
    } else {
      console.error('返回数据格式错误:', res)
      isAdmin.value = false
    }
  } catch (error) {
    console.error('检查登录失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    isAdmin.value = false
  }
}


// 监听路由变化
watch(() => router.currentRoute.value, () => {
  console.log('路由变化，重新检查 HomeView 登录状态')
  checkLogin()
})

onMounted(() => {
  loadBlogs()
  checkLogin()
})
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #05a8c4f1;
  margin-bottom: 30px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.search-box input:focus {
  outline: none;
  border-color: #1d9ba1c4;
}

.search-box button {
  padding: 10px 25px;
  background: #408bd6ff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.search-box button:hover {
  background: #0052a3;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.blog-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.blog-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.blog-card h2 {
  margin: 0 0 10px;
}

.blog-card h2 a {
  color: #333;
  text-decoration: none;
  font-size: 24px;
}

.blog-card h2 a:hover {
  color: #00c2ccff;
}

.meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 15px;
}

.summary {
  color: #555;
  line-height: 1.8;
  margin-bottom: 20px;
}

.admin-actions {
  display: flex;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.edit-btn, .delete-btn {
  padding: 5px 15px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.edit-btn {
  background: #0066cc;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
}

.delete-btn:hover {
  background: #c82333;
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 40px;
}

.pagination button {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination button:hover {
  background: #f0f7ff;
  border-color: #0066cc;
  color: #0066cc;
}

.pagination button.active {
  background: #0066cc;
  color: white;
  border-color: #0066cc;
}

.no-data {
  text-align: center;
  padding: 60px;
  color: #666;
  background: white;
  border-radius: 10px;
}
/* 社交按钮 */
.social-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.social-btn.github {
  background: #24292e;
  color: white;
}

.social-btn.github:hover {
  background: #2f363d;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.social-btn.bilibili {
  background: #fb7299;
  color: white;
}

.social-btn.bilibili:hover {
  background: #fc8bab;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.social-icon {
  font-size: 1.2rem;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
  margin-top: 3rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .social-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .social-btn {
    width: 100%;
    justify-content: center;
  }
}
.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 30px 0 10px;
}

.page-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 40px;
}

.page-btn:hover:not(:disabled) {
  background: #f0f7ff;
  border-color: #5996d4;
  color: #286fb5;
}

.page-btn.active {
  background: #5996d4;
  color: white;
  border-color: #286fb5;
}

.page-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.page-info {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}
</style>