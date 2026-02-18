import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true  // 允许携带 cookie（用于 session 登录）
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    console.log('发送请求:', config.method, config.url, config.params || config.data)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.data)
    return response.data  // 直接返回数据部分
  },
  error => {
    console.error('响应错误:', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default request