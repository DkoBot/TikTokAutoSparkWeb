<template>
  <div class="tasks-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>定时任务管理</span>
          <div class="header-buttons">
            <el-button v-if="!selectionMode" type="primary" :icon="Refresh" @click="refreshAll" :loading="loading">
              刷新
            </el-button>
            <el-button v-if="!selectionMode" type="success" :icon="Plus" @click="openAddDialog">
              添加任务
            </el-button>
            <template v-if="selectionMode">
              <el-button type="primary" :icon="Refresh" @click="refreshAll" :loading="loading">
                刷新
              </el-button>
              <el-button type="danger" :icon="Delete" @click="handleBatchDelete" :loading="batchDeleteLoading">
                删除 ({{ selectedTasks.length }})
              </el-button>
              <el-button :icon="Close" @click="cancelSelection">
                取消
              </el-button>
            </template>
            <el-button v-if="!selectionMode && taskList.length > 0" :icon="Tickets" @click="selectionMode = true">
              多选
            </el-button>
          </div>
        </div>
      </template>

      <!-- 任务列表 -->
      <el-table
        v-loading="loading"
        :data="taskList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="selectionMode" type="selection" width="50" />
        <el-table-column type="index" label="序号" :width="selectionMode ? 80 : 60" />
        <el-table-column prop="name" label="好友" min-width="120" />
        <el-table-column prop="time" label="执行时间" width="100" />
        <el-table-column prop="next_run" label="下次执行" min-width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" size="small" @click="openEditDialog(row)">
              修改时间
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && taskList.length === 0" description="暂无定时任务">
        <el-button type="primary" @click="openAddDialog">添加第一个任务</el-button>
      </el-empty>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="好友">
          <el-select
            v-model="taskForm.name"
            placeholder="选择好友"
            filterable
            :disabled="dialogMode === 'edit'"
            style="width: 100%"
          >
            <el-option
              v-for="friend in availableFriends"
              :key="friend.name"
              :label="friend.name"
              :value="friend.name"
            />
          </el-select>
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
        <el-form-item v-if="dialogMode === 'add'" label="消息内容">
          <el-input
            v-model="taskForm.text"
            type="textarea"
            :rows="3"
            placeholder="留空将使用每日名言"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ dialogMode === 'add' ? '添加' : '修改' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Delete, Close, Tickets } from '@element-plus/icons-vue'
import { getTaskList, addTask, delTask, editTask, getFriendsList } from '../api/douyin'
import { friendsList as storeFriendsList, setFriendsList } from '../stores/browser'

const loading = ref(false)
const taskList = ref([])
const isFirstLoad = ref(true)

const selectionMode = ref(false)
const selectedTasks = ref([])
const batchDeleteLoading = ref(false)

const dialogVisible = ref(false)
const dialogMode = ref('add')
const submitLoading = ref(false)
const taskForm = ref({
  name: '',
  time: '',
  text: ''
})

const dialogTitle = computed(() => dialogMode.value === 'add' ? '添加定时任务' : '修改执行时间')

const availableFriends = computed(() => {
  // 过滤掉已有任务的好友
  const existingNames = taskList.value.map(t => t.name)
  return storeFriendsList.value.filter(f => !existingNames.includes(f.name))
})

// 页面加载时获取任务列表（首次加载才请求接口）
onMounted(async () => {
  if (isFirstLoad.value) {
    // 首次加载：请求接口并缓存
    await refreshAll()
    isFirstLoad.value = false
  } else {
    // 非首次加载：从缓存恢复
    const cached = localStorage.getItem('douyin_tasks')
    if (cached) {
      taskList.value = JSON.parse(cached)
    }
  }
})

// 刷新按钮 - 同时请求任务列表和好友列表
const refreshAll = async () => {
  loading.value = true
  try {
    const [tasksRes, friendsRes] = await Promise.all([
      getTaskList(),
      getFriendsList()
    ])

    // 更新任务列表
    if (tasksRes.code === 200) {
      const tasks = tasksRes.data.tasks || []
      taskList.value = tasks
      localStorage.setItem('douyin_tasks', JSON.stringify(tasks))
    }

    // 更新好友列表到 store
    if (friendsRes.code === 200) {
      const list = friendsRes.data.list || {}
      const formattedList = Object.entries(list).map(([name, [avatar, fire]]) => ({
        name,
        avatar,
        fire
      }))
      setFriendsList(formattedList)
    }
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  taskForm.value = {
    name: '',
    time: '',
    text: ''
  }
  dialogVisible.value = true
}

const openEditDialog = (task) => {
  dialogMode.value = 'edit'
  taskForm.value = {
    name: task.name,
    time: task.time,
    text: ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!taskForm.value.name && dialogMode.value === 'add') {
    ElMessage.warning('请选择好友')
    return
  }
  if (!taskForm.value.time) {
    ElMessage.warning('请选择时间')
    return
  }

  submitLoading.value = true
  try {
    if (dialogMode.value === 'add') {
      await addTask(taskForm.value.time, taskForm.value.name, taskForm.value.text || null)
      ElMessage.success('添加成功')
    } else {
      await editTask(taskForm.value.name, taskForm.value.time)
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    // 使用刷新方法更新任务列表
    await refreshAll()
  } catch (error) {
    ElMessage.error(dialogMode.value === 'add' ? '添加失败' : '修改失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (task) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${task.name} 的定时任务吗？`, '提示', {
      type: 'warning'
    })
    await delTask(task.task_id)
    ElMessage.success('删除成功')
    await refreshAll()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSelectionChange = (rows) => {
  selectedTasks.value = rows
}

const cancelSelection = () => {
  selectionMode.value = false
  selectedTasks.value = []
}

const handleBatchDelete = async () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择要删除的任务')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedTasks.value.length} 个任务吗？`, '批量删除', {
      type: 'warning'
    })
    batchDeleteLoading.value = true
    let success = 0
    let failed = 0
    for (const task of selectedTasks.value) {
      try {
        await delTask(task.task_id)
        success++
      } catch {
        failed++
      }
    }
    if (failed === 0) {
      ElMessage.success(`批量删除成功，共 ${success} 个`)
    } else {
      ElMessage.warning(`完成：成功 ${success} 个，失败 ${failed} 个`)
    }
    cancelSelection()
    await refreshAll()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  } finally {
    batchDeleteLoading.value = false
  }
}
</script>

<style scoped>
.tasks-container {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
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

  :deep(.el-dialog) {
    width: 95% !important;
  }
}
</style>