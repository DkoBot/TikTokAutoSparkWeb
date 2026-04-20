<template>
  <div class="friends-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>好友列表</span>
          <div class="header-actions">
            <el-button v-if="!selectionMode" type="primary" :icon="Refresh" @click="loadFriends" :loading="loading">
              刷新
            </el-button>
            <el-button v-if="!selectionMode" type="success" :icon="Tickets" @click="selectionMode = true">
              多选
            </el-button>
            <template v-if="selectionMode">
              <el-button type="primary" :icon="Refresh" @click="loadFriends" :loading="loading">
                刷新
              </el-button>
              <el-button type="success" :icon="Check" @click="openBatchTaskDialog">
                创建定时任务 ({{ selectedFriends.length }})
              </el-button>
              <el-button :icon="Close" @click="cancelSelection">
                取消
              </el-button>
            </template>
          </div>
        </div>
      </template>

      <!-- 搜索框 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索好友..."
          :prefix-icon="Search"
          clearable
          style="max-width: 220px"
        />
        <el-select v-model="fireFilter" placeholder="火花筛选" clearable style="width: 140px; margin-left: 10px">
          <el-option label="全部" value="all" />
          <el-option label="有火花" value="has" />
          <el-option label="无火花" value="none" />
        </el-select>
      </div>

      <!-- 好友列表 -->
      <el-table
        v-loading="loading"
        :data="filteredFriends"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="selectionMode" type="selection" width="50" />
        <el-table-column type="index" label="序号" :width="selectionMode ? 80 : 60" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="昵称" min-width="120" />
        <el-table-column prop="fire" label="火花天数" width="100">
          <template #default="{ row }">
            <el-tag v-if="isFireActive(row.fire)" type="warning">{{ row.fire }}🔥</el-tag>
            <el-tag v-else type="info">无火花</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-dropdown @command="(cmd) => handleCommand(cmd, row)" trigger="click">
              <el-button type="primary" size="small">
                操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="send">发送消息</el-dropdown-item>
                  <el-dropdown-item command="create">创建任务</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredFriends.length === 0" description="暂无好友数据" />
    </el-card>

    <!-- 发送消息对话框 -->
    <el-dialog v-model="sendDialogVisible" title="发送消息" width="500px" destroy-on-close>
      <el-form :model="sendForm" label-width="80px">
        <el-form-item label="好友">
          <el-input v-model="sendForm.name" disabled />
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input
            v-model="sendForm.text"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSend" :loading="sendLoading">发送</el-button>
      </template>
    </el-dialog>

    <!-- 创建定时任务对话框 -->
    <el-dialog v-model="taskDialogVisible" title="创建定时任务" width="500px" destroy-on-close>
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="好友">
          <el-input v-model="taskForm.name" disabled />
        </el-form-item>
        <el-form-item label="执行时间">
          <el-time-picker
            v-model="taskForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input
            v-model="taskForm.text"
            type="textarea"
            :rows="3"
            placeholder="留空将使用每日名言"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTask" :loading="taskLoading">创建</el-button>
      </template>
    </el-dialog>

    <!-- 批量创建定时任务对话框 -->
    <el-dialog v-model="batchTaskDialogVisible" title="批量创建定时任务" width="600px" destroy-on-close>
      <div class="selected-friends">
        <span class="label">已选好友 ({{ selectedFriends.length }})：</span>
        <el-tag v-for="f in selectedFriends" :key="f.name" style="margin: 4px 4px 4px 0">
          {{ f.name }}
        </el-tag>
        <span v-if="selectedFriends.length === 0" class="empty-hint">未选择任何好友</span>
      </div>
      <el-divider />
      <el-form :model="batchTaskForm" label-width="80px">
        <el-form-item label="执行时间">
          <el-time-picker
            v-model="batchTaskForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input
            v-model="batchTaskForm.text"
            type="textarea"
            :rows="3"
            placeholder="留空将使用每日名言"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchCreateTask" :loading="batchTaskLoading">
          批量创建 ({{ selectedFriends.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search, User, ArrowDown, Tickets, Check, Close } from '@element-plus/icons-vue'
import { sendMessage, addTask } from '../api/douyin'
import { friendsList, setFriendsList } from '../stores/browser'

const loading = ref(false)
const searchKeyword = ref('')
const fireFilter = ref('')

// 判断是否有火花：数值>0 或文本非空非"0"
const isFireActive = (fire) => {
  if (!fire) return false
  const n = Number(fire)
  return !isNaN(n) ? n > 0 : true
}

const sendDialogVisible = ref(false)
const sendLoading = ref(false)
const sendForm = ref({
  name: '',
  text: ''
})

const taskDialogVisible = ref(false)
const taskLoading = ref(false)
const taskForm = ref({
  name: '',
  time: '',
  text: ''
})

const selectionMode = ref(false)
const selectedFriends = ref([])
const batchTaskDialogVisible = ref(false)
const batchTaskLoading = ref(false)
const batchTaskForm = ref({
  time: '',
  text: ''
})

const filteredFriends = computed(() => {
  let list = friendsList.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(f => f.name.toLowerCase().includes(keyword))
  }

  if (fireFilter.value && fireFilter.value !== 'all') {
    list = list.filter(f => {
      if (fireFilter.value === 'has') return isFireActive(f.fire)
      if (fireFilter.value === 'none') return !isFireActive(f.fire)
      return false
    })
  }

  return list
})

// 刷新按钮 - 请求 API 获取最新数据
const loadFriends = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/Api/GetFriendsList', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('douyin_token')}`
      }
    })
    const data = await res.json()
    if (data.code == 401) {
      ElMessageBox.confirm('您还未登录抖音账号，是否前往登录？', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.location.href = '/settings'
      }).catch(() => {})
      loading.value = false
      return
    }
    if (data.code === 200) {
      const list = data.data.list || {}
      const formattedList = Object.entries(list).map(([name, [avatar, fire]]) => ({
        name,
        avatar,
        fire
      }))
      setFriendsList(formattedList)
    }
  } catch (error) {
    ElMessage.error('加载好友列表失败')
  } finally {
    loading.value = false
  }
}

