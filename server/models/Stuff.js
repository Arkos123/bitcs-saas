const mongoose = require('mongoose');
const { Schema } = mongoose;

const StuffSchema = new Schema({
  name: { type: String, required: true, max: 25 },  // 姓名，必填，最大长度25
  password: { type: String, required: true, max: 50 },  // 密码，必填，最大长度50
  gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },  // 性别
  phone: { type: String, max: 20 },  // 手机号码，最大长度20，可选
  position: { type: String, default: '未指定' },  // 职位
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null },  // 所属租户（公司），默认为 null，关联到租户表
  // 参与的项目信息（项目id：项目信息）
  projects: {
    type: Map,
    of: {
      ratio: { type: Number },  // 项目比例
      isPublic: {type: Boolean, default: false },  // 是否公开
      workHours: {
        type: [ // 工时信息
          {
            date: { type: Date, required: true },  // 工作日期
            hours: { type: Number, required: true },  // 工作时长
            notes: { type: String },  // 工作备注
          },
        ],
        default: [],
      }
    },
    default: {},
  },
  // 工作经验
  experience: {
    type: [
      {
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    default: [],
  },
  // 技能
  skills: {
    type: [
      {
        name: { type: String, required: true },
        years: { type: Number, required: true },
        proficiency: { type: String, required: true },
      },
    ],
    default: [],
  }
});


// 定义模型
const Stuff = mongoose.model('Stuff', StuffSchema);

module.exports = Stuff;
