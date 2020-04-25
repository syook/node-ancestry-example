import { mongoose, Schema } from '../config/db';

const MachineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Machine', MachineSchema);
