import { mount, flushPromises } from '@vue/test-utils'
import AssignmentPage from '@/views/tenant/AssignmentPage.vue'
// import PieChart from '@/components/PieChart.vue'
import ModalForm from '@/components/ModalForm.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import api from '@/utils/api.js'

// Mocking the API
vi.mock('@/utils/api.js')

// Create stub components
const PieChartStub = {
  template: '<div class="pie-chart-stub"></div>',
  props: ['projects', 'projectInfo'],
}

describe('AssignmentPage.vue', () => {
  //   let wrapper

  const mockClientsAndProjects = {
    data: {
      clients: [],
      projects: [
        { _id: 'project1', name: '项目1' },
        { _id: 'project2', name: '项目2' }
      ]
    }
  }

  const mockTenantStructAndStuffs = {
    data: {
      stuffs: [
        { _id: 'stuff1', name: '员工1', projects: { project1: { ratio: 0.5 } } },
        { _id: 'stuff2', name: '员工2', projects: { project2: { ratio: 0.3 } } }
      ]
    }
  }

  const mountData = {
    global: {
      components: {
        PieChart: PieChartStub ,
        // ModalForm
      }
    }
  }

  beforeEach(async () => {
    api.getClientsAndProjects.mockResolvedValue(mockClientsAndProjects)
    api.getTenantStructAndStuffs.mockResolvedValue(mockTenantStructAndStuffs)

    // await flushPromises()
  })

  it('正确渲染表格', async () => {
    const wrapper = mount(AssignmentPage, mountData)
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('人员分配')
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr').length).toBe(2)
    expect(wrapper.findAll('thead th').length).toBe(3)
    expect(wrapper.findAll('thead th').at(0).text()).toBe('人员')
    expect(wrapper.findAll('thead th').at(1).text()).toBe('项目分配情况')
    expect(wrapper.findAll('thead th').at(2).text()).toBe('分配项目')

    const rows = wrapper.findAll('tbody tr')
    expect(rows.at(0).find('td').text()).toBe('员工1')
    expect(rows.at(1).find('td').text()).toBe('员工2')

    const pieCharts = wrapper.findAllComponents(PieChartStub)
    expect(pieCharts.length).toBe(2)
    expect(pieCharts.at(0).props('projects')).toEqual({ 'project1': { ratio: 0.5 } })
    expect(pieCharts.at(1).props('projects')).toEqual({ 'project2': { ratio: 0.3 } })
    expect(pieCharts.at(0).props('projectInfo')).toEqual(wrapper.vm.projectInfo)
    expect(pieCharts.at(1).props('projectInfo')).toEqual(wrapper.vm.projectInfo)
  })

  it('显示加载中状态', async () => {
    // 模拟50ms延迟
    api.getClientsAndProjects.mockResolvedValue(
      new Promise((resolve) => setTimeout(() => resolve(mockClientsAndProjects), 50))
    )
    const wrapper = mount(AssignmentPage, mountData)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#loadingText').text()).toBe('加载中...')
    expect(wrapper.find('div').text()).toBe('人员分配加载中...')
    // 等待50ms
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(wrapper.find('div').text()).not.toBe('人员分配加载中...')
  })

  it('API失效时显示错误信息', async () => {
    const errorMessage = '获取数据失败。请重新登录！'
    api.getClientsAndProjects.mockRejectedValue(new Error(errorMessage))
    window.alert = vi.fn()
    const wrapper = mount(AssignmentPage, mountData)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(window.alert).toHaveBeenCalledWith('获取数据失败。请重新登录！')
    expect(window.location.hash).toBe('#login')
    // expect(wrapper.find('div').text()).toContain(errorMessage)
  })

  it('点击编辑弹出模态框', async () => {
    api.getClientsAndProjects.mockResolvedValue(mockClientsAndProjects)
    api.getTenantStructAndStuffs.mockResolvedValue(mockTenantStructAndStuffs)
    const wrapper = mount(AssignmentPage, mountData)
    await new Promise((resolve) => setTimeout(resolve, 50))
    await wrapper.find('button.btn-edit').trigger('click')
    expect(wrapper.findComponent(ModalForm).exists()).toBe(true)
  })

  it('处理项目添加', async () => {
    const wrapper = mount(AssignmentPage, mountData)
    await new Promise((resolve) => setTimeout(resolve, 50))
    await wrapper.find('button.btn-edit').trigger('click')

    wrapper.vm.curProjects = [
        { id: 'project1', ratio: 100 },
        { id: 'project2', ratio: 30 }
      ]
    await wrapper.find('form').trigger('submit.prevent')
    wrapper.vm.curProjects = [
        { id: 'project1', ratio: 10 },
      ]

    const newProjectId = 'project2'
    await wrapper.setData({ newProjectId:'' })
    await wrapper.find('button.addButton').trigger('click')
    await wrapper.setData({ newProjectId })
    await new Promise((resolve) => setTimeout(resolve, 50))
    let ratioInput = wrapper.find('input.changeRatio')
    await ratioInput.setValue(-1)
    await ratioInput.setValue(50)
    ratioInput = wrapper.find('input#newRatio')
    await ratioInput.setValue(0)
    await wrapper.find('button.addButton').trigger('click')
    await ratioInput.setValue(101)
    await ratioInput.setValue(30)
    await wrapper.find('button.addButton').trigger('click')

    expect(wrapper.vm.curProjects).toEqual([
      { id: 'project1', ratio: 50 },
      { id: 'project2', ratio: 30 }
    ])
  })

  it('处理项目删除', async () => {
    const wrapper = mount(AssignmentPage, mountData)
    await new Promise((resolve) => setTimeout(resolve, 50))
    await wrapper.find('button.btn-edit').trigger('click')
    await wrapper.find('button.delButton').trigger('click')

    expect(wrapper.vm.curProjects).toEqual([])
  })

  it('处理表单提交', async () => {
    const wrapper = mount(AssignmentPage, mountData)
    await new Promise((resolve) => setTimeout(resolve, 50))
    api.updateAssignment.mockRejectedValue(new Error('网络错误'))

    await wrapper.find('button.btn-edit').trigger('click')
    wrapper.vm.showEditModal=false;
    await wrapper.vm.$nextTick()
    await wrapper.find('button.btn-edit').trigger('click')
    await wrapper.find('form').trigger('submit.prevent')

    
    await wrapper.find('button.btn-edit').trigger('click')
    api.updateAssignment.mockResolvedValue({})
    await wrapper.find('form').trigger('submit.prevent')

    expect(api.updateAssignment).toHaveBeenCalled()
  })
})
