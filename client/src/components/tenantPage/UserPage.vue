<script>
import ProfilePage from './ProfilePage.vue'
import AllTenantInfo from './AllTenantInfo.vue'
import NotFound from '../NotFound.vue'

const routes = {
  profile: ProfilePage,
  allTenant: AllTenantInfo,
}
export default {
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1).split('/')[1] || 'profile'] || NotFound
    }
  },
  mounted() {
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash
    })
  }
}
</script>

<template>
  <div class="sidebar-tabs">
    <nav>
      <ul>
        <li>
          <a href="#userPage/profile" :class="{ active: currentPath === '#userPage/profile' }"
            >您的公司信息</a
          >
        </li>
        <li><a href="#userPage/allTenant" :class="{ active: currentPath === '#userPage/allTenant' }">全部公司信息</a></li>
        <!-- Add more tabs as needed -->
      </ul>
    </nav>
    <main>
      <component :is="currentView" />
    </main>
  </div>
</template>

<style scoped>
.sidebar-tabs {
  display: flex;
  width: max-content;
}

nav {
  width: 20vw;
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
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

main {
  flex: 1;
  width: 70vw;
  padding: 5vw;
}
</style>