const openSendDialog = (friend) => {
  sendForm.value = {
    name: friend.name,
    text: ''
  }
  sendDialogVisible.value = true
}

const handleSend = async () => {
  if (!sendForm.value.text.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  sendLoading.value = true
  try {
    const res = await sendMessage(sendForm.value.name, sendForm.value.text)
    ElMessage.success('发送成功')
    sendDialogVisible.value = false
  } catch (error) {
    ElMessage.error('发送失败')
  } finally {
    sendLoading.value = false
  }
}

const handleCommand = (command, row) => {
  if (command === 'send') {
    openSendDialog(row)
  } else if (command === 'create') {
    openCreateTaskDialog(row)
  }
}

const openCreateTaskDialog = (friend) => {
  taskForm.value = {
    name: friend.name,
    time: '',
    text: ''
  }
  taskDialogVisible.value = true
}

const handleCreateTask = async () => {
  if (!taskForm.value.time) {
    ElMessage.warning('请选择时间')
    return
  }

  taskLoading.value = true
  try {
    await addTask(taskForm.value.time, taskForm.value.name, taskForm.value.text || null)
    ElMessage.success('创建成功')
    taskDialogVisible.value = false
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    taskLoading.value = false
  }
}

const handleSelectionChange = (rows) => {
  selectedFriends.value = rows
}

const cancelSelection = () => {
  selectionMode.value = false
  selectedFriends.value = []
}

const openBatchTaskDialog = () => {
  if (selectedFriends.value.length === 0) {
    ElMessage.warning('请先选择好友')
    return
  }
  batchTaskForm.value = { time: '', text: '' }
  batchTaskDialogVisible.value = true
}

const handleBatchCreateTask = async () => {
  if (!batchTaskForm.value.time) {
    ElMessage.warning('请选择时间')
    return
  }

  batchTaskLoading.value = true
  let success = 0
  let failed = 0
  try {
    for (const friend of selectedFriends.value) {
      try {
        await addTask(batchTaskForm.value.time, friend.name, batchTaskForm.value.text || null)
        success++
      } catch {
        failed++
      }
    }
    if (failed === 0) {
      ElMessage.success(`批量创建成功，共 ${success} 个任务`)
    } else {
      ElMessage.warning(`完成：成功 ${success} 个，失败 ${failed} 个`)
    }
    batchTaskDialogVisible.value = false
    cancelSelection()
  } finally {
    batchTaskLoading.value = false
  }
}
</script>

<style scoped>
.friends-container {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.selected-friends {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  max-height: 120px;
  overflow-y: auto;
}

.selected-friends .label {
  font-weight: 500;
  margin-right: 8px;
  white-space: nowrap;
}

.selected-friends .empty-hint {
  color: #999;
  font-size: 14px;
}

.search-bar {
  margin-bottom: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  :deep(.el-table) {
    font-size: 14px;
  }

  :deep(.el-button) {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>