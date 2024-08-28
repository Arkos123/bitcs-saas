<template>
  <li class="tree-item">
    <div
      :class="{ bold: isFolder, [isFolder ? `layer${isInnerFolder ? 0 : Math.min(depth, 3)}` : 'layer3']: true }"
      :disabled="type === 'root'"
      @mouseover="showButton = true"
      @mouseleave="showButton = false"
      class="tree-item-content"
      @click.self="toggle"
    >
      <svg
        v-show="isFolder && type !== 'root'"
        @click.left="toggle"
        class="triangle-icon"
        :class="{ rotated: isOpen }"
        t="1720285851016"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
      >
        <path
          d="M320 194.88a64 64 0 0 1 103.296-50.56l407.744 317.184a64 64 0 0 1 0 100.992l-407.744 317.184A64 64 0 0 1 320 829.12v-634.24z"
        ></path>
      </svg>
      <div :class="{ foldername: isFolder }" @click.self="toggle">
        {{ model.name + '    ' }}
        <i v-if="type !== 'root'" style="color:gray;font-size:11px;">{{ getNameAtDepth(depth) }}</i>
      </div>
      <!-- <button v-if="isFolder" style = "margin-left: 10px;" @click.stop="toggle">
        编辑
      </button> -->
      <!-- 编辑按钮 -->
      <svg
        @click="editClicked"
        v-if="showButton && type !== 'root'"
        class="edit-icon"
        t="1720367734372"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4502"
        width="48"
        height="48"
      >
        <path
          d="M951 512h-62.7c-4.9 0-9 4-9 9v342.4c0 8.8-7.2 16-16 16H160.6c-8.8 0-16-7.2-16-16V160.6c0-8.8 7.2-16 16-16H503c4.9 0 9-4 9-9V73c0-4.9-4-9-9-9H99.8C80 64 64 80 64 99.8v824.3c0 19.8 16 35.8 35.8 35.8h824.3c19.8 0 35.8-16 35.8-35.8V521c0.1-5-4-9-8.9-9z"
          p-id="4503"
          fill="#2c2c2c"
        ></path>
        <path
          d="M337.2 537.6l-2.1 133.2c-0.1 10 8 18.1 17.9 18.1h0.4l132.2-3.2c2.2-0.1 4.5-1 6-2.6l465.8-464.8c3.5-3.5 3.5-9.2 0-12.7l-139.2-139c-1.8-1.8-4-2.6-6.4-2.6s-4.6 0.9-6.4 2.6L339.7 531.4c-1.5 1.7-2.5 3.9-2.5 6.2z m75.7 21.9l387.6-386.8c6.2-6.2 16.4-6.2 22.6 0l28 27.9c6.3 6.3 6.3 16.4 0 22.7l-387.9 387c-2.9 2.9-6.8 4.6-10.9 4.7l-28.2 0.7c-9.1 0.2-16.5-7.2-16.4-16.2 0.1-9.8 0.3-21.7 0.4-28.8 0.1-4.3 1.8-8.3 4.8-11.2z"
          p-id="4504"
          fill="#2c2c2c"
        ></path>
      </svg>

      <!-- 编辑客户 -->
      <ModalForm
        v-if="depth === 1 && showEditModal"
        :isVisible="showEditModal"
        title1="编辑客户"
        @close="showEditModal = false"
      >
        <form @submit.prevent="handleClientEditSubmit">
          <div class="form-row">
            <label>客户名称</label>
            <label>{{ model.name }}</label>
          </div>
          <div class="form-row">
            <label>客户电话</label>
            <label>{{ model.phone }}</label>
          </div>
          <div class="form-row">
            <label for="personnel">客户经理：</label>
            <select id="personnel" v-model="clientForm.accountManager" required>
              <option value="" disabled selected>请选择</option>
              <option v-for="pId in personnelOptions" :key="pId" :value="pId">
                {{ this.stuffInfo[pId].name }}
              </option>
            </select>
          </div>
          <div>
            <!-- <label for="his">变动历史：</label> -->
            <table class="table" id="his">
              <thead>
                <tr>
                  <th>变动历史</th>
                  <th>开始日期</th>
                  <th>结束日期</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, idx) in (clientForm.managerHistory)" :key="entry.id">
                  <td>{{ this.stuffInfo[entry.id]?.name ?? '未知人员id' }}</td>
                  <td>{{ formatDate(entry.dateStart) }}</td>
                  <td>{{ idx === clientForm.managerHistory.length - 1 ? '-' :formatDate(entry.dateEnd) }}</td>
                </tr>
                <tr v-if="clientForm.managerHistory.length===0">
                  <td colspan="3">暂无变动历史</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="form-row">
            <label for="delDept">删除客户</label>
            <button
              @click="deleteCurItem"
              type="button"
              class="deleteBut"
              id="delDept"
              title="删除"
            >
              删除客户
            </button>
          </div>

          <div class="modal-buttons">
            <button type="submit" title="编辑完成">确定</button>
            <button type="button" title="取消标记" @click="showEditModal = false">取消</button>
          </div>
        </form>
      </ModalForm>

      <!-- 编辑合同 -->
      <ModalForm
        v-if="depth === 2 && showEditModal"
        :isVisible="showEditModal"
        title1="编辑合同"
        @close="showEditModal = false"
      >
        <form @submit.prevent="handleContractEditSubmit">
          <div class="form-row">
            <label for="conName">合同名称</label>
            <input type="text" id="conName" v-model="contractForm.name" required />
          </div>
          <div class="form-row">
            <label for="personnel">销售人员：</label>
            <select id="personnel" v-model="contractForm.salesperson" required>
              <option value="" disabled selected>请选择</option>
              <option v-for="pId in personnelOptions" :key="pId" :value="pId">
                {{ this.stuffInfo[pId].name }}
              </option>
            </select>
          </div>
          
          <div>
            <!-- <label for="his2">变动历史：</label> -->
            <table class="table" id="his2">
              <thead>
                <tr>
                  <th>变动历史</th>
                  <th>开始日期</th>
                  <th>结束日期</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, idx) in (contractForm.managerHistory)" :key="entry.id">
                  <td>{{ this.stuffInfo[entry.id]?.name ?? '未知人员id' }}</td>
                  <td>{{ formatDate(entry.dateStart) }}</td>
                  <td>{{ idx === contractForm.managerHistory.length - 1 ? '-' :formatDate(entry.dateEnd) }}</td>
                </tr>
                <tr v-if="contractForm.managerHistory.length===0">
                  <td colspan="3">暂无变动历史</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="form-row">
            <label for="conStatus">合同状态：</label>
            <select id="conStatus" v-model="contractForm.status" required>
              <option value="on">启用</option>
              <option value="off">停止</option>
            </select>
          </div>
          <div class="form-row">
            <label for="delDept">删除合同</label>
            <button
              @click="deleteCurItem"
              type="button"
              class="deleteBut"
              id="delDept"
              title="删除"
            >
              删除合同
            </button>
          </div>

          <div class="modal-buttons">
            <button type="submit" title="编辑完成">确定</button>
            <button type="button" title="取消标记" @click="showEditModal = false">取消</button>
          </div>
        </form>
      </ModalForm>

      <!-- 编辑项目 -->
      <ModalForm
        v-if="type === 'project' && showEditModal"
        :isVisible="showEditModal"
        title1="编辑项目"
        @close="showEditModal = false"
      >
        <form @submit.prevent="handleProjectEditSubmit">
          <div class="form-row">
            <label for="pName">项目名称</label>
            <input type="text" id="pName" v-model="projectForm.name" required />
          </div>
          <div class="form-row">
            <label for="personnel">项目经理：</label>
            <select id="personnel" v-model="projectForm.manager" required>
              <option value="" disabled>请选择</option>
              <option v-for="pId in personnelOptions" :key="pId" :value="pId">
                {{ stuffInfo[pId].name }}
              </option>
            </select>
          </div>
          <div>
            <!-- <label for="his3">变动历史：</label> -->
            <table class="table" id="his3">
              <thead>
                <tr>
                  <th>变动历史</th>
                  <th>开始日期</th>
                  <th>结束日期</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, idx) in (projectForm.managerHistory)" :key="entry.id">
                  <td>{{ this.stuffInfo[entry.id]?.name ?? '未知人员id' }}</td>
                  <td>{{ formatDate(entry.dateStart) }}</td>
                  <td>{{ idx === projectForm.managerHistory.length - 1 ? '-' :formatDate(entry.dateEnd) }}</td>
                </tr>
                <tr v-if="projectForm.managerHistory.length===0">
                  <td colspan="3">暂无变动历史</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="form-row">
            <label for="dateStart">开始日期</label>
            <input type="date" id="dateStart" v-model="projectForm.dateStart" required />
          </div>
          <div class="form-row">
            <label for="dateEnd">结束日期</label>
            <input type="date" id="dateEnd" v-model="projectForm.dateEnd" required />
          </div>
          <div class="form-row">
            <label for="status">项目状态</label>
            <select id="status" v-model="projectForm.status" required>
              <option value="normal">开始</option>
              <option value="finished">结束</option>
              <option value="delayed">延迟</option>
            </select>
          </div>
          <div class="form-row">
            <label>公共项目：</label>
            <label>{{ projectForm.needStaff ? '否' : '是' }}</label>
          </div>
          <div class="form-row" v-if="!projectInfo[model.parentProject]">
            <label>工时填报规则：</label>
            <label> {{projectForm.whRule==='root'?'在本项目填报':(projectForm.whRule==='leaf'?'在子项目填报':'均可')}}</label>
          </div>
          <div class="form-row">
            <label for="delDept">删除项目</label>
            <button
              @click="deleteCurItem"
              type="button"
              class="deleteBut"
              id="delDept"
              title="删除"
            >
              删除项目
            </button>
          </div>

          <div class="modal-buttons">
            <button type="submit" title="编辑完成">确定</button>
            <button type="button" title="取消标记" @click="showEditModal = false">取消</button>
          </div>
        </form>
      </ModalForm>
    </div>
    <transition name="slide-fade">
      <ul v-show="isOpen" v-if="isFolder" class="folder">
        <TreeItem
          class="item"
          v-for="(childModel, index) in children"
          :key="index"
          :model="typeof childModel === 'string' ? this.projectInfo[childModel] : childModel"
          :curDict="children"
          :stuffInfo="stuffInfo"
          :projectInfo="projectInfo"
          :allClients="allClients"
          :depth="depth + 1"
          :ipj = "ipj"
        ></TreeItem>
        <li class="add" @click="showAddModal = true">
          + 添加{{ getNameAtDepth(depth + 1) }}
        </li>
      </ul>
    </transition>
  </li>

  <!-- 添加客户 -->
  <ModalForm
    v-if="depth === 0 && showAddModal"
    :isVisible="showAddModal"
    title1="添加客户"
    @close="showAddModal = false"
  >
    <form @submit.prevent="handleAddClientSubmit">
      <div class="form-row">
        <label for="conName">客户名称</label>
        <input type="text" id="conName" v-model="clientForm.name" required />
      </div>
      <div class="form-row">
        <label for="conPhone">客户电话</label>
        <input type="text" id="conPhone" v-model="clientForm.phone" required />
      </div>
      <div class="form-row">
        <label for="personnel">客户经理：</label>
        <select id="personnel" v-model="clientForm.accountManager" required>
          <option value="" disabled selected>请选择</option>
          <option v-for="pId in personnelOptions" :key="pId" :value="pId">
            {{ this.stuffInfo[pId].name }}
          </option>
        </select>
      </div>

      <div class="modal-buttons">
        <button type="submit" title="编辑完成">确定</button>
        <button type="button" title="取消标记" @click="showAddModal = false">取消</button>
      </div>
    </form>
  </ModalForm>

  <!-- 添加合同 -->
  <ModalForm
    v-if="depth === 1 && showAddModal"
    :isVisible="showAddModal"
    title1="添加合同"
    @close="showAddModal = false"
  >

    <form @submit.prevent="handleAddContractSubmit">
    <p>
      为<strong>{{ this.model.name }}</strong
      >添加新合同
    </p>
      <div class="form-row">
        <label for="conName">合同名称</label>
        <input type="text" id="conName" v-model="contractForm.name" required />
      </div>
      <div class="form-row">
        <label for="personnel">销售人员：</label>
        <select id="personnel" v-model="contractForm.salesperson" required>
          <option value="" disabled selected>请选择</option>
          <option v-for="pId in personnelOptions" :key="pId" :value="pId">
            {{ this.stuffInfo[pId].name }}
          </option>
        </select>
      </div>
      <div class="form-row">
        <label for="conStatus">合同状态：</label>
        <select id="conStatus" v-model="contractForm.status" required>
          <option value="on">启用</option>
          <option value="off">停止</option>
        </select>
      </div>

      <div class="modal-buttons">
        <button type="submit" title="编辑完成">确定</button>
        <button type="button" title="取消标记" @click="showAddModal = false">取消</button>
      </div>
    </form>
  </ModalForm>

  <!-- 添加项目 -->
  <ModalForm
    v-if="depth >= 2 && showAddModal"
    :isVisible="showAddModal"
    title1="添加项目"
    @close="showAddModal = false"
  >
    <form @submit.prevent="handleAddProjectSubmit">
      <p>
        为<strong>{{ this.model.name }}</strong
        >添加新项目
      </p>
      <div class="form-row">
        <label for="pName">项目名称</label>
        <input type="text" id="pName" v-model="projectForm.name" required />
      </div>
      <div class="form-row">
        <label for="personnel">项目经理：</label>
        <select id="personnel" v-model="projectForm.manager" required>
          <option value="" disabled>请选择</option>
          <option v-for="pId in personnelOptions" :key="pId" :value="pId">
            {{ stuffInfo[pId].name }}
          </option>
        </select>
      </div>
      <div class="form-row">
        <label for="dateStart">开始日期</label>
        <input type="date" id="dateStart" v-model="projectForm.dateStart" required />
      </div>
      <div class="form-row">
        <label for="dateEnd">结束日期</label>
        <input type="date" id="dateEnd" v-model="projectForm.dateEnd" required />
      </div>
      <div class="form-row">
        <label for="status">项目状态</label>
        <select id="status" v-model="projectForm.status" required>
          <option value="normal">正常</option>
          <option value="finished">已完成</option>
          <option value="delayed">延迟</option>
        </select>
      </div>
      <div class="form-row">
        <label for="needStaff">公共项目：</label>
        <select id="needStaff" v-model="projectForm.needStaff" required>
          <option :value="true">否</option>
          <option :value="false">是</option>
        </select>
      </div>
      <div class="form-row" v-if="depth===2">
        <label for="whr">工时填报规则：</label>
        <select id="whr" v-model="projectForm.whRule" required>
          <option value="root">在本项目填报</option>
          <option value="leaf">在子项目填报</option>
          <option value="all">均可</option>
        </select>
      </div>

      <div class="modal-buttons">
        <button type="submit" title="编辑完成">确定</button>
        <button type="button" title="取消标记" @click="showAddModal = false">取消</button>
      </div>
    </form>
  </ModalForm>
