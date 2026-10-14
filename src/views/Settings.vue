<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账户配置</span>
        </div>
      </template>

      <div class="account-section">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="登录状态">
            <el-tag :type="loginStatus ? 'success' : 'danger'">
              {{ loginStatus ? (username ? '已登录: ' + username : '已登录') : '未登录' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="login-action">
          <el-button type="primary" :icon="Key" @click="handleLogin" :loading="loginLoading" :disabled="loginStatus">
            扫码登录
          </el-button>
          <el-button type="primary" :icon="Message" @click="phoneDialogVisible = true" :disabled="loginStatus">
            验证码登录
          </el-button>
          <el-button :icon="Edit" @click="manualDialogVisible = true" :disabled="loginStatus">
            手动登录
          </el-button>
          <el-button :icon="Refresh" @click="handleRefreshStatus" :loading="refreshStatusLoading">
            刷新状态
          </el-button>
          <el-button :icon="Document" @click="cookieDialogVisible = true">
            获取Base64Cookie
          </el-button>
          <el-button :icon="SwitchButton" type="danger" @click="handleDieLogin">
            强制退出登录
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 手动登录弹窗 -->
    <el-dialog v-model="manualDialogVisible" title="手动登录" width="500px" destroy-on-close>
      <el-form :model="manualForm" label-width="100px">
        <el-form-item label="Base64Cookie">
          <el-input
            v-model="manualForm.cookie"
            type="textarea"
            :rows="6"
            placeholder="请输入登录Base64Cookie"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleManualLogin" :loading="manualLoading">
          验证登录
        </el-button>
      </template>
    </el-dialog>

    <!-- 获取Cookie弹窗 -->
    <el-dialog v-model="cookieDialogVisible" title="获取Base64Cookie" width="400px" destroy-on-close>
      <el-form :model="cookieForm" label-width="100px">
        <el-form-item label="确认密码">
          <el-input
            v-model="cookieForm.password"
            type="password"
            placeholder="请输入密码确认"
            @keyup.enter="handleGetCookie"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cookieDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGetCookie" :loading="cookieLoading">
          获取Cookie
        </el-button>
      </template>
    </el-dialog>

    <!-- 验证码登录弹窗 -->
    <el-dialog v-model="phoneDialogVisible" title="验证码登录" width="400px" destroy-on-close>
      <el-form :model="phoneForm" label-width="80px">
        <el-form-item label="手机号">
          <div style="display: flex; gap: 8px;">
            <el-input
              v-model="phoneForm.areacode"
              placeholder="+86"
              style="width: 70px; flex-shrink: 0;"
              @keyup.enter="handleSendCode"
            />
            <el-input
              v-model="phoneForm.phone"
              placeholder="请输入手机号"
              style="flex: 1"
              @keyup.enter="handleSendCode"
            />
          </div>
        </el-form-item>
        <el-form-item label="验证码">
          <div style="display: flex; gap: 10px;">
            <el-input
              v-model="phoneForm.code"
              placeholder="请输入验证码"
              style="flex: 1"
              @keyup.enter="handlePhoneLogin"
            />
            <el-button @click="handleSendCode" :disabled="codeCountdown > 0" :loading="codeLoading">
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="phoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePhoneLogin" :loading="phoneLoading">
          登录
        </el-button>
      </template>
    </el-dialog>

    <!-- 二维码弹窗 -->
    <el-dialog v-model="qrDialogVisible" title="抖音扫码登录" width="350px" destroy-on-close>
      <div class="qrcode-container">
        <div v-if="qrcodeUrl" class="qrcode-wrapper">
          <img :src="qrcodeUrl" alt="登录二维码" class="qrcode-img" />
          <p class="qrcode-hint">请使用抖音App扫码登录</p>
        </div>
        <div v-else-if="loading" class="loading-wrapper">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>正在加载二维码...</p>
        </div>
        <div v-else class="error-wrapper">
          <p>获取二维码失败，请重试</p>
        </div>
      </div>
      <div class="qrcode-actions">
        <el-button :icon="Refresh" @click="handleRefreshCode" :loading="refreshLoading" size="small">
          刷新验证码
        </el-button>
        <el-button :icon="View" @click="handleCheckLogin" :loading="checkLoading" size="small">
          获取登录状态
        </el-button>
      </div>
    </el-dialog>
  </div>

  <!-- 修改密码弹窗 -->
  <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px" destroy-on-close>
    <el-form :model="passwordForm" label-width="90px">
      <el-form-item label="原密码">
        <el-input v-model="passwordForm.old_password" type="password" placeholder="请输入原密码" show-password />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="passwordForm.new_password" type="password" placeholder="请输入新密码" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="passwordDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
        确认修改
      </el-button>
    </template>
  </el-dialog>

  <!-- 后台配置卡片 -->
  <el-card style="margin-top: 20px">
    <template #header>
      <div class="card-header">
        <span>后台配置</span>
      </div>
    </template>
    <div class="config-row">
      <div class="config-item">
        <span class="config-label">上次登录IP：</span>
        <span class="config-value">{{ lastLoginIP }}</span>
      </div>
      <el-button type="primary" :icon="Lock" @click="passwordDialogVisible = true">
        修改密码
      </el-button>
    </div>
  </el-card>

  <!-- 调试区域卡片 -->
  <el-card style="margin-top: 20px">
    <template #header>
      <div class="card-header">
        <span>调试功能</span>
      </div>
    </template>
    <div class="debug-row">
      <el-button type="primary" :icon="Picture" @click="handleGetScreenshot" :loading="screenshotLoading">
        获取浏览器页面截图
      </el-button>
      <el-button type="warning" :icon="WarnTriangleFilled" @click="handleForceLogin">
        强制登录状态
      </el-button>
    </div>
    <el-dialog v-model="screenshotPreviewVisible" title="浏览器截图" width="600px" destroy-on-close>
      <img :src="screenshotUrl" alt="浏览器截图" class="screenshot-img" />
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { ElMessage } from 'element-plus'
import { Key, Refresh, View, Loading, Edit, Lock, Document, SwitchButton, Picture, Message, WarnTriangleFilled } from '@element-plus/icons-vue'
import { getInitStatus, getLoginStatus, initBrowser, getLoginPng, login, getUsername, changePassword, getLastLoginIP, getFriendsList, getCooker, logout, pnglogin, getScrlk, dieLogin, sendVerifyCode, submitVerifyCode, forceLogin } from '../api/douyin'
import { loginStatus, hasLoaded, setLoginStatus, setFriendsList } from '../stores/browser'

const loginLoading = ref(false)
const refreshLoading = ref(false)
const checkLoading = ref(false)
const refreshStatusLoading = ref(false)
const qrDialogVisible = ref(false)
const qrcodeUrl = ref('')
const loading = ref(false)
const manualDialogVisible = ref(false)
const manualLoading = ref(false)
const manualForm = ref({
  cookie: ''
})
const username = ref(localStorage.getItem('douyin_username') || '')
const usernameLoaded = ref(localStorage.getItem('douyin_username_loaded') === '1')
const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)
const passwordForm = ref({
  old_password: '',
  new_password: ''
})
const lastLoginIP = ref(localStorage.getItem('douyin_last_login_ip') || '加载中...')
const settingsLoaded = ref(localStorage.getItem('douyin_settings_loaded') === '1')
const cookieDialogVisible = ref(false)
const cookieLoading = ref(false)
const cookieForm = ref({
  password: ''
})
const screenshotLoading = ref(false)
const screenshotUrl = ref('')
const screenshotPreviewVisible = ref(false)
const phoneDialogVisible = ref(false)
const phoneLoading = ref(false)
const codeLoading = ref(false)
const codeCountdown = ref(0)
const phoneForm = ref({
  areacode: '+86',
  phone: '',
  code: ''
})

const fetchLastLoginIP = async () => {
  try {
    const res = await getLastLoginIP()
    if (res.code == 200 || res.code == '200') {
      lastLoginIP.value = res.data || '无'
      localStorage.setItem('douyin_last_login_ip', lastLoginIP.value)
    }
  } catch (error) {
    lastLoginIP.value = '获取失败'
  }
}

const fetchUsername = async () => {
  try {
    const res = await getUsername()
    if (res.code == 200 || res.code == '200') {
      username.value = res.data
      usernameLoaded.value = true
      localStorage.setItem('douyin_username', res.data)
      localStorage.setItem('douyin_username_loaded', '1')
    }
  } catch (error) {
    // 获取失败不提示，静默处理
  }
}

const checkLoginStatus = async () => {
  try {
    const res = await getLoginStatus()
    loginStatus.value = res.data === 'Yes'
    setLoginStatus(loginStatus.value)
    if (loginStatus.value && !usernameLoaded.value) {
      await fetchUsername()
    }
  } catch (error) {
    loginStatus.value = false
    setLoginStatus(false)
  }
}

const handleRefreshStatus = async () => {
  refreshStatusLoading.value = true
  try {
    usernameLoaded.value = false
    localStorage.removeItem('douyin_username')
    localStorage.removeItem('douyin_username_loaded')
    await checkLoginStatus()
    await fetchLastLoginIP()
    ElMessage.success(loginStatus.value ? '已登录' : '未登录')
  } finally {
    refreshStatusLoading.value = false
  }
}

const handleCheckLogin = async () => {
  checkLoading.value = true
  try {
    const res = await pnglogin()
    loginStatus.value = res.code == 200
    setLoginStatus(loginStatus.value)
    if (loginStatus.value) {
      ElMessage.success('登录成功，扫码登录窗口将关闭')
      qrDialogVisible.value = false
      username.value = ''
      usernameLoaded.value = false
      localStorage.removeItem('douyin_username')
      localStorage.removeItem('douyin_username_loaded')
      await fetchUsername()
      // 登录成功后请求好友列表
      await fetchFriendsList()
    } else {
      ElMessage.warning('未登录，请继续扫码')
    }
  } catch (error) {
    ElMessage.error('扫码登录失败，请重试')
  } finally {
    checkLoading.value = false
  }
}

const fetchFriendsList = async () => {
  try {
    const res = await getFriendsList()
    if (res.code === 200) {
      const list = res.data.list || {}
      const formattedList = Object.entries(list).map(([name, [avatar, fire]]) => ({
        name,
        avatar,
        fire
      }))
      setFriendsList(formattedList)
    }
  } catch (error) {
    // 获取失败静默处理
  }
}

const handleRefreshCode = async () => {
  refreshLoading.value = true
  try {
    // 先初始化浏览器
    await initBrowser()
    // 获取新二维码
    const res = await getLoginPng()
    if (res.data) {
      qrcodeUrl.value = res.data
      qrDialogVisible.value = true
      ElMessage.success('刷新成功')
    } else {
      ElMessage.error('获取二维码失败')
    }
  } catch (error) {
    ElMessage.error('刷新失败，请确保浏览器已初始化')
  } finally {
    refreshLoading.value = false
  }
}

const handleManualLogin = async () => {
  if (!manualForm.value.cookie.trim()) {
    ElMessage.warning('请输入Base64Cookie')
    return
  }
  manualLoading.value = true
  try {
    const res = await login(manualForm.value.cookie)
    if (res.data === 'ok') {
      ElMessage.success('登录成功')
      loginStatus.value = true
      setLoginStatus(true)
      manualDialogVisible.value = false
      username.value = ''
      usernameLoaded.value = false
      localStorage.removeItem('douyin_username')
      localStorage.removeItem('douyin_username_loaded')
      await fetchUsername()
      await fetchFriendsList()
    } else {
      ElMessage.error('登录失败，Cookie无效')
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查Cookie')
  } finally {
    manualLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (!passwordForm.value.old_password) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!passwordForm.value.new_password) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.value.old_password === passwordForm.value.new_password) {
    ElMessage.warning('新密码不能与原密码相同')
    return
  }
  passwordLoading.value = true
  try {
    const res = await changePassword(passwordForm.value.old_password, passwordForm.value.new_password)
    if (res.code == 200 || res.code == '200') {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      passwordForm.value.old_password = ''
      passwordForm.value.new_password = ''
    } else {
      ElMessage.error(res.data || '修改失败')
    }
  } catch (error) {
    ElMessage.error('修改失败')
  } finally {
    passwordLoading.value = false
  }
}

const handleGetCookie = async () => {
  if (!cookieForm.value.password) {
    ElMessage.warning('请输入密码')
    return
  }
  cookieLoading.value = true
  try {
    const res = await getCooker(cookieForm.value.password)
    console.log('Cookie:', res.data.cooke)
    if (res.code == 200) {
      const textArea = document.createElement('textarea')
      textArea.value = res.data.cooke
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        ElMessage.success('Cookie已复制到剪贴板')
        cookieDialogVisible.value = false
        cookieForm.value.password = ''
      } catch {
        ElMessage.error('复制失败，请手动复制控制台输出的Cookie')
      } finally {
        document.body.removeChild(textArea)
      }
    } else {
      ElMessage.error(res.data || '获取失败，密码错误')
    }
  } catch (error) {
    ElMessage.error('获取失败')
  } finally {
    cookieLoading.value = false
  }
}

