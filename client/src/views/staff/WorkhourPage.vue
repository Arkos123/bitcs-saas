<template>
  <div>
    <h1>工时登记</h1>
    <table v-if="!isLoading">
      <thead>
        <tr>
          <th>项目</th>
          <th>项目投入比</th>
          <th>工时登记</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(project, id) in projects" :key="id">
          <td style="text-align: left;">{{ getProjectName(projectInfo[id]) }}</td>
          <td>{{ project.ratio ===0 ? '父项目' : (project.isPublic ? '公共项目' : (project.ratio * 100 + '%')) }}</td>
          <td style="text-align: center">
            <button @click="handleEditClicked(projectInfo[id], project)" class="btn-edit">
              工时登记
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="isLoading" id="loaddddd">加载中...</div>
    <div v-if="error">{{ error }}</div>
  </div>

  <ModalForm
    :formWidth="700"
    v-if="showEditModal"
    :isVisible="showEditModal"
    title1="工时登记"
    @close="showEditModal = false"
  >
    <form @submit.prevent="handleEditSubmit">
      <div class="form-row">
        <strong style="width: 100px">项目名称</strong>
        <label>{{ getProjectName(curPjInfo) }}</label>
      </div>

      <!-- <h3>项目分配情况</h3> -->
      <div>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>工作日期</th>
              <th>工作时长</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, idx) in curWorkHoursForm" :key="'rc' + idx">
              <td>{{ idx + 1 }}</td>
              <td>
                <input type="date" required v-model="record.date" />
              </td>
              <td>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  v-model="record.hours"
                  @change="record.hours = Math.max(0.5, Math.min(12, record.hours))"
                />
              </td>
              <td
                class="notes-cell"
                @click="selectNotesCell(idx)"
                title="编辑备注"
                :class="{ 'selected-notes': selectedNotesIndex === idx }"
              >
                {{ truncate(record.notes, 8) }}
              </td>
              <td>
                <button type="button" class="delButton" @click="removeRecord(idx)">删除</button>
              </td>
            </tr>
            <tr style="background-color: #f0fff0">
              <td>添加新工时记录</td>
              <td>
                <input type="date" v-model="newRecord.date" />
              </td>
              <td>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  v-model="newRecord.hours"
                  @change="newRecord.hours = Math.max(0.5, Math.min(12, newRecord.hours))"
                />
              </td>
              <td class="notes-cell"
                @click="selectNotesCell(-1)"
                title="编辑备注"
                :class="{ 'selected-notes': selectedNotesIndex === -1 }"
                >{{ truncate(newRecord.notes, 8) }}</td>
              <td>
                <button type="button" class="addButton" @click="addRecord">添加</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 备注编辑器 -->
        <div v-if="selectedNotesIndex !== null" class="notes-editor">
          <label for="notes">编辑备注:</label>
          <textarea id="notes" ref="newNotesTextarea" v-if="selectedNotesIndex === -1" v-model="newRecord.notes"></textarea>
          <textarea id="notes" ref="notesTextarea" v-else v-model="curWorkHoursForm[selectedNotesIndex].notes"></textarea>
        </div>
      </div>

      <!-- <div class="form-row">
          <strong style="width: 100px;">空闲时间</strong>
          <label>{{ (100*().toFixed(0)}}%</label>
        </div> -->

      <div class="modal-buttons">
        <button type="submit" title="编辑完成">确定</button>
        <button type="button" title="取消标记" @click="showEditModal = false">取消</button>
      </div>
    </form>
  </ModalForm>
</template>

<script>
import api from '@/utils/api.js'
import ModalForm from '@/components/ModalForm.vue'

export default {
  name: 'TenantTable',
  data() {
    return {
      projects: {},
      projectInfo: {},
      isLoading: false,
      error: null,
      showEditModal: false,
      curPjInfo: null,
      curPjObj: {},
      curWorkHoursForm: [],
      newRecord: {
        date: this.formatDate(),
        hours: 1,
        notes: '无'
      },
      selectedNotesIndex: null
    }
  },
  components: {
    ModalForm
  },
  mounted() {
    this.fetchStuffData()
  },
  methods: {
    getProjectName(pj) {
      if (!pj) return '未知项目id'
      return pj.path ?? pj.name
    },
    selectNotesCell(index) {
      // 点击备注单元格时触发，设置选中的备注单元格索引
      this.selectedNotesIndex = this.selectedNotesIndex === index ? null : index
      if (this.selectedNotesIndex !== index) return
      this.$nextTick(() => {
        if (this.selectedNotesIndex === -1) {
          this.$refs.newNotesTextarea.focus()
        } else {
          this.$refs.notesTextarea?.focus()
        }
      })
    },
    truncate(text, len) {
      if (text.length > len) {
        return text.slice(0, len) + '...'
      } else {
        return text
      }
    },
    formatDate(date = new Date()) {
      if (typeof date === 'string') {
        if (date.includes('T')) return date.split('T')[0]
        return date
      }
      return date.toISOString().split('T')[0] // 取出日期部分
    },
    fetchStuffData() {
      this.isLoading = true
      api
        .getStuffData()
        .then(async (response) => {
          let { projects } = response.data
          // 当前员工项目信息
          this.projects = projects
          // 补充不分配人员的项目
          let publics;
          await api.getPublicProjectsAndPjs().then((response) => {
            publics = response.data.publics
            this.projectInfo = response.data.projects.reduce
              ((acc, cur) => {
              acc[cur._id.toString()] = cur
              return acc
            }, {})
            publics.forEach((pj) => {
              projects[pj._id.toString()] = { isPublic: true, ratio: -1, workHours: projects[pj._id.toString()]?.workHours ?? [] }
            })
          })
          Object.keys(projects).forEach((id) => {
             const pj = this.projectInfo[id]
              if (pj.rootProject) {
                // 添加根的工时记录
                projects[pj.rootProject] = { ratio: 0, workHours: projects[pj.rootProject]?.workHours ?? [] }
              }
            })
          // 如果是whRule 规则为root，则记录工时到root上，并剔除子项目
          // 如果是whRule 规则为all，添加root的记录
          Object.entries(this.projectInfo).forEach(([id, pj]) => {
              if (!pj.rootProject) {
                // 根项目,且记录到子项目，删除自己
                if (pj.whRule === 'leaf') {
                  delete projects[id]
                }
              }else {
                // 叶项目
                const rootPj = this.projectInfo[pj.rootProject]
                if (rootPj.whRule === 'root') {
                  delete projects[id]
                }
              }
            })
          // 记录其他工时
          projects.others = { isPublic: true, ratio: -1, workHours: projects.others?.workHours ?? [] }
          this.projectInfo.others = {_id: 'others' ,name: '其他工时登记'}
        })
        .catch((error) => {
          console.error('Error fetching data:', error.message)
          alert('获取数据失败。请重新登录！')
          api.clearCache()
          window.location.hash = '#login'
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    handleEditClicked(pjInfo, pj) {
      this.selectedNotesIndex = null
      if (pjInfo === 'other') {
        this.curPjInfo = {}
        this.curPjObj = pj
      } else {
        this.curPjInfo = pjInfo
        this.curPjObj = pj
      }
      this.curWorkHoursForm = pj.workHours.map((record) => {
        return {
          date: this.formatDate(record.date),
          hours: record.hours,
          notes: record.notes
        }
      })
      
      this.showEditModal = true
    },
    handleEditSubmit() {
      this.curPjObj.workHours = this.curWorkHoursForm
      // console.log(this.curPjInfo)
      // console.log(assignment);
      api
        .updateWorkHours({ projectId: this.curPjInfo._id, isPublic: !this.curPjInfo.needStaff,  workHours: this.curWorkHoursForm })
        .then(() => {
          alert('工时信息上传成功！')
        })
        .catch((error) => {
          console.error('Error updating workhours:', error)
          const errInfo = error?.response.data ?? error.message
          alert('工时信息保存失败！' + errInfo)
        })
      this.showEditModal = false
    },
    addRecord() {
      // 添加新的比例分配
      this.curWorkHoursForm.push({ ...this.newRecord })
      this.newRecord = {
        date: this.formatDate(),
        hours: this.newRecord.hours,
        notes: '无'
      }
    },
    removeRecord(idx) {
      this.curWorkHoursForm.splice(idx, 1)
    }
  }
}
</script>

<style scoped>
.notes-cell {
  cursor: pointer; /* 鼠标指针样式为手型 */
  padding: 8px;
  transition: background-color 0.3s; /* 背景色变化动画 */
}

.notes-cell:hover {
  background-color: #cceeff; /* hover时背景色变化 */
}

.selected-notes {
  background-color: lightblue; /* 选中时背景色 */
}
.notes-editor {
  margin-top: 10px;
}
.notes-editor textarea {
  width: 100%;
  height: 100px;
  resize: vertical; /* 垂直调整大小 */
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: center;
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  text-align: center;
  background-color: #f4f4f4;
}

.btn-edit {
  color: #fff;
  background-color: #007bff;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}
.btn-edit:hover {
  background-color: #0056b3;
}

/* .delButton
   {
    color: #fff;
    background-color: #dc3545;
    padding: 5px 8px;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
  }
  .delButton:hover {
    background-color: #c82333;
  } */
.addButton {
  color: #fff;
  background-color: #28a745;
  padding: 5px 8px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}
.addButton:hover {
  background-color: #218838;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.form-row label {
  text-align: left;
}

/* Optional: Centering the entire table */
/* div {
    text-align: center;
  } */
</style>
