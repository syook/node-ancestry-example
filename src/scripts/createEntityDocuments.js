import { Machine, SubAssembly, Component, WorkOrder } from '../models';

const createEntityDocuments = async () => {
  try {
    const machine = await Machine.create({ name: 'machine-1' });

    const subAssembly1 = await SubAssembly.create({ name: 'sub-assembly-1', machineId: machine._id });
    await Component.create({ name: 'component-1-1', subAssemblyId: subAssembly1._id });
    await Component.create({ name: 'component-1-2', subAssemblyId: subAssembly1._id });

    const subAssembly2 = await SubAssembly.create({ name: 'sub-assembly-2', machineId: machine._id });
    await Component.create({ name: 'component-2-1', subAssemblyId: subAssembly2._id });
    await Component.create({ name: 'component-2-2', subAssemblyId: subAssembly2._id });

    const machineWorkOrder = await WorkOrder.create({ workOrderableId: machine._id, workOrderableType: 'Machine' });

    for (let subAssembly of [subAssembly1, subAssembly2]) {
      const subAssemblyWorkOrder = await WorkOrder.create({
        workOrderableId: subAssembly._id,
        workOrderableType: 'SubAssembly',
        ancestry: machineWorkOrder.id,
      });

      const subAssemblyComponents = await Component.find({ subAssemblyId: subAssembly._id });

      for (let component of subAssemblyComponents) {
        await WorkOrder.create({
          workOrderableId: component._id,
          workOrderableType: 'Component',
          ancestry: `${subAssemblyWorkOrder.ancestry}/${subAssemblyWorkOrder._id}`,
        });
      }
    }
  } catch (error) {
    console.log('error', error);
    throw error;
  }
};

export default createEntityDocuments;
