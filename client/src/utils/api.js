import axios from 'axios'
// import { API_BASE_URL } from './util.js'

const API_BASE_URL = 'http://localhost:3000'

// 创建一个 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL, // 后端 API 的基础 URL
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器，携带token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 存储缓存数据
let cache = {}

// 缓存装饰器
function withCache(id, apiMethod) {
  return async function (...args) {
    if (cache[id]) {
      return cache[id]
    }
    const responseData = await apiMethod.apply(null, args)
    cache[id] = responseData
    return responseData
  }
}

const api = {
  // 清空缓存，用于登录失效时
  clearCache: () => (cache = {}),

  // 租户注册
  tenantRegister: async (data) => axios.post(`${API_BASE_URL}/tenant/register`, data),
  // 租户登录
  tenantLogin: async (data) => apiClient.post(`${API_BASE_URL}/tenant/login`, data),

  // 获取本租户所有信息（包括基础信息、公司组织、客户信息。对获取的数据进行缓存）
  getTenantData: withCache('get this tenant data', async () => {
    const data = await apiClient.get(`${API_BASE_URL}/tenant/tenant-data`)
    if (typeof data.struct !== 'object') {
      data.struct = []
    }
    if (typeof data.clients !== 'object') {
      data.clients = []
    }
    return data
  }),
  // 修改租户基础信息
  updateBasicTenantInfo: async (data) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/tenant/tenant-data`, data)
  },
  // 租户注销
  tenantDelete: async () => {
    api.clearCache()
    return apiClient.delete(`${API_BASE_URL}/tenant/tenant-data`)
  },
  // 查询所有租户信息
  getAllTenantData: withCache('get all tenant data', async () =>
    apiClient.get(`${API_BASE_URL}/tenant/tenant-data-all`)
  ),

  /**
   * 处理租户组织架构相关的请求
   * API 列表：
   * 1. GET struct/tenant-stuff 获取本租户组织结构、员工信息
   * 2. PUT struct/tenant-stuff  { struct }更新本租户组织结构信息
   * 3. POST tenant/register-stuff { name, password, phone, position } => stuff 注册员工，返回员工信息
   * 4. PUT tenant/update-stuff { _id, name, password, phone, position } => stuff 修改员工信息
   */
  // 获取租户结构、人员信息
  getTenantStructAndStuffs: withCache('get tenant struct', async () => {
    const data = await apiClient.get(`${API_BASE_URL}/struct/tenant-stuff`)
    return data
  }),
  // 更新租户的组织结构信息
  updateTenantStruct: async (struct) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/struct/tenant-stuff`, { struct })
  },
  // 注册员工
  registerStuff: async (data) => {
    api.clearCache()
    return apiClient.post(`${API_BASE_URL}/struct/register-stuff`, data)
  },
  updateStuffInfo: async (data) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/struct/update-stuff`, data)
  },

  /**
   * 处理客户/合同/项目相关的处理请求
   * API 列表：
   * 1.GET project/clients ()=>{clients:[..], projects:[...], innerProjects:[...]} 获取客户结构、项目信息、内部项目信息
   * 2.PUT project/clients { clients, innerProjects } 更新客户结构信息，内部项目信息
   * 3.POST project/register-project { name, manager, ... managerHistory, parentProject, subProjects, rootProject,  needStaff } => project 注册项目，返回项目信息
   * 4.POST project/edit-project { _id, name, manager, ... } 修改项目
   * 5.DELETE project/{projectId} 删除项目
   */

  /**
   * 获取客户结构、项目信息、内部项目信息 ()=>{clients:[..], projects:[...], innerProjects:[...]}
   * @returns {{clients:[], projects:[], innerProjects:[]}}
   */
  getClientsAndProjects: withCache('get project data', async () =>
    apiClient.get(`${API_BASE_URL}/project/clients`)
  ),
  /**
   * 更新客户结构信息
   * @param {Array} clients 客户结构信息
   * @param {Array} innerProjects 内部项目id列表
   */
  updateClientsData: async (clients, innerProjects) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/project/clients`, { clients, innerProjects })
  },
  /**
   * 注册项目{ name, manager, ... managerHistory, parentProject, subProjects, rootProject, needStaff } => project
   * @param {{ name, manager, dateStart, dateEnd, status, managerHistory:[], parentProject, subProjects:[], rootProject, needStaff }} data 项目信息
   */
  registerProject: async (data) => {
    api.clearCache()
    return apiClient.post(`${API_BASE_URL}/project/register-project`, data)
  },
  /**
   * 修改项目
   * @param {{ _id, name, manager, dateStart, dateEnd, status, managerHistory, needStaff }} data 客户结构信息
   */
  updateProjectData: async (data) => {
    api.clearCache()
    return apiClient.post(`${API_BASE_URL}/project/edit-project`, data)
  },
  /**
   * 删除项目
   * @param {string} projectId 项目ID
   */
  deleteProject: async (projectId) => {
    api.clearCache()
    return apiClient.delete(`${API_BASE_URL}/project/${projectId}`)
  },

  /**
   * 人员分配处理请求
   * API 列表：
   * 1. GET struct/all-assignments ()=>[{员工文档（含分配信息）}] 读取人员信息
   * 2. PUT struct/assignment {stuffId, assignment:[{id: 项目id, ratio: Number}]} 更新人员分配表单
   */

  /**
   * 获取人员信息
   * @returns {Array} 员工文档（含分配信息）
   */
  getAllStuffs: withCache('get all assignments', async () =>
    apiClient.get(`${API_BASE_URL}/struct/all-assignments`)
  ),
  /**
   * 更新人员分配表单
   * @param {string} stuffId 员工ID
   * @param {[{id: 项目id, ratio: Number}]} assignment 分配信息
   */
  updateAssignment: async (stuffId, assignment) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/struct/assignment`, { stuffId, assignment })
  },

  /**
   * 员工登录：POST stuff/login { name, password } => {token}
   * 获取员工信息：GET stuff/stuff-data ()=> {name,position, ...,projects}
   * 更新员工工时信息： PUT stuff/workhours { projectId, isPublic, workHours:[...]}
   * 获取项目Id列表对应信息对象 ：POST project/project-info  { idList } => {id1: {...}, id2: {...}}
   */

  /**
   * 员工登录 { name, password } => {token}
   * @param {{ name, password }} data 登录信息
   */
  stuffLogin: async (data) => apiClient.post(`${API_BASE_URL}/stuff/login`, data),

  /**
   * 获取员工信息 { name, position, ..., projects}
   * @returns {{ name, position, ..., projects}} 员工信息
   */
  getStuffData: withCache('get stuff data', async () =>
    apiClient.get(`${API_BASE_URL}/stuff/stuff-data`)
  ),

  /**
   * 更新员工工时信息 { projectId, isPublic, workHours:[...]}
   * @param {{ projectId, isPublic, workHours:[...]}} data 工时信息
   */
  updateWorkHours: async (data) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/stuff/workhours`, data)
  },
  /**
   * 获取项目Id列表对应信息对象 [...idList] => {id1: {...}, id2: {...}}
   * @param {Array} idList 项目ID列表
   * @returns {{id1: {...}, id2: {...}}} 项目信息对象
   */
  getProjectInfoByIds: async (idList) =>
    apiClient.post(`${API_BASE_URL}/project/project-info`, { idList }),

  /**
   *  更新工作经验 PUT stuff/experience [{ company, startDate, endDate }]
   *  更新技能 PUT stuff/skills [{ name, years, proficiency }]
   */

  /**
   * 更新工作经验 [{ company, startDate, endDate }]
   * @param {[{ company, startDate, endDate }]} experience 工作经验
   */
  updateExperience: async (experience) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/stuff/experience`, { experience })
  },

  /**
   * 更新技能 [{ name, years, proficiency }]
   * @param {[{ name, years, proficiency }]} skills 技能
   */
  updateSkills: async (skills) => {
    api.clearCache()
    return apiClient.put(`${API_BASE_URL}/stuff/skills`, { skills })
  },

  //GET project/public-projects ()=>{projects:[...], publics:[...]} 员工获取公司的公共项目信息
  /**
   * 员工获取公司的项目信息、公共项目信息
   * @returns {{projects:[]}} 公司的公共项目信息
   */
  getPublicProjectsAndPjs: withCache('get public projects', async () =>
    apiClient.get(`${API_BASE_URL}/project/public-projects`)
  )
}

export default api
