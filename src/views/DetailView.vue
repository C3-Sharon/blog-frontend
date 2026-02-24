<template>
  <div class="detail-container">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="blog" class="blog-content">
      <h1>{{ blog.title }}</h1>
      <div class="meta">{{ formatDate(blog.createdAt) }}</div>
      
      <div class="content" v-html="htmlContent"></div>
      
      <div class="comments-section">
        <h3>留言板</h3>
        
        <div class="comments-list">
          <div v-if="commentsLoading" class="comments-loading">加载留言中...</div>
          <div v-else-if="comments.length === 0" class="no-comments">还没有留言...</div>
          <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-nickname">{{ comment.nickname }}</span>
              <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
              <button v-if="isAdmin" @click="handleDeleteComment(comment.id)" class="delete-comment-btn">×</button>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
        
        <form class="comment-form" @submit.prevent="handleAddComment">
          <div class="form-row">
            <input type="text" v-model="commentForm.nickname" placeholder="你的昵称" required class="nickname-input">
          </div>
          <div class="form-row">
            <textarea v-model="commentForm.content" placeholder="写下你的留言..." required rows="3" class="content-input"></textarea>
          </div>
          <div class="form-row">
            <button type="submit" :disabled="commentSubmitting" class="submit-btn">
              {{ commentSubmitting ? '提交中...' : '发表留言' }}
            </button>
          </div>
        </form>
      </div>
      
      <router-link to="/" class="back-btn">← 返回首页</router-link>
    </div>
    
    <div v-else class="not-found">
      <h2>博客不存在</h2>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import { useRoute } from 'vue-router'
import { getBlogById } from '../api/blog'
import { getComments, addComment, deleteComment } from '../api/comment'

const route = useRoute()
const blog = ref(null)
const loading = ref(true)
const comments = ref([])
const commentsLoading = ref(true)
const commentSubmitting = ref(false)
const isAdmin = ref(false)
const commentForm = ref({ nickname: '', content: '' })

marked.setOptions({ breaks: true, gfm: true })

// 🚩 核心逻辑：修复详情页照片不显示
const htmlContent = computed(() => {
  if (!blog.value || !blog.value.content) return ''
  
  // 1. 转换 Markdown 为 HTML
  let html = marked(blog.value.content)
  
  // 2. 强制路径纠偏
  // 无论后端存的是 /uploads 还是 uploads，统一指向 http://localhost:8080/uploads
  const baseURL = 'http://localhost:8080'
  html = html.replace(/src="(\/)?uploads\//g, `src="${baseURL}/uploads/`)
  
  return html
})

const formatDate = (d) => d ? new Date(d).toLocaleString() : ''

const fetchBlog = async () => {
  loading.value = true
  try {
    const res = await getBlogById(route.params.id)
    blog.value = res.data || res
  } catch (err) { console.error(err); blog.value = null }
  finally { loading.value = false }
}

const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const res = await getComments(route.params.id)
    comments.value = res.data || res || []
  } catch (err) { comments.value = [] }
  finally { commentsLoading.value = false }
}

const handleAddComment = async () => {
  try {
    await addComment(route.params.id, commentForm.value)
    commentForm.value = { nickname: '', content: '' }
    await fetchComments()
  } catch (err) { alert(err.message) }
}

const handleDeleteComment = async (id) => {
  if (confirm('确定删除？')) {
    await deleteComment(id)
    await fetchComments()
  }
}

onMounted(() => {
  fetchBlog()
  fetchComments()
  isAdmin.value = !!sessionStorage.getItem('adminUser')
})
</script>

<style scoped>
/* 🎨 找回你原本的所有美术效果 */
.detail-container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
.blog-content { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
h1 { margin: 0 0 10px; color: #333; font-size: 32px; }
.meta { color: #888; font-size: 14px; padding-bottom: 20px; border-bottom: 1px solid #eee; margin-bottom: 20px; }

/* 🚩 强制修正内容区域图片展示 */
:deep(.content img) {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 1.5rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 留言板美术效果恢复 */
.comments-section { margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; }
.comment-item { background: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 5px; position: relative; }
.comment-nickname { font-weight: bold; color: #286fb5; }
.nickname-input, .content-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px; }
.submit-btn { padding: 10px 25px; background: #286fb5; color: white; border: none; border-radius: 5px; cursor: pointer; }

/* Markdown 渲染样式补全 */
:deep(.content) { line-height: 1.8; font-size: 16px; color: #444; }
:deep(.content h2) { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px; }
:deep(.content pre) { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
</style>