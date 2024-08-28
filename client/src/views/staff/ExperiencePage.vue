<template>
  <div>
    <h1>经验技能记录</h1>
    <div v-if="!isLoading">
      <div
        style="
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 15px;
          padding-top: 5px;
          margin-bottom: 10px;
        "
      >
        <h2>工作经验</h2>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>工作公司</th>
              <th>起始时间</th>
              <th>结束时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(exp, idx) in experience"
              :key="'rc' + idx"
              :class="{ 'invalid-line': errorExp === exp }"
            >
              <td>{{ idx + 1 }}</td>
              <td>
                <input type="text" required v-model="exp.company" />
              </td>
              <td>
                <input type="date" required v-model="exp.startDate" />
              </td>
              <td>
                <input type="date" required v-model="exp.endDate" />
              </td>
              <!-- <td>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  v-model="exp.hours"
                  @change="exp.hours = Math.max(0.5, Math.min(12, exp.hours))"
                />
              </td> -->
              <td>
                <button type="button" class="delButton" @click="deleteExp(idx)">删除</button>
              </td>
            </tr>
            <tr style="background-color: #f0fff0">
              <td>添加新工作经历</td>
              <td>
                <input type="text" required v-model="newExp.company" />
              </td>
              <td>
                <input type="date" required v-model="newExp.startDate" />
              </td>
              <td>
                <input type="date" required v-model="newExp.endDate" />
              </td>
              <td>
                <button type="button" class="addButton" @click="handleExpAddSubmit">添加</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="expError" class="error">{{ expError }}</div>
        <button
          type="button"
          class="btn-edit"
          @click="handleExpEditSubmit"
          :disabled="expError !== ''"
        >
          保存修改
        </button>
      </div>
      <div
        style="
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 15px;
          padding-top: 5px;
          margin-bottom: 10px;
        "
      >
        <h2>个人技能</h2>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>技能名称</th>
              <th>积累年数</th>
              <th>达到程度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(skill, idx) in skills"
              :key="'rc' + idx"
              :class="{ 'invalid-line': errorSkill === skill }"
            >
              <td>{{ idx + 1 }}</td>
              <td>
                <input type="text" required v-model="skill.name" />
              </td>
              <td>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="90"
                  v-model="skill.years"
                  @change="skill.years = Math.max(0.5, Math.min(90, skill.years))"
                />
              </td>
              <td>
                <input type="text" required v-model="skill.proficiency" />
              </td>
              <td>
                <button type="button" class="delButton" @click="deleteSkill(idx)">删除</button>
              </td>
            </tr>
            <tr style="background-color: #f0fff0">
              <td>添加新技能</td>
              <td>
                <input type="text" required v-model="newSkill.name" />
              </td>
              <td>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="90"
                  v-model="newSkill.years"
                  @change="newSkill.years = Math.max(0.5, Math.min(90, newSkill.years))"
                />
              </td>
              <td>
                <input type="text" required v-model="newSkill.proficiency" />
              </td>
              <td>
                <button type="button" class="addButton" @click="handleSkillAddSubmit">添加</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="skillError" class="error">{{ skillError }}</div>
        <button
          type="button"
          class="btn-edit"
          @click="handleSkillEditSubmit"
          :disabled="skillError !== ''"
        >
          保存修改
        </button>
      </div>
    </div>
    <div v-if="isLoading">加载中...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import api from '@/utils/api.js'
// import ModalForm from '@/components/ModalForm.vue'

