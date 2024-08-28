
// const { body, validationResult } = require("express-validator/check");
// const { sanitizeBody } = require("express-validator/filter");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const {authenticateToken, secret} = require('../utils/authToken'); // 引入验证中间件

const saltRounds = 10;

const express = require("express");
const router = express.Router();

const Tenant = require("../models/tenant");
  
/**
 * 获取租户数据相关的请求
 * API 列表：
 * 1. POST tenant/register { name, password, address, phone } 注册租户
 * 2. POST tenant/login { name, password }=>{token} 登录租户
 * 3. GET tenant/tenant-data 获取本租户
 * 3. PUT tenant/tenant-data { name, address, phone, contact, password } 修改本租户
 * 4. DELETE tenant/tenant-data 注销本租户
 * 5. GET tenant/tenant-data-all 获取所有租户信息（密码除外）
 */

// 处理注册表单
router.post('/register', async (req, res) => {
    try {
      const { name, password, address, phone } = req.body;
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // 存入注册数据
      const tenant = new Tenant({ name,  password: hashedPassword, address, phone });
      await tenant.save();
      res.status(201).send('User registered');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
// 处理登录表单
router.post('/login', async (req, res) => {
try {
    const { name, password } = req.body;
    const tenant = await Tenant.findOne({ name });
    if (!tenant) {
        return res.status(401).send('公司名称不存在，请先注册！');
    } else if (!(await bcrypt.compare(password, tenant.password))) {
        return res.status(401).send('密码错误！');
    }
    // 设置token，60分钟过期
    const token = jwt.sign({ userId: tenant._id }, secret, { expiresIn: '60m' });
    // 登录成功，返回token
    res.status(200).json({ token });
} catch (error) {
    res.status(500).send(error.message);
}
});

// 获取公司数据
router.get('/tenant-data', authenticateToken, async (req, res) => {
    try {
        // const { name } = req.body;
        // 根据token中的id获取
        const tenant = await Tenant.findById(req.user.userId);
        if (!tenant) {
            return res.status(401).send('公司id不存在！');
        }
        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).send(error.message);
    }
  });
  
// 更新公司数据
router.put('/tenant-data', authenticateToken, async (req, res) => {
    try {
      const { name, address, phone, contact, password } = req.body;
      const updatedData = { name, address, phone, contact };
  
      if (password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updatedData.password = hashedPassword;
      }
  
      const tenant = await Tenant.findByIdAndUpdate(req.user.userId, updatedData, { new: true });
  
      if (!tenant) {
        return res.status(401).send('公司id不存在！');
      }
  
      res.status(200).json(tenant);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  

// 删除公司数据
router.delete('/tenant-data', authenticateToken, async (req, res) => {
    try {
      const tenant = await Tenant.findByIdAndDelete(req.user.userId);
      if (!tenant) {
        return res.status(401).send('公司id不存在！');
      }
      res.status(200).send('公司信息已删除');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
// 获取所有公司数据
router.get('/tenant-data-all', authenticateToken, async (req, res) => {
    try {
        // 查询所有租户数据
        const tenants = await Tenant.find({});
        res.status(200).json(tenants);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


module.exports = router;
