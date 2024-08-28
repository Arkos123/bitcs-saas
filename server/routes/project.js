const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const { authenticateToken, secret } = require('../utils/authToken'); // 引入验证中间件

const saltRounds = 10;

const express = require('express');
const router = express.Router();
router.use(bodyParser.json());

const Tenant = require('../models/tenant');
const Project = require('../models/project');
const Stuff = require('../models/Stuff');

/**
 * 处理客户/合同/项目相关的处理请求
 * API 列表：
 * 1.GET project/clients ()=>{clients:[..], projects:[...], innerProjects:[...]} 获取客户结构、项目信息、内部项目信息
 * 2.PUT project/clients { clients, innerProjects } 更新客户结构信息，内部项目信息
 * 3.POST project/register-project { name, manager, ... managerHistory, parentProject, subProjects, rootProject, needStaff } => project 注册项目，返回项目信息
 * 4.POST project/edit-project { _id, name, manager, ... } 修改项目
 * 5.DELETE project/{projectId} 删除项目
 * 6.POST project/project-info [...idList] => {id1: {...}, id2: {...}} 获取项目Id列表对应信息对象
 * 7.GET project/public-projects ()=>{projects:[...]} 员工获取公司的公共项目信息
 */

/**
 * 根据项目id列表，获取所有项目及其子项目的对象信息
 * @param {Array<string>} projectIds 
 * @returns 
 */
async function getSubProjectsFromPjs(projectIds, pathInfo) {
  const projects = await Project.find({ _id: { $in: projectIds } }).exec();
  if (pathInfo) {
    // 路径加入自己名字
    projects.forEach((project) => {
      pathInfo[project._id].push(project.name)
    });
  }
  // 获取子项目id
  const subIds = [];
  for (let project of projects) {
    if (project.subProjects && project.subProjects.length > 0) {
      subIds.push(...project.subProjects);
      if (pathInfo) {
        // 设置子项目路径
        project.subProjects.forEach((id) => {
          pathInfo[id] = [...pathInfo[project._id]];
        })
      }
    }
  }
  if (subIds.length > 0) projects.push(...await getSubProjectsFromPjs(subIds, pathInfo));
  return projects;
}


// 根据clients，获取所有projects
/**
 * 根据tenant，获取所有projects信息（包括内部项目和外部项目）
 * @param {Tenant} tenant 租户信息
 * @param {Boolean} getIds 是否只返回项目id列表
 * @returns {Array}
 */
async function getProjectsFromTenant(tenant, getIds = false, updatePath = false) {
  // 假如内部项目id
  let pjs = [];
  const path = [];
  const pjsPathInfo = {};
  tenant.projects.forEach(pj => {
    pjs.push(pj);
    if (updatePath) pjsPathInfo[pj] = ['内部项目'];
  });
  // 获取所有客户项目id
  tenant.clients.forEach((client) => {
    path.push(client.name)
    client.contracts.forEach((contract) => {
      path.push(contract.name)
      contract.projects.forEach((pid) => {
        pjsPathInfo[pid] = [...path];
        pjs.push(pid);
      });
      pjs.push(...contract.projects);
      path.pop()
    });
    path.pop()
  });
  // 获取子项目
  pjs = await getSubProjectsFromPjs(pjs, updatePath ? pjsPathInfo : null);
  // 更新路径信息
  if (updatePath) {
    pjs.forEach((pj) => {
      pj.path = pjsPathInfo[pj._id]
      ? pjsPathInfo[pj._id].join('>') : pj.name
      // console.log(pj.path)
    }
    )
    // 批量更新项目
    await Project.bulkWrite(pjs.map((pj) => ({
      updateOne: {
        filter: { _id: pj._id },
        update: { $set: { path: pj.path } }
      }
    })))
  }
	if (getIds) return pjs.map((pj) => pj._id.toString());
  else return pjs;

  // try {
  //   // 批量从数据库中读取所有项目信息
  //   const pjs = await Project.find({ _id: { $in: pjIds } });
  //   return pjs;
  // } catch (error) {
  //   throw new Error(`Failed to fetch projects: ${error.message}`);
  // }
}

// GET project/clients ()=>{clients:[..], projects:[...], innerProjects:[...]} 获取客户结构、项目信息、内部项目信息
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    // 根据token中的id获取
    const tenant = await Tenant.findById(req.user.userId);
    if (!tenant) {
      return res.status(401).send('公司id不存在！');
    }
    if (typeof tenant.clients !== 'object') {
      tenant.clients = [];
    }
    if (typeof tenant.projects !== 'object') {
      tenant.projects = [];
    }
    const pjs = await getProjectsFromTenant(tenant, false);
    res.status(200).json({ clients: tenant.clients, projects: pjs, innerProjects: tenant.projects });
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message);
  }
});

