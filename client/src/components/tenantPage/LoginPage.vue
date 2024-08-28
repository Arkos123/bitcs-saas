<template>
  <div class="login-container">
    <h2 style="text-align: center">租户登录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">公司名称:</label>
        <input type="text" id="username" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" class="form-button" :disabled="isLoading">{{buttonText}}</button>
      <!-- <div v-if="isLoading" class="loading">Loading...</div> -->
    </form>
    <p style="text-align: center; margin-top: 2%">
      <button @click="goToRegister" class="link-button">注册</button>
    </p>
  </div>
</template>

<script>
// import axios from 'axios'
import {API_BASE_URL} from '../../utils/util.js'
import apiClient from '../../utils/apiClient.js';

export default {
  data() {
    return {
      name: '',
      password: '',
      buttonText: '登录',
      isLoading: false,
    }
  },
  methods: {
    async handleSubmit() {
      try {
        // if (this.name === '' || this.password === '') {
        //   alert('请输入用户名和密码')
        //   return
        // }
        this.isLoading = true;
        this.buttonText = '登录中...';
        const response = await apiClient.post(`${API_BASE_URL}/tenant/login`, {
          name: this.name,
          password: this.password
        })
        // 保存token
        localStorage.setItem('token', response.data.token);
        alert('登录成功')
        window.location.hash = '#userPage/profile'
      } catch (error) {
        console.error('登录失败', error)
        if (error.response) {
          alert('登录失败：' + error.response.data)
        } else {
          alert('登录失败：' + error.message)
        }
        
      } finally {
        this.isLoading = false;
        this.buttonText = '登录';
      }
    },
    goToRegister() {
      // this.$router.push({ name: 'Register' })
      window.location.hash = '#register'
    }
  }
}
</script>

<style scoped>
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
