const { mongoose, Schema } = require('../config/db');

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

module.exports = mongoose.model('Machine', MachineSchema);
