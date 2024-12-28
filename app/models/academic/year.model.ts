import mongoose from "mongoose";

const yearSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: [true, "Year value is required"],
    min: 1,
    max: 4,
    unique: true,
  },
  label: {
    type: String,
    required: [true, "Year label is required"],
    unique: true,
  },
}, {
  timestamps: true
});

const Year = mongoose.models.Year || mongoose.model("Year", yearSchema);

export { yearSchema };
export default Year; 