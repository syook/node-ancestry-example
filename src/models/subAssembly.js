import { mongoose, Schema } from '../config/db';

const SubAssemblySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    machineId: {
      type: Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('SubAssembly', SubAssemblySchema);
