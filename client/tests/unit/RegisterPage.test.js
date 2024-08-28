// RegisterPage.vue 注册页面单元测试

import { mount } from '@vue/test-utils'
import RegisterPage from '@/components/tenantPage/RegisterPage.vue'
import axios from 'axios'
import { describe, it, expect, beforeEach, vi } from 'vitest'
// import { API_BASE_URL } from '../src/utils/util.js'

vi.mock('axios')

describe('RegisterPage.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(RegisterPage)
  })

  it('注册表单渲染正确', () => {
    expect(wrapper.find('h2').text()).toBe('租户注册')
    expect(wrapper.findAll('form').length).toBe(1)
    expect(wrapper.findAll('input').length).toBe(4) // Ensure all input fields are rendered
    expect(wrapper.find('button.back-button').text()).toBe('返回')
  })

  it('input输入后正确更新数据', async () => {
    let nameInput = wrapper.find('input#name')
    await nameInput.setValue('testname')
    expect(wrapper.vm.fields.find(field => field.id === 'name').model).toBe('testname')
    nameInput = wrapper.find('input#address')
    await nameInput.setValue('testaddr')
    expect(wrapper.vm.fields.find(field => field.id === 'address').model).toBe('testaddr')
  })

  it('提交表单时，按钮显示加载状态', async () => {
    axios.post.mockResolvedValue(
        new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 100);
        })
      );

    await wrapper.setData({
      fields: [
        { id: 'name', model: 'testname' },
        { id: 'address', model: 'testaddress' },
        { id: 'phone', model: '12345678901' },
        { id: 'password', model: 'Test1234' }
      ]
    })

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('注册中...')
  })

  it('提交完成后，按钮恢复初始状态', async () => {
    axios.post.mockResolvedValue({})

    await wrapper.setData({
      fields: [
        { id: 'name', model: 'testname' },
        { id: 'address', model: 'testaddress' },
        { id: 'phone', model: '12345678901' },
        { id: 'password', model: 'Test1234' }
      ]
    })

    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.find('button[type="submit"]').text()).toBe('注册')
  })

  it('注册成功时弹出alert提示', async () => {
    axios.post.mockResolvedValue({})

    window.alert = vi.fn()

    await wrapper.setData({
      fields: [
        { id: 'name', model: 'testname' },
        { id: 'address', model: 'testaddress' },
        { id: 'phone', model: '12345678901' },
        { id: 'password', model: 'Test1234' }
      ]
    })

    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(window.alert).toHaveBeenCalledWith('注册成功, 用户名: testname')
  })

  it('注册失败时弹出alert提示', async () => {
    const errorMessage = '测试失败消息'
    axios.post.mockRejectedValue(new Error(errorMessage))

    window.alert = vi.fn()

    await wrapper.setData({
      fields: [
        { id: 'name', model: 'testname' },
        { id: 'address', model: 'testaddress' },
        { id: 'phone', model: '12345678901' },
        { id: 'password', model: 'Test1234' }
      ]
    })

    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(window.alert).toHaveBeenCalledWith("注册失败："+errorMessage)

    
    const errorResponse = { response: { data: 'Invalid credentials' } };
    axios.post.mockRejectedValue(errorResponse)
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(window.alert).toHaveBeenCalledWith("注册失败："+errorResponse.response.data)
  })

  it('点击返回按钮时，回到Login页面', async () => {
    const backButton = wrapper.find('button.back-button')

    backButton.trigger('click')

    await wrapper.vm.$nextTick()

    expect(window.location.hash).toBe('#login')
  })
  // 验证表单格式

  it('公司名称、地址长度超过50字时禁用按钮', async () => {
    await wrapper.setData({
      fields: [
        { id: 'name', model: 'a'.repeat(51) }, // More than 50 characters
        { id: 'address', model: 'b'.repeat(53) },
        { id: 'phone', model: '12345678901' },
        { id: 'password', model: 'ValidPassword123' }
      ]
    })
    wrapper.vm.validateName()
    wrapper.vm.validateAddress()
    
    expect(wrapper.vm.fields.find(field => field.id === 'name').error).toBe('公司名称不能超过50个字符')
    expect(wrapper.vm.fields.find(field => field.id === 'address').error).toBe('地址不能超过50个字符')
    expect(wrapper.vm.isFormInvalid).toBe(true)
  })
  

  it('正确验证电话、密码格式', async () => {
    await wrapper.setData({
      fields: [
        { id: 'name', model: 'testname' },
        { id: 'address', model: 'testaddress' },
        { id: 'phone', model: '12345' },
        { id: 'password', model: 'Abc1' }
      ]
    })
    wrapper.vm.validatePhone()
    wrapper.vm.validatePassword()
    
    expect(wrapper.vm.fields.find(field => field.id === 'phone').error).toBe('电话号码必须为11位数字')
    expect(wrapper.vm.fields.find(field => field.id === 'password').error).toBe('密码必须至少8个字符，包含字母和数字')

    expect(wrapper.vm.isFormInvalid).toBe(true)
    await wrapper.setData({
      fields: [
        { id: 'name', model: 'testname' },
        { id: 'address', model: 'testaddress' },
        { id: 'phone', model: '13828233344' },
        { id: 'password', model: 'Abcdefg1' }
      ]
    })
    wrapper.vm.validatePhone()
    wrapper.vm.validatePassword()
    
    expect(wrapper.vm.fields.find(field => field.id === 'phone').error).toBe('')
    expect(wrapper.vm.fields.find(field => field.id === 'password').error).toBe('')

    expect(wrapper.vm.isFormInvalid).toBe(true)


  })
  
})
