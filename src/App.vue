<template>
  <div id="app">
    <!-- 全局导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">三碳化合物的博客</router-link>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/gallery">展厅</router-link>
          <!-- 根据登录状态显示不同按钮 -->
          <template v-if="isLoggedIn">
            <router-link to="/admin/new" class="write-btn">写博客</router-link>
            <button @click="handleLogout" class="logout-btn">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="login-btn">登录</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- 页面内容 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout,checkLogin } from './api/auth'

const router = useRouter()
const isLoggedIn = ref(false)

// 检查登录状态
const checkLoginStatus = async () => {
  try {
    const res = await checkLogin() // 拦截器剥壳后，res 是 LoginStatus 对象
    console.log('登录检查结果:', res)
    
    // 必须判断对象内部的字段，而不是判断对象本身
    isLoggedIn.value = res && res.loggedIn === true 
  } catch (error) {
    isLoggedIn.value = false
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await logout()
    sessionStorage.removeItem('adminUser')
    window.location.href = '/'  // 强制刷新
  } catch (error) {
    console.error('退出失败:', error)
    window.location.href = '/'
  }
}

// 路由变化时检查
router.afterEach(() => {
  checkLoginStatus()
})

onMounted(() => {
  checkLoginStatus()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 1rem 0;
}

.nav-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.3rem;
  font-weight: bold;
  color: #12458dd4;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  color: #555;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #0066cc;
}

.login-btn, .write-btn {
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.login-btn {
  background: #0066cc;
  color: white !important;
}

.write-btn {
  background: #28a745;
  color: white !important;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.logout-btn:hover {
  background: #dc3545;
  color: white;
}
</style>