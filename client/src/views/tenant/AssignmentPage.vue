<template>
  <div>
    <h1>人员分配</h1>
    <table v-if="!isLoading">
      <thead>
        <tr>
          <th>人员</th>
          <th>项目分配情况</th>
          <th>分配项目</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stuff in stuffs" :key="stuff._id">
          <td>{{ stuff.name }}</td>
          <td style="text-align: center; width: 50%">
            <PieChart :projects="showEditModal&&stuff === curStuff ? curProInfo : stuff.projects" :projectInfo="projectInfo"></PieChart>
          </td>
          <td style="text-align: center">
            <button @click="handleEditClicked(stuff)" class="btn-edit">编辑</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="isLoading" id="loadingText">加载中...</div>
    <div v-if="error">{{ error }}</div>
  </div>

  <ModalForm
    v-if="showEditModal"
    :isVisible="showEditModal"
    title1="分配项目"
    :formWidth="700"
    @close="showEditModal = false"
  >
    <form @submit.prevent="handleEditSubmit">
      <div class="form-row">
        <strong style="width: 100px">员工名称</strong>
        <label>{{ curStuff.name }}</label>
      </div>
      <!-- <div class="form-row">
        <strong style="width: 100px;">员工职务</strong>
        <label>{{ curStuff.position }}</label>
      </div> -->

      <!-- <h3>项目分配情况</h3> -->
      <table>
        <thead>
          <tr>
            <th>项目</th>
            <th>占比</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pj in curProjects" :key="pj.id">
            <td style="text-align: left;">{{ this.projectInfo[pj.id]?.path ?? '未知项目id' }}</td>
            <td>
              <input
                class="changeRatio"
                type="number"
                step="1"
                min="1"
                max="100"
                v-model="pj.ratio"
                style="text-align: right;"
                @change="handleRatioInput(pj)"
              />%
            </td>
            <td>
              <button type= "button" class="delButton" @click="removeProject(pj.id)">删除</button>
            </td>
          </tr>
          
          <!-- <tr>
            <th>添加项目</th>
            <th>占比</th>
            <th>添加</th>
          </tr> -->
          <tr style="background-color: #f0f0f0; ">
            <td>
              <select v-model="newProjectId" id="newProject">
                <option value="" disabled>添加新项目</option>
                <option
                  v-for="project in availableProjects"
                  :key="project._id"
                  :value="project._id"
                  :disabled="disabledText(project) !== ''"
                >
                  {{ (project.path ?? project.name) + disabledText(project) }}
                </option>
              </select>
            </td>
            <td>
              <input
                id="newRatio"
                type="number"
                step="1"
                min="0"
                max="100"
                v-model="newProjectRatio"
                style="text-align: right;"
                @change="handleNewProjectRatioInput"
              />%
            </td>
            <td>
              <button  type= "button" class="addButton"  @click="addProject">添加</button>
            </td>
          </tr>
          
        </tbody>
      </table>

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
import PieChart from '@/components/PieChart.vue'
import ModalForm from '@/components/ModalForm.vue'

