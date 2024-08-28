
const Stuff = require('../models/Stuff'); 
const Tenant = require('../models/tenant'); 
const Project = require('../models/project'); 


const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = "You database url here";

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await test();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function test ()  {
  try {

    const manager = new Stuff({ name: 'John Doe', password: '123456' });
    await manager.save();

    const project = new Project({
      name: 'Project A',
      manager: manager._id,
      dateStart: new Date(),
      dateEnd: new Date(),
      status: 'normal',
    });
    await project.save();

    const client = {
      name: 'Client A',

      phone: '13828233656',
      accountManager: manager._id,
      contracts: [
        {
          name: 'Contract A',
          salesperson: manager._id,
          status: 'on',
          projects: [project._id],
        },
      ],
    };

    const tenantData = {
      name: 'Tenant A',
      password: '1145141919810d',
      struct: [],
      clients: [client],
    };

    const newTenant = new Tenant(tenantData);
    await newTenant.save();

    const foundTenant = await Tenant.findById(newTenant._id)
      .populate('clients.accountManager clients.contracts.salesperson clients.contracts.projects.manager')
      .exec();

    console.log(foundTenant);

  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}
