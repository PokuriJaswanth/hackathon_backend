const { Emergency, Donor,User } = require("../models/queries");
const jwt= require("jsonwebtoken");



const createEmergency = async (req, res) => {
  try {
    console.log("Incoming:", req.body);

    const newEmergency = await Emergency.create(req.body);

    res.status(201).json(newEmergency);

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


const createDonor = async (req, res) => {
  try {
    console.log("Incoming Donor:", req.body);

    const donor = await Donor.create(req.body);

    res.status(201).json({
      success: true,
      data: donor
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// 📍 Get Nearby Donors
const getNearbyDonors = async (req, res) => {
  try {
    const { lat, lng, bloodGroup } = req.query;

    const donors = await Donor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: "distance",
          maxDistance: 10000,
          spherical: true,
          query: {
            bloodGroup: bloodGroup
          }
        }
      },
      {
        $sort: { distance: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getDonorByPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    const donor = await Donor.findOne({ phone });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({
      success: true,
      data: donor
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const login=async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey", // 🔥 change to env later
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const signup=async (req, res) => {
  try {
    console.log('backend is calling')
    const { name, phone, password } = req.body;

    // 🧪 Validation
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // ❌ Check existing user
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create user
    const user = await User.create({
      name,
      phone,
      password
    });

    // 🔑 Create token
    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        phone: user.phone
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};





module.exports = {
  createEmergency,
  createDonor,
  getNearbyDonors,
  login,signup,getDonorByPhone
};