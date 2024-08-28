<template>
  <div>
    <div class="tabs">
      <button id="comBut" :class="{ active: loginType === 'company' }" @click="loginType = 'company'">
        公司登录
      </button>
      <button id="emBut" :class="{ active: loginType === 'employee' }" @click="loginType = 'employee'">
        员工登录
      </button>
    </div>

    <div class="login-container">
      <h2 style="text-align: center">{{ loginType === 'company' ? '租户登录' : '员工登录' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">{{ loginType === 'company' ? '公司名称:' : '员工ID:' }}</label>
          <input type="text" id="username" v-model="curForm.name" required />
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input type="password" id="password" v-model="curForm.password" required />
        </div>
        <div style="display: flex; justify-content:center; align-items:center;width: fit-content; margin: 0 auto;margin-bottom: 10px;"><label style="text-wrap:nowrap;cursor: pointer;" @click="curForm.rememberMe=!curForm.rememberMe">记住密码</label><input type="checkbox" v-model="curForm.rememberMe" /></div>
        <button type="submit" class="form-button" :disabled="isLoading">{{ buttonText }}</button>
        <!-- <div v-if="isLoading" class="loading">Loading...</div> -->
      </form>
      <p v-if="loginType !=='employee'" style="text-align: center; margin-top: 2%">
        <button @click="goToRegister" class="link-button">注册</button>
      </p>
      <p v-else style="text-align: center; margin-top: 2%; color: #999">
        (员工请通过公司注册)
      </p>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      form: {
        company: {
          name: '',
          password: '',
          rememberMe: false // 记住密码选项
        },
        employee: {
          name: '',
          password: '',
          rememberMe: false // 记住密码选项
        },
      },
      buttonText: '登录',
      isLoading: false,
      loginType: 'company', // 默认选中公司登录
    }
  },
  mounted() {
    // 加载记住登录表单
    const rememberedComForm = JSON.parse(localStorage.getItem('companyLoginForm'));
    const rememberedStaffForm = JSON.parse(localStorage.getItem('employeeLoginForm'));
    if (rememberedComForm) {
      this.form.company = rememberedComForm;
    }
    if (rememberedStaffForm) {
      this.form.employee = rememberedStaffForm;
    }
    api.clearCache();
  },
  computed: {
    curForm() {
        return this.form[this.loginType]
    },
  },
  methods: {
    async handleSubmit() {
      try {
        this.isLoading = true
        this.buttonText = '登录中...'
        // 公司登录
        if (this.loginType === 'company') {
          const response = await api.tenantLogin({
            name: this.curForm.name,
            password: this.curForm.password
          })
          localStorage.setItem('token', response.data.token)
          alert('登录成功')
          window.location.hash = '#userPage/tenant/profile'
        } else {
          // 员工登录
          const response = await api.stuffLogin({
            id: this.curForm.name,
            password: this.curForm.password
          })
          localStorage.setItem('token', response.data.token)
          alert('登录成功')
          window.location.hash = '#userPage/staff/workhour'
        }
        // 记住密码
        if (this.curForm.rememberMe) {
          localStorage.setItem(`${this.loginType}LoginForm`, JSON.stringify(this.curForm));
        } else {
          localStorage.removeItem(`${this.loginType}LoginForm`);
        }
      } catch (error) {
        console.error('登录失败', error)
        if (error.response) {
          alert('登录失败：' + error.response.data)
        } else {
          alert('登录失败：' + error.message)
        }
      } finally {
        this.isLoading = false
        this.buttonText = '登录'
      }
    },
    goToRegister() {
      window.location.hash = '#register'
    }
  }
}
</script>

<style scoped>
.tabs {
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  /* margin-bottom: 20px; */
}

.tabs button {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  width: 50%;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
  border-radius: 5px 5px 0 0;
}

.login-container {
  width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.login-container {
  width: 400px;
  /* margin: 50px auto; */
  /* align-items: center; */
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.form-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.form-button:hover {
  background-color: #0056b3;
}

.link-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: medium;
  text-decoration: underline;
}

.link-button:hover {
  color: #002c5b;
  background: none;
}

.form-button[disabled] {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