</template>

<script>
import api from '@/utils/api'
import ModalForm from '@/components/ModalForm.vue'

export default {
  name: 'TreeItem',
  props: {
    model: Object,
    stuffInfo: Object,
    projectInfo: Object,
    ipj: Array,
    allClients: Array,
    curDict: Array,
    isInnerFolder: Boolean,
    depth: {
      type: Number,
      default: 0
    }
  },
  components: {
    ModalForm
  },
  data() {
    return {
      showButton: false,
      showEditModal: false,
      isOpen: this.depth === 0||this.isInnerFolder ? true : false,
      showAddModal: false,
      clientForm: {
        name: '新客户',
        phone: '13855556666',
        accountManager: '',
        managerHistory: []
      },
      contractForm: {
        name: '新合同',
        salesperson: '',
        status: 'on',
        managerHistory: []
      },
      projectForm: {
        name: '新项目',
        manager: '',
        dateStart: this.formatDate(),
        dateEnd: this.formatDate(new Date(new Date().setDate(new Date().getDate() + 3))),
        status: 'normal',
        managerHistory: [],
        parentProject: null,
        subProjects: [],
        rootProject: null,
        needStaff: true,
        whRule: 'all',
      }
    }
  },
  computed: {
    isEndBeforeStart() {
      if (!this.projectForm.dateStart || !this.projectForm.dateEnd) {
        return false; // 如果日期未填写，则不进行验证
      }
      const startDate = new Date(this.projectForm.dateStart);
      const endDate = new Date(this.projectForm.dateEnd);
      return endDate < startDate;
    },
    children() {
      switch (this.depth) {
        case 0:
          return this.model.clients
        case 1:
          return this.model.contracts
        case 2:
          return this.model.projects
        default:
          return this.model.subProjects
      }
    },
    type() {
      if (this.isInnerFolder) return 'root'
      switch (this.depth) {
        case 0:
          return 'root'
        case 1:
          return 'client'
        case 2:
          return 'contract'
        case 3:
          return 'project'
        default:
          return 'project'
      }
    },
    isFolder() {
      return true //this.depth < 3
    },
    personnelOptions() {
      return Object.keys(this.stuffInfo)
    }
  },
  methods: {
    formatDate(date = new Date()) {
      if (typeof date === 'string') {
        if(date.includes('T')) return date.split('T')[0]
        return date
      }
      return date.toISOString().split('T')[0]; // 取出日期部分
    },
    getNameAtDepth(d) {
      switch (d) {
        case 0:
          return '根'
        case 1:
          return '客户'
        case 2:
          return '合同'
        case 3:
          return '项目'
        default:
          return '子项目'
      }
    },
    async deleteCurItem() {
      switch(this.type) {
        case 'client':
          if (!confirm('确定要删除此客户及下属合同、项目？此操作不可撤销！')) return
          this.curDict.splice(this.curDict.indexOf(this.model), 1)
          // 删除项目的同时，从项目表移除、从员工工时表移除
          break
        case 'contract':
          if (!confirm('确定要删除此合同及下属项目？此操作不可撤销！')) return
          this.curDict.splice(this.curDict.indexOf(this.model), 1)
          // 删除项目的同时，从项目表移除、从员工工时表移除
          break
        case 'project':
        if (!confirm('确定要删除此项目以及子项目？此操作不可撤销！')) return
          // 移除项目id
          this.curDict.splice(this.curDict.indexOf(this.model._id), 1)
          // await api.deleteProject(this.model._id)
          break
        default:
          break
      }
      this.saveClientsData()
      this.showEditModal = false
    },
    modelToForm() {
      switch(this.type) {
        case 'client':
          this.clientForm.name= this.model.name
          this.clientForm.phone = this.model.phone
          this.clientForm.accountManager = this.model.accountManager
          this.clientForm.managerHistory = this.model.managerHistory ?? []
          break
        case 'contract':
          this.contractForm.name = this.model.name
          this.contractForm.salesperson = this.model.salesperson
          this.contractForm.status = this.model.status
          this.contractForm.managerHistory = this.model.managerHistory ?? []
          break
        case 'project':
          this.projectForm.name = this.model.name
          this.projectForm.manager = this.model.manager
          this.projectForm.dateStart = this.formatDate(this.model.dateStart)
          this.projectForm.dateEnd = this.formatDate(this.model.dateEnd)
          this.projectForm.status = this.model.status
          this.projectForm.managerHistory = this.model.managerHistory ?? []
          // this.projectForm.parentProject = null,
          // this.projectForm.subProjects: [],whRule
          this.projectForm.needStaff = this.model.needStaff ?? true
          this.projectForm.whRule = this.model.whRule ?? 'all'
          break
        default:
          break
      }
    },
    formToModel() {
      switch(this.type) {
        case 'client':
          this.model.name = this.clientForm.name
          this.model.phone = this.clientForm.phone
          this.model.accountManager = this.clientForm.accountManager
          this.model.managerHistory = this.appendHistory(this.model.managerHistory, this.clientForm.accountManager)
          // this.model.managerHistory = this.clientForm.managerHistory ?? []
          break
        case 'contract':
          this.model.name = this.contractForm.name
          this.model.salesperson = this.contractForm.salesperson
          this.model.status = this.contractForm.status
          this.model.managerHistory = this.appendHistory(this.model.managerHistory, this.contractForm.salesperson)
          break
        case 'project':
          this.model.name = this.projectForm.name
          this.model.manager = this.projectForm.manager
          this.model.dateStart = this.formatDate(this.projectForm.dateStart)
          this.model.dateEnd = this.formatDate(this.projectForm.dateEnd)
          this.model.status = this.projectForm.status
          this.model.managerHistory = this.appendHistory(this.model.managerHistory, this.projectForm.manager)
          // this.model.managerHistory = this.projectForm.managerHistory
          // this.projectForm.parentProject = null,
          // this.projectForm.subProjects: [],
          this.model.needStaff = Boolean(this.projectForm.needStaff)
          this.model.whRule = this.projectForm.whRule
          break
        default:
          break
      }
    },
    // 弹出编辑框
    editClicked(e) {
      this.modelToForm()
      this.showEditModal = true
      e.stopPropagation()
    },
    handleClientEditSubmit() {
      if (!this.validateClient(this.curDict)) return
      this.formToModel()
      this.saveClientsData()
      this.showEditModal = false
    },
    handleContractEditSubmit() {
      if (!this.validateContract(this.curDict)) return
      this.formToModel()
      this.saveClientsData()
      this.showEditModal = false
    },
    handleProjectEditSubmit() {
      if (!this.validateProject(this.curDict)) return
      this.formToModel()
      // 保存项目信息到数据库
      api.updateProjectData(this.model)
        .then(() => {
          alert("项目信息修改成功！")
        })
        .catch((error) => {
          console.error('Error updating clients struct:', error)
          const errInfo = error?.response.data ?? error.message
          alert('项目信息修改失败！' + errInfo)
        })
      this.showEditModal = false
    },

    validateClient(clis = this.model.clients) {
      if (clis.some((item) => item !== this.model && item.name === this.clientForm.name)) {
        alert(`已存在名为 "${this.clientForm.name}" 的客户！`)
        return
      }
      return true
    },
    async handleAddClientSubmit() {
      // 验证表单，是否已有同名客户
      if (!this.validateClient()) return
      // 验证电话号码
      if (!this.clientForm.phone.match(/^1[3-9]\d{9}$/)) {
        alert('请输入正确的11位手机号码！')
        return
      }
      // 添加到结构中
      this.model.clients.push({
        ...this.clientForm,
        contracts: [], 
        managerHistory: this.appendHistory([], this.clientForm.accountManager)
      })
      // 添加完毕，同步云端数据
      this.saveClientsData()
      this.isOpen = true
      this.showAddModal = false
    },
    validateContract(cons = this.model.contracts) {
      // 验证表单，是否已有同名项目
      if (cons.some((item) => item !== this.model && item.name === this.contractForm.name)) {
        alert(`已存在名为 "${this.contractForm.name}" 的合同！`)
        return
      }
      return true
    },
    async handleAddContractSubmit() {
      // 验证表单，是否已有同名合同
      if (!this.validateContract()) return
      // 添加到结构中
      this.model.contracts.push({
        ...this.contractForm,
        projects: [], 
        managerHistory: this.appendHistory([], this.contractForm.salesperson)
      })
      // 添加完毕，同步云端数据
      this.saveClientsData()
      this.isOpen = true
      this.showAddModal = false
    },
    validateProject(pjs) {
      // 验证表单，是否已有同名项目
      if (!pjs) pjs = this.children ?? []
      let sameName = false
      if (pjs.length > 0) {
        if (typeof pjs[0] === 'string') {
          sameName = pjs.some((item) => item !== this.model._id && this.projectInfo[item]?.name === this.projectForm.name)
        } else {
          sameName = pjs.some((item) => item !== this.model && item.name === this.projectForm.name)
        }
      }
      if (sameName) {
        alert(`已存在名为 "${this.projectForm.name}" 的项目！`)
        return false
      }
      if (this.isEndBeforeStart){
        alert('项目结束日期不能早于开始日期！')
        return false
      }
      return true
    },
    appendHistory(his, staffId) {
      if (!his) his = []
      const foreverDate = new Date('9999-12-31T23:59:59.999Z')
      const record = {
        id: staffId, // 人员id
        dateStart: this.formatDate(), // 开始日期
        dateEnd: this.formatDate(foreverDate), // 结束日期
      }
      if (his.length > 0) {
        // 上一任是同一个员工，不修改
        if (his[his.length - 1].id === staffId) {
          return his
        }
        // 上一个记录的结束日期为当前日期
        his[his.length - 1].dateEnd = this.formatDate(new Date())
      }
      his.push(record)
      return his
    },
    async handleAddProjectSubmit() {
      if (!this.validateProject()) return
      // 注册项目
      await api.registerProject({
        ...this.projectForm,
        parentProject: this.model._id,
        rootProject: (this.type!=='project') ? null : (this.model.rootProject ?? this.model._id),
        managerHistory: this.appendHistory([], this.projectForm.manager)})
        .then(response => {
          // 项目创建成功
          const newPId = response.data._id;
          this.projectInfo[newPId] = response.data;
          // 添加到结构中
          this.children.push(newPId)
          // 添加完毕，同步云端数据
          if (this.type === 'project') {
            // 子项目
            api.updateProjectData(this.model)
              .then(() => {
                alert("项目信息修改成功！")
              })
              .catch((error) => {
                console.error('Error updating clients struct:', error)
                const errInfo = error?.response.data ?? error.message
                alert('项目信息修改失败！' + errInfo)
              })
          } else {
            // 更新结构
            this.saveClientsData()
          }
          this.isOpen = true
          this.showAddModal = false
        }).catch(error => {
          console.error('Error registering new projects:', error);
          const errInfo = error?.response?.data ?? error.message;
          alert('注册项目失败！ '+ errInfo);
        })
    },
    toggle() {
      if (this.isFolder && this.type !== 'root') {
        this.isOpen = !this.isOpen
      }
    },
    /**
     * 保存客户信息（会自动检查删除的项目并处理级联删除）
     */
    async saveClientsData(successText = '保存成功！', errorText = '更新失败！') {
      return api
        .updateClientsData(this.allClients, this.ipj)
        .then(() => {
          alert(successText)
        })
        .catch((error) => {
          console.error('Error updating clients struct:', error)
          const errInfo = error?.response.data ?? error.message
          alert(errorText + errInfo)
        })
    }
  }
}
</script>

