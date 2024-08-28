<template>
  <div class="profile-page">
    <h2>公司信息</h2>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else>
      <form @submit.prevent="handleSubmit">
        <div class="form-group" v-for="field in fields" :key="field.id">
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
        <button type="submit">保存</button>
      </form>
    <button style="background-color: rgb(253, 87, 87)" @click="handleDelete">注销</button>
  </div>
  </div>
</template>

<script>
import {API_BASE_URL} from '../../utils/util.js'
import apiClient from '../../utils/apiClient.js';

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
        { id: 'contact', label: '联系人:', type: 'text', model: '', required: true },
        {
          id: 'phone',
          label: '电话:',
          type: 'text',
          model: '',
          required: true,
          validate: this.validatePhone,
          error: ''
        }
      ]
    }
  },
  methods: {
    handleDelete() {
      if (confirm('确定要注销公司吗？此操作不可逆！')) {
      // 注销逻辑
      apiClient.delete(`${API_BASE_URL}/tenant/tenant-data`)
        .then(() => {
          alert('公司已注销');
          window.location.hash = '#login'
        })
        .catch(error => {
          console.error('Error deleting tenant data:', error.message);
          alert('注销公司时发生错误'+ error?.response.data ?? error.message);
        });
      }
    },
    handleSubmit() {
      // 提交表单逻辑
      const updatedData = this.getInput();
      apiClient.put(`${API_BASE_URL}/tenant/tenant-data`, updatedData)
        .then(response => {
          alert('公司信息已保存');
          // 这里可以添加更多逻辑，比如更新前端显示的信息
        })
        .catch(error => {
          console.error('Error updating tenant data:', error);
          const errInfo = error?.response?.data ?? error.message;
          if (errInfo.includes("duplicate key error")) {
            alert('保存公司信息时发生错误：该公司名称已被占用')
          } else {
            alert('保存公司信息时发生错误：'+ errInfo);
          }
        });
    },
    validateName() {
      if (this.fields.find((field) => field.id === 'name').model.length > 50) {
        this.fields.find((field) => field.id === 'name').error = '公司名称不能超过50个字符'
      } else {
        this.fields.find((field) => field.id === 'name').error = ''
      }
    },
    validateAddress() {
      if (this.fields.find((field) => field.id === 'address').model.length > 50) {
        this.fields.find((field) => field.id === 'address').error = '地址不能超过50个字符'
      } else {
        this.fields.find((field) => field.id === 'address').error = ''
      }
    },
    validatePhone() {
      const phoneRegex = /^[0-9]{11}$/
      if (!phoneRegex.test(this.fields.find((field) => field.id === 'phone').model)) {
        this.fields.find((field) => field.id === 'phone').error = '电话号码必须为11位数字'
      } else {
        this.fields.find((field) => field.id === 'phone').error = ''
      }
    },
    fillInput(obj) {
      this.fields.find(field => field.id === 'name').model = obj.name || '';
      this.fields.find(field => field.id === 'address').model = obj.address || '';
      this.fields.find(field => field.id === 'contact').model = obj.contact || '';
      this.fields.find(field => field.id === 'phone').model = obj.phone || '';
    },
    getInput() {
      return {
        name: this.fields.find(field => field.id === 'name').model,
        address: this.fields.find(field => field.id === 'address').model,
        contact: this.fields.find(field => field.id === 'contact').model,
        phone: this.fields.find(field => field.id === 'phone').model
      }
    }
  },
  mounted() {
    // 模拟从后端获取数据
    // this.fields.find((field) => field.id === 'name').model = '某某公司'
    // this.fields.find((field) => field.id === 'address').model = '某某地址'
    // this.fields.find((field) => field.id === 'contact').model = '联系人姓名'
    // this.fields.find((field) => field.id === 'phone').model = '12345678901'
    this.isLoading = true;
    apiClient.get(`${API_BASE_URL}/tenant/tenant-data`)
      .then(response => {
        const tenantData = response.data;
        // 填充表单字段
        this.fillInput(tenantData);
      })
      .catch(error => {
        console.error('Error fetching tenant data:', error.message);
        alert('获取数据失败。请重新登录！')
        window.location.hash = '#login'
      }).finally(() => {
        this.isLoading = false;
      });
  }
}
</script>

<style scoped>
.profile-page {
  /* max-width: 400px; */
  /* width: max-content; */
  margin: 50px auto;
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
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1%;
}

button:hover {
  background-color: #218838;
}

.error {
  color: red;
  font-size: 12px;
}
</style>
