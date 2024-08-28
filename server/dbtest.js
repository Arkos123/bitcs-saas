#! /usr/bin/env node

console.log('数据库测试');
  
  const Tenant = require("./models/tenant");
  
  const tenants = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = "YOU DB URL HERE";
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createTenant();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  

  
  async function tenantCreate(index, name, password, address, phone, contact) {
    const info = { name, password, address, phone, contact };
    // if (address != false) info.address = address;
    // if (phone != false) info.phone = phone;
  
    const tenant = new Tenant(info);
  
    await tenant.save();
    tenants[index] = tenant;
    console.log(`Added tenant: ${name} ${password}`);
  }
  
  
  async function createTenant() {
    console.log("Adding authors");
    await Promise.all([
        tenantCreate(0, "Patrick inc.", "114514", "地球", "13828233659","黄朋悦"),
        tenantCreate(1, "Ben公司", "1919", "中国", "138233659",),
        tenantCreate(2, "Isaac哈哈哈有限公司", "sdfwes", "bit", "13212233659","派大星"),
        tenantCreate(3, "零零后有线公共公司", "sddd123", "北理", "13828233659","黄朋悦"),
        tenantCreate(4, "Jim11234", "asdf2sdf", "vocal", "13828233659","黄朋悦"),
    ]);
  }
  
