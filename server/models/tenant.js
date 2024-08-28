const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* 公司租户表 schema */
const TenantSchema = new Schema({
  name: { type: String, required: true, max: 50, unique: true },
  password: { type: String, required: true, max: 50 },
  address: { type: String, max: 50 },
  phone: { type: String, max: 20 },
  contact: { type: String, max: 20, default: "未填写" },
});

// 为 name 字段创建唯一索引
TenantSchema.index({ name: 1 }, { unique: true });

// 导出 Tenant 模型
module.exports = mongoose.model("Tenant", TenantSchema);
