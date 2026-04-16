import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(username, password) {
    try {
      const res = await axios.get('/api/Api/Login/Admin', {
        params: { username, password }
      })
      if (res.data.code == 200 || res.data.code == '200') {
        const newToken = res.data.data
        token.value = newToken
        userInfo.value = { username, loginTime: new Date().toISOString() }
        localStorage.setItem('token', newToken)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: res.data.data || '登录失败' }
      }
    } catch (error) {
      const msg = error.response?.data?.data || error.message || '登录失败'
      return { success: false, message: msg }
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    delete axios.defaults.headers.common['Authorization']
  }

  // 恢复登录状态
  function restoreSession() {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    restoreSession
  }
})