const handleLogout = async () => {
  try {
    await logout()
    setLoginStatus(false)
    localStorage.removeItem('douyin_token')
    ElMessage.success('已退出登录')
  } catch (error) {
    ElMessage.error('退出失败')
  }
}

const handleDieLogin = async () => {
  try {
    await dieLogin()
    setLoginStatus(false)
    localStorage.removeItem('douyin_token')
    ElMessage.success('已强制退出登录')
  } catch (error) {
    ElMessage.error('强制退出失败')
  }
}

const handleSendCode = async () => {
  if (!phoneForm.value.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  codeLoading.value = true
  try {
    const res = await sendVerifyCode(phoneForm.value.areacode, phoneForm.value.phone)
    if (res.code == 200) {
      ElMessage.success('验证码发送成功')
      codeCountdown.value = 60
      const timer = setInterval(() => {
        codeCountdown.value--
        if (codeCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(res.data || '验证码发送失败')
    }
  } catch (error) {
    ElMessage.error('验证码发送失败，请确保浏览器已初始化')
  } finally {
    codeLoading.value = false
  }
}

const handlePhoneLogin = async () => {
  if (!phoneForm.value.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!phoneForm.value.code) {
    ElMessage.warning('请输入验证码')
    return
  }
  phoneLoading.value = true
  try {
    const res = await submitVerifyCode(phoneForm.value.code)
    if (res.code == 200) {
      ElMessage.success('登录成功')
      phoneDialogVisible.value = false
      setLoginStatus(true)
      username.value = ''
      usernameLoaded.value = false
      localStorage.removeItem('douyin_username')
      localStorage.removeItem('douyin_username_loaded')
      await fetchUsername()
    } else {
      ElMessage.error(res.data || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败，请重试')
  } finally {
    phoneLoading.value = false
  }
}

const handleGetScreenshot = async () => {
  screenshotLoading.value = true
  screenshotUrl.value = ''
  try {
    const res = await getScrlk()
    if (res.code == 200) {
      screenshotUrl.value = 'data:image/png;base64,' + res.data
      screenshotPreviewVisible.value = true
    } else {
      ElMessage.error(res.data || '获取截图失败')
    }
  } catch (error) {
    ElMessage.error('获取截图失败，请确保已登录')
  } finally {
    screenshotLoading.value = false
  }
}

const handleForceLogin = async () => {
  try {
    const res = await forceLogin()
    if (res.code == 200) {
      ElMessage.success(res.data || '强制登录状态成功')
    } else {
      ElMessage.error(res.data || '强制登录状态失败')
    }
  } catch (error) {
    ElMessage.error('强制登录状态失败')
  }
}

const handleLogin = async () => {
  loginLoading.value = true
  loading.value = true
  qrcodeUrl.value = ''
  qrDialogVisible.value = true

  try {
    // 先初始化浏览器
    await initBrowser()
    // 获取二维码
    const res = await getLoginPng()
    if (res.data) {
      qrcodeUrl.value = res.data
      ElMessage.success('请使用抖音App扫码登录')
    } else {
      ElMessage.error('获取二维码失败')
      qrDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('登录初始化失败，请确保浏览器已启动')
    qrDialogVisible.value = false
  } finally {
    loginLoading.value = false
    loading.value = false
  }
}

onMounted(async () => {
  // 首次加载
  if (!settingsLoaded.value) {
    await checkLoginStatus()
    await fetchLastLoginIP()
    localStorage.setItem('douyin_settings_loaded', '1')
  }
})

onActivated(async () => {
  // 每次进入页面，IP 从缓存读取
  lastLoginIP.value = localStorage.getItem('douyin_last_login_ip') || '加载中...'
})
</script>

<style scoped>
.settings-container {
  width: 100%;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.account-section {
  padding: 10px 0;
}

.login-action {
  margin-top: 30px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.qrcode-wrapper {
  text-align: center;
}

.qrcode-img {
  width: 250px;
  height: 250px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qrcode-hint {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

.qrcode-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.loading-wrapper,
.error-wrapper {
  text-align: center;
  color: #999;
}

.loading-wrapper .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.config-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.config-label {
  color: #909399;
  font-size: 14px;
}

.config-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.debug-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.screenshot-wrapper {
  margin-top: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.screenshot-img {
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
