import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ExperiencePage from '@/views/staff/ExperiencePage.vue'
import api from '@/utils/api.js'

vi.mock('@/utils/api.js')

describe('ExperiencePage.vue', () => {
  window.alert = vi.fn()
  const mockExperience = [{ company: '公司A', startDate: '2022-01-01', endDate: '2022-12-31' }]
  const mockSkills = [{ name: 'Vue.js', years: 2.5, proficiency: '高级' }]
  api.updateExperience.mockResolvedValue({})
  api.updateSkills.mockResolvedValue({})

  it('应该正确渲染', () => {
    api.getStuffData.mockRejectedValue(new Error('网络错误'))
    let wrapper = mount(ExperiencePage)
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
     wrapper = mount(ExperiencePage)
    expect(wrapper.find('h1').text()).toBe('经验技能记录')
  })

  it('显示加载中', async () => {
    api.getStuffData.mockResolvedValueOnce(
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { experience: mockExperience, skills: mockSkills } }), 30)
      )
    )
    const wrapper = mount(ExperiencePage)
    //30ms后返回结果
    // 等待35ms
    // await new Promise((resolve) => setTimeout(resolve, 35))
    // wrapper.setData({ isLoading: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div').text()).toContain('加载中...')
  })

  it('载入时正确获取数据', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    await new Promise((resolve) => setTimeout(resolve, 35))

    await wrapper.vm.$nextTick()
    expect(api.getStuffData).toHaveBeenCalled()
    expect(wrapper.vm.experience).toEqual(mockExperience)
    expect(wrapper.vm.skills).toEqual(mockSkills)
  })

  it('验证和增加新经验', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    wrapper.setData({
      newExp: { company: '公司B', startDate: '2023-01-01', endDate: '2023-12-31' }
    })

    await wrapper.find('.addButton').trigger('click')

    expect(wrapper.vm.experience.length).toBe(1)
    expect(wrapper.vm.newExp.company).toBe('公司名称')
  })

  it('验证和增加新技能', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    wrapper.setData({
      newSkill: { name: 'React', years: '2.5', proficiency: '高级' }
    })

    await wrapper.find('.addButton').trigger('click')

    expect(wrapper.vm.skills.length).toBe(1)
    expect(wrapper.vm.newSkill.name).toBe('React')
  })

  it('删除经验', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    wrapper.setData({
      experience: [{ company: '公司C', startDate: '2021-01-01', endDate: '2021-12-31' }]
    })
    await new Promise((resolve) => setTimeout(resolve, 35))

    await wrapper.find('.delButton').trigger('click')

    expect(wrapper.vm.experience.length).toBe(0)
  })

  it('删除技能', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    wrapper.setData({
      skills: [{ name: 'Angular', years: 3, proficiency: '中级' }]
    })
    await new Promise((resolve) => setTimeout(resolve, 35))

    await wrapper.findAll('.delButton').at(1).trigger('click')

    expect(wrapper.vm.skills.length).toBe(0)
  })

  it('处理经验提交', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    let wrapper = mount(ExperiencePage)

    api.updateExperience.mockResolvedValue({})
    await wrapper.find('.btn-edit').trigger('click')

    expect(api.updateExperience).toHaveBeenCalled()
    
     wrapper = mount(ExperiencePage)
    api.updateExperience.mockRejectedValue({})
    await wrapper.find('.btn-edit').trigger('click')
  })

  api.getStuffData.mockResolvedValue({
    data: { experience: mockExperience, skills: mockSkills }
  })
  it('处理技能提交', async () => {
    const wrapper = mount(ExperiencePage)

    await wrapper.findAll('.btn-edit').at(1).trigger('click')

    expect(api.updateSkills).toHaveBeenCalled()
  })

  it('正确显示技能', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    api.getStuffData.mockResolvedValue({
        data: { experience: mockExperience, skills: mockSkills }
      })
    const wrapper = mount(ExperiencePage)
    await new Promise((resolve) => setTimeout(resolve, 35))

    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3) // 包括添加新工作经历的行
    expect(rows.at(0).text()).toContain('删除')
  })

  it('结束时间早于开始时间时提示错误', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    await new Promise((resolve) => setTimeout(resolve, 35))
    wrapper.setData({
      newExp: { company: '公司E', startDate: '2024-12-31', endDate: '2023-01-01' }
    })
    await wrapper.vm.$nextTick()

    await wrapper.find('.addButton').trigger('click')

    expect(wrapper.vm.experience.length).toBe(1)
    expect(window.alert).toHaveBeenCalledWith('结束日期不能早于开始日期')
  })

  it('edits and submits work experience', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    await new Promise((resolve) => setTimeout(resolve, 35))
    const updatedExp = {
      company: '公司C',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };

    // 更新已有的工作经验
    await wrapper.findAll('tbody tr').at(0).findAll('td').at(1).find('input').setValue(updatedExp.company);
    await wrapper.findAll('tbody tr').at(0).findAll('td').at(2).find('input').setValue(updatedExp.startDate);
    await wrapper.findAll('tbody tr').at(0).findAll('td').at(3).find('input').setValue(updatedExp.endDate);
    expect(wrapper.vm.experience[0]).toEqual(updatedExp);

    // 提交更新
    await wrapper.find('.btn-edit').trigger('click');

    // 验证 API 调用
    expect(api.updateExperience).toHaveBeenCalledWith([updatedExp]);
    expect(api.updateExperience).toHaveBeenCalledTimes(3);

    const updatedSkill = {
      name: '技能',
      years: 90,
      proficiency: '测试'
    }
    await wrapper.findAll('tbody tr').at(2).findAll('td').at(1).find('input').setValue('技能');
    await wrapper.findAll('tbody tr').at(2).findAll('td').at(2).find('input').setValue(0);
    await wrapper.findAll('tbody tr').at(2).findAll('td').at(2).find('input').setValue(100);
    await wrapper.findAll('tbody tr').at(2).findAll('td').at(3).find('input').setValue('测试');
    expect(wrapper.vm.newSkill).toEqual(updatedSkill);

    // 提交更新
    await wrapper.findAll('.btn-edit').at(1).trigger('click');

    // 验证 API 调用
    expect(api.updateSkills).toHaveBeenCalledWith([]);
    expect(api.updateSkills).toHaveBeenCalledTimes(2);

    
    api.updateSkills.mockRejectedValue({})
    await wrapper.findAll('.btn-edit').at(1).trigger('click');
    wrapper.vm.isTimeOverlap(new Date(), new Date(), new Date(), new Date())
    wrapper.vm.handleSkillAddSubmit()
  });

  it('验证技能表单', async () => {
    const wrapper = mount(ExperiencePage)
    // 设置技能数据，其中一个技能无效
    const invalidSkill = { name: '', years: 2.5, proficiency: '中级' };
    const skills = [
      { name: 'Vue.js', years: 2.5, proficiency: '高级' },
      invalidSkill
    ];

    // 设置技能数据并调用 skillError 方法
    await wrapper.setData({ skills });
    const errorMessage = wrapper.vm.skillError;

    // 验证 errorSkill 和返回的错误消息
    expect(wrapper.vm.errorSkill).toStrictEqual(invalidSkill);
    expect(errorMessage).toBe('请检查表格：请输入技能名称');
  });

  it('重复的技能名称提示错误', async () => {
    api.getStuffData.mockResolvedValue({
      data: { experience: mockExperience, skills: mockSkills }
    })
    const wrapper = mount(ExperiencePage)
    await new Promise((resolve) => setTimeout(resolve, 35))
    wrapper.setData({
      skills: [{ name: 'Vue.js', years: 2, proficiency: '高级' }],
      newSkill: { name: 'Vue.js', years: 1, proficiency: '初级' }
    })

    await wrapper.findAll('.addButton').at(1).trigger('click')

    expect(wrapper.vm.skills.length).toBe(1)
    expect(window.alert).toHaveBeenCalledWith('技能名称不能重复')
  })



})
