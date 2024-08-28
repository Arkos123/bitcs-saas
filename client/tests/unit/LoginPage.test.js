// 登录页面单元测试

import { mount } from '@vue/test-utils'
import LoginPage from '@/components/tenantPage/LoginPage.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import apiClient from '@/utils/apiClient.js'

vi.mock('@/utils//apiClient.js')

describe('LoginPage.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginPage)
  })

  it('正确渲染登录界面', () => {
    expect(wrapper.find('h2').text()).toBe('租户登录')
    expect(wrapper.find('label[for="username"]').text()).toBe('公司名称:')
    expect(wrapper.find('label[for="password"]').text()).toBe('密码:')
  })

  it('当input变化时，更新数据', async () => {
    const nameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    
    await nameInput.setValue('testname')
    await passwordInput.setValue('testpassword')
    
    expect(wrapper.vm.name).toBe('testname')
    expect(wrapper.vm.password).toBe('testpassword')
  })

  it('提交表单时，禁用按钮并显示“登录中...”', async () => {
    // 模拟 100ms 延迟
    apiClient.post.mockResolvedValue(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { token: 'testtoken' } });
        }, 100);
      })
    );
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.find('button.form-button').text()).toBe('登录中...')
  })

  it('提交完成后，恢复登录按钮状态', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 'testtoken' } })
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.find('button.form-button').text()).toBe('登录')
  })

  it('登录成功后弹出成功alert提示', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 'testtoken' } })
    
    window.alert = vi.fn()
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalledWith('登录成功')
  })

  it('登录失败（请求错误），弹出失败提示', async () => {
    apiClient.post.mockRejectedValue(new Error('登录失败'))
    
    window.alert = vi.fn()
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalledWith('登录失败：登录失败')
  })

  it('登录验证失败，弹出带有response.data的失败信息', async () => {
    const errorResponse = { response: { data: 'Invalid credentials' } };
    apiClient.post.mockRejectedValue(errorResponse);
    
    window.alert = vi.fn();
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' });
    await wrapper.find('form').trigger('submit.prevent');
    
    await wrapper.vm.$nextTick();
    
    expect(window.alert).toHaveBeenCalledWith(`登录失败：${errorResponse.response.data}`);
  });
  
  

  it('点击注册按钮导航到注册页面', async () => {
    const registerButton = wrapper.find('button.link-button')
    
    registerButton.trigger('click')
    
    await wrapper.vm.$nextTick()
    
    expect(window.location.hash).toBe('#register')
  })
})
