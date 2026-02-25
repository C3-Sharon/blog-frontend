<template>
  <div class="form-container">
    <div class="form-box">
      <h2>{{ isEdit ? '编辑作品' : '上传作品' }}</h2>
      
      <div v-if="error" class="error">{{ error }}</div>
      
      <div v-if="loading" class="loading-area">
        <div class="spinner"></div>
        <p>正在获取作品详情...</p>
      </div>
      
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
            <div v-else class="upload-placeholder">
              <span>点击或拖拽文件到此处上传</span>
            </div>
          </div>
          <small class="help-text">支持图片、PDF、Word、文本文件</small>
        </div>
        
        <div v-if="isEdit && form.filePath" class="form-group">
          <label>当前文件</label>
          <div class="current-file">
            <a :href="fullFilePath" target="_blank" class="view-link">
              🔍 查看当前存储的文件
            </a>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '保存中...' : (isEdit ? '保存修改' : '立即发布') }}
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

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  category: 'painting',
  description: '',
  filePath: ''
})

const fullFilePath = computed(() => {
  if (!form.filePath) return '#'
  if (form.filePath.startsWith('http')) return form.filePath
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  const serverBase = apiBase.replace(/\/api$/, '').replace(/\/api\/$/, '')
  const cleanPath = form.filePath.startsWith('/') ? form.filePath : `/${form.filePath}`
  return `${serverBase}${cleanPath}`
})

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) { fileInput.value.value = '' }
}

const fetchArtwork = async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const id = route.params.id
    // 对齐后端 Result.ok(data)
    const res = await getArtwork(id)
    const data = res.data || res // 兼容拦截器是否剥离了第一层 data
    if (data) {
      form.title = data.title || ''
      form.category = data.category || 'painting'
      form.description = data.description || ''
      form.filePath = data.filePath || ''
    }
  } catch (err) {
    error.value = '获取详情失败'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!isEdit.value && !selectedFile.value) {
    error.value = '请选择文件'
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateArtwork(route.params.id, {
        title: form.title,
        category: form.category,
        description: form.description
      })
    } else {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('category', form.category)
      formData.append('description', form.description)
      formData.append('file', selectedFile.value)
      await uploadArtwork(formData)
    }
    router.push('/gallery')
  } catch (err) {
    error.value = err.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => fetchArtwork())
</script>


<style scoped>
.form-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

.form-box {
  background: white;
  padding: 35px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

h2 { margin-bottom: 25px; color: #2c3e50; text-align: center; font-weight: 600; }

.form-group { margin-bottom: 20px; }

label { display: block; margin-bottom: 8px; color: #34495e; font-weight: 600; }

input[type="text"], select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
}

input[type="text"]:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3498db;
}

.file-upload-area {
  border: 2px dashed #bdc3c7;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  background: #f9f9f9;
  position: relative;
  transition: 0.3s;
}

.file-upload-area:hover { border-color: #3498db; background: #f0f7ff; }

.file-upload-area input[type="file"] {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0; cursor: pointer;
}

.upload-placeholder { color: #7f8c8d; }

.file-info { display: flex; align-items: center; justify-content: center; gap: 10px; color: #2980b9; font-weight: 500; }

.clear-btn {
  width: 22px; height: 22px; border: none; background: #e74c3c;
  color: white; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.current-file { padding: 12px; background: #edf2f7; border-radius: 8px; }
.view-link { color: #3498db; text-decoration: none; font-weight: 500; }
.view-link:hover { text-decoration: underline; }

.form-actions { display: flex; gap: 15px; margin-top: 35px; }

.submit-btn {
  flex: 2; padding: 14px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white; border: none; border-radius: 8px;
  font-size: 16px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4); }

.cancel-btn {
  flex: 1; padding: 14px; background: #f1f2f6; color: #57606f;
  border-radius: 8px; text-decoration: none; text-align: center; font-weight: 500;
}

.loading-area { text-align: center; padding: 40px; color: #7f8c8d; }
.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.error {
  background: #ff7675; color: white; padding: 12px;
  border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: 500;
}
</style>