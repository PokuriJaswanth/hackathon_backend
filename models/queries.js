const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const emergencySchema = new mongoose.Schema({
  patientName: String,
  bloodGroup: String,
  hospital: String,
  contact: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: [Number]
  }
}, { timestamps: true });

emergencySchema.index({ location: "2dsphere" });

const Emergency=mongoose.model("Emergency", emergencySchema)

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      required: true,
      min: 18
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    },

    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },
    

    // 📍 GeoJSON
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    image: {
      type: String,
     // 👈 make true if image is compulsory
    }
  },
  { timestamps: true }
);

donorSchema.index({ location: "2dsphere" });

const Donor = mongoose.model("Donor", donorSchema);

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

/* 🔐 Hash password before saving */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* 🔑 Compare password */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User=mongoose.model("User",userSchema)

module.exports ={
    Emergency,Donor,User
}