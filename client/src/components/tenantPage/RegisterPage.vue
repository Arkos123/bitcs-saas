<template>
  <div class="register-container">
    <h2 style="text-align: center">租户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group" v-for="(field, index) in fields" :key="index">
        <label :for="field.id">{{ field.label }}</label>
        <input
          :type="field.type"
          :id="field.id"
          v-model="field.model"
          :required="field.required"
          @input="field.validate && field.validate()"
        />
        <p v-if="field.error" class="error">{{ field.error }}</p>
      </div>
      <button type="submit" :disabled="isFormInvalid">{{isLoading ? '注册中...' : '注册'}}</button>
    </form>
    <button @click="goBack" class="back-button">返回</button>
  </div>
</template>

<script>
import axios from 'axios'
import {API_BASE_URL} from '../../utils/util.js'

export default {
  data() {
    return {
      isLoading: false,
      fields: [
        {
          id: 'name',
          label: '公司名称:',
          type: 'text',
          model: '',
          required: true,
          validate: this.validateName,
          error: ''
        },
        {
          id: 'address',
          label: '地址:',
          type: 'text',
          model: '',
          required: true,
          validate: this.validateAddress,
          error: ''
        },
        {
          id: 'phone',
          label: '电话:',
          type: 'text',
          model: '',
          required: true,
          validate: this.validatePhone,
          error: ''
        },
        {
          id: 'password',
          label: '密码:',
          type: 'password',
          model: '',
          required: true,
          validate: this.validatePassword,
          error: ''
        }
      ]
    }
  },
  methods: {
    async handleRegister() {
      try {
        const res = this.fields.reduce((res, field) => {  
          res[field.id] = field.model;  
          return res;  
        }, {}); 
        this.isLoading = true;
        await axios.post(`${API_BASE_URL}/tenant/register`, res)
        alert(`注册成功, 用户名: ${this.fields.find((field) => field.id === 'name').model}`)
        window.location.hash = '#login'
      } catch (error) {
        console.error('注册失败', error)
        if (error.response) {
          alert('注册失败：' + error.response.data)
        } else {
          alert('注册失败：' + error.message)
        }
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      window.location.hash = '#login'
    },
    validateName() {
      const field = this.fields.find((field) => field.id === 'name')
      field.error = field.model.length > 50 ? '公司名称不能超过50个字符' : ''
    },
    validateAddress() {
      const field = this.fields.find((field) => field.id === 'address')
      field.error = field.model.length > 50 ? '地址不能超过50个字符' : ''
    },
    validatePhone() {
      const field = this.fields.find((field) => field.id === 'phone')
      const phoneRegex = /^[0-9]{11}$/
      field.error = !phoneRegex.test(field.model) ? '电话号码必须为11位数字' : ''
    },
    validatePassword() {
      const field = this.fields.find((field) => field.id === 'password')
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
      field.error = !passwordRegex.test(field.model) ? '密码必须至少8个字符，包含字母和数字' : ''
    }
  },
  computed: {
    isFormInvalid() {
      return this.fields.some((field) => field.model === '' || field.error !== '')
    }
  }
}
</script>

<style scoped>
.register-container {
  width: 400px;
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

button {
  width: 100%;
  padding: 10px;
  margin-bottom: 5px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

button[disabled] {
  background-color: #cccccc;
  cursor: not-allowed;
}

.back-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 5px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  font-size: 12px;
}
</style>
