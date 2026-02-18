<template>
  <div class="detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 博客内容 -->
    <div v-else-if="blog" class="blog-content">
      <h1>{{ blog.title }}</h1>
      <div class="meta">{{ formatDate(blog.createdAt) }}</div>
      <div class="content" v-html="htmlContent"></div>
      
      <!-- 留言板区域 -->
      <div class="comments-section">
        <h3>留言板</h3>
        
        <!-- 留言列表 -->
        <div class="comments-list">
          <div v-if="commentsLoading" class="comments-loading">加载留言中...</div>
          <div v-else-if="comments.length === 0" class="no-comments">
            还没有留言...
          </div>
          <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-nickname">{{ comment.nickname }}</span>
              <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
              <!-- 管理员删除按钮 -->
              <button 
                v-if="isAdmin" 
                @click="handleDeleteComment(comment.id)" 
                class="delete-comment-btn"
                title="删除留言"
              >
                ×
              </button>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
        
        <!-- 发表留言表单 -->
        <form class="comment-form" @submit.prevent="handleAddComment">
          <div class="form-row">
            <input 
              type="text" 
              v-model="commentForm.nickname" 
              placeholder="你的昵称"
              required
              class="nickname-input"
            >
          </div>
          <div class="form-row">
            <textarea 
              v-model="commentForm.content" 
              placeholder="写下你的留言..."
              required
              rows="3"
              class="content-input"
            ></textarea>
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
    
    <!-- 404 -->
    <div v-else class="not-found">
      <h2>博客不存在</h2>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue'
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

const commentForm = ref({
  nickname: '',
  content: ''
})
// 配置 marked（可选，但推荐）
marked.setOptions({
  breaks: true,  // 支持换行符
  gfm: true,     // 支持 GitHub 风格的 Markdown
})
// 计算属性：把 Markdown 转成 HTML
const htmlContent = computed(() => {
  if (!blog.value) return ''
  let html = marked(blog.value.content)
  
  // 替换所有图片路径，加上后端地址
  const baseURL = 'http://localhost:8080'
  html = html.replace(/src="\/uploads\//g, `src="${baseURL}/uploads/`)
  
  return html
})
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

// 获取博客详情
const fetchBlog = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const data = await getBlogById(id)
    blog.value = data
  } catch (error) {
    console.error('获取博客失败:', error)
    blog.value = null
  } finally {
    loading.value = false
  }
}

// 获取留言列表
const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const id = route.params.id
    const data = await getComments(id)
    comments.value = data || []
  } catch (error) {
    console.error('获取留言失败:', error)
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

// 发表留言
const handleAddComment = async () => {
  if (!commentForm.value.nickname || !commentForm.value.content) return
  
  commentSubmitting.value = true
  try {
    const id = route.params.id
    await addComment(id, commentForm.value)
    // 清空表单
    commentForm.value.nickname = ''
    commentForm.value.content = ''
    // 重新加载留言
    await fetchComments()
    alert('留言成功！')
  } catch (error) {
    console.error('留言失败:', error)
    alert('留言失败，请重试')
  } finally {
    commentSubmitting.value = false
  }
}

// 删除留言
const handleDeleteComment = async (commentId) => {
  if (!confirm('确定要删除这条留言吗？')) return
  
  try {
    await deleteComment(commentId)
    // 重新加载留言
    await fetchComments()
  } catch (error) {
    console.error('删除留言失败:', error)
    alert('删除失败')
  }
}

// 检查登录状态
const checkLogin = () => {
  isAdmin.value = !!sessionStorage.getItem('adminUser')
}

onMounted(() => {
  fetchBlog()
  fetchComments()
  checkLogin()
})
</script>

<style scoped>
.detail-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
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
  font-size: 32px;
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
  font-size: 16px;
}

.back-btn {
  display: inline-block;
  margin-top: 30px;
  color: #286fb5;
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
  color: #286fb5;
  text-decoration: none;
}

/* 留言板样式 */
.comments-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.comments-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.comments-loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #999;
  background: #f8f9fa;
  border-radius: 5px;
}

.comment-item {
  background: #f8f9fa;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  position: relative;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.comment-nickname {
  font-weight: bold;
  color: #286fb5;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.delete-comment-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.delete-comment-btn:hover {
  opacity: 1;
}

.comment-content {
  color: #555;
  line-height: 1.6;
  white-space: pre-wrap;
}

.comment-form {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #eee;
}

.form-row {
  margin-bottom: 15px;
}

.nickname-input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.nickname-input:focus {
  outline: none;
  border-color: #286fb5;
}

.content-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.content-input:focus {
  outline: none;
  border-color: #286fb5;
}

.submit-btn {
  padding: 10px 25px;
  background: #286fb5;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #0052a3;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
/* Markdown 渲染样式 */
:deep(.content) {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #2c3e50;
}

:deep(.content h1),
:deep(.content h2),
:deep(.content h3),
:deep(.content h4),
:deep(.content h5),
:deep(.content h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

:deep(.content h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.content h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.content code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
}

:deep(.content pre) {
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 5px;
  padding: 16px;
  overflow: auto;
  line-height: 1.45;
  margin-bottom: 1rem;
}

:deep(.content pre code) {
  background-color: transparent;
  padding: 0;
  white-space: pre;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

:deep(.content blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 1rem 0;
  background-color: #f8f9fa;
  padding: 1rem;
  font-style: italic;
}

:deep(.content ul),
:deep(.content ol) {
  padding-left: 2em;
  margin: 1rem 0;
}

:deep(.content img) {
  max-width: 100%;
  box-sizing: content-box;
}
</style>