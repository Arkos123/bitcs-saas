// tests/AllTenantInfo.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AllTenantInfo from '@/views/tenant/AllTenantInfo.vue'
import api from '@/utils/api.js'

vi.mock('@/utils/api.js')

describe('AllTenantInfo.vue', () => {
  let wrapper
  let cnt = 0
  let errorMessage = ''

  beforeEach(() => {
    cnt++
    if (cnt === 4) {
      errorMessage = { response: { data: 'Network Error' } }
      api.getAllTenantData.mockRejectedValue(errorMessage)
    } else if (cnt === 5) {
      tenants = [
        {
          _id: '1',
          name: 'Company A',
          address: 'Address A',
          phone: '123456',
          contact: 'Contact A'
        },
        { _id: '2', name: 'Company B', address: null, phone: null, contact: null }
      ]
      api.getAllTenantData.mockResolvedValue({ data: tenants })
    }
    wrapper = mount(AllTenantInfo)
  })

  api.getAllTenantData.mockResolvedValue({ data: [] })

  it('正确渲染表格', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('h1').text()).toBe('已注册公司信息')
    const headers = wrapper.findAll('th')
    expect(headers[0].text()).toBe('公司名称')
    expect(headers[1].text()).toBe('地址')
    expect(headers[2].text()).toBe('联系电话')
    expect(headers[3].text()).toBe('联系人姓名')
  })

  it('显示初始时的加载信息', () => {
    expect(wrapper.find('div').text()).toContain('加载中...')
  })

  let tenants = [
    { _id: '1', name: 'Company A', address: 'Address A', phone: '123456', contact: 'Contact A' },
    { _id: '2', name: 'Company B', address: 'Address B', phone: '654321', contact: 'Contact B' }
  ]

  api.getAllTenantData.mockResolvedValue({ data: tenants })

  it('进入时获取tenant信息', async () => {
    await wrapper.vm.$nextTick() // wait for component to mount and fetch data
    expect(wrapper.vm.tenants).toEqual(tenants)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  it('处理信息获取错误的情况', async () => {
    await wrapper.vm.$nextTick() // wait for component to mount and fetch data
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.error).toBe(`获取数据失败。请稍后重试：${errorMessage.response.data}`)
    expect(wrapper.find('div').text()).toContain(`获取数据失败。请稍后重试：${errorMessage.response.data}`)
  })

  it('displays tenant data correctly', async () => {
    await wrapper.vm.$nextTick() // wait for component to mount and fetch data
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(2)
    expect(rows[0].findAll('td')[0].text()).toBe('Company A')
    expect(rows[0].findAll('td')[1].text()).toBe('Address A')
    expect(rows[0].findAll('td')[2].text()).toBe('123456')
    expect(rows[0].findAll('td')[3].text()).toBe('Contact A')

    expect(rows[1].findAll('td')[0].text()).toBe('Company B')
    expect(rows[1].findAll('td')[1].text()).toBe('未填写')
    expect(rows[1].findAll('td')[2].text()).toBe('未填写')
    expect(rows[1].findAll('td')[3].text()).toBe('未填写')
  })
})
