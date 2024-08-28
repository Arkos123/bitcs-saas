import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, config } from '@vue/test-utils';
import TreeItem from '@/views/tenant/clientsPage/TreeItem.vue'
import ModalForm from '@/components/ModalForm.vue'
import StaffPage from '@/views/tenant/clientsPage/ClientsPage.vue'
import api from '@/utils/api'

vi.mock('@/utils/api')


describe('ClientsPage.vue', () => {
  const contractNode = {
    name: '合同1',
    salesperson: 'staff1',
    status: 'on',
    projects: ['project1']
  }
  const clientNode = {
    name: '客户1',
    accountManager: 'staff1',
    phone: '11451419198',
    contracts: [contractNode],
  }
  const rootNode = { name: '公司客户/项目', clients:[clientNode] }
  const projectInfo = {
      project1: {
        _id: 'project1',
        name: 'saas项目开发', 
        manager: 'staff1',  // 项目经理
        dateStart: new Date(),
        dateEnd: new Date(new Date().setDate(new Date().getDate() + 3)),
        status: 'normal'
      }
    };
  const stuffInfo = {
    staff1: {
      _id: 'staff1',
      name: '张三',
      position: '开发',
      phone: '13370000303',
      password: 'john12345678'
    }
  }
  
  api.updateClientsData.mockResolvedValue(rootNode.clients)
  api.registerProject.mockResolvedValue({data: projectInfo.project1})
  beforeEach(() => {
    console.warn = vi.fn();
    vi.clearAllMocks()
  })

  it('显示Loading', () => {
    api.getTenantStructAndStuffs.mockResolvedValue(
        new Promise((resolve) => setTimeout(() => resolve({}), 50))
    )
    api.getClientsAndProjects.mockResolvedValue({})
    const wrapper = mount(StaffPage)
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.item').exists()).toBe(false)
  })

  it('正确渲染客户/合同/项目结构', async () => {
    api.getTenantStructAndStuffs.mockResolvedValue({
      data: {
        struct: [{ _id: '1', name: 'Dept1', type: 'dept', stuffs:[{ _id: '3', id: '2', type: 'stuff' }] }],
        stuffs: [{ _id: '2', name: 'John Doe' }]
      }
    })
    api.getClientsAndProjects.mockResolvedValue({
      data: {
        clients: rootNode.clients,
        projects: [projectInfo.project1],
      }
    })
    const wrapper = await mount(StaffPage)

    // 等待 mounted 钩子完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isLoading).toBe(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(wrapper.find('.item').exists()).toBe(true)
  })

  it('API失败时提示网络错误', async () => {
    const mockError = new Error('Network Error')
    api.getClientsAndProjects.mockRejectedValue(mockError)
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

  
  it('正确显示合同名称', () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:rootNode, curDict:[], stuffInfo, projectInfo, depth: 0 }
    })
    const folderName = wrapper.find('.foldername')
    expect(folderName.exists()).toBe(true)
  })

  it('点击收起/展开节点', async () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:rootNode, curDict:[], stuffInfo, projectInfo, depth: 1 }
    })
    const treeItemContent = wrapper.find('.tree-item-content')
    expect(wrapper.vm.isOpen).toBe(false)
    await treeItemContent.trigger('click')
    expect(wrapper.vm.isOpen).toBe(true)
    await treeItemContent.trigger('click')
    expect(wrapper.vm.isOpen).toBe(false)
  })

  it('渲染客户', () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:clientNode, curDict:[], stuffInfo, projectInfo, depth: 1 }
    })
    const client = wrapper.findAll('.tree-item-content').at(0)
    expect(client.text()).toContain('客户1')
    expect(client.text()).toContain('客户')
  })

  it('当点击编辑时，显示模态框', async () => {
    // 客户编辑点击
    {
      const wrapper = mount(TreeItem, {
         propsData: { allClients:rootNode.clients, model:clientNode, curDict:[], stuffInfo, projectInfo, depth: 1 }
      })
        const div = wrapper.findAll('.tree-item-content').at(0)
        await div.trigger('mouseover')
        const editIcon = wrapper.find('.edit-icon')
        await editIcon.trigger('click')
        const modalForm = wrapper.findComponent(ModalForm)
        expect(modalForm.exists()).toBe(true)
    }
    // 合同编辑点击
    {
      const wrapper = mount(TreeItem, {
         propsData: { allClients:rootNode.clients, model:contractNode, curDict:[], stuffInfo, projectInfo, depth: 2 }
      })
        const div = wrapper.findAll('.tree-item-content').at(0)
        await div.trigger('mouseover')
        const editIcon = wrapper.find('.edit-icon')
        await editIcon.trigger('click')
        const modalForm = wrapper.findComponent(ModalForm)
        expect(modalForm.exists()).toBe(true)
    }
    // 项目编辑点击
    {
      const wrapper = mount(TreeItem, {
         propsData: { allClients:rootNode.clients, model:projectInfo.project1, curDict:[], stuffInfo, projectInfo, depth: 3 }
      })
        const div = wrapper.findAll('.tree-item-content').at(0)
        await div.trigger('mouseover')
        const editIcon = wrapper.find('.edit-icon')
        await editIcon.trigger('click')
        const modalForm = wrapper.findComponent(ModalForm)
        expect(modalForm.exists()).toBe(true)
    }
  })
  const editIcon = '.add';

  it('添加客户按钮点击', async () => {
    const wrapper = mount(TreeItem, {
      propsData: { allClients:[], model:{ name: '公司客户/项目', clients:[] }, curDict:[], stuffInfo, projectInfo, depth: 0 }
   })
   // 展开节点
  //  const treeItemContent = wrapper.find('.tree-item-content')
  //  expect(wrapper.vm.isOpen).toBe(true)
  //  await treeItemContent.trigger('click')
    // 点击添加客户按钮
    const addButton = wrapper.find('.add');
    await addButton.trigger('click');
    // Check if the add modal is displayed
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);
    await wrapper.setData({ showAddModal: true });
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // 添加客户
    expect(wrapper.vm.depth).toBe(0)
    expect(wrapper.vm.showAddModal).toBe(true)
    const inputs = addModal.findAll('input');
    const nameInput = inputs.at(0); // 第一个input是客户名称
    await nameInput.setValue('Test Client');

    const phoneInput = inputs.at(1); // 第二个input是客户电话
    await phoneInput.setValue('13828282828');

    const select = wrapper.find('select');
    await select.setValue('staff1');

    // Simulate form submission
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    // Check if the form data is correct
    expect(wrapper.vm.model.clients[0].name).toBe('Test Client');
    expect(wrapper.vm.model.clients[0].phone).toBe('13828282828');
    expect(wrapper.vm.model.clients[0].accountManager).toBe('staff1');
  });

  it('添加合同按钮点击', async () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:clientNode, curDict:[], stuffInfo, projectInfo, depth: 1 }
    })
    // Find the add button and click it
    const addButton = wrapper.findAll('.add').at(2);
    await addButton.trigger('click');
    // Check if the add modal is displayed
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const inputs = addModal.findAll('input');
    expect(inputs.length).toBe(1);

    const nameInput = inputs.at(0);
    await nameInput.setValue('Test Contract');

    const selects = addModal.findAll('select');
    expect(selects.length).toBe(2);

    const salespersonSelect = selects.at(0);
    await salespersonSelect.setValue('staff1');

    const statusSelect = selects.at(1);
    await statusSelect.setValue('off');

    // Simulate form submission
    const form = addModal.find('form');
    await form.trigger('submit.prevent');
    await wrapper.vm.$nextTick()

    // window.alert = vi.fn()
    // expect(window.alert).toHaveBeenCalledWith('获取数据失败。请重新登录！')
    expect(wrapper.vm.showAddModal).toBe(false)
    // Check if the form data is correct
    expect(wrapper.vm.model.contracts[1].name).toBe('Test Contract');
    expect(wrapper.vm.model.contracts[1].salesperson).toBe('staff1');
    expect(wrapper.vm.model.contracts[1].status).toBe('off');
  });
  
  it('添加项目按钮点击', async () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:contractNode, curDict:[], stuffInfo, projectInfo, depth: 2 }
    })
    // Find the add button and click it
    const addButton = wrapper.findAll('.add').at(1);
    await addButton.trigger('click');
    // Check if the add modal is displayed
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const inputs = addModal.findAll('input');
    // console.log(111111111,addModal.find('p').text())
    expect(inputs.length).toBe(3);

    const nameInput = inputs.at(0);
    await nameInput.setValue('新项目');

    const selects = addModal.findAll('select');
    expect(selects.length).toBe(4);

    const salespersonSelect = selects.at(0);
    await salespersonSelect.setValue('staff1');
    await selects.at(1).setValue('normal');

    await inputs.at(1).setValue('2023-1-1');
    await inputs.at(2).setValue('2023-2-1');

    // Simulate form submission
    const form = addModal.find('form');
    await form.trigger('submit.prevent');
    await wrapper.vm.$nextTick()

    // window.alert = vi.fn()
    // expect(window.alert).toHaveBeenCalledWith('获取数据失败。请重新登录！')
    expect(wrapper.vm.showAddModal).toBe(false)
  });

  
  it('编辑客户', async () => {
    const wrapper = mount(TreeItem, {
      propsData: { allClients:[], model:{ name: '公司客户/项目', clients:[] }, curDict:[], stuffInfo, projectInfo, depth: 0 }
   })
   // 展开节点
  //  const treeItemContent = wrapper.find('.tree-item-content')
  //  expect(wrapper.vm.isOpen).toBe(true)
  //  await treeItemContent.trigger('click')
    // 点击添加客户按钮
    const addButton = wrapper.find(editIcon);
    await addButton.trigger('click');
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);
    await wrapper.setData({ showAddModal: true });
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // 添加客户
    expect(wrapper.vm.depth).toBe(0)
    expect(wrapper.vm.showAddModal).toBe(true)
    const inputs = addModal.findAll('input');
    const nameInput = inputs.at(0); // 第一个input是客户名称
    await nameInput.setValue('Test Client');

    const phoneInput = inputs.at(1); // 第二个input是客户电话
    await phoneInput.setValue('13828282828');

    const select = wrapper.find('select');
    await select.setValue('staff1');

    // Simulate form submission
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    // Check if the form data is correct
    expect(wrapper.vm.model.clients[0].name).toBe('Test Client');
    expect(wrapper.vm.model.clients[0].phone).toBe('13828282828');
    expect(wrapper.vm.model.clients[0].accountManager).toBe('staff1');
  });

  
  it('添加子项目按钮点击', async () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:contractNode, curDict:[], stuffInfo, projectInfo, depth: 2 }
    })
    // Find the add button and click it
    const addButton = wrapper.findAll('.add').at(1);
    await addButton.trigger('click');
    // Check if the add modal is displayed
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const inputs = addModal.findAll('input');
    // console.log(111111111,addModal.find('p').text())
    expect(inputs.length).toBe(3);

    const nameInput = inputs.at(0);
    await nameInput.setValue('新项目');

    const selects = addModal.findAll('select');
    expect(selects.length).toBe(3);

    const salespersonSelect = selects.at(0);
    await salespersonSelect.setValue('staff1');
    await selects.at(1).setValue('normal');
    await selects.at(2).setValue('true');

    await inputs.at(1).setValue('2023-1-1');
    await inputs.at(2).setValue('2023-2-1');

    // Simulate form submission
    const form = addModal.find('form');
    await form.trigger('submit.prevent');
    await wrapper.vm.$nextTick()

    // window.alert = vi.fn()
    // expect(window.alert).toHaveBeenCalledWith('获取数据失败。请重新登录！')
    expect(wrapper.vm.showAddModal).toBe(false)
  });

  it('编辑合同', async () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:clientNode, curDict:[], stuffInfo, projectInfo, depth: 1 }
    })
    const addButton = wrapper.findAll(editIcon).at(1);
    await addButton.trigger('click');
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const inputs = addModal.findAll('input');
    expect(inputs.length).toBe(3);

    const nameInput = inputs.at(0);
    await nameInput.setValue('Test Contract');

    const selects = addModal.findAll('select');
    expect(selects.length).toBe(3);

    const salespersonSelect = selects.at(0);
    await salespersonSelect.setValue('staff1');
    await selects.at(2).setValue('true');

    const statusSelect = selects.at(1);
    await statusSelect.setValue('off');

    // Simulate form submission
    const form = addModal.find('form');
    await form.trigger('submit.prevent');
    await wrapper.vm.$nextTick()

    // window.alert = vi.fn()
    // expect(window.alert).toHaveBeenCalledWith('获取数据失败。请重新登录！')
    expect(wrapper.vm.showAddModal).toBe(false)
    // Check if the form data is correct
    expect(wrapper.vm.model.contracts[1].name).toBe('Test Contract');
    expect(wrapper.vm.model.contracts[1].salesperson).toBe('staff1');
    expect(wrapper.vm.model.contracts[1].status).toBe('off');
  });
  
  it('编辑项目', async () => {
    const wrapper = mount(TreeItem, {
       propsData: { allClients:rootNode.clients, model:contractNode, curDict:[], stuffInfo, projectInfo, depth: 2 }
    })
    const addButton = wrapper.findAll(editIcon).at(0);
    await addButton.trigger('click');
    const addModal = wrapper.findComponent(ModalForm);
    expect(addModal.exists()).toBe(true);

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const inputs = addModal.findAll('input');
    expect(inputs.length).toBe(3);

    const nameInput = inputs.at(0);
    await nameInput.setValue('新项目');

    const selects = addModal.findAll('select');
    expect(selects.length).toBe(3);

    const salespersonSelect = selects.at(0);
    await salespersonSelect.setValue('staff1');
    await selects.at(1).setValue('normal');

    await inputs.at(1).setValue('2023-1-1');
    await inputs.at(2).setValue('2023-2-1');

    // Simulate form submission
    const form = addModal.find('form');
    await form.trigger('submit.prevent');
    await wrapper.vm.$nextTick()

    // window.alert = vi.fn()
    // expect(window.alert).toHaveBeenCalledWith('获取数据失败。请重新登录！')
    expect(wrapper.vm.showAddModal).toBe(false)
  });

  it('渲染变更历史', async () => {
    api.getTenantStructAndStuffs.mockResolvedValue({
      data: {
        struct: [{ _id: '1', name: 'Dept1', type: 'dept', stuffs:[{ _id: '3', id: '2', type: 'stuff' }] }],
        stuffs: [{ _id: '2', name: 'John Doe' }]
      }
    })
    api.getClientsAndProjects.mockResolvedValue({
      data: {
        clients: rootNode.clients,
        projects: [projectInfo.project1],
      }
    })
    const wrapper = await mount(StaffPage)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isLoading).toBe(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.item').exists()).toBe(true)
  })
  

})

