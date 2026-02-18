<template>
  <div class="admin-container">
    <div class="admin-box">
      <h2>编辑博客</h2>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <!-- 错误提示 -->
      <div v-else-if="error" class="error">{{ error }}</div>
      
      <!-- 编辑表单 -->
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">标题</label>
          <input 
            type="text" 
            id="title" 
            v-model="form.title" 
            required
            placeholder="请输入博客标题"
          >
        </div>
        
        <div class="form-group">
          <label for="content">内容</label>
          <textarea 
            id="content" 
            v-model="form.content" 
            required
            placeholder="请输入博客内容（支持 Markdown）"
            rows="10"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存修改' }}
          </button>
          <router-link to="/" class="cancel-btn">取消</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBlogById, updateBlog } from '../api/blog'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  content: ''
})

// 获取博客详情
const fetchBlog = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const id = route.params.id
    console.log('获取博客ID:', id)
    
    const data = await getBlogById(id)
    console.log('获取到的数据:', data)
    
    form.title = data.title
    form.content = data.content
  } catch (err) {
    console.error('获取博客失败:', err)
    error.value = '获取博客失败，请重试'
  } finally {
    loading.value = false
  }
}

// 提交修改
const handleSubmit = async () => {
  if (!form.title || !form.content) {
    error.value = '请填写完整信息'
    return
  }
  
  submitting.value = true
  error.value = ''
  
  try {
    const id = route.params.id
    await updateBlog(id, form)
    alert('保存成功！')
    router.push('/')
  } catch (err) {
    console.error('保存失败:', err)
    error.value = err.response?.data?.message || '保存失败，请重试'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchBlog()
})
</script>

<style scoped>
.admin-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.admin-box {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #286fb5;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

button {
  flex: 1;
  padding: 12px;
  background: #286fb5;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: #0052a3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-decoration: none;
  text-align: center;
  font-size: 16px;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}
</style>