export default {
  // name: 'TenantTable',
  data() {
    return {
      isLoading: false,
      error: null,
      errorSkill: null,
      errorExp: null,
      skills: [],
      experience: [],
      newExp: {
        company: '公司名称',
        startDate: this.formatDate(),
        endDate: this.formatDate()
      },
      newSkill: {
        name: '练习生',
        years: '2.5',
        proficiency: '熟练掌握唱跳rap'
      }
    }
  },
  computed: {
    expError() {
      this.errorExp = null
      // 检查experience所有项
      for (let exp of this.experience) {
        const error = this.validateExp(exp)
        if (error !== '') {
          this.errorExp = exp
          return '请检查表格：' + error
        }
      }
      return ''
    },
    skillError() {
      this.errorSkill = null
      // 检查skills所有项
      for (let skill of this.skills) {
        const error = this.validateSkill(skill)
        if (error !== '') {
          this.errorSkill = skill
          return '请检查表格：' + error
        }
      }
      return ''
    }
  },
  components: {
    // ModalForm
  },
  mounted() {
    this.fetchStuffData()
  },
  methods: {
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
        .then((response) => {
          let { experience, skills } = response.data
          // 当前员工项目信息
          this.experience = experience.map((exp) => ({
            ...exp,
            startDate: this.formatDate(exp.startDate),
            endDate: this.formatDate(exp.endDate)
          }))
          this.skills = skills
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
    async handleSkillEditSubmit() {
      // console.log(this.curPjInfo)
      // console.log(assignment);
      return api
        .updateSkills(this.skills)
        .then(() => {
          alert('技能信息已保存！')
        })
        .catch((error) => {
          console.error('Error updating info:', error)
          const errInfo = error?.response?.data ?? error.message
          alert('保存失败！' + errInfo)
        })
    },
    async handleExpEditSubmit() {
      // console.log(this.curPjInfo)
      // console.log(assignment);
      return api
        .updateExperience(this.experience)
        .then(() => {
          alert('经验信息已保存！')
        })
        .catch((error) => {
          console.error('Error updating info:', error)
          const errInfo = error?.response?.data ?? error.message
          alert('保存失败！' + errInfo)
        })
    },
    handleExpAddSubmit() {
      const error = this.validateExp(this.newExp)
      if (error !== '') {
        alert(error)
        return
      }
      // 添加新的经验
      this.experience.push({ ...this.newExp })
      this.newExp = {
        company: '公司名称',
        startDate: this.formatDate(),
        endDate: this.formatDate()
      }
    },
    isEndBeforeStart(start, end) {
      if (!start || !end) {
        return false // 如果日期未填写，则不进行验证
      }
      const startDate = new Date(start)
      const endDate = new Date(end)
      return endDate < startDate
    },
    validateExp(exp) {
      if (!exp.company) {
        return '请输入公司名称'
      }
      if (!exp.startDate || !exp.endDate) {
        return '请输入开始和结束日期'
      }
      if (this.isEndBeforeStart(exp.startDate, exp.endDate)) {
        return '结束日期不能早于开始日期'
      }
      // 验证是否和this.experience列表已有的其他记录的时间段重叠
      for (let curExp of this.experience) {
        if (
          exp !== curExp &&
          this.isTimeOverlap(exp.startDate, exp.endDate, curExp.startDate, curExp.endDate)
        ) {
          return '时间段不能重叠'
        }
      }
      return ''
    },
    isTimeOverlap(s1, e1, s2, e2) {
      const S1 = new Date(s1)
      const E1 = new Date(e1)
      const S2 = new Date(s2)
      const E2 = new Date(e2)
      return !(E1 < S2 || E2 < S1)
    },
    validateSkill(skill) {
      if (!skill.name) {
        return '请输入技能名称'
      }
      if (!skill.proficiency) {
        return '请输入技能掌握程度'
      }
      // 检查是否有同名技能
      for (let curSkill of this.skills) {
        if (skill !== curSkill && curSkill.name === skill.name) {
          return '技能名称不能重复'
        }
      }
      return ''
    },
    handleSkillAddSubmit() {
      const error = this.validateSkill(this.newSkill)
      if (error !== '') {
        alert(error)
        return
      }
      // 添加新的技能
      this.skills.push({ ...this.newSkill })
      this.newSkill = {
        name: '练习生',
        years: '2.5',
        proficiency: '熟练掌握唱跳rap'
      }
    },
    deleteExp(idx) {
      this.experience.splice(idx, 1)
    },
    deleteSkill(idx) {
      this.skills.splice(idx, 1)
    }
  }
}
</script>

<style scoped>
table {
  width: 100%;
  /* margin-top: 20px; */
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

.invalid-line {
  background-color: rgba(255, 72, 109, 0.588);
}

button[disabled] {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-edit {
  color: #fff;
  background-color: #007bff;
  padding: 10px 10px;
  margin-top: 10px;
  margin-left: 0px;
  font-size: 15px;
  border-radius: 5px;
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
.error {
  margin-top: 10px;
  color: red;
  font-size: 12px;
}

/* Optional: Centering the entire table */
/* div {
    text-align: center;
  } */
</style>
