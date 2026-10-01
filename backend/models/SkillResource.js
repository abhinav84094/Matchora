import mongoose from "mongoose"

const skillResourceSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
    unique: true,        // canonical name
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  resources: [
    {
      type:  { type: String, enum: ["YouTube", "Free", "Practice", "Docs"] },
      title: { type: String, required: true },
      url:   { type: String, required: true },
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
},
{ timestamps: true });


export default mongoose.model("SkillResource", skillResourceSchema);