<style scoped>

.tree-item {
  list-style-type: none;
  /* 去除列表项前面的圆点 */
  /* 添加边缘 */
  /* margin-bottom: 5px; */
  /* 增加间距 */
  overflow: hidden; /* 确保内容超出部分被隐藏 */
}

.error-message {
  color: red;
  margin-top: 5px;
}

.tree-item-content {
  /* line-height: 1.5; */
  border-bottom: 1px solid #dee2e6; /* 添加分割线 */
  position: relative; /* 需要相对定位，以便子元素可以绝对定位 */
  /* cursor: pointer; */
  display: flex;
  align-items: center;
  padding-right: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  /* background-color: #f9f9f9; */
  /* border: 1px solid #6d6d6d; */
  border-radius: 4px;
  /* 添加背景颜色 */
  transition: background-color 0.3s ease; /* 添加背景颜色过渡效果 */
}

.tree-item-content:hover {
  background-color: #f1f1f1; /* 悬停效果 */
}

.edit-button {
  border: 1px solid #ccc;
  /* 添加边缘 */
  background-color: #eee;
  /* 添加背景颜色 */
  color: #333;
  /* 文字颜色 */
  font-size: 1rem;
  margin-right: 5px;
}

.bold {
  font-weight: bold;
  background-color: #e9e9e9;
}

