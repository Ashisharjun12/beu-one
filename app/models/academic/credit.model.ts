import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: [true, "Credit value is required"],
    min: 0.5,
    validate: {
      validator: function(v: number) {
        // Check if number has at most 1 decimal place
        return /^\d*\.?\d{0,1}$/.test(v.toString());
      },
      message: "Credit value must have at most 1 decimal place"
    }
  },
  label: {
    type: String,
    required: [true, "Credit label is required"],
    unique: true,
  },
}, {
  timestamps: true
});

const Credit = mongoose.models.Credit || mongoose.model("Credit", creditSchema);
export default Credit; 