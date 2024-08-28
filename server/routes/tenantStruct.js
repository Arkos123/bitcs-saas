const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const { authenticateToken, secret } = require('../utils/authToken'); // 引入验证中间件

const saltRounds = 10;

const express = require('express');
const router = express.Router();

const Tenant = require('../models/tenant');
const Stuff = require('../models/Stuff');

/**
 * 处理租户组织架构相关的请求
 * API 列表：
 * 1. GET struct/tenant-stuff 获取本租户组织结构、员工信息
 * 2. PUT struct/tenant-stuff  { struct }更新本租户组织结构信息
 * 3. POST struct/register-stuff { name, password, phone, position } => stuff 注册员工，返回员工信息
 * 4. PUT struct/update-stuff { _id, name, password, phone, position } => stuff 修改员工信息
 */


// 根据struct，获取部门中所有员工信息的函数
async function getStuffFromStruct(struct, getIds = false) {
  // 递归获取员工id
  const _getIdsFromStruct = (struct, ids = []) => {
    for (const item of struct) {
      if (item.type === 'stuff') {
        // 如果当前项是员工（stuff），加入id
        ids.push(item.id);
      } else if (item.type === 'dept') {
        // 如果当前项是部门（dept），递归获取部门中的员工信息
        _getIdsFromStruct(item.stuffs, ids);
      }
    }
    return ids;
  };

  // 获取所有员工的 ID
  const stuffIds = _getIdsFromStruct(struct);
  if (getIds) return stuffIds;

  try {
    // 批量从数据库中读取所有员工信息
    const stuffs = await Stuff.find({ _id: { $in: stuffIds } });
    return stuffs;
  } catch (error) {
    throw new Error(`Failed to fetch stuffs: ${error.message}`);
  }
}

// 获取公司组织结构数据以及公司全体员工信息
router.get('/tenant-stuff', authenticateToken, async (req, res) => {
  try {
    // 根据token中的id获取
    const tenant = await Tenant.findById(req.user.userId);
    if (!tenant) {
      return res.status(401).send('公司id不存在！');
    }
    if (typeof tenant.struct !== 'object') {
        tenant.struct = [];
    }
    const stuffs = await getStuffFromStruct(tenant.struct);
    res.status(200).json({ struct: tenant.struct, stuffs });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 更新公司组织结构数据
router.put('/tenant-stuff', authenticateToken, async (req, res) => {
  try {
    const { struct } = req.body;
    const updatedData = { struct };

    // const tenant = await Tenant.findByIdAndUpdate(
    //   req.user.userId,
    //   updatedData,
    //   { new: true }
    // );
    const tenant = await Tenant.findById(req.user.userId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    // 对比前后的struct，找到所有删除的人员
    const oldStaff = (await getStuffFromStruct(tenant.struct, true)).map(id => id.toString());;
    const newStaff = (await getStuffFromStruct(struct, true)).map(id => id.toString());;
    // 找到被删除的人员
    const deletedStaff = oldStaff.filter(id => !newStaff.includes(id));
		await deleteStaffFromDataBase(deletedStaff);
    // 保存架构信息
    tenant.struct = struct;
    await tenant.save();
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

async function deleteStaffFromDataBase(deletedStaff) {
  if (deletedStaff.length > 0) {
    // 从用户表删除用户
    await Stuff.deleteMany({ _id: { $in: deletedStaff } });
    // await Stuff.updateMany(
    //   {},
    //   { $unset: { [`projects.${deletedStaff.join(' projects.')}`]: '' } }
    // );
  }
}

// 注册公司员工(由公司注册)
router.post('/register-stuff', authenticateToken, async (req, res) => {
  try {
    const { name, password, phone, position } = req.body;
    // 加密密码
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    // 存入用户注册数据
    const stuff = new Stuff({ name, password, tenant: req.user.userId, phone, position });
    await stuff.save();
    // 返回新创建的stuff
    res.status(201).send(stuff);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// 修改员工信息
router.put('/update-stuff', authenticateToken, async (req, res) => {
  try {
    const { _id, name, phone, position } = req.body;
    let updatedData = {};
    if (name) updatedData.name = name;
    if (phone) updatedData.phone = phone;
    if (position) updatedData.position = position;

    const stuff = await Stuff.findByIdAndUpdate(_id, updatedData, { new: true });
    res.status(200).json(stuff);
    } catch (error) {
      res.status(500).send(error.message);
    }
})

/** 
 * 人员分配处理请求
 * API 列表：
 * 1. GET struct/all-assignments ()=>[{员工文档（含分配信息）}] 读取人员分配信息
 * 2. PUT struct/assignment {stuffId, assignment:[{id: 项目id, ratio: Number}] 更新人员分配表单
 */

// 读取人员分配信息 [...{员工文档（含分配信息）}]
router.get('/all-assignments', authenticateToken, async (req, res) => {
  try {
    // 根据token中的id获取
    const tenant = await Tenant.findById(req.user.userId);
    if (!tenant) {
      return res.status(401).send('公司id不存在！');
    }
    if (typeof tenant.struct !== 'object') {
        tenant.struct = [];
    }
    const stuffs = await getStuffFromStruct(tenant.struct);
    res.status(200).json(stuffs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PUT struct/assignment {stuffId, assignment:[{id: 项目id, ratio: Number}] 更新人员分配表单
// 更新人员分配表单
router.put('/assignment', authenticateToken, async (req, res) => {
   try {
    const { stuffId, assignment } = req.body;
    if (!stuffId || !assignment || !Array.isArray(assignment)) {
      return res.status(400).send('Invalid input');
    }

    const stuff = await Stuff.findById(stuffId);
    if (!stuff) {
      return res.status(404).send('Stuff not found');
    }
    const projects = {};
    assignment.forEach(({ id, ratio }) => {
      if (stuff.projects.get(id)?.workHours) {
        // 更新现有项目的 ratio
        projects[id] = { ratio, workHours: stuff.projects.get(id).workHours };
      } else {
        // 创建新的项目条目
        projects[id] = { ratio, workHours: [] };
      }
    });
    stuff.projects = projects;
    await stuff.save();

    res.status(200).send('Assignment updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
})

module.exports = router;
