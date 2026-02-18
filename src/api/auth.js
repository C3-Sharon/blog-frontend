import request from './request'

// 登录
export const login = (username, password) => {
  // 使用 URLSearchParams 因为后端接收的是 form data
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  
  return request.post('/admin/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 登出
export const logout = () => {
  return request.get('/admin/logout')
}

// 检查登录状态
export const checkLogin = () => {
  return request.get('/admin/check')
}