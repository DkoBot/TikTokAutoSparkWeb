<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <div class="hero-banner">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="wave">👋</span> 欢迎使用抖音火花助手
        </h1>
        <p class="hero-subtitle">自动化管理你的抖音好友火花，保持联系不间断</p>
      </div>
      <div class="hero-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 状态卡片 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card" :class="{ active: browserStatus }">
          <div class="stat-card-inner">
            <div class="stat-icon browser">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">浏览器状态</div>
              <div class="stat-value">
                <span class="status-text">{{ browserStatus ? '已初始化' : '未初始化' }}</span>
                <span class="status-dot" :class="browserStatus ? 'online' : 'offline'"></span>
              </div>
            </div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card" :class="{ active: loginStatus }">
          <div class="stat-card-inner">
            <div class="stat-icon login">
              <el-icon><Key /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">登录状态</div>
              <div class="stat-value">
                <span class="status-text">{{ loginStatus ? '已登录' : '未登录' }}</span>
                <span class="status-dot" :class="loginStatus ? 'online' : 'offline'"></span>
              </div>
            </div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon friends">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">好友数量</div>
              <div class="stat-value">
                <span class="number">{{ friendsCount }}</span>
                <span class="unit">人</span>
              </div>
            </div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-card-inner">
            <div class="stat-icon tasks">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">定时任务</div>
              <div class="stat-value">
                <span class="number">{{ taskCount }}</span>
                <span class="unit">个</span>
              </div>
            </div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 主内容区域 -->
    <el-row :gutter="24" class="main-content">
      <!-- 快速操作 -->
      <el-col :xs="24" :lg="14">
        <div class="panel-card action-panel">
          <div class="panel-header">
            <span class="panel-title">
              <el-icon><Operation /></el-icon>
              快速操作
            </span>
          </div>
          <div class="action-grid">
            <div class="action-item" @click="initBrowser" :class="{ loading: initLoading }">
              <div class="action-icon browser">
                <el-icon><Monitor /></el-icon>
              </div>
              <span class="action-text">初始化浏览器</span>
              <span class="action-hint">启动自动化环境</span>
            </div>
            <div class="action-item" @click="refreshFriends">
              <div class="action-icon refresh">
                <el-icon><Refresh /></el-icon>
              </div>
              <span class="action-text">刷新好友列表</span>
              <span class="action-hint">更新好友数据</span>
            </div>
            <div class="action-item" @click="$router.push('/tasks')">
              <div class="action-icon tasks">
                <el-icon><Clock /></el-icon>
              </div>
              <span class="action-text">管理定时任务</span>
              <span class="action-hint">添加或修改任务</span>
            </div>
            <div class="action-item" @click="$router.push('/settings')">
              <div class="action-icon settings">
                <el-icon><Setting /></el-icon>
              </div>
              <span class="action-text">系统设置</span>
              <span class="action-hint">配置账户信息</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 系统信息 -->
      <el-col :xs="24" :lg="10">
        <div class="panel-card system-info">
          <div class="panel-header">
            <span class="panel-title">
              <el-icon><InfoFilled /></el-icon>
              系统信息
            </span>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">系统版本</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">项目已运行</span>
              <span class="info-value uptime">{{ uptime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">API 地址</span>
              <span class="info-value">http://127.0.0.1:9844</span>
            </div>
            <div class="info-item">
              <span class="info-label">前端端口</span>
              <span class="info-value">5173</span>
            </div>
            <div class="info-item">
              <span class="info-label">运行状态</span>
              <span class="info-value">
                <el-tag :type="browserStatus && loginStatus ? 'success' : 'warning'" size="small">
                  {{ browserStatus && loginStatus ? '正常' : '待初始化' }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近定时任务 -->
    <div class="panel-card recent-tasks">
      <div class="panel-header">
        <span class="panel-title">
          <el-icon><Calendar /></el-icon>
          最近定时任务
        </span>
        <el-button type="primary" link @click="$router.push('/tasks')">
          查看全部
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-empty v-if="recentTasks.length === 0" description="暂无定时任务，快去添加一个吧">
        <el-button type="primary" @click="$router.push('/tasks')">添加任务</el-button>
      </el-empty>
      <el-table v-else :data="recentTasks" stripe class="task-table">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="好友">
          <template #default="{ row }">
            <div class="friend-cell">
              <div class="friend-avatar">
                {{ row.name?.charAt(0) || '?' }}
              </div>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="执行时间" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.time }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="next_run" label="下次执行" min-width="180">
          <template #default="{ row }">
            <span class="next-run-text">
              <el-icon><Clock /></el-icon>
              {{ row.next_run || '未设置' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Monitor,
  Clock,
  Key,
  User,
  Operation,
  Setting,
  InfoFilled,
  Calendar,
  ArrowRight
} from '@element-plus/icons-vue'
import { initBrowser as initBrowserApi, getInitStatus, getLoginStatus, getFriendsList, getTaskList, getHome } from '../api/douyin'
import { browserStatus, loginStatus, hasLoaded, setBrowserStatus, setLoginStatus, setFriendsList, friendsList as storeFriendsList, homeLoaded, setHomeLoaded } from '../stores/browser'

const router = useRouter()

const friendsCount = ref(0)
const taskCount = ref(0)
const recentTasks = ref([])
const initLoading = ref(false)
const uptime = ref('--')

const formatUptime = (startTime) => {
  const start = new Date(startTime)
  const now = new Date()
  const diff = Math.floor((now - start) / 1000)
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0 || days > 0) parts.push(`${hours}小时`)
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}分`)
  parts.push(`${seconds}秒`)
  return parts.join(' ')
}

// 从 localStorage 恢复任务数据
const restoreFromLocalStorage = () => {
  const tasks = JSON.parse(localStorage.getItem('douyin_tasks') || '[]')
  taskCount.value = tasks.length
  recentTasks.value = tasks.slice(0, 5)
}

const checkBrowserStatus = async () => {
  try {
    const res = await getInitStatus()
    browserStatus.value = res.data === 'Yes'
    setBrowserStatus(browserStatus.value)
    if (!browserStatus.value) {
      ElMessageBox.confirm('浏览器未初始化，是否立即初始化？', '提示', {
        confirmButtonText: '立即初始化',
        cancelButtonText: '稍后',
        type: 'warning'
      }).then(async () => {
        await initBrowser()
      }).catch(() => {})
    }
  } catch (error) {
    browserStatus.value = false
    setBrowserStatus(false)
  }
}

const checkLoginStatus = async () => {
  try {
    const res = await getLoginStatus()
    loginStatus.value = res.data === 'Yes'
    setLoginStatus(loginStatus.value)
  } catch (error) {
    loginStatus.value = false
    setLoginStatus(false)
  }
}

const refreshFriends = async () => {
  try {
    const res = await getFriendsList()
    const list = res.data.list || {}
    const formattedList = Object.entries(list).map(([name, [avatar, fire]]) => ({
      name,
      avatar,
      fire
    }))
    setFriendsList(formattedList)
    friendsCount.value = res.data.count || 0
    ElMessage.success('刷新成功')
  } catch (error) {
    const isUnauthorized = error.response?.status === 401 || error.message?.includes('未授权') || error.message?.includes('登录已过期')
    if (isUnauthorized) {
      ElMessageBox.confirm('您还未登录抖音账号，是否前往登录？', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.location.href = '/settings'
      }).catch(() => {})
    } else {
      ElMessage.error('刷新失败')
    }
  }
}

const loadTaskList = async () => {
  try {
    const res = await getTaskList()
    taskCount.value = res.data.count || 0
    recentTasks.value = res.data.tasks?.slice(0, 5) || []
    // 保存到 localStorage
    localStorage.setItem('douyin_tasks', JSON.stringify(res.data.tasks || []))
  } catch (error) {
    console.error('加载任务列表失败:', error)
  }
}

const initBrowser = async () => {
  initLoading.value = true
  try {
    const res = await initBrowserApi()
    if (res.code === 200) {
      browserStatus.value = true
      setBrowserStatus(true)
      ElMessage.success('浏览器初始化成功')
      await checkLoginStatus()
      if (!loginStatus.value) {
        ElMessageBox.confirm('浏览器初始化成功，但您还未登录抖音账号，是否前往登录？', '提示', {
          confirmButtonText: '前往登录',
          cancelButtonText: '稍后',
          type: 'warning'
        }).then(() => {
          window.location.href = '/settings'
        }).catch(() => {})
      }
    }
  } catch (error) {
    ElMessage.error('浏览器初始化失败')
  } finally {
    initLoading.value = false
  }
}

// 从 localStorage 恢复 uptime
const restoreUptimeFromLocalStorage = () => {
  const startTime = localStorage.getItem('douyin_start_time')
  if (startTime) {
    uptime.value = formatUptime(startTime)
    setInterval(() => {
      uptime.value = formatUptime(startTime)
    }, 1000)
  }
}

onMounted(async () => {
  // 首次加载：调用所有接口并缓存
  if (!homeLoaded.value) {
    await checkBrowserStatus()
    await checkLoginStatus()
    if (browserStatus.value && loginStatus.value) {
      await refreshFriends()
      await loadTaskList()
    }
    // 获取并缓存 uptime
    try {
      const res = await getHome()
      const timeKey = res.time
      if (timeKey) {
        localStorage.setItem('douyin_start_time', timeKey)
        uptime.value = formatUptime(timeKey)
        setInterval(() => {
          uptime.value = formatUptime(timeKey)
        }, 1000)
      }
    } catch (error) {
      uptime.value = '获取失败'
    }
    setHomeLoaded()
  } else {
    // 缓存恢复：只从 localStorage 读取
    friendsCount.value = storeFriendsList.value.length
    restoreFromLocalStorage()
    restoreUptimeFromLocalStorage()
  }
})

// 页面激活时（如从其他页面返回）：使用缓存，不重复请求
onActivated(() => {
  // 无需额外操作，数据已通过缓存保持最新
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.home-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 欢迎横幅 */
.hero-banner {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 40px 48px;
  margin-bottom: 28px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(15, 52, 96, 0.25);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.wave {
  animation: wave 1.5s ease-in-out infinite;
  display: inline-block;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-15deg); }
}

.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-weight: 400;
}

.hero-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 77, 96, 0.15);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: 100px;
  border: 1px solid rgba(255, 77, 96, 0.1);
  background: transparent;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 50px;
  right: -30px;
  border: 1px solid rgba(255, 77, 96, 0.08);
  background: transparent;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: -30px;
  right: 150px;
  border: 1px solid rgba(255, 77, 96, 0.06);
  background: transparent;
}

/* 状态卡片 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.stat-card.active {
  border-color: transparent;
}

.stat-card-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.02) 50%);
  border-radius: 0 16px 0 120px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-card-bg {
  width: 160px;
  height: 160px;
  border-radius: 0 24px 0 160px;
}

.stat-card-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-icon.browser {
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.35);
}

.stat-icon.login {
  background: linear-gradient(135deg, #ffa502, #ff7f50);
  box-shadow: 0 4px 12px rgba(255, 165, 2, 0.35);
}

.stat-icon.friends {
  background: linear-gradient(135deg, #2ed573, #7bed9f);
  box-shadow: 0 4px 12px rgba(46, 213, 115, 0.35);
}

.stat-icon.tasks {
  background: linear-gradient(135deg, #1e90ff, #70a1ff);
  box-shadow: 0 4px 12px rgba(30, 144, 255, 0.35);
}

.stat-icon .el-icon {
  font-size: 24px;
  color: #fff;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.online {
  background: #52c41a;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.5);
}

.status-dot.offline {
  background: #ff4d4f;
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.5);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.number {
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  line-height: 1;
}

.unit {
  font-size: 14px;
  color: #8c8c8c;
  font-weight: 400;
}

/* 主内容区域 */
.main-content {
  margin-bottom: 24px;
}

.panel-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title .el-icon {
  font-size: 18px;
  color: #ff4757;
}

/* 快速操作 */
.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.action-item:hover {
  background: #fff5f5;
  border-color: #ff4757;
  transform: translateY(-2px);
}

.action-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.action-icon.browser {
  background: linear-gradient(135deg, #ff4757, #ff6b81);
}

.action-icon.refresh {
  background: linear-gradient(135deg, #ffa502, #ff7f50);
}

.action-icon.tasks {
  background: linear-gradient(135deg, #2ed573, #7bed9f);
}

.action-icon.settings {
  background: linear-gradient(135deg, #1e90ff, #70a1ff);
}

.action-icon .el-icon {
  font-size: 22px;
  color: #fff;
}

.action-text {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.action-hint {
  font-size: 12px;
  color: #8c8c8c;
}

/* 系统信息 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 10px;
}

.info-label {
  font-size: 14px;
  color: #8c8c8c;
}

.info-value {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uptime {
  color: #52c41a;
}

/* 最近定时任务 */
.recent-tasks {
  margin-bottom: 24px;
}

.task-table {
  margin-top: 16px;
}

.friend-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.friend-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.next-run-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #595959;
  font-size: 13px;
}

.next-run-text .el-icon {
  color: #8c8c8c;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-banner {
    padding: 28px 24px;
    border-radius: 16px;
  }

  .hero-title {
    font-size: 22px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .hero-decoration {
    display: none;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-icon .el-icon {
    font-size: 20px;
  }

  .number {
    font-size: 24px;
  }

  .action-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .action-item {
    padding: 20px 12px;
  }

  .action-icon {
    width: 44px;
    height: 44px;
    margin-bottom: 10px;
  }

  .action-icon .el-icon {
    font-size: 20px;
  }

  .action-text {
    font-size: 13px;
  }

  .action-hint {
    font-size: 11px;
  }

  .panel-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .action-grid {
    grid-template-columns: 1fr;
  }

  .action-item {
    flex-direction: row;
    justify-content: flex-start;
    padding: 16px 20px;
    gap: 16px;
  }

  .action-icon {
    margin-bottom: 0;
  }

  .action-text {
    margin-bottom: 2px;
  }
}
</style>
