// tests/UserPage.spec.js
import { mount } from '@vue/test-utils'
import UserPage from '@/components/tenantPage/UserPage.vue'
import ProfilePage from '@/components/tenantPage/ProfilePage.vue'
import AllTenantInfo from '@/components/tenantPage/AllTenantInfo.vue'
import NotFound from '@/components/NotFound.vue'
import { describe, it, expect, beforeEach } from 'vitest'

// Mocking window.location.hash
const mockHashChange = (newHash) => {
  Object.defineProperty(window, 'location', {
    value: {
      hash: newHash,
    },
    writable: true,
  })
  window.dispatchEvent(new Event('hashchange'))
}

describe('UserPage.vue', () => {
  let wrapper

  beforeEach(() => {
    // Mount the component
    wrapper = mount(UserPage)
  })

  it('路径为空，默认渲染Profile页', async () => {
    // Assert default behavior when hash is empty
    expect(wrapper.findComponent(ProfilePage).exists()).toBe(true)
  })

  it('路径为#userPage/profile 渲染Profile页', async () => {
    // Simulate hash change to #userPage/profile
    mockHashChange('#userPage/profile')
    
    // Assert that ProfilePage is rendered
    expect(wrapper.findComponent(ProfilePage).exists()).toBe(true)
  })

  it('路径为#userPage/profile 渲染AllTenantInfo页', async () => {
    // Simulate hash change to #userPage/allTenant
    mockHashChange('#userPage/allTenant')
    
    await wrapper.vm.$nextTick()
    // Assert that AllTenantInfo is rendered
    expect(wrapper.findComponent(AllTenantInfo).exists()).toBe(true)
  })

  it('未知路径显示 NotFound 页', async () => {
    // Simulate hash change to an unknown route
    mockHashChange('#userPage/unknown')
    
    await wrapper.vm.$nextTick()
    // Assert that NotFound component is rendered
    expect(wrapper.findComponent(NotFound).exists()).toBe(true)
  })

//   it('updates currentPath when hash changes', async () => {
//     // Simulate hash change to #userPage/allTenant
//     mockHashChange('#userPage/allTenant')
    
//     // Assert that currentPath is updated correctly
//     expect(wrapper.vm.currentPath).toBe('#userPage/allTenant')
//   })

  it('当路径和tab按钮匹配时，active tab按钮', async () => {
    // Simulate hash change to #userPage/allTenant
    mockHashChange('#userPage/allTenant')
    
    await wrapper.vm.$nextTick()
    // Assert that active class is applied to the correct tab link
    const allTenantTab = wrapper.find('a[href="#userPage/allTenant"]')
    expect(allTenantTab.classes()).toContain('active')
  })
})
