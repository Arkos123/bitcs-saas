<template>
  <li class="tree-item">
    <div
      :class="{ bold: isFolder, [isFolder ? `layer${Math.min(depth, 3)}` : 'layer3']: true }"
      :disabled = "depth === 0"
      @mouseover="showButton = true" @mouseleave="showButton = false"
      class="tree-item-content"
      @click.self="toggle"
    >
    <svg v-show="isFolder&&depth > 0"
      @click.left="toggle"
        class="triangle-icon"
        :class="{ rotated: isOpen }"
       t="1720285851016" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
      <path d="M320 194.88a64 64 0 0 1 103.296-50.56l407.744 317.184a64 64 0 0 1 0 100.992l-407.744 317.184A64 64 0 0 1 320 829.12v-634.24z"></path>
    </svg>
      <!-- <button v-if="isFolder" class="toggle-button" @click.stop="toggle">
        {{ isOpen ? '-' : '+' }}
      </button> -->
      <div :class="{ foldername: isFolder }" 
      @click.self="toggle">
      {{ model.type === 'stuff' ? ((this.stuffInfo[model.id]?.gender==='female')? '👩🏻 ':'👨🏻 ') +this.stuffInfo[model.id]?.name ?? "人员名字获取失败" : model.name +'    '}}
      <i v-if="depth>0" style="color:gray;font-size:11px;">{{ isFolder ? "部门" : (this.stuffInfo[model.id]?.position ?? "职位获取失败") }}</i>
      </div>
      <!-- <button v-if="isFolder" style = "margin-left: 10px;" @click.stop="toggle">
        编辑
      </button> -->
      <!-- 编辑按钮 -->
      <svg @click="editClicked" v-if="showButton&&depth > 0" class="edit-icon" t="1720367734372"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4502" width="48" height="48"><path d="M951 512h-62.7c-4.9 0-9 4-9 9v342.4c0 8.8-7.2 16-16 16H160.6c-8.8 0-16-7.2-16-16V160.6c0-8.8 7.2-16 16-16H503c4.9 0 9-4 9-9V73c0-4.9-4-9-9-9H99.8C80 64 64 80 64 99.8v824.3c0 19.8 16 35.8 35.8 35.8h824.3c19.8 0 35.8-16 35.8-35.8V521c0.1-5-4-9-8.9-9z" p-id="4503" fill="#2c2c2c"></path><path d="M337.2 537.6l-2.1 133.2c-0.1 10 8 18.1 17.9 18.1h0.4l132.2-3.2c2.2-0.1 4.5-1 6-2.6l465.8-464.8c3.5-3.5 3.5-9.2 0-12.7l-139.2-139c-1.8-1.8-4-2.6-6.4-2.6s-4.6 0.9-6.4 2.6L339.7 531.4c-1.5 1.7-2.5 3.9-2.5 6.2z m75.7 21.9l387.6-386.8c6.2-6.2 16.4-6.2 22.6 0l28 27.9c6.3 6.3 6.3 16.4 0 22.7l-387.9 387c-2.9 2.9-6.8 4.6-10.9 4.7l-28.2 0.7c-9.1 0.2-16.5-7.2-16.4-16.2 0.1-9.8 0.3-21.7 0.4-28.8 0.1-4.3 1.8-8.3 4.8-11.2z" p-id="4504" fill="#2c2c2c"></path></svg>
          
      <!-- 添加模态框 -->
      <ModalForm v-if="isFolder" :isVisible="showEditModal" title1="编辑部门" @close="showEditModal = false" >
            <form @submit.prevent="handleDeptEditSubmit">
                
              <div class="form-row">
                <label for="subDepartmentName">部门名称</label>
                <input type="text" id="subDepartmentName" v-model="addForm.subDepartmentName" required />
              </div>
              <div class="form-row">
                <label for="delDept">删除部门</label>
                <button @click="deleteCurItem" type="button" class="deleteBut" id="delDept" title="删除">删除部门</button>
              </div>

              <div class="modal-buttons">
                <button type="submit" title="编辑完成">确定</button>
                <button type="button" title="取消标记" @click="showEditModal = false">取消</button>
              </div>
            </form>
      </ModalForm>
      <ModalForm v-if="!isFolder" :isVisible="showEditModal" title1="编辑人员" @close="showEditModal = false" >
            <form @submit.prevent="handleStuffEditSubmit">
                
            <!-- <div class="form-row">
              <label>员工ID</label>
              <label class="copyable" style="width:200px" title="复制" @click="copyText(model.id)">{{ model.id }}</label>
            </div> -->
            <div class="form-row">
              <label>员工名称</label>
              <label>{{ this.stuffInfo[model.id]?.name ?? "人员名字获取失败" }}</label>
            </div>
            <div class="form-row">
              <label>员工电话</label>
              <label>{{ this.stuffInfo[model.id]?.phone ?? "电话获取失败" }}</label>
            </div>
            <div class="form-row">
              <label>账号密码</label>
              <button type="button" title="复制" @click="copyAccount">复制</button>
            </div>
            <div class="form-group">
              <div class="form-row">
                <label for="newEPos">职务</label>
                <input type="text" id="newEPos" v-model="addForm.newStuffInfo.position" required />
              </div>
            </div>
              <div class="form-row">
                <label for="delStuff">解雇员工</label>
                <button @click="deleteCurItem" type="button" class="deleteBut" id="delStuff" title="删除">解雇员工</button>
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
        v-for="(childModel, index) in model.stuffs"
        :key="index"
        :model="childModel"
        :curDict="model.stuffs"
        :stuffInfo = "stuffInfo"
        :allStruct = "allStruct"
        :depth="depth + 1"
      ></TreeItem>
      <li class="add" @click="showAddModal = true">+ 添加{{depth<2?'子部门/人员':'子部门/人员'}}</li>
    </ul>
  </transition>
  </li>
  <!-- 添加模态框 -->
  <ModalForm :isVisible="showAddModal" title1="添加子部门/人员" @close="showAddModal = false" >
        <form @submit.prevent="handleAddSubmit">
          <p>为<strong>{{ this.model.name }}</strong>添加子部门/人员</p>
          <label for="type">添加类型：</label>
          <select id="type" v-model="addForm.selectedType">
            <option value="子部门">子部门</option>
            <option value="人员">人员</option>
          </select>

          <div v-if="addForm.selectedType === '子部门'" class="form-group">
            <label for="subDepartmentName">子部门名称：</label>
            <input type="text" id="subDepartmentName" v-model="addForm.subDepartmentName" required />
          </div>
          
          <div v-if="addForm.selectedType === '人员'" class="form-group">
            <label for="personnel">人员：</label>
            <select id="personnel" v-model="addForm.personnel">
              <option value="" disabled selected>请选择</option>
              <option value="新员工">+ 注册新员工信息</option>
              <!-- 其他人员选项可以从父组件传递或者动态加载 -->
              <option v-for="pId in personnelOptions" :key="pId" :value="pId">{{ this.stuffInfo[pId].name }}</option>
            </select>
            
            <div v-if="addForm.personnel === '新员工'" class="form-group">
              <div class="form-row">
                <label for="newEmployeeName">名称</label>
                <input type="text" id="newEmployeeName" v-model="addForm.newStuffInfo.name" required />
              </div>
              <div class="form-row">
                <label for="newEmployeePhone">电话</label>
                <input type="text" id="newEmployeePhone" v-model="addForm.newStuffInfo.phone" required />
              </div>
              <div class="form-row">
                <label for="newEmployeePos">职务</label>
                <input type="text" id="newEmployeePos" v-model="addForm.newStuffInfo.position" required />
              </div>
              <div class="form-row">
                <label for="newEmployeePassword">密码</label>
                <input type="password" id="newEmployeePassword" v-model="addForm.newStuffInfo.password" required />
              </div>
            </div>

          </div>

          <div class="modal-buttons">
            <button type="submit" title="确定创建">确定</button>
            <button type="button" title="取消创建" @click="showAddModal = false">取消</button>
          </div>
        </form>
  </ModalForm>
