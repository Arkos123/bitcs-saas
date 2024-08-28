// tests/ProfilePage.spec.js
// 公司信息查看、编辑页
import { mount } from '@vue/test-utils'
import ProfilePage from '@/components/tenantPage/ProfilePage.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import apiClient from '@/utils/apiClient.js'

// Mocking API calls
vi.mock('@/utils/apiClient.js')

describe('ProfilePage.vue', async () => {
  let wrapper
  let localStorageMock = (function () {
    let store = {}

    return {
      getItem: vi.fn(function (key) {
        return 'key'
      }),
      setItem: vi.fn(function (key, value) {
        store[key] = value.toString()
      }),
      removeItem: function (key) {
        delete store[key]
      },
      clear: function () {
        store = {}
      }
    }
  })()

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  beforeEach(() => {
    window.alert = vi.fn()
    // Mount the component
    wrapper = mount(ProfilePage)
  })
  apiClient.get.mockRejectedValue({})

  it('网络异常时渲染提示', async () => {
    // Assert loading state initially
    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  apiClient.get.mockResolvedValue({
    data: {
      name: 'Test Company',
      address: '123 Test St',
      contact: 'HPY',
      phone: '12345678901'
    }
  })

  it('获取租户信息，填入表单', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // Assert form fields are filled correctly
    expect(wrapper.find('input#name').element.value).toBe('Test Company')
    expect(wrapper.find('input#address').element.value).toBe('123 Test St')
    expect(wrapper.find('input#contact').element.value).toBe('HPY')
    expect(wrapper.find('input#phone').element.value).toBe('12345678901')
  })

  it('当修改的公司名超过50，显示错误提示', async () => {
    await wrapper.vm.$nextTick()
    // Set a name longer than 50 characters
    await wrapper.setData(
        { fields: [{ id: 'name', model: 'a'.repeat(51) }, { id: 'address', model: 'a'.repeat(10) }, { id: 'phone', model: '1'.repeat(11) }] },
    )
    // Trigger validation
    wrapper.vm.validateName()
    wrapper.vm.validateAddress()
    wrapper.vm.validatePhone()
    await wrapper.vm.$nextTick()
    // Assert error message is displayed
    expect(wrapper.find('.error').text()).toContain('公司名称不能超过50个字符')
  })

  it('其他表单异常', async () => {
    await wrapper.vm.$nextTick()
    // Set a name longer than 50 characters
    await wrapper.setData(
        { fields: [{ id: 'name', model: 'a'.repeat(10) }, { id: 'address', model: 'a'.repeat(51) }, { id: 'phone', model: '1'.repeat(15) }] },
    )
    // Trigger validation
    wrapper.vm.validateName()
    wrapper.vm.validateAddress()
    wrapper.vm.validatePhone()
    await wrapper.vm.$nextTick()
    // Assert error message is displayed
    expect(wrapper.find('.error').text()).toContain('不能超过50个字符')
  })

  it('字段非法时，修改按钮禁用', async () => {
    // Set fields to invalid state
    await wrapper.vm.$nextTick()
    await wrapper.setData({ fields: [{ id: 'name', error: '公司名称不能超过50个字符' }] })
    await wrapper.vm.$nextTick()

    // Assert submit button is disabled
    expect(wrapper.find('button[type="submit"]').isDisabled()).toBe(false)
  })

  it('成功提交修改数据', async () => {
    // Mock successful API response
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    window.alert = vi.fn()
    apiClient.put.mockResolvedValue({})

    // Simulate form submission
    await wrapper.vm.handleSubmit()

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // Assert success alert is shown
    expect(window.alert).toHaveBeenCalledWith('公司信息已保存')

    apiClient.put.mockRejectedValue(new Error('网络错误'))
    await wrapper.vm.handleSubmit()
    // Assert success alert is shown
    expect(window.alert).toHaveBeenCalled()
    apiClient.put.mockRejectedValue(new Error('duplicate key error'))
    await wrapper.vm.handleSubmit()
    // Assert success alert is shown
    expect(window.alert).toHaveBeenCalled()
  })

  it('处理公司注销', async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 210)
    })
    // Mock confirmation dialog
    window.confirm = vi.fn().mockReturnValueOnce(true)
    await wrapper.vm.$nextTick()
    window.alert = vi.fn()

    apiClient.put.mockRejectedValue(new Error('网络错误'))
    // Mock successful deletion API response
    apiClient.delete.mockResolvedValue({})
    // Simulate deletion button click
    await wrapper.vm.handleDelete()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // Assert success alert is shown and redirected to login page
    expect(window.alert).toHaveBeenCalledWith('公司已注销')
    expect(window.location.hash).toBe('#login')
  })
})
