<template>
    <div>
      <h1>已注册公司信息</h1>
      <table v-if="!isLoading">
        <thead>
          <tr>
            <th>公司名称</th>
            <th>地址</th>
            <th>联系电话</th>
            <th>联系人姓名</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tenant in tenants" :key="tenant._id">
            <td>{{ tenant.name }}</td>
            <td>{{ tenant.address || '未填写' }}</td>
            <td>{{ tenant.phone || '未填写' }}</td>
            <td>{{ tenant.contact || '未填写' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="isLoading">加载中...</div>
      <div v-if="error">{{ error }}</div>
    </div>
  </template>
  
  <script>
  import api from '@/utils/api.js';
  
  export default {
    name: 'TenantTable',
    data() {
      return {
        tenants: [],
        isLoading: false,
        error: null,
      };
    },
    mounted() {
      this.fetchTenantData();
    },
    methods: {
      fetchTenantData() {
        this.isLoading = true;
        api.getAllTenantData().then(response => {
            this.tenants = response.data;
          })
          .catch(error => {
            const errInfo = error?.response?.data ?? error.message;
            console.error('Error fetching tenant data:', error.message);
            this.error = '获取数据失败。请稍后重试：'+errInfo;
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    }
  };
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  th {
    background-color: #f4f4f4;
  }
  </style>
  