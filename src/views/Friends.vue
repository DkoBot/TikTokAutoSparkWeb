<template>
  <div class="friends-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>好友列表</span>
          <el-button type="primary" :icon="Refresh" @click="loadFriends" :loading="loading">
            刷新
          </el-button>
        </div>
      </template>

      <!-- 搜索框 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索好友..."
          :prefix-icon="Search"
          clearable
          style="max-width: 300px"
        />
      </div>

      <!-- 好友列表 -->
      <el-table
        v-loading="loading"
        :data="filteredFriends"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
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
            <el-tag v-if="row.fire > 0" type="warning">{{ row.fire }}🔥</el-tag>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search, User, ArrowDown } from '@element-plus/icons-vue'
import { sendMessage, addTask } from '../api/douyin'
import { friendsList, setFriendsList } from '../stores/browser'

const loading = ref(false)
const searchKeyword = ref('')

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

const filteredFriends = computed(() => {
  if (!searchKeyword.value) return friendsList.value
  const keyword = searchKeyword.value.toLowerCase()
  return friendsList.value.filter(f => f.name.toLowerCase().includes(keyword))
})

// 刷新按钮 - 请求 API 获取最新数据
const loadFriends = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/Api/GetFriendsList')
    const data = await res.json()
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
</script>

<style scoped>
.friends-container {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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