// GET project/public-projects ()=>{publics, projects:[...]} 员工获取公司的公共项目信息
router.get('/public-projects', authenticateToken, async (req, res) => {
  try {
    const stuff = await Stuff.findById(req.user.userId);
    if (!stuff) {
      return res.status(401).send('员工id不存在！');
    }
    const tenant = await Tenant.findById(stuff.tenant);
    if (!tenant) {
      return res.status(401).send('公司id不存在！');
    }
    if (typeof tenant.clients !== 'object') {
      tenant.clients = [];
    }
    if (typeof tenant.projects !== 'object') {
      tenant.projects = [];
    }
    let pjs = await getProjectsFromTenant(tenant, false);
    const publics = pjs.filter((pj) => !pj.needStaff);
    res.status(200).json({ publics, projects: pjs });
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message);
  }
});

async function deleteProjectsFromDataBase(deletedPjs) {
  if (deletedPjs.length > 0) {

    // 查找所有要删除的项目
    const projects = await getSubProjectsFromPjs(deletedPjs)
    const ids = projects.map((pj) => pj._id.toString());
    // console.log(ids)
    // 批量删除
    await Project.deleteMany({ _id: { $in: ids } });


    // 批量从父项目的子项目列表中移除
    const bulkOps = projects
      .filter(project => project.parentProject)
      .map(project => ({
        updateOne: {
          filter: { _id: project.parentProject },
          update: { $pull: { subProjects: project._id } }
        }
      }));
    if (bulkOps.length > 0) {
      await Project.bulkWrite(bulkOps);
    }


    // 更新Stuff表的projects字段
    const unsetFields = ids.reduce((acc, projectId) => {
      acc[`projects.${projectId}`] = "";
      return acc;
    }, {});
    await Stuff.updateMany({}, { $unset: unsetFields });
    // await Stuff.updateMany(
    //   {},
    //   { $unset: { [`projects.${deletedPjs.join(' projects.')}`]: '' } }
    // );
  }
}

// PUT project/clients { clients, innerProjects } 更新客户结构信息，内部项目信息
router.put('/clients', authenticateToken, async (req, res) => {
  const { clients, innerProjects } = req.body;
  try {
    const tenant = await Tenant.findById(req.user.userId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
		// 对比前后的clients，找到所有删除的项目
    const oldPjs = await getProjectsFromTenant(tenant, true);
    const newPjs = await getProjectsFromTenant({clients, projects: innerProjects}, true, true);
    // 找到被删除的项目
    const deletedPjs = oldPjs.filter(projectId => !newPjs.includes(projectId));
		await deleteProjectsFromDataBase(deletedPjs);
    tenant.clients = clients;
    tenant.projects = innerProjects;
    await tenant.save();
    res.json({ message: 'Clients updated successfully' });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error', error });
  }
});

// 3. 注册项目，返回项目信息
// POST project/register-project { name, manager, ... managerHistory, subProjects, parentProject, rootProject, needStaff } => project 注册项目，返回项目信息
router.post('/register-project', authenticateToken, async (req, res) => {
  const data = req.body;
  try {
    const newProject = new Project(data);
    const project = await newProject.save();

    // 加到父项目的子项目数组
    if (project.parentProject) {
      await Project.findByIdAndUpdate(project.parentProject, { $push: { subProjects: project._id } });
    }
    // 刷新路径
    const tenant = await Tenant.findById(req.user.userId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    await getProjectsFromTenant(tenant, false, true);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// 4. 修改项目
// POST project/edit-project { _id, name, manager, ... } 修改项目
router.post('/edit-project', authenticateToken, async (req, res) => {
  const { _id, name, manager, dateStart, dateEnd, status, managerHistory, subProjects, needStaff, whRule } = req.body;
  try {
    const project = await Project.findById(_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.name = name || project.name;
    project.manager = manager || project.manager;
    project.dateStart = dateStart || project.dateStart;
    project.dateEnd = dateEnd || project.dateEnd;
    project.status = status || project.status;
    project.managerHistory = managerHistory || project.managerHistory || [];
    project.subProjects = subProjects || project.subProjects || [];
    project.needStaff = needStaff ?? project.needStaff ?? true;
    project.whRule = whRule ?? project.whRule ?? 'all';

    await project.save();

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// 5 DELETE project/{projectId} 删除项目
router.delete('/:projectId', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  try {
    // const project = await Project.findByIdAndDelete(projectId);

    // if (!project) {
    //   return res.status(404).json({ message: 'Project not found' });
    // }
    await deleteProjectsFromDataBase([projectId]);

    res.json({ message: 'Project deleted successfully'});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST project/project-info [...idList] => {id1: {...}, id2: {...}} 获取项目Id列表对应信息对象
router.post('/project-info', authenticateToken, async (req, res) => {
  let { idList } = req.body;
  try {
    // 删除 'others'
    idList = idList.filter(id => id !== 'others');
    const projects = await Project.find({ _id: { $in: idList } });
    const projectInfo = projects.reduce((acc, project) => {
      acc[project._id.toString()] = project;
      return acc;
    }, {});
    res.json(projectInfo);
    } catch (error) {
      console.error(114514, error)
      res.status(500).json({ message: 'Server error', error });
    }
})


module.exports = router;
