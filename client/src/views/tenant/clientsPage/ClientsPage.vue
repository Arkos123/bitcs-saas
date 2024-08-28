<template>
  <div v-if="isLoading" class="loading">Loading...</div>
  <div v-else>
    <div class="item">
      <TreeItem :allClients="clientsStruct.clients" :ipj="innerProjects" :model="clientsStruct" :curDict="[]" :stuffInfo="stuffInfo" :projectInfo="projectInfo"></TreeItem>
    </div>
    <div class="item">
      <TreeItem :isInnerFolder = "true"  :ipj="innerProjects" :allClients="clientsStruct.clients" :depth="2" :model="{name: '内部项目', projects: innerProjects}" :curDict="[]" :stuffInfo="stuffInfo" :projectInfo="projectInfo"></TreeItem>
    </div>
  </div>
</template>

<!-- clients: [
{
  name:
  phone
  accountManager
  // 当前客户的合同
  contracts: [
    {
      name
      salesperson
      status:  enum: ['on', 'off']
      projects: [
       {
          name: 
          manager: 
          dateStart: 
          dateEnd: 
          status: enum: ['finished', 'normal', 'delayed']
       }
      ]
    },
  ],
},
], -->

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
      innerProjects: [],
      clientsStruct: { name: '公司客户/项目', clients: [] },
      projectInfo: {},
      stuffInfo: {},
    }
  },

  mounted() {
    this.isLoading = true
    api
      .getClientsAndProjects()
      .then((response) => {
        let {clients,  projects, innerProjects} = response.data
        this.innerProjects = innerProjects;
        this.clientsStruct = { name: '公司客户/项目', clients }
        // 项目数组信息转对象，方便查找
        this.projectInfo = projects.reduce((acc, cur) => {
          acc[cur._id] = cur
          return acc
        }, {})
        // 将project对象替代id列表
        // clients.forEach(client => {
        //   client.contracts.forEach(contract => {
        //     contract.projects = contract.projects.map(projectId => this.projectInfo[projectId])
        //   })
        // })
        // 读取员工列表
        api
        .getTenantStructAndStuffs()
        .then((response) => {
          let {stuffs} = response.data
          // 员工数组信息转对象，方便查找
          this.stuffInfo = stuffs.reduce((acc, cur) => {
            acc[cur._id] = cur
            return acc
          }, {})
        })
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
  border: 1px solid #8a8a8a;
  border-radius: 10px;
  margin-bottom: 15px; /* 增加间距 */
  /* background-color: #f9f9f9;  */
  padding: 8px;
}
</style>
