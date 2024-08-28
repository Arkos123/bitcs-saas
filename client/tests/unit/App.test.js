// tests/App.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import App from '@/App.vue'
import LoginPage from '@/components/tenantPage/LoginPage.vue'
import RegisterPage from '@/components/tenantPage/RegisterPage.vue'
import UserPage from '@/components/tenantPage/UserPage.vue'
import NotFound from '@/components/NotFound.vue'

describe('App.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(App, {
      data() {
        return {
          currentPath: ''
        }
      }
    })
  })

  it('renders LoginPage by default', () => {
    expect(wrapper.findComponent(LoginPage).exists()).toBe(true)
  })

  it('renders RegisterPage when hash is #register', async () => {
    window.location.hash = '#register'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(RegisterPage).exists()).toBe(true)
  })

  it('renders UserPage when hash is #userPage', async () => {
    window.location.hash = '#userPage'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(UserPage).exists()).toBe(true)
  })

  it('renders NotFound for unknown paths', async () => {
    window.location.hash = '#unknown'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(NotFound).exists()).toBe(true)
  })

  it('updates currentPath on hashchange', async () => {
    window.location.hash = '#userPage'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.currentPath).toBe('#userPage')
  })
})
