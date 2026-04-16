<template>
  <div class="layout-container">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && sidebarVisible"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- 侧边栏 -->
    <aside
      :width="isCollapsed ? '64px' : '220px'"
      class="sidebar"
      :class="{
        'sidebar-collapsed': isCollapsed && !isMobile,
        'sidebar-mobile': isMobile,
        'sidebar-mobile-visible': sidebarVisible
      }"
    >
      <div class="logo">
        <el-icon v-if="isCollapsed && !isMobile"><ChromeFilled /></el-icon>
        <span v-else-if="!isCollapsed || (isMobile && sidebarVisible)" class="logo-text">抖音火花助手</span>
        <el-tooltip :content="browserStatus ? '浏览器已初始化' : '浏览器未初始化'" placement="right">
          <span class="status-dot" :class="browserStatus ? 'success' : 'error'"></span>
        </el-tooltip>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed && !isMobile"
        :collapse-transition="false"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuList"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>
            <span>{{ item.title }}</span>
          </template>
        </el-menu-item>
      </el-menu>

      <!-- 底部链接 -->
      <div class="sidebar-footer">
        <a
          href="https://github.com/DkoBot/TikTokAutoSparkWeb"
          target="_blank"
          class="github-link"
          :title="isCollapsed && !isMobile ? 'GitHub 项目' : ''"
        >
          <svg class="github-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span v-if="!isCollapsed || isMobile" class="github-text">GitHub 项目</span>
        </a>
      </div>
    </aside>

    <!-- 主体区域 -->
    <div class="main-wrapper">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <Fold v-if="!isCollapsed || isMobile" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="activeMenu !== '/home'">
              {{ currentMenuTitle }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo.username || 'Admin' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElTooltip } from 'element-plus'
import { useUserStore } from '../stores/user'
import { logout } from '../api/douyin'
import { browserStatus } from '../stores/browser'
import {
  Fold,
  Expand,
  UserFilled,
  ArrowDown,
  SwitchButton,
  House,
  User,
  Clock,
  ChromeFilled,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapsed = ref(false)
const isMobile = ref(false)
const sidebarVisible = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapsed.value = true
    sidebarVisible.value = false
  } else {
    sidebarVisible.value = true
  }
}

const toggleSidebar = () => {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  } else {
    isCollapsed.value = !isCollapsed.value
  }
}

const closeSidebar = () => {
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

watch(isCollapsed, (val) => {
  if (!isMobile.value && window.innerWidth < 768) {
    isCollapsed.value = true
  }
})

const menuList = [
  { path: '/home', title: '首页', icon: House },
  { path: '/friends', title: '好友列表', icon: User },
  { path: '/tasks', title: '定时任务', icon: Clock },
  { path: '/settings', title: '设置', icon: Setting }
]

const activeMenu = computed(() => route.path)

const currentMenuTitle = computed(() => {
  const menu = menuList.find(item => item.path === activeMenu.value)
  return menu ? menu.title : ''
})

const handleMenuSelect = (path) => {
  router.push(path)
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      try {
        await logout()
      } catch (e) {}
      userStore.logout()
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.sidebar {
  background: #304156;
  transition: width 0.3s, transform 0.3s;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 64px !important;
}

.sidebar-mobile {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 999;
  transform: translateX(-100%);
  width: 220px !important;
}

.sidebar-mobile-visible {
  transform: translateX(0);
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #263445;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.logo-text {
  flex-shrink: 0;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.3s;
}

.status-dot.success {
  background: #67c23a;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
}

.status-dot.error {
  background: #f56c6c;
  box-shadow: 0 0 6px rgba(245, 108, 108, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.sidebar-menu {
  border-right: none;
  background: #304156;
  flex: 1;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #263445 !important;
  color: #409eff;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  color: #bfcbd9;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s;
  font-size: 13px;
}

.github-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.github-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: currentColor;
}

.github-text {
  white-space: nowrap;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: 60px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #333;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .username {
    display: none;
  }

  .main-content {
    padding: 12px;
  }
}
</style>