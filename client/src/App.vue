<script>
import LoginPage from './components/tenantPage/LoginPage.vue'
import RegisterPage from './components/tenantPage/RegisterPage.vue'
import UserPage from './components/tenantPage/UserPage.vue'
import NotFound from './components/NotFound.vue'
//import RegSuccess from './RegSuccess.vue'
const routes = {
  login: LoginPage,
  register: RegisterPage,
  userPage: UserPage
}
export default {
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1).split('/')[0] || 'login'] || NotFound
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
  <component :is="currentView" />
</template>

<style scoped></style>
