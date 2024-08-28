const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/* 公司租户表 schema */
const TenantSchema = new Schema({
  name: { type: String, required: true, max: 50, unique: true },
  password: { type: String, required: true, max: 50 },
  address: { type: String, max: 50 },
  phone: { type: String, max: 20 },
  contact: { type: String, max: 20, default: '未填写' },
  /** 公司组织结构信息 */
  struct: [
    {
      type: { type: String, enum: ['dept', 'stuff'], required: true }, // 类型：部门或员工
      id: { type: Schema.Types.ObjectId, ref: 'Tenant' }, // 可选，员工id
      name: { type: String, max: 20 }, // 可选，部门名称
      stuffs: { type: [Schema.Types.Mixed], default: [] },
    },
  ],
  /** 公司内部项目 */
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  /** 公司客户/合同信息 */
  clients: [
    {
      name: { type: String, required: true, max: 20 }, // 客户名
      phone: { type: String, max: 20 }, // 电话
      // 客户经理
      accountManager: {
        type: Schema.Types.ObjectId,
        ref: 'Stuff',
        required: true,
      },
      // 客户经理历史
      managerHistory: [
        {
          id: { type: Schema.Types.ObjectId, ref: 'Stuff', required: true }, // 人员id
          dateStart: { type: Date, required: true }, // 开始日期
          dateEnd: { type: Date, required: true }, // 结束日期
        },
      ],
      // 当前客户的合同
      contracts: [
        {
          name: { type: String, required: true, max: 20 }, // 必填
          // 销售人员
          salesperson: {
            type: Schema.Types.ObjectId,
            ref: 'Stuff',
            required: true,
          },
          // 销售人员历史
          managerHistory: [
            {
              id: { type: Schema.Types.ObjectId, ref: 'Stuff', required: true}, // 人员id
              dateStart: { type: Date, required: true }, // 开始日期
              dateEnd: { type: Date, required: true }, // 结束日期
            },
          ],
          status: {
            type: String,
            enum: ['on', 'off'],
            required: true,
            default: 'on',
          }, // 合同状态：启动/关闭
          projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }], // 下属项目
        },
      ],
    },
  ],
});

// 默认的公司组织
TenantSchema.path('struct').default([
  { type: 'dept', name: '人事部', stuffs: [] },
  { type: 'dept', name: '财务部', stuffs: [] },
  {
    type: 'dept',
    name: '开发中心',
    stuffs: [
      { type: 'dept', name: '开发1组', stuffs: [] },
      { type: 'dept', name: '开发2组', stuffs: [] },
    ],
  },
]);
TenantSchema.path('clients').default([]);

// 为 name 字段创建唯一索引
TenantSchema.index({ name: 1 }, { unique: true });

// 导出 Tenant 模型
module.exports = mongoose.model('Tenant', TenantSchema);
