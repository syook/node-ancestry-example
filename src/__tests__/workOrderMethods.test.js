import { mongoose } from '../config/db';

import createEntityDocuments from '../scripts/createEntityDocuments';

import { WorkOrder } from '../models';

test('createEntityDocuments is a function', async () => {
  expect(typeof createEntityDocuments).toEqual('function');
});

let machineWorkOrder, subAssemblyWorkOrder, componentWorkOrder;
beforeAll(async (done) => {
  await mongoose.connection.dropDatabase();
  await createEntityDocuments();
  machineWorkOrder = await WorkOrder.findOne({ workOrderableType: 'Machine' });
  subAssemblyWorkOrder = await WorkOrder.findOne({ workOrderableType: 'SubAssembly' });
  componentWorkOrder = await WorkOrder.findOne({ workOrderableType: 'Component' });
  done();
});

it('it returns the correct count of documents', async () => {
  const result = await WorkOrder.countDocuments();
  expect(result).toEqual(7);
});

describe('Machine work order', () => {
  it('work order to exist', async () => {
    expect(machineWorkOrder).toBeTruthy();
  });

  it('work order to be the top most in chain', async () => {
    expect(await machineWorkOrder.parentId()).toBeNull();
    expect(await machineWorkOrder.parent()).toBeNull();
    expect(await machineWorkOrder.rootId()).toBeNull();
    expect(await machineWorkOrder.root()).toBeNull();
    expect(await machineWorkOrder.ancestryIds()).toHaveLength(0);
    expect(await machineWorkOrder.siblings()).toHaveLength(1);
  });

  it('work order to have sub-assembly children work orders', async () => {
    const machineChildrenWorkOrders = await machineWorkOrder.children();
    expect(machineChildrenWorkOrders).toHaveLength(2);
    expect(machineChildrenWorkOrders[0].workOrderableType).toEqual('SubAssembly');
    expect(machineChildrenWorkOrders[1].workOrderableType).toEqual('SubAssembly');
  });

  it('work order to have sub-assembly & component type descendant work orders', async () => {
    const machineDescendantWorkOrders = await machineWorkOrder.descendants();
    expect(machineDescendantWorkOrders).toHaveLength(6);

    const subAssemblyTypeWorkOrders = machineDescendantWorkOrders.filter(
      ({ workOrderableType }) => workOrderableType === 'SubAssembly'
    );
    const componentTypeWorkOrders = machineDescendantWorkOrders.filter(
      ({ workOrderableType }) => workOrderableType === 'Component'
    );

    expect(subAssemblyTypeWorkOrders).toHaveLength(2);
    expect(componentTypeWorkOrders).toHaveLength(4);
  });
});

describe('Sub Assembly work order', () => {
  it('work order to exist', async () => {
    expect(subAssemblyWorkOrder).toBeTruthy();
  });

  it('work order to have parent machine work order', async () => {
    expect(await subAssemblyWorkOrder.parentId()).toEqual(machineWorkOrder.id);
    expect(await subAssemblyWorkOrder.parent()).toEqual(machineWorkOrder);
    expect(await subAssemblyWorkOrder.rootId()).toEqual(machineWorkOrder.id);
    expect(await subAssemblyWorkOrder.root()).toEqual(machineWorkOrder);
    expect(await subAssemblyWorkOrder.ancestryIds()).toHaveLength(1);
    expect(await subAssemblyWorkOrder.siblings()).toHaveLength(2);
  });

  it('work order to have component children work orders', async () => {
    const componentChildrenWorkOrders = await subAssemblyWorkOrder.children();

    expect(componentChildrenWorkOrders).toHaveLength(2);
    expect(componentChildrenWorkOrders[0].workOrderableType).toEqual('Component');
    expect(componentChildrenWorkOrders[1].workOrderableType).toEqual('Component');
  });

  it('work order to have component type descendant work orders', async () => {
    const subAssemblyDescendantWorkOrders = await subAssemblyWorkOrder.descendants();

    expect(subAssemblyDescendantWorkOrders).toHaveLength(2);
    expect(subAssemblyDescendantWorkOrders[0].workOrderableType).toEqual('Component');
    expect(subAssemblyDescendantWorkOrders[1].workOrderableType).toEqual('Component');
  });
});

describe('Component work order', () => {
  it('work order to exist', async () => {
    expect(componentWorkOrder).toBeTruthy();
  });

  it('work order to have parent sub-assembly work order', async () => {
    expect(await componentWorkOrder.parentId()).toEqual(subAssemblyWorkOrder.id);
    expect(await componentWorkOrder.parent()).toEqual(subAssemblyWorkOrder);
  });

  it('work order to have root machine work order', async () => {
    expect(await componentWorkOrder.rootId()).toEqual(machineWorkOrder.id);
    expect(await componentWorkOrder.root()).toEqual(machineWorkOrder);
  });

  it('work order to have both machine & sub-assembly work order id in ancestry ids', async () => {
    expect(await componentWorkOrder.ancestryIds()).toEqual(
      expect.arrayContaining([machineWorkOrder.id, subAssemblyWorkOrder.id])
    );
  });

  it('work order should not have any children work orders', async () => {
    const componentChildrenWorkOrders = await componentWorkOrder.children();

    expect(componentChildrenWorkOrders).toHaveLength(0);
  });

  it('work order should not have any descendant work orders', async () => {
    const componentDescendantWorkOrders = await componentWorkOrder.descendants();

    expect(componentDescendantWorkOrders).toHaveLength(0);
  });
});
