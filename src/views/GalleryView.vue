<template>
  <div class="gallery-container">
    <h1>展厅</h1>
    
    <!-- 分类导航 -->
    <div class="category-nav">
      <button 
        @click="switchCategory('painting')" 
        :class="['category-btn', { active: category === 'painting' }]"
      >
        绘画作品
      </button>
      <button 
        @click="switchCategory('note')" 
        :class="['category-btn', { active: category === 'note' }]"
      >
        笔记文档
      </button>
    </div>

    <!-- 管理员上传按钮 -->
    <div v-if="isAdmin" class="admin-actions">
      <router-link to="/gallery/upload" class="upload-btn">
        + 上传作品
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 作品网格 -->
    <div v-else-if="artworks.length > 0" class="gallery-grid">
      <div v-for="item in artworks" :key="item.id" class="gallery-item">
        <!-- 图片或文件图标 -->
        <div class="item-preview">
          <img 
            v-if="item.fileType?.startsWith('image/')" 
            :src="item.filePath" 
            :alt="item.title"
            @click="viewArtwork(item)"
          >
          <div v-else class="file-icon" @click="viewArtwork(item)">
            📄
          </div>
        </div>
        
        <div class="item-info">
          <h3>{{ item.title }}</h3>
          <p class="description">{{ item.description }}</p>
          <div class="meta">
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
        
        <!-- 下载按钮 -->
        <a 
          :href="item.filePath" 
          class="download-btn" 
          download
          target="_blank"
        >
          下载
        </a>
        
        <!-- 管理员操作 -->
        <div v-if="isAdmin" class="item-actions">
          <router-link :to="'/gallery/edit/' + item.id" class="edit-btn">编辑</router-link>
          <button @click="handleDelete(item.id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-else class="no-data">
      暂无作品
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="page-btn"
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
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getArtworks, deleteArtwork } from '../api/gallery'

const router = useRouter()
const artworks = ref([])
const loading = ref(true)
const category = ref('painting')
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const isAdmin = ref(false)
const pageSize = ref(12)

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
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

// 加载作品列表
const loadArtworks = async () => {
  loading.value = true
  try {
    const params = {
      category: category.value,
      page: currentPage.value,
      size: pageSize.value
    }
    const res = await getArtworks(params)
    artworks.value = res.data || []
    totalPages.value = res.totalPages || 1
    total.value = res.total || 0
  } catch (error) {
    console.error('加载作品失败:', error)
    artworks.value = []
  } finally {
    loading.value = false
  }
}

// 切换分类
const switchCategory = (cat) => {
  category.value = cat
  currentPage.value = 1
  loadArtworks()
}

// 翻页
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadArtworks()
}

// 查看作品详情
const viewArtwork = (item) => {
  // 如果是图片，在当前页打开（可以用返回按钮）
  if (item.fileType?.startsWith('image/')) {
    // 创建一个全屏预览的模态框，或者在新标签页打开但保留导航
    window.open(item.filePath, '_blank')
  } else {
    // 非图片文件直接下载
    window.open(item.filePath, '_blank')
  }
}

// 删除作品
const handleDelete = async (id) => {
  if (!confirm('确定要删除这个作品吗？')) return
  try {
    await deleteArtwork(id)
    loadArtworks()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败')
  }
}

// 检查登录状态
const checkLogin = () => {
  isAdmin.value = !!sessionStorage.getItem('adminUser')
}

onMounted(() => {
  loadArtworks()
  checkLogin()
})
</script>

<style scoped>
.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.category-nav {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
}

.category-btn {
  padding: 10px 30px;
  border: 2px solid #286fb5;
  background: transparent;
  color: #286fb5;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  background: #286fb5;
  color: white;
}

.category-btn.active {
  background: #286fb5;
  color: white;
}

.admin-actions {
  text-align: right;
  margin-bottom: 20px;
}

.upload-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #218838;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.gallery-item {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.item-preview {
  height: 200px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;
}

.item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #286fb5;
  background: #f8f9fa;
}

.item-info {
  padding: 15px;
}

.item-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
}

.description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  color: #999;
  font-size: 12px;
}

.download-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background: rgba(40, 111, 181, 0.9);
  color: white;
  text-decoration: none;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-item:hover .download-btn {
  opacity: 1;
}

.item-actions {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #eee;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 5px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  text-decoration: none;
}

.edit-btn {
  background: #286fb5;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.pagination {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 40px;
}

.page-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #f0f7ff;
  border-color: #286fb5;
  color: #286fb5;
}

.page-btn.active {
  background: #286fb5;
  color: white;
  border-color: #286fb5;
}

.page-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 60px;
  color: #666;
  background: white;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .category-nav {
    flex-direction: column;
    align-items: center;
  }
  
  .category-btn {
    width: 200px;
  }
}
</style>