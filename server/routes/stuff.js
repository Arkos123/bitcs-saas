const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const { authenticateToken, secret } = require('../utils/authToken'); // 引入验证中间件

const saltRounds = 10;

const express = require('express');
const router = express.Router();

const Stuff = require('../models/Stuff'); // 引入用户模型
const Project = require('../models/project'); // 引入用户模型
const Tenant = require('../models/tenant'); // 引入公司模型

// 处理员工的请求
/**
 * 员工登录：POST stuff/login { id, password } => {token}
 * 获取员工信息：GET stuff/stuff-data ()=> {name,position, ...,projects}
 * 更新员工工时信息： PUT stuff/workhours { projectId, isPublic, workHours:[...]}
 *
 * 迭代2：
 *  更新工作经验 PUT stuff/experience [{ company, startDate, endDate }]
 * 更新技能 PUT stuff/skills [{ name, years, proficiency }]
 */

router.use(bodyParser.json()); // 解析json格式的请求体

// 处理员工登录表单
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    const stuff = await Stuff.findById(id);
    if (!stuff) {
      return res.status(401).send('员工ID不存在！');
    } else if (password !== stuff.password) {
      return res.status(401).send('密码错误！');
    }
    // 设置token，60分钟过期
    const token = jwt.sign({ userId: stuff._id }, secret, { expiresIn: '60m' });
    // 登录成功，返回token
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 获取员工信息
router.get('/stuff-data', authenticateToken, async (req, res) => {
  try {
    // 根据token中的id获取
    const stuff = await Stuff.findById(req.user.userId);
    // console.log(req.user.userId, stuff)
    if (!stuff) {
      return res.status(401).send('员工id不存在！');
    }
    res.status(200).json(stuff);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 更新员工工时信息 { projectId, isPublic, workHours:[...]}
router.put('/workhours', authenticateToken, async (req, res) => {
  try {
    const { projectId, workHours, isPublic } = req.body;
    const stuff = await Stuff.findById(req.user.userId);
    if (!stuff) {
      return res.status(401).send('员工id不存在！');
    }
    if (!stuff.projects) {
      stuff.projects = {};
    }
    // 有项目
    if (stuff.projects.has(projectId)) {
      // 更新工时信息
      stuff.projects.get(projectId).workHours = workHours;
    } else {
      if (isPublic) {
        stuff.projects.set(projectId, { workHours, isPublic });
      } else {
        // 父项目
        stuff.projects.set(projectId, { workHours, ratio: 0 });
        // return res.status(400).send('员工不属于该项目，无法上传工时！');
      }
    }
    await stuff.save();

    res.status(200).send('updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 更新工作经验 PUT stuff/experience [{ company, startDate, endDate }]
router.put('/experience', authenticateToken, async (req, res) => {
  try {
    const { experience } = req.body;
    const stuff = await Stuff.findById(req.user.userId);
    if (!stuff) {
      return res.status(401).send('员工id不存在！');
    }
    if (!stuff.experience) {
      stuff.experience = [];
    }
    // 更新经验信息
    stuff.experience = experience;
    await stuff.save();
    res.status(200).send('updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// 更新技能 PUT stuff/skills [{ name, years, proficiency }]
router.put('/skills', authenticateToken, async (req, res) => {
  try {
    const { skills } = req.body;
    const stuff = await Stuff.findById(req.user.userId);
    if (!stuff) {
      return res.status(401).send('员工id不存在！');
    }
    if (!stuff.skills) {
      stuff.skills = [];
    }
    // 更新经验信息
    stuff.skills = skills;
    await stuff.save();
    res.status(200).send('updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
