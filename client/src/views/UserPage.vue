<script>
import ProfilePage from './tenant/ProfilePage.vue'
import AllTenantInfo from './tenant/AllTenantInfo.vue'
import StaffPage from './tenant/organizationPage/StaffPage.vue'
import ClientsPage from './tenant/clientsPage/ClientsPage.vue'
import AssignmentPage from './tenant/AssignmentPage.vue' 
import WorkhourPage from './staff/WorkhourPage.vue'
import ExperiencePage from './staff/ExperiencePage.vue'
import NotFound from './NotFound.vue'


const routes = {
  tenant: {
    profile: ProfilePage,
    allTenant: AllTenantInfo,
    stuff: StaffPage,
    clients: ClientsPage,
    assignment: AssignmentPage,
  },
  staff: {
    workhour: WorkhourPage,
    experience: ExperiencePage,
  }
}
export default {
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    paths() {
      return this.currentPath.slice(1).split('/')
    },
    currentView() {
      if (!routes[this.paths[1]]) {
        return NotFound
      }
      return routes[this.paths[1]][this.paths[2]] || NotFound
    }
  },
  mounted() {
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash
    })
  },
  methods: {
    goToLogin() {
      window.location.hash = '#login'
    }
  }
}
</script>

<template>
  <div class="sidebar-tabs">
    <nav>
      <ul>
        <li>
          <button @click="goToLogin" class="login-button">返回</button>
        </li>
        <div v-if="paths[1]==='tenant'">
          <li><a href="#userPage/tenant/profile" :class="{ active: currentPath === '#userPage/tenant/profile' }">您的公司信息</a></li>
          <li><a href="#userPage/tenant/allTenant" :class="{ active: currentPath === '#userPage/tenant/allTenant' }">全部公司信息</a></li>
          <li><a href="#userPage/tenant/stuff" :class="{ active: currentPath === '#userPage/tenant/stuff' }">人员组织</a></li>
          <li><a href="#userPage/tenant/clients" :class="{ active: currentPath === '#userPage/tenant/clients' }">客户项目</a></li>
          <li><a href="#userPage/tenant/assignment" :class="{ active: currentPath === '#userPage/tenant/assignment' }">人员分配</a></li>
        </div>
        <div v-if="paths[1]==='staff'">
          <li><a href="#userPage/staff/workhour" :class="{ active: currentPath === '#userPage/staff/workhour' }">工时记录</a></li>
          <li><a href="#userPage/staff/experience" :class="{ active: currentPath === '#userPage/staff/experience' }">经验技能记录</a></li>
        </div>
      </ul>
    </nav>
    <main class="main-content">
      <component :is="currentView" />
    </main>
  </div>
</template>
<style scoped>
.sidebar-tabs {
  display: flex;
  height: 100vh; /* 使父容器高度等于视口高度 */
}

nav {
  width: 20vw;
  height: 100vh; /* 使导航高度等于视口高度 */
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  position: fixed; /* 固定导航 */
  top: 0;
  left: 0;
  overflow-y: auto; /* 如果导航项目多于视口高度，添加滚动条 */
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav li {
  margin: 0;
}

nav a {
  display: block;
  padding: 10px;
  color: #007bff;
  text-decoration: none;
}

nav a.active {
  background-color: #007bff;
  color: #fff;
}

nav a:hover {
  background-color: #007bff5c;
}

.main-content {
  margin-left: 19vw; /* 为主内容预留导航栏的宽度 */
  width: calc(100vw - 25vw); /* 主内容宽度等于视口宽度减去导航栏宽度 */
  height: 100vh; /* 使主内容高度等于视口高度 */
  /* padding: 5vw; */
}

.login-button {
  /* position: relative; */
  display: block;
  width: 6vw;
  padding: 8px;
  margin: 10px;
  color: #fff;
  background-color: #007bff;;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  /* text-align: left; */
}

.login-button:hover {
  background-color: #007bff5c;
}
</style>
