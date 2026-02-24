<template>
  <div class="gallery-container">
    <h1>作品展厅</h1>
    
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

    <div v-if="isAdmin" class="admin-actions">
      <router-link to="/gallery/upload" class="upload-btn">
        <span class="plus-icon">+</span>
        发布新作品
      </router-link>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在获取作品列表...</p>
    </div>

    <div v-else-if="artworks.length > 0" class="gallery-grid">
      <div v-for="item in artworks" :key="item.id" class="gallery-item">
        <div class="item-preview">
          <img 
            v-if="isImage(item)" 
            :src="item.filePath" 
            :alt="item.title"
            loading="lazy"
          >
          <div v-else class="file-icon-box">
            <span class="file-ext">{{ getExt(item.filePath) }}</span>
            <span class="icon">📄</span>
          </div>
          
          <a :href="item.filePath" class="hover-download" :download="item.title" target="_blank">
            下载作品
          </a>
        </div>
        
        <div class="item-info">
          <h3>{{ item.title }}</h3>
          <p class="description">{{ item.description || '暂无描述' }}</p>
          <div class="item-footer">
            <span class="date">{{ formatDate(item.createdAt) }}</span>
            <div v-if="isAdmin" class="mini-actions">
              <router-link :to="'/gallery/edit/' + item.id" class="text-btn">编辑</router-link>
              <button @click="handleDelete(item.id)" class="text-btn delete">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📁</div>
      <p>当前分类下还没有作品</p>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
      <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getArtworks, deleteArtwork } from '../api/gallery'
import { checkLogin as checkLoginApi } from '../api/auth'

const artworks = ref([])
const loading = ref(true)
// 🚩 核心修改点：默认值改为 'painting'，确保初始化不为空
const category = ref('painting') 
const currentPage = ref(1)
const totalPages = ref(1)
const isAdmin = ref(false)

// 1. 检查管理员身份
const checkStatus = async () => {
  try {
    const res = await checkLoginApi()
    // 对齐后端字段：res.loggedIn 或 res.isLoggedIn
    isAdmin.value = res && (res.loggedIn === true || res.isLoggedIn === true)
  } catch (e) {
    isAdmin.value = false
  }
}

// 2. 加载作品列表
const loadArtworks = async () => {
  loading.value = true
  try {
    const params = {
      category: category.value,
      page: currentPage.value,
      size: 12
    }
    
    const res = await getArtworks(params)
    
    // 动态处理服务器地址（自动剔除 /api 尾缀）
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    const serverBase = apiBase.replace(/\/api$/, '').replace(/\/api\/$/, '')

    // 适配后端 PageResult，尝试多种数据字段
    const rawList = res.data || res.list || (Array.isArray(res) ? res : [])
    
    artworks.value = rawList.map(item => {
      let path = item.filePath || ''
      if (path && !path.startsWith('http')) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`
        path = `${serverBase}${cleanPath}`
      }
      return { ...item, filePath: path }
    })

    totalPages.value = res.totalPages || res.totalPage || 1
  } catch (error) {
    console.error('展厅加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 3. 分类切换逻辑
const switchCategory = (cat) => {
  category.value = cat
  currentPage.value = 1
  loadArtworks()
}

const goToPage = (page) => {
  currentPage.value = page
  loadArtworks()
}

// 4. 辅助识别逻辑
const isImage = (item) => {
  const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  return item.fileType?.includes('image') || 
         imgExts.some(ext => item.filePath?.toLowerCase().endsWith(ext))
}

const getExt = (path) => path ? path.split('.').pop().toUpperCase() : 'FILE'
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : ''

const handleDelete = async (id) => {
  if (!confirm('确认永久删除该作品吗？')) return
  try {
    await deleteArtwork(id)
    loadArtworks()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(() => {
  checkStatus()
  loadArtworks()
})
</script>

<style scoped>
.gallery-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
h1 { text-align: center; color: #2c3e50; font-size: 2.2rem; margin-bottom: 40px; }

/* 分类导航样式 */
.category-nav { display: flex; gap: 15px; justify-content: center; margin-bottom: 40px; }
.category-btn { 
  padding: 10px 30px; border: 2px solid #3498db; background: white; color: #3498db;
  border-radius: 30px; cursor: pointer; transition: 0.3s; font-weight: 600;
}
.category-btn.active, .category-btn:hover { background: #3498db; color: white; }

/* 管理员上传按钮 */
.admin-actions { display: flex; justify-content: flex-end; margin-bottom: 30px; }
.upload-btn { 
  display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white; text-decoration: none; border-radius: 50px;
  font-weight: 600; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
  transition: 0.3s;
}
.upload-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4); }

/* 作品卡片网格 */
.gallery-grid { 
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 30px; 
}
.gallery-item { 
  background: white; border-radius: 15px; overflow: hidden; 
  box-shadow: 0 8px 20px rgba(0,0,0,0.06); transition: 0.3s;
}
.gallery-item:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.12); }

.item-preview { position: relative; height: 200px; background: #f8f9fa; overflow: hidden; }
.item-preview img { width: 100%; height: 100%; object-fit: cover; }
.file-icon-box { 
  height: 100%; display: flex; flex-direction: column; 
  align-items: center; justify-content: center; background: #edf2f7; 
}

.hover-download { 
  position: absolute; bottom: -45px; left: 0; width: 100%; padding: 12px;
  background: rgba(52, 152, 219, 0.95); color: white; text-align: center;
  text-decoration: none; transition: 0.3s; font-weight: 600;
}
.gallery-item:hover .hover-download { bottom: 0; }

.item-info { padding: 20px; }
.item-info h3 { margin: 0 0 10px; font-size: 1.2rem; color: #2c3e50; }
.description { color: #7f8c8d; font-size: 0.9rem; line-height: 1.5; height: 42px; overflow: hidden; margin-bottom: 15px;}

.item-footer { 
  display: flex; justify-content: space-between; align-items: center; 
  border-top: 1px solid #f1f1f1; padding-top: 15px;
}
.date { font-size: 0.8rem; color: #bdc3c7; }
.text-btn { background: none; border: none; color: #3498db; cursor: pointer; font-size: 0.85rem; margin-left: 12px; text-decoration: none; }
.text-btn.delete { color: #e74c3c; }

.loading-state, .empty-state { text-align: center; padding: 80px 0; color: #95a5a6; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 50px; }
.pagination button { padding: 8px 20px; border-radius: 8px; border: 1px solid #ddd; background: white; cursor: pointer; }
.pagination button:disabled { background: #f9f9f9; color: #ccc; cursor: not-allowed; }
</style>