export default {
  name: 'TenantTable',
  data() {
    return {
      stuffs: [],
      projectInfo: {},
      isLoading: false,
      error: null,
      showEditModal: false,
      curStuff: null,
      curProjects: [],
      newProjectId: '', // 新添加项目的ID
      newProjectRatio: 30 // 新添加项目的占比
    }
  },
  components: {
    PieChart,
    ModalForm
  },
  computed: {
    availableProjects() {
      const arr = Object.values(this.projectInfo)
      .filter((project) => {
        // 过滤不分配人员的项目
        // if (!project.needStaff) return false
        // 过滤已选的项目
        if (this.curProjects.some(p=> p.id === project._id)) return false
        // 过滤有子节点的根项目（应该选子项目）
        if (!this.projectInfo[project.parentProject] && project.subProjects?.length > 0) return false
        return true
      })
      arr.sort((a, b) => {
        if (this.disabledText(a) === '') return -1
        const aPath = a.path ?? a.name
        const bPath = b.path ?? b.name
        return aPath.localeCompare(bPath)
      })
      return arr
    },
    curProInfo() {
      return this.curProjects.reduce((acc, cur) => {
        acc[cur.id] = {ratio: cur.ratio/100};
        return acc;
      }, {})
    }
  },
  mounted() {
    this.fetchStuffData()
  },
  methods: {
    disabledText(pj) {
      if(!pj.needStaff) return '(不分配成员)'
      if (this.curProjects.some(p=> p.id === pj._id)) return '(已选)'
      if (!this.projectInfo[pj.parentProject] && pj.subProjects?.length > 0) return '(父项目)'
      return ''
    },
    getProjectName(id) {
      const pj = this.projectInfo[id]
      if (!pj) return '未知项目id'
      return pj.path ?? pj.name
    },
    // 限制修改范围
    handleRatioInput(pj) {
      let freeTime =
        100 -
        this.curProjects.reduce((acc, project) => {
          if (project !== pj) acc += Number(project.ratio)
          return acc
        }, 0)
      pj.ratio = Math.min(Math.max(pj.ratio, 1), freeTime)
      // 保留 2 位小数
      pj.ratio = Number(pj.ratio.toFixed(2))
    },
    // 限制修改范围
    handleNewProjectRatioInput() {
      const freeTime = 100 - this.curProjects.reduce((acc, project) => acc + Number(project.ratio), 0)
      this.newProjectRatio = Math.min(Math.max(this.newProjectRatio, 0), freeTime)
      // 保留 2 位小数
      this.newProjectRatio = Number(this.newProjectRatio.toFixed(2))
    },
    handleEditClicked(stuff) {
      this.curStuff = stuff
      this.curProjects = Object.entries(stuff.projects).map(([key, pj]) => {
        let ratio = Math.min(Math.max(Number(pj.ratio), 0), 1)
        if (isNaN(ratio)) ratio = 0
        ratio *= 100
        return { id: key, ratio }
      })
      this.showEditModal = true
      this.handleNewProjectRatioInput()
    },
    fillFormToCurStuff() {
      const projects = {}
      this.curProjects.forEach(({ id, ratio }) => {
        const r = ratio / 100;
        if (this.curStuff.projects[id]) {
          // 更新现有项目的 ratio
          projects[id] = { ratio: r, workHours: this.curStuff.projects[id].workHours }; 
        }
        //  else {
        //   // 创建新的项目条目
        //   projects[id] = { ratio: r, workHours: [] };
        // }
      });
      this.curStuff.projects = projects;
    },
    handleEditSubmit() {
      // 验证总和<=100
      if (this.curProjects.reduce((acc, project) => acc + Number(project.ratio), 0) > 100) {
        alert('分配比例总和必须<100%！')
        return
      }
      const assignment = this.curProjects.map((pj) => ({ id: pj.id, ratio: pj.ratio / 100 }))
      // 提交编辑，更新员工的项目分配
      this.fillFormToCurStuff();
      // console.log(assignment);
      api.updateAssignment(this.curStuff._id, assignment)
        .then(() => {
          // alert('人员分配保存成功！')
        })
        .catch((error) => {
          console.error('Error updating assignment:', error)
          const errInfo = error?.response?.data ?? error.message
          alert('人员分配保存失败！' + errInfo)
        })
      this.showEditModal = false
    },
    addProject() {
      if (this.newProjectId === '') {
        alert('请选择一个项目！')
        return
      }
      if (this.newProjectRatio <= 0) {
        alert('占比不能为0！')
        return
      }
      if (this.newProjectId && !this.curProjects[this.newProjectId]) {
        // 添加新的比例分配
        this.curProjects.push({ id:this.newProjectId, ratio: this.newProjectRatio })
        this.newProjectId = ''
        this.newProjectRatio = 30
        this.handleNewProjectRatioInput()
      }
    },
    removeProject(projectId) {
      this.curProjects = this.curProjects.filter(project => project.id !== projectId)
    },
    fetchStuffData() {
      this.isLoading = true
      api
        .getClientsAndProjects()
        .then((response) => {
          let { clients, projects } = response.data
          // 项目数组信息转对象，方便查找
          this.projectInfo = projects.reduce((acc, cur) => {
            acc[cur._id] = cur
            return acc
          }, {})
          // 读取员工列表
          api.getTenantStructAndStuffs().then((response) => {
            const { stuffs } = response.data
            stuffs.forEach(stuff=>{
              // 剔除Public项目以及ratio<=0的项目
              stuff.projects = Object.fromEntries(
                Object.entries(stuff.projects).filter(([key, value]) => (!value.isPublic && value.ratio > 0))
              );
            })
            // 员工数组信息转对象，方便查找
            this.stuffs = stuffs
          })
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
    }
  }
}
</script>

<style scoped>
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
