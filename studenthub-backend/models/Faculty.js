import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Faculty", schema);