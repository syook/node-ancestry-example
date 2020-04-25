import { mongoose, Schema } from '../config/db';

const ComponentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    subAssemblyId: {
      type: Schema.Types.ObjectId,
      ref: 'SubAssembly',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Component', ComponentSchema);
