import { mount } from '@vue/test-utils'
import LoginPage from '@/views/LoginPage.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import api from '@/utils/api.js' 

vi.mock('@/utils/api.js') // mock 新的 api 模块

describe('LoginPage.vue', () => {
  let wrapper

  beforeEach(() => {
    const mockLocalStorage = {
      getItem: vi.fn((key) => {
        switch (key) {
          case 'companyLoginForm':
            return JSON.stringify({ name: 'companyName', password: 'companyPass', rememberMe: true });
          case 'employeeLoginForm':
            return JSON.stringify({ name: 'employeeName', password: 'employeePass', rememberMe: true });
          default:
            return null;
        }
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    wrapper = mount(LoginPage)
  })

  it('should load remembered employee login form from localStorage', () => {
    wrapper = mount(LoginPage);
    
    expect(wrapper.vm.form.employee.name).toBe('employeeName');
    expect(wrapper.vm.form.employee.password).toBe('employeePass');
    expect(wrapper.vm.form.employee.rememberMe).toBe(true);
  });

  it('正确渲染登录界面', () => {
    expect(wrapper.find('h2').text()).toBe('租户登录')
    expect(wrapper.find('label[for="username"]').text()).toBe('公司名称:')
    expect(wrapper.find('label[for="password"]').text()).toBe('密码:')
  })

  it('当input变化时，更新数据', async () => {
    const nameInput = wrapper.find('input#username')
    const passwordInput = wrapper.find('input#password')
    
    await nameInput.setValue('testname')
    expect(wrapper.vm.form.company.name).toBe('testname')
    await passwordInput.setValue('testpassword')
    expect(wrapper.vm.form.company.password).toBe('testpassword')
  })

  it('提交表单时，禁用按钮并显示“登录中...”', async () => {
    // 模拟 100ms 延迟
    api.tenantLogin.mockResolvedValue(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { token: 'testtoken' } });
        }, 100);
      })
    )
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.find('button.form-button').text()).toBe('登录中...')
  })

  it('提交完成后，恢复登录按钮状态', async () => {
    api.tenantLogin.mockResolvedValue({ data: { token: 'testtoken' } })
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.find('button.form-button').text()).toBe('登录')
  })

  it('登录成功后弹出成功alert提示', async () => {
    api.tenantLogin.mockResolvedValue({ data: { token: 'testtoken' } })
    
    window.alert = vi.fn()
    
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setChecked();
    wrapper.vm.form.company.rememberMe=false
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalledWith('登录成功')
  })

  it('登录失败（请求错误），弹出失败提示', async () => {
    api.tenantLogin.mockRejectedValue(new Error('登录失败'))
    
    window.alert = vi.fn()
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalledWith('登录失败：登录失败')
  })

  it('登录验证失败，弹出带有response.data的失败信息', async () => {
    const errorResponse = { response: { data: 'Invalid credentials' } }
    api.tenantLogin.mockRejectedValue(errorResponse)
    
    window.alert = vi.fn()
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalledWith(`登录失败：${errorResponse.response.data}`)
  })
  
  it('点击注册按钮导航到注册页面', async () => {
    const registerButton = wrapper.find('button.link-button')
    
    registerButton.trigger('click')
    
    await wrapper.vm.$nextTick()
    
    expect(window.location.hash).toBe('#register')
  })


  it('点击按钮切换公司/员工登录', async () => {
    const companyButton = wrapper.find('#comBut');
    const employeeButton = wrapper.find('#emBut');

    await employeeButton.trigger('click');
    expect(wrapper.vm.loginType).toBe('employee');

    await companyButton.trigger('click');
    expect(wrapper.vm.loginType).toBe('company');
  });

  it('点击记住密码', async () => {
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setChecked();
    expect(wrapper.vm.curForm.rememberMe).toBe(true);

    
    const employeeButton = wrapper.find('#emBut');
    await employeeButton.trigger('click');

    await checkbox.setChecked(false);
    expect(wrapper.vm.curForm.rememberMe).toBe(false);
  });

  it('员工登录', async () => {
    api.tenantLogin.mockResolvedValue({ data: { token: 'testtoken' } })
    
    window.alert = vi.fn()
    const employeeButton = wrapper.find('#emBut');
    await employeeButton.trigger('click');
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setChecked();
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalled()
  })
  
  it('员工记住登录', async () => {
    api.tenantLogin.mockResolvedValue({ data: { token: 'testtoken' } })
    
    window.alert = vi.fn()
    const employeeButton = wrapper.find('#emBut');
    await employeeButton.trigger('click');
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setChecked(false);
    wrapper.vm.form.employee.rememberMe=false
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalled()
  })

  it('员工登录失败，弹出失败提示', async () => {
    api.tenantLogin.mockRejectedValue(new Error('登录失败'))
    
    window.alert = vi.fn()
    const employeeButton = wrapper.find('#emBut');
    await employeeButton.trigger('click');
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalled()
  })

  it('员工登录登录失败，弹出带有response.data的失败信息', async () => {
    const errorResponse = { response: { data: 'Invalid credentials' } }
    api.tenantLogin.mockRejectedValue(errorResponse)
    const employeeButton = wrapper.find('#emBut');
    await employeeButton.trigger('click');
    
    window.alert = vi.fn()
    
    await wrapper.setData({ name: 'testname', password: 'testpassword' })
    await wrapper.find('form').trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    expect(window.alert).toHaveBeenCalled()
  })
});