.folder {
  border: 1px solid #ddd;
  list-style-type: none;
  /* 去除列表项前面的圆点 */
  padding: 0%;
  padding-left: 1%;
  /* box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); */
  /* 去除默认缩进 */
}
/* 过渡效果定义 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.add {
  cursor: pointer;
  color: #007bff;
  /* font-weight: bold; */
  margin-top: 5px;
  margin-bottom: 5px;
  border: 1px solid #007bff;
  /* 添加边缘 */
  padding: 4px 8px;
  /* 添加内边距 */
  border-radius: 4px;
  /* 圆角 */
  background-color: #fff;
  /* 背景颜色 */
}

.add:hover {
  background-color: #007bff;
  /* 悬停时的背景颜色 */
  color: #fff;
  /* 文字颜色 */
}

.item {
  /* cursor: pointer; */
  line-height: 1.5;
}

.foldername:hover {
  text-decoration: underline;
  cursor: pointer;
}

.triangle-icon {
  width: 1.2rem; /* 放大图标 */
  height: 0.8rem; /* 缩小高度 */
  padding-left: 0%;
  fill: #888; /* 图标颜色 */
  transition: transform 0.2s ease-in-out; /* 添加动画效果 */
}

.edit-icon {
  width: 1rem; /* 放大图标 */
  height: 1rem; /* 缩小高度 */
  margin-left: 1%;
  cursor: pointer;
}

