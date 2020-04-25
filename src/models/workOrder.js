import { mongoose, Schema } from '../config/db';

const WorkOrderSchema = new Schema(
  {
    ancestry: {
      type: String,
      index: true,
      sparse: true,
      default: '',
    },
    workOrderableId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    workOrderableType: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TODO: move all this methods into a plugin, then connect schema where this is needed
// ancestor ids of the record
WorkOrderSchema.methods.ancestryIds = async function () {
  try {
    return this.ancestry.split('/').filter(Boolean);
  } catch (error) {
    throw error;
  }
};

// parent id of the record, null for a root node
WorkOrderSchema.methods.parentId = async function () {
  try {
    const ancestryIds = await this.ancestryIds();
    if (!ancestryIds.length) return null;

    return ancestryIds[ancestryIds.length - 1];
  } catch (error) {
    throw error;
  }
};

// root id of the record's tree, null for a root node
WorkOrderSchema.methods.rootId = async function () {
  try {
    const ancestryIds = await this.ancestryIds();
    if (!ancestryIds.length) return null;

    return ancestryIds[0];
  } catch (error) {
    throw error;
  }
};

// parent of the record, null for a root node
WorkOrderSchema.methods.parent = async function () {
  try {
    const parentId = await this.parentId();
    if (!parentId) return null;

    const parentWorkOrder = await this.model('WorkOrder').findOne({ _id: parentId });
    return parentWorkOrder;
  } catch (error) {
    throw error;
  }
};

// root of the record's tree, null for a root node
WorkOrderSchema.methods.root = async function () {
  try {
    const rootId = await this.rootId();
    if (!rootId) return null;

    const rootWorkOrder = await this.model('WorkOrder').findOne({ _id: rootId });
    return rootWorkOrder;
  } catch (error) {
    throw error;
  }
};

// direct children of the record
WorkOrderSchema.methods.children = async function () {
  try {
    if (!this.id) return [];

    const childrenWorkOrders = await this.model('WorkOrder').find({
      ancestry: this.ancestry ? `${this.ancestry}/${this.id}` : this.id,
    });
    return childrenWorkOrders;
  } catch (error) {
    throw error;
  }
};

// direct and indirect children of the record
WorkOrderSchema.methods.descendants = async function () {
  try {
    if (!this.id) return [];

    const descendantWorkOrders = await this.model('WorkOrder').find({ ancestry: new RegExp(this.id, 'i') });
    return descendantWorkOrders;
  } catch (error) {
    throw error;
  }
};

// siblings of the record, the record itself is included*
WorkOrderSchema.methods.siblings = async function () {
  try {
    if (!this.ancestry) return [];

    const siblingWorkOrders = await this.model('WorkOrder').find({ ancestry: this.ancestry });
    return siblingWorkOrders;
  } catch (error) {
    throw error;
  }
};

export default mongoose.model('WorkOrder', WorkOrderSchema);
