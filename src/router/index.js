import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'      
import { createRouter, createWebHistory } from 'vue-router'
import DetailView from '../views/DetailView.vue'
import AdminNewView from '../views/AdminNewView.vue'
import GalleryView from '../views/GalleryView.vue'
import AdminEditView from '../views/AdminEditView.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/blog/:id',      // 添加这行！:id 是动态参数
    name: 'detail',
    component: DetailView
  },
  {
    path: '/admin/new',
    name: 'admin-new',
    component: AdminNewView,
    meta: { requiresAuth: true }  // 需要登录
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: GalleryView
  },
  {
  path: '/admin/edit/:id',
  name: 'admin-edit',
  component: AdminEditView,
  meta: { requiresAuth: true }
}
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router