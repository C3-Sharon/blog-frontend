<template>
  <div class="form-container">
    <div class="form-box">
      <h2>{{ isEdit ? '编辑作品' : '上传作品' }}</h2>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <form v-else @submit.prevent="handleSubmit" enctype="multipart/form-data">
        <div class="form-group">
          <label for="title">作品标题</label>
          <input 
            type="text" 
            id="title" 
            v-model="form.title" 
            required
            placeholder="请输入作品标题"
          >
        </div>
        
        <div class="form-group">
          <label for="category">分类</label>
          <select id="category" v-model="form.category" required>
            <option value="painting">绘画作品</option>
            <option value="note">笔记文档</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="description">作品描述</label>
          <textarea 
            id="description" 
            v-model="form.description" 
            rows="3"
            placeholder="请输入作品描述"
          ></textarea>
        </div>
        
        <!-- 文件上传（只在新增时显示） -->
        <div v-if="!isEdit" class="form-group">
          <label for="file">选择文件</label>
          <div class="file-upload-area">
            <input 
              type="file" 
              id="file" 
              @change="handleFileSelect"
              accept="image/*,.pdf,.doc,.docx,.txt"
              ref="fileInput"
              :required="!isEdit"
            >
            <div class="file-info" v-if="selectedFile">
              已选择: {{ selectedFile.name }}
              <button type="button" @click="clearFile" class="clear-btn">×</button>
            </div>
          </div>
          <small class="help-text">支持图片、PDF、Word、文本文件</small>
        </div>
        
        <!-- 当前文件（编辑时显示） -->
        <div v-if="isEdit && form.filePath" class="form-group">
          <label>当前文件</label>
          <div class="current-file">
            <a :href="form.filePath" target="_blank">查看文件</a>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '保存中...' : (isEdit ? '保存修改' : '上传作品') }}
          </button>
          <router-link to="/gallery" class="cancel-btn">取消</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArtwork, uploadArtwork, updateArtwork } from '../api/gallery'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const fileInput = ref(null)
const selectedFile = ref(null)

const isEdit = computed(() => route.params.id)

const form = reactive({
  title: '',
  category: 'painting',
  description: '',
  filePath: ''
})

// 处理文件选择
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
}

// 清除选择的文件
const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 获取作品详情（编辑时）
const fetchArtwork = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const id = route.params.id
    const data = await getArtwork(id)
    
    form.title = data.title
    form.category = data.category
    form.description = data.description || ''
    form.filePath = data.filePath
  } catch (err) {
    console.error('获取作品失败:', err)
    error.value = '获取作品失败，请重试'
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.title || !form.category) {
    error.value = '请填写完整信息'
    return
  }
  
  if (!isEdit.value && !selectedFile.value) {
    error.value = '请选择要上传的文件'
    return
  }
  
  submitting.value = true
  error.value = ''
  
  try {
    if (isEdit.value) {
      // 编辑模式
      await updateArtwork(route.params.id, {
        title: form.title,
        category: form.category,
        description: form.description
      })
      alert('保存成功！')
    } else {
      // 上传模式
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('category', form.category)
      formData.append('description', form.description)
      formData.append('file', selectedFile.value)
      
      await uploadArtwork(formData)
      alert('上传成功！')
    }
    
    router.push('/gallery')
  } catch (err) {
    console.error('保存失败:', err)
    error.value = err.response?.data?.message || '保存失败，请重试'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchArtwork()
})
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

.form-box {
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

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

input[type="text"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  font-family: inherit;
  box-sizing: border-box;
}

input[type="text"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #286fb5;
}

.file-upload-area {
  border: 2px dashed #ddd;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  background: #f8f9fa;
  position: relative;
}

.file-upload-area input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #286fb5;
}

.clear-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.clear-btn:hover {
  background: #c82333;
}

.help-text {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.current-file {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.current-file a {
  color: #286fb5;
  text-decoration: none;
}

.current-file a:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.submit-btn {
  flex: 1;
  padding: 12px;
  background: #286fb5;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
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

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
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