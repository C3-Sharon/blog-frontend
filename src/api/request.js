import axios from 'axios'

// 1. 创建实例
const request = axios.create({
  // import.meta.env.VITE_API_BASE_URL 会自动读取 .env 文件中的配置
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  timeout: 10000,
  withCredentials: true
})

// 2. 请求拦截器（如需加 Token 可在此处）
request.interceptors.request.use(
  config => {
    return config
  },
  error => Promise.reject(error)
)

// 3. 响应拦截器：核心拆包逻辑
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果后端返回的是 Result 对象 (包含 success, message, data)
    if (res.success === false) {
      // 业务报错，抛出异常让组件的 catch 捕获
      return Promise.reject(new Error(res.message || '未知错误'))
    }
    
    // 成功则直接返回 data 部分，组件里拿到的就是纯数据
    return res.data
  },
  error => {
    // 处理 HTTP 状态码错误（如 404, 500）
    const msg = error.response?.data?.message || '网络连接异常'
    return Promise.reject(new Error(msg))
  }
)

export default request