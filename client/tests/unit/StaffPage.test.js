import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils';
import TreeItem from '@/views/tenant/organizationPage/TreeItem.vue'
import ModalForm from '@/components/ModalForm.vue'
import StaffPage from '@/views/tenant/organizationPage/StaffPage.vue'
import api from '@/utils/api'

vi.mock('@/utils/api')

describe('StaffPage.vue', () => {
    
  const stuffNode = { type: 'stuff', id: 'staff1' }
  const deptNode = {
    type: 'dept',
    name: '部门A',
    stuffs: [stuffNode]
  }
  const rootNode = {
    type: 'dept',
    name: '当前公司',
    stuffs: [deptNode]
  }
  const stuffInfo = {
    staff1: {
      _id: 'staff1',
      name: '张三',
      position: '开发',
      phone: '13370000303',
      password: 'john12345678'
    }
  }
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('显示加载中', () => {
    api.getTenantStructAndStuffs.mockResolvedValue(
        // 50ms后返回
        new Promise((resolve) => setTimeout(() => resolve({}), 50))
    )
    const wrapper = mount(StaffPage)
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.item').exists()).toBe(false)
  })

  it('正确渲染树形结构', async () => {
    const mockResponse = {
      data: {
        struct: [{ _id: '1', name: 'Dept1', type: 'dept', stuffs:[{ _id: '3', id: '2', type: 'stuff' }] }],
        stuffs: [{ _id: '2', name: 'John Doe' }]
      }
    }
    api.getTenantStructAndStuffs.mockResolvedValue(mockResponse)

    const wrapper = await mount(StaffPage)

    // 等待 mounted 钩子完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isLoading).toBe(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(wrapper.find('.item').exists()).toBe(false)
  })

  it('API失败时提示网络错误', async () => {
    const mockError = new Error('Network Error')
    api.getTenantStructAndStuffs.mockRejectedValue(mockError)
    window.alert = vi.fn()
    window.location.hash = ''

    const wrapper = mount(StaffPage)

    // 等待 mounted 钩子完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isLoading).toBe(true)
    expect(window.alert).toHaveBeenCalledWith('获取数据失败。请重新登录！')
    expect(window.location.hash).toBe('#login')
  })

  
  it('正确部门信息', () => {
    const wrapper = mount(TreeItem, {
       propsData: { model:rootNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[] }
    })
    const folderName = wrapper.find('.foldername')
    expect(folderName.exists()).toBe(true)
  })

  it('点击收起/展开部门', async () => {
    const wrapper = mount(TreeItem, {
       propsData: { model: deptNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[], depth:1 }
    })
    const treeItemContent = wrapper.find('.tree-item-content')
    expect(wrapper.vm.isOpen).toBe(false)
    await treeItemContent.trigger('click')
    expect(wrapper.vm.isOpen).toBe(true)
    await treeItemContent.trigger('click')
    expect(wrapper.vm.isOpen).toBe(false)
  })

  it('渲染员工', () => {
    const wrapper = mount(TreeItem, {
       propsData: { model: stuffNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[], depth:2 }
    }) 
    const employeeItem = wrapper.findAll('.tree-item-content').at(0)
    expect(employeeItem.text()).toContain('👨🏻 张三')
    expect(employeeItem.text()).toContain('开发')
  })

  it('当点击编辑时，显示模态框', async () => {
    {
        const wrapper = mount(TreeItem, {
           propsData: { model: deptNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[], depth:1 }
        })
        const div = wrapper.findAll('.tree-item-content').at(0)
        await div.trigger('mouseover')
        const editIcon = wrapper.find('.edit-icon')
        await editIcon.trigger('click')
        const modalForm = wrapper.findComponent(ModalForm)
        expect(modalForm.exists()).toBe(true)
    }
    {
        const wrapper = mount(TreeItem, {
            propsData: { model: stuffNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[], depth:2 }
        })
        const div = wrapper.findAll('.tree-item-content').at(0)
        await div.trigger('mouseover')
        const editIcon = wrapper.find('.edit-icon')
        await editIcon.trigger('click')
        const modalForm = wrapper.findComponent(ModalForm)
        expect(modalForm.exists()).toBe(true)
    }
  })

  it('点击添加人员模块框', async () => {
    const model = {
      name: '部门A',
      type: 'dept',
      stuffs: []
    };
    const stuffInfo = {};
    const allStruct = [];
    const wrapper = shallowMount(TreeItem, {
      propsData: { model, stuffInfo, allStruct }
    });

    // Find the add button and click it
    const addButton = wrapper.find('.add');
    await addButton.trigger('click');

    // Check if the add modal is displayed
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);
  });

  it('测试添加部门', async () => {
    {
        const wrapper = mount(TreeItem, {
           propsData: { model: deptNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[], depth:1 }
        })
        const div = wrapper.findAll('.tree-item-content').at(0)
        await div.trigger('mouseover')
        const editIcon = wrapper.find('.edit-icon')
        await editIcon.trigger('click')
        const modalForm = wrapper.findComponent(ModalForm)
        expect(modalForm.exists()).toBe(true)
    }
    {
        const wrapper = mount(TreeItem, {
            propsData: { model: stuffNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[], depth:2 }
        })
        const div = wrapper.findAll('.tree-item-content').at(0)
        await div.trigger('mouseover')
        const editIcon = wrapper.find('.edit-icon')
        await editIcon.trigger('click')
        const modalForm = wrapper.findComponent(ModalForm)
        expect(modalForm.exists()).toBe(true)
    }
  })

  it('测试添加人员', async () => {
    const model = {
      name: '部门A',
      type: 'dept',
      stuffs: []
    };
    const stuffInfo = {};
    const allStruct = [];
    const wrapper = shallowMount(TreeItem, {
      propsData: { model, stuffInfo, allStruct }
    });

    // Find the add button and click it
    const addButton = wrapper.find('.add');
    await addButton.trigger('click');

    // Check if the add modal is displayed
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);
  });

  it('测试编辑人员信息', async () => {
    const wrapper = mount(TreeItem, {
        propsData: { model: deptNode, stuffInfo, allStruct: rootNode.stuffs, curDict:[], depth:1 }
     })
     const div = wrapper.findAll('.tree-item-content').at(0)
     await div.trigger('mouseover')
     const editIcon = wrapper.find('.edit-icon')
     await editIcon.trigger('click')
     const modalForm = wrapper.findComponent(ModalForm)
     expect(modalForm.exists()).toBe(true)
  })

  it('测试人员部门变动', async () => {
    const model = {
      name: '部门B',
      type: 'dept',
      stuffs: []
    };
    const stuffInfo = {};
    const allStruct = [];
    const wrapper = shallowMount(TreeItem, {
      propsData: { model, stuffInfo, allStruct }
    });
    const addButton = wrapper.find('.add');
    await addButton.trigger('click');
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);
  })
})

