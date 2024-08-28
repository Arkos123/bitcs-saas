// tests/ProfilePage.spec.js
// 公司信息查看、编辑页
import { mount } from '@vue/test-utils'
import ProfilePage from '@/views/tenant/ProfilePage.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import api from '@/utils/api.js'

// Mocking API calls
vi.mock('@/utils/api.js') // mock 新的 api 模块

describe('ProfilePage.vue', async () => {
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
    window.location.hash = '#/profile'
    window.alert = vi.fn()
    // Mount the component
  })

  it('成功加载并渲染', async() => {
    api.getTenantData.mockResolvedValueOnce({
      data: {
        name: 'Test Company',
        address: '123 Test St',
        contact: 'HPY',
        phone: '12345678901'
      }
    })
    let wrapper = mount(ProfilePage)
    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.findAll('.form-group').length).toBe(4)

    const testData = {
      name: 'New Company',
      address: '789 Test Ave',
      contact: 'New Contact Person',
      phone: '5555555555'
    }
    wrapper.vm.fillInput(testData)
    // 断言字段是否正确填充
    expect(wrapper.vm.fields.find(field => field.id === 'name').model).toBe('New Company')
    expect(wrapper.vm.fields.find(field => field.id === 'address').model).toBe('789 Test Ave')
    expect(wrapper.vm.fields.find(field => field.id === 'contact').model).toBe('New Contact Person')
    expect(wrapper.vm.fields.find(field => field.id === 'phone').model).toBe('5555555555')
    
    const fields = wrapper.findAll('.form-group')
    expect(fields.length).toBe(4)  // 假设有4个字段
    expect(fields.at(0).find('label').text()).toBe('公司名称:')
    expect(fields.at(1).find('label').text()).toBe('地址:')
    expect(fields.at(2).find('label').text()).toBe('联系人:')
    expect(fields.at(3).find('label').text()).toBe('电话:')

    // 模拟输入
    const companyNameInput = fields.at(0).find('input')
    await companyNameInput.setValue('New Test Company')

    const addressInput = fields.at(1).find('input')
    await addressInput.setValue('456 New St')

    const contactInput = fields.at(2).find('input')
    await contactInput.setValue('New Contact')

    const phoneInput = fields.at(3).find('input')
    await phoneInput.setValue('9876543210')

    // 断言输入值是否正确
    expect(companyNameInput.element.value).toBe('New Test Company')
    expect(addressInput.element.value).toBe('456 New St')
    expect(contactInput.element.value).toBe('New Contact')
    expect(phoneInput.element.value).toBe('9876543210')

    // 加载失败
    api.getTenantData.mockRejectedValue({})
    wrapper = mount(ProfilePage)
    expect(window.location.hash).toBe('#/profile')
  })

  it('等待加载完成', async () => {
    api.getTenantData.mockResolvedValueOnce(new Promise((resolve) => setTimeout(resolve({
      data: {
        name: 'Test Company',
        address: '123 Test St',
        contact: 'HPY',
        phone: '12345678901'
      }
    }), 50)))
    const wrapper = mount(ProfilePage)
    await wrapper.vm.$nextTick()
    // Assert loading state initially
    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('获取租户信息，填入表单', async () => {
    api.getTenantData.mockResolvedValueOnce({
      data: {
        name: 'Test Company',
        address: '123 Test St',
        contact: 'HPY',
        phone: '12345678901'
      }
    })
    const wrapper = mount(ProfilePage)
    // 等待30ms
    await new Promise(resolve => setTimeout(resolve, 30))
    // Assert form fields are filled correctly
    expect(wrapper.find('input#name').element.value).toBe('Test Company')
    expect(wrapper.find('input#address').element.value).toBe('123 Test St')
    expect(wrapper.find('input#contact').element.value).toBe('HPY')
    expect(wrapper.find('input#phone').element.value).toBe('12345678901')
  })

  it('当修改的公司名超过50，显示错误提示', async () => {
    api.getTenantData.mockResolvedValueOnce({
      data: {
        name: 'Test Company',
        address: '123 Test St',
        contact: 'HPY',
        phone: '12345678901'
      }
    })
    const wrapper = mount(ProfilePage)
    await new Promise(resolve => setTimeout(resolve, 30))
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
    api.getTenantData.mockResolvedValueOnce({
      data: {
        name: 'Test Company',
        address: '123 Test St',
        contact: 'HPY',
        phone: '12345678901'
      }
    })
    const wrapper = mount(ProfilePage)
    await new Promise(resolve => setTimeout(resolve, 30))
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
    api.getTenantData.mockResolvedValueOnce({
      data: {
        name: 'Test Company',
        address: '123 Test St',
        contact: 'HPY',
        phone: '12345678901'
      }
    })
    const wrapper = mount(ProfilePage)
    await new Promise(resolve => setTimeout(resolve, 30))
    // Set fields to invalid state
    await wrapper.vm.$nextTick()
    await wrapper.setData({ fields: [{ id: 'name', error: '公司名称不能超过50个字符' }] })
    await wrapper.vm.$nextTick()
    // Assert submit button is disabled
    expect(wrapper.find('button[type="submit"]').isDisabled()).toBe(false)
  })

  it('成功提交修改数据', async () => {
    api.getTenantData.mockResolvedValueOnce({
      data: {
        name: 'Test Company',
        address: '123 Test St',
        contact: 'HPY',
        phone: '12345678901'
      }
    })
    const wrapper = mount(ProfilePage)
    // Mock successful API response
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    window.alert = vi.fn()
    api.updateBasicTenantInfo.mockResolvedValueOnce({})

    // Simulate form submission
    await wrapper.vm.handleSubmit()

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // Assert success alert is shown
    expect(window.alert).toHaveBeenCalledWith('公司信息已保存')
    await wrapper.vm.$nextTick()

    api.updateBasicTenantInfo.mockRejectedValue(new Error('网络错误'))
    await wrapper.vm.$nextTick()
    // Simulate form submission
    await wrapper.vm.handleSubmit()
    // 等待promise
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // Assert success alert is shown
    expect(window.alert).toHaveBeenCalledWith('保存公司信息时发生错误：网络错误')

    await wrapper.vm.$nextTick()

    api.updateBasicTenantInfo.mockRejectedValue(new Error('duplicate key error'))
    await wrapper.vm.$nextTick()
    // Simulate form submission
    await wrapper.vm.handleSubmit()
    // 等待promise
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // Assert success alert is shown
    expect(window.alert).toHaveBeenCalledWith('保存公司信息时发生错误：网络错误')
  })

  it('处理公司注销', async () => {
    // Mock confirmation dialog
    const wrapper = mount(ProfilePage)
    window.confirm = vi.fn().mockReturnValueOnce(true);

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // Mock successful deletion API response again
    api.tenantDelete.mockResolvedValueOnce({});
    await wrapper.vm.$nextTick();

    // Simulate deletion button click
    window.alert = vi.fn()
    await wrapper.vm.handleDelete();

    // Assert success alert is shown and redirected to login page
    expect(window.alert).toHaveBeenCalledWith('公司已注销');
    expect(window.location.hash).toBe('#login');

    window.confirm = vi.fn().mockReturnValueOnce(true);
    // Mock network error on delete request
    api.tenantDelete.mockRejectedValueOnce({ response: { data: '网络错误' } });

    // Simulate deletion button click
    await wrapper.vm.$nextTick();
    await wrapper.vm.handleDelete();
    await wrapper.vm.$nextTick();

    // Assert error alert is shown for network error
    expect(window.alert).toHaveBeenCalledWith('注销公司时发生错误网络错误');
    expect(window.location.hash).toBe('#login');
    await wrapper.vm.$nextTick();

    // Reset mocks
    api.tenantDelete.mockReset();
  });
})
