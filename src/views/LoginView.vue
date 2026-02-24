<template>
  <div class="login-container">
    <div class="login-box">
      <h2>管理员登录</h2>
      
      <div v-if="error" class="error">{{ error }}</div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            required
            placeholder="请输入用户名"
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required
            placeholder="请输入密码"
          >
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <router-link to="/" class="back-link">返回首页</router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'

const router = useRouter()
const error = ref('')
const loading = ref(false)

// 修正：模板中使用的是 v-model="form.username"，所以这里必须定义 form 对象
const form = reactive({
  username: '',
  password: ''
})

// LoginView.vue 里的 handleLogin
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await login(form.username, form.password)
    console.log('登录响应详情:', res)

    const isOk = res && (res.loggedIn === true || res.isLoggedIn === true)

    if (isOk) {
      sessionStorage.setItem('adminUser', res.username || form.username)
       
      console.log('准备跳转前的 res:', res)
      window.location.href = '/' // 先注释掉这一行测试
    } else {
      error.value = '后端返回验证失败'
    }
  } catch (err) {
    error.value = err.message || '网络异常'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #0066cc;
}

button {
  width: 100%;
  padding: 12px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 15px;
}

button:hover:not(:disabled) {
  background: #0052a3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.back-link {
  display: block;
  text-align: center;
  color: #666;
  text-decoration: none;
}

.back-link:hover {
  color: #0066cc;
}
</style>