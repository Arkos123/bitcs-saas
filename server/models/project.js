const mongoose = require('mongoose');
const { Schema } = mongoose;

// 项目schema
const ProjectSchema = new Schema({
  name: { type: String, required: true },  // 项目名称
  manager: { type: Schema.Types.ObjectId, ref: 'Stuff', required: true },  // 项目经理
  dateStart: { type: Date, required: true },  // 开始日期
  dateEnd: { type: Date, required: true },  // 结束日期
  path: {type: String}, // 记录项目路径
  status: { type: String, enum: ['finished', 'normal', 'delayed'], required: true, default: 'normal'},  // 项目状态：正常/完成/待定
  // 项目经理历史
  managerHistory: [
    {
      id: { type: Schema.Types.ObjectId, ref: 'Stuff' }, // 人员id
      dateStart: { type: Date, required: true }, // 开始日期
      dateEnd: { type: Date, required: true }, // 结束日期
    },
  ],
  subProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],  // 子项目
  parentProject: { type: Schema.Types.ObjectId, ref: 'Project' },  // 父项目
  rootProject: { type: Schema.Types.ObjectId, ref: 'Project' },  // 根项目
  needStaff: {type: Boolean, required: true, default: true},  // 是否需要分配人员
  // 工时填报规则，在总项目填报/在子项目填报/均可
  whRule: { type: String, enum: ['root', 'leaf', 'all'], default: 'all'},
});

// 定义模型
const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