</template>

<script>
import api from '@/utils/api';
import ModalForm from '@/components/ModalForm.vue';
import { model } from 'mongoose';

export default {
  name: 'TreeItem',
  props: {
    model: Object,
    stuffInfo: Object,
    allStruct: Array,
    curDict: Array,
    depth: {
      type: Number,
      default: 0
    }
  },
  components: {
    ModalForm,
  },
  data() {
    return {
      showButton: false,
      showEditModal: false,
      isOpen: this.depth === 0 ? true : false,
      showAddModal: false,
      addForm: {
        selectedType: '子部门',
        subDepartmentName: '',
        personnel: '',
        newStuffInfo: {
          name: '',
          phone: '',
          position: '',
          password: '',
        }
      },
    }
  },
  computed: {
    isFolder() {
      return this.model.type === 'dept'
    },
    personnelOptions() {
      return Object.keys(this.stuffInfo);
    }
  },
  methods: {
    copyAccount() {
      const text = '员工ID：'+(this.stuffInfo[this.model.id]?._id ?? '')+'\n密码：'+(this.stuffInfo[this.model.id]?.password ?? '')
        navigator.clipboard.writeText(text).then(() => {
        alert('已复制员工账号到剪贴板！\n'+text);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    },
    deleteCurItem() {
      if( this.model.type === 'dept') {
        if (!confirm('确定要删除此部门及下属员工/部门？此操作不可撤销！')) {
          return
        }
        this.curDict.splice(this.curDict.indexOf(this.model), 1);
      } else {
        if (!confirm('确定要开除员工？')) {
          return
        }
        // 开除员工
        this.removeIdFromStruct(this.model.id);
      }
      this.saveStruct();
      this.showEditModal=false;
    },
    async handleStuffEditSubmit() {
      const newPos = this.addForm.newStuffInfo.position
      // const newPassword = this.addForm.newStuffInfo.password
      // if ( === newPos) {
      //   alert("信息未改变！")
      //   return
      // }
      this.stuffInfo[this.model.id].position = newPos;
      // this.stuffInfo[this.model.id].password = newPassword;
      api.updateStuffInfo({_id: this.model.id, position: newPos })
      .then(() => {
          alert('保存成功！');
        })
        .catch(error => {
          console.error('Error updating stuff info:', error);
          const errInfo = error?.response.data ?? error.message;
          alert('更新失败！ '+ errInfo);
        });
      this.showEditModal=false;
    },
    async handleDeptEditSubmit() {
      const newName = this.addForm.subDepartmentName
      if (this.model.name === newName) {
        alert("名称未改变！")
        return
      }
      if (this.curDict.some(item => item.name === newName)) {
        alert(`已存在名为 "${newName}" 的部门`)
        return
      }
      this.model.name = this.addForm.subDepartmentName;
      this.saveStruct();
      this.showEditModal=false;
    },
    // // 弹出编辑框
    editClicked(e) {
      if(this.model.type === 'dept') this.addForm.subDepartmentName = this.model.name;
      else {
        this.addForm.newStuffInfo.position = this.stuffInfo[this.model.id]?.position ?? '';
        this.addForm.newStuffInfo.password = this.stuffInfo[this.model.id]?.password ?? '';
      }
      this.showEditModal=true;
      e.stopPropagation();
    },
    removeIdFromStruct(id, struct = this.allStruct) {
    for (const item of struct) {
      if (item.type === 'stuff' && item.id === id) {
        // 从结构中删除
        const index = struct.indexOf(item);
        struct.splice(index, 1);
      } else if (item.type === 'dept') {
        // 如果当前项是部门（dept），递归删除部门中的员工信息
        this.removeIdFromStruct(id, item.stuffs);
      }
    }
  },
    async handleAddSubmit() {
      if (this.addForm.selectedType === '子部门') {
        await this.addChild(this.addForm.subDepartmentName, 'dept')
      } else if (this.addForm.personnel === '新员工') {
        // 创建新员工
        // 验证手机号格式
        if (!this.addForm.newStuffInfo.phone.match(/^1[3-9]\d{9}$/)) {
          alert('请输入正确的11位手机号！');
          return;
        }
        // 验证密码格式
        if (!this.addForm.newStuffInfo.password.match(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)) {
          alert('请输入至少8位包含大小写字母和数字的密码！');
          return;
        }
        await api.registerStuff(this.addForm.newStuffInfo)
        .then(response => {
          // 创建成功
          const newEmployeeId = response.data._id;
          this.stuffInfo[newEmployeeId] = response.data;
          // 添加新员工到架构中
          return this.addChild(newEmployeeId, 'stuff', '\n新注册员工ID：'+newEmployeeId+'\n密码：'+response.data.password)
        }).catch(error => {
          console.error('Error registering new stuff:', error);
          const errInfo = error?.response.data ?? error.message;
          alert('注册失败！ '+ errInfo);
        })

      } else {
        if (this.addForm.personnel === '') {
          alert("请先选择一个员工！");
          return;
        }
        // 切换已有员工的部门
        await this.addChild(this.addForm.personnel, 'stuff')
      }
      this.showAddModal = false
    },
    toggle() {
      if (this.isFolder && this.depth>0) {
        this.isOpen = !this.isOpen
      }
    },
    
    async addChild(nameOrId, type, stuffInfoText = '') {
      if (type === 'stuff') {
        // 先从架构中其他组织中移除自己（避免重复）
        this.removeIdFromStruct(nameOrId)
        // 找到最后的dept之前插入stuff
        let idx = this.model.stuffs.length;
        let lastDept = this.model.stuffs.find(item => item.type === 'dept')
        if (lastDept) {
          idx = this.model.stuffs.indexOf(lastDept);
        }
        // 添加子员工
        this.model.stuffs.splice(idx, 0, {
          id: nameOrId,
          type: 'stuff',
        })
        this.saveStruct('员工添加成功！'+stuffInfoText, '员工添加失败！ ');
      } else {
        // 检查是否已有同名部门
        if (this.model.stuffs.some(item => item.name === nameOrId)) {
          alert(`已存在名为 "${nameOrId}" 的部门`)
          return
        }
        // 添加子部门
        this.model.stuffs.push({
          name: nameOrId,
          type: 'dept',
          stuffs: []
        })
      // 添加完毕，同步云端数据
      this.saveStruct('子部门添加成功！', '子部门添加失败！ ');
      }
      this.isOpen = true;
    },
    async saveStruct(successText = '保存成功！', failText = '更新失败！ ') {
      return api.updateTenantStruct(this.allStruct)
      .then(() => {
          alert(successText);
          // 这里可以添加更多逻辑，比如更新前端显示的信息
        })
        .catch(error => {
          console.error('Error updating tenant struct:', error);
          const errInfo = error?.response.data ?? error.message;
          alert(failText + errInfo);
        });
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
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
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

.edit-icon{
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
  width: 80px; /* 可以根据需要调整 */
  /* margin-right: 10px; */
}
.form-row input {
  flex: 1;
}

.copyable {
  word-break: break-all; /* 自动换行 */
  width: 200px; /* 内容宽度自适应 */
}
.copyable:hover {
  text-decoration: underline; /* 悬停时下划线 */
  color: #007bff; /* 鼠标悬停时的颜色 */
  cursor: pointer; /* 鼠标指针样式 */
}
.layer0 {
  /* 主层级样式，例如主部门 */
  text-decoration: none;
  font-size: 1.2rem;
  line-height: 1.6;
  padding: 12px;
  cursor:default;
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

</style>
