<template>
  <div v-if="isLoading" class="loading">Loading...</div>
  <div v-else>
    <TreeItem class="item" :allStruct="tenantStruct.stuffs" :model="tenantStruct" :curDict="[]" :stuffInfo="stuffInfo"></TreeItem>
  </div>
</template>

<script>
import TreeItem from './TreeItem.vue'
//   import InfoBus from '@/utils/infoBus';
import api from '@/utils/api'

export default {
  components: {
    TreeItem
  },
  data() {
    return {
      isLoading: true,
      tenantStruct: { type: 'dept', name: '当前公司', stuffs: [] },
      stuffInfo: {},
    }
  },

  async mounted() {
    this.isLoading = true
    return api
      .getTenantStructAndStuffs()
      .then((response) => {
        let {struct, stuffs} = response.data
        this.tenantStruct = { type: 'dept', name: '公司组织结构', stuffs: struct }
        // 员工数组信息转对象，方便查找
        this.stuffInfo = stuffs.reduce((acc, cur) => {
          acc[cur._id] = cur
          return acc
        }, {})
      })
      .catch((error) => {
        console.error('Error fetching tenant data:', error.message)
        alert('获取数据失败。请重新登录！')
        api.clearCache()
        window.location.hash = '#login'
      })
      .finally(() => {
        this.isLoading = false
      })
  }
}
</script>

<style scoped>
.item {
  border: 1px solid #ddd; /* 添加边缘 */
  margin-bottom: 5px; /* 增加间距 */
  background-color: #f9f9f9; /* 添加背景颜色 */
  padding: 8px;
}
</style>