.triangle-icon.rotated {
  transform: rotate(90deg); /* 展开状态时旋转90度 */
}

.form-group {
  margin-top: 10px;
}
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.form-row label {
  width: 120px; /* 可以根据需要调整 */
  /* margin-right: 10px; */
}
.form-row input {
  flex: 1;
}

.layer0 {
  /* 主层级样式，例如主部门 */
  text-decoration: none;
  font-size: 1.2rem;
  line-height: 1.6;
  padding: 12px;
  cursor: default;
}

.layer1 {
  /* 子部门样式 */
  font-size: 1rem;
  line-height: 1.6;
  padding: 10px;
}

.layer2 {
  /* 员工样式 */
  font-size: 1rem;
  line-height: 1.4;
  padding: 8px;
}
.layer3 {
  /* 员工样式 */
  font-size: 0.9rem;
  line-height: 1.2;
  padding: 8px;
  background-color: #ffffff;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.deleteBut {
  background-color: #f44336; /* 红色背景 */
  color: white; /* 白色文本 */
  border: none; /* 没有边框 */
  padding: 5px 5px; /* 内边距 */
  cursor: pointer; /* 鼠标指针样式 */
  border-radius: 5px; /* 圆角边框 */
  outline: none; /* 移除默认的轮廓样式 */
}

.deleteBut:hover {
  background-color: #d32f2f; /* 鼠标悬停时的背景色 */
}

.deleteBut:active {
  background-color: #b71c1c; /* 按下时的背景色 */
}

.table {
  width: 80%;
  border-collapse: collapse;
  margin: 10px;
}

.table th, .table td {
  border: 1px solid #ddd;
  padding: 6px;
}

.table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #f2f2f2;
  color: black;
}
</style>
