<template>
  <div class="admin-container">
    <div class="admin-box">
      <h2>发布新博客</h2>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>
      
      <form @submit.prevent="handleSubmit">
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
            placeholder="请输入博客内容:"
            rows="10"
          ></textarea>
        </div>
        
        <!-- 图片上传区域 (放在表单里面) -->
        <div class="form-group">
          <label>上传图片</label>
          <div class="upload-area">
            <input 
              type="file" 
              id="imageFile" 
              accept="image/*"
              @change="handleFileSelect"
              ref="fileInput"
              style="display: none;"
            >
            <button 
              type="button" 
              @click="fileInput.click()" 
              class="upload-btn"
            >
              选择图片
            </button>
            <button 
              type="button" 
              @click="uploadImage" 
              :disabled="uploading || !selectedFile"
              class="upload-btn"
              :style="{ background: uploading || !selectedFile ? '#ccc' : '#286fb5' }"
            >
              {{ uploading ? '上传中...' : '上传图片' }}
            </button>
          </div>
          <div v-if="uploadProgress" class="upload-progress">{{ uploadProgress }}</div>
          <div v-if="previewUrl" class="image-preview">
            <img :src="previewUrl" alt="预览">
            <button type="button" @click="insertImage" class="insert-btn">插入到文章</button>
          </div>
        </div>
        
        <!-- 发布按钮区域 -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '发布中...' : '发布博客' }}
          </button>
          <router-link to="/" class="cancel-btn">取消</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createBlog } from '../api/blog'
import { uploadImage as uploadImageApi} from '../api/upload'

const router = useRouter()
const submitting = ref(false)
const uploading = ref(false)
const error = ref('')
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const uploadProgress = ref('')

const form = reactive({
  title: '',
  content: ''
})

// 选择文件
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  uploadProgress.value = ''
}

// 上传图片
const uploadImage = async () => {
  if (!selectedFile.value) {
    alert('请先选择图片')
    return
  }
  
  uploading.value = true
  uploadProgress.value = '上传中...'
  
  try {
    const res = await uploadImageApi(selectedFile.value)
    console.log('上传响应:', res)
    
    if (res.success) {
      uploadProgress.value = '上传成功！'
      // 保存图片URL，等待插入
      lastUploadedUrl.value = res.url
    } else {
      uploadProgress.value = '上传失败：' + res.message
    }
  } catch (err) {
    console.error('上传失败:', err)
    uploadProgress.value = '上传失败，请重试'
  } finally {
    uploading.value = false
  }
}

// 插入图片
const insertImage = () => {
  if (!lastUploadedUrl.value) return
  
  const imageMarkdown = `\n![图片](${lastUploadedUrl.value})\n`
  form.content += imageMarkdown
  
  // 清空预览
  previewUrl.value = ''
  selectedFile.value = null
  fileInput.value.value = ''
  uploadProgress.value = ''
  lastUploadedUrl.value = ''
}

// 保存最后上传的图片URL
const lastUploadedUrl = ref('')

// 提交表单
const handleSubmit = async () => {
  if (!form.title || !form.content) {
    error.value = '请填写完整信息'
    return
  }
  
  submitting.value = true
  error.value = ''
  
  try {
    await createBlog(form)
    alert('发布成功！')
    router.push('/')
  } catch (err) {
    console.error('发布失败:', err)
    error.value = err.response?.data?.message || '发布失败，请重试'
  } finally {
    submitting.value = false
  }
}
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
  box-sizing: border-box;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #5787b7;
}

/* 上传区域 */
.upload-area {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 5px;
}

.upload-area input[type="file"] {
  display: none;
}

.upload-btn {
  display: inline-block !important;
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.upload-btn:hover:not(:disabled) {
  background: #218838;
}

.upload-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.image-preview {
  margin-top: 15px;
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.insert-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px 10px;
  background: #286fb5;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.insert-btn:hover {
  background: #0052a3;
}

/* 表单按钮 */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.submit-btn {
  flex: 1;
  padding: 12px;
  background: #5787b7;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
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

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}
</style>