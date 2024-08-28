import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkhourPage from '@/views/staff/WorkhourPage.vue'
import ModalForm from '@/components/ModalForm.vue';
import api from '@/utils/api.js';

// Mock API
vi.mock('@/utils/api.js');

describe('WorkhourPage.vue', () => {

  beforeEach(() => {
    // Mock API responses
    window.alert = vi.fn()
  });
  
  api.getStuffData.mockResolvedValue({
    data: {
      projects: {
        'projectId1': {
          ratio: 0.5,
          workHours: [{ date: '2023-01-01', hours: 4, notes: 'Task 1' }]
        },
        'projectId2': {
          ratio: 0.5,
          workHours: [{ date: '2023-01-01', hours: 4, notes: 'Task 1' }]
        }
      }
    }
  });
  api.getPublicProjectsAndPjs.mockResolvedValue({
    data: {
      projects: [{ _id: 'projectId1', name: 'Project 1' }, { _id: 'projectId2', name: 'Project 2'}],
      publics: [{ _id: 'projectId1', name: 'Project 1' }, { _id: 'projectId2', name: 'Project 2'}],
    }
  });
  api.updateWorkHours.mockResolvedValue({});

  it('正确渲染项目数据', async () => {
    const wrapper = mount(WorkhourPage, { components: { ModalForm } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.fetchStuffData();

    await new Promise(resolve => setTimeout(resolve, 50));  
    expect(api.getStuffData).toHaveBeenCalled();
    // expect(api.getPublicProjectsAndPjs).toHaveBeenCalled();
    expect(wrapper.vm.projects).toHaveProperty('projectId1');
    // expect(wrapper.vm.projectInfo['projectId1'].name).toBe('Project 1');
  });

  it('显示加载信息', async () => {
    const wrapper = mount(WorkhourPage, { components: { ModalForm } });
    await wrapper.vm.$nextTick();
    wrapper.vm.isLoading = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#loaddddd').exists()).toBe(true);
  });
  
it('在子项目报工时', async () => {
  const wrapper = mount(WorkhourPage, { components: { ModalForm } });
  await wrapper.vm.$nextTick();
  await wrapper.vm.fetchStuffData();

  expect(api.getStuffData).toHaveBeenCalled();
  expect(api.getPublicProjectsAndPjs).toHaveBeenCalled();

  await new Promise(resolve => setTimeout(resolve, 50));  
      await wrapper.vm.$nextTick();
  
  const rows = wrapper.findAll('tbody tr');
  expect(rows.length).toBe(3);

  // await wrapper.vm.handleEditClicked({ name: 'Project 1', _id: 'projectId1' }, {workHours:[]});

  const firstRowColumns = rows[0].findAll('td');
  expect(firstRowColumns[0].text()).toBe('Project 1');
  expect(firstRowColumns[2].find('button.btn-edit').exists()).toBe(true);
  wrapper.vm.curPjInfo={_id:'abc'}
  await wrapper.vm.handleEditSubmit();
  await wrapper.vm.addRecord();
  await wrapper.vm.removeRecord(0);

});

it('不分配人员的项目报工时', async () => {
  const wrapper = mount(WorkhourPage, { components: { ModalForm } });
  await wrapper.vm.$nextTick();
  await wrapper.vm.fetchStuffData();

  await new Promise(resolve => setTimeout(resolve, 50));  
  expect(api.getStuffData).toHaveBeenCalled();
  // expect(api.getPublicProjectsAndPjs).toHaveBeenCalled();
  expect(wrapper.vm.projects).toHaveProperty('projectId1');
  // expect(wrapper.vm.projectInfo['projectId1'].name).toBe('Project 1');
  wrapper.vm.curPjInfo={_id:'abc'}
  await wrapper.vm.handleEditSubmit();
  await wrapper.vm.addRecord();

  await new Promise(resolve => setTimeout(resolve, 50));  
  await wrapper.vm.$nextTick();

  await wrapper.vm.removeRecord(0);
});

it('非项目报工时', async () => {
  const wrapper = mount(WorkhourPage, { components: { ModalForm } });
  await wrapper.vm.$nextTick();
  await wrapper.vm.fetchStuffData();

  await new Promise(resolve => setTimeout(resolve, 30));  
  expect(api.getPublicProjectsAndPjs).toHaveBeenCalled();
  expect(api.getStuffData).toHaveBeenCalled();
  
  const rows = wrapper.findAll('tbody tr');

  // await wrapper.vm.handleEditClicked({ name: 'Project 1', _id: 'projectId1' }, {workHours:[]});

  const firstRowColumns = rows[0].findAll('td');
  expect(firstRowColumns[2].find('button.btn-edit').exists()).toBe(true);
  wrapper.vm.curPjInfo={_id:'abc'}
  await wrapper.vm.handleEditSubmit();
  await wrapper.vm.addRecord();
  await wrapper.vm.removeRecord(0);

});


  it('渲染错误信息', async () => {
    const wrapper = mount(WorkhourPage, { components: { ModalForm } });
    await wrapper.vm.$nextTick();
    const errorMessage = 'Error fetching data';
    wrapper.vm.error = errorMessage;
        await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain(errorMessage);
  });


  it('正确渲染表格', async () => {
    const wrapper = mount(WorkhourPage, { components: { ModalForm } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.fetchStuffData();

    expect(api.getStuffData).toHaveBeenCalled();
    expect(api.getPublicProjectsAndPjs).toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 50));  
        await wrapper.vm.$nextTick();
    
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(3);

    await wrapper.vm.truncate('11232112342114',10);
    // await wrapper.vm.handleEditClicked({ name: 'Project 1', _id: 'projectId1' }, {workHours:[]});

    const firstRowColumns = rows[0].findAll('td');
    expect(firstRowColumns[0].text()).toBe('Project 1');
    expect(firstRowColumns[1].text()).toBe('公共项目');
    expect(firstRowColumns[2].find('button.btn-edit').exists()).toBe(true);
    expect(firstRowColumns[2].find('button.btn-edit').text()).toBe('工时登记');
    wrapper.vm.curPjInfo={_id:'abc'}
    await wrapper.vm.handleEditSubmit();
    await wrapper.vm.selectNotesCell(-99);
    await wrapper.vm.addRecord();
    await wrapper.vm.removeRecord(0);

  });

//   it('显示 "未知项目id" 如果项目未找到', async () => {
//     const wrapper = mount(WorkhourPage, { components: { ModalForm } });
//     await wrapper.vm.$nextTick();
//     await wrapper.vm.fetchStuffData();
//     await new Promise(resolve => setTimeout(resolve, 50));
//     wrapper.vm.projectInfo = {};
//         await wrapper.vm.$nextTick();
//     expect(wrapper.text()).toContain('未知项目id');
//   });

});
