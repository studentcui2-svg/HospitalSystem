const Doctor = require("../models/Doctor");

exports.createDoctor = async (req, res) => {
  try {
    console.log("[CREATE DOCTOR] Payload received:", req.body);
    const { name, email, department } = req.body;
    if (!name || !email) {
      console.warn("[CREATE DOCTOR] Missing required fields");
      return res
        .status(400)
        .json({ message: "Doctor name and email are required" });
    }

    const payload = { ...req.body };

    if (payload.photo && typeof payload.photo === "string") {
      const trimmed = payload.photo.trim();
      payload.photo = trimmed.length ? trimmed : undefined;
    }

    const doc = new Doctor(payload);
    await doc.save();

    // Always create or update a corresponding User account with role 'doctor' if email provided
    if (payload.email) {
      try {
        const User = require("../models/User");
        let user = await User.findOne({
          email: { $regex: `^${payload.email}$`, $options: "i" },
        });
        if (!user) {
          // Create new user with password if provided, or a default temp password
          const password =
            payload.password || Math.random().toString(36).slice(-10) + "A1!";
          user = new User({
            name: payload.name,
            email: payload.email,
            password: password,
            role: "doctor",
            isVerified: true,
          });
          await user.save();
          console.log(
            "[CREATE DOCTOR] Created user account for doctor:",
            user._id,
            payload.password ? "(with admin password)" : "(with temp password)",
          );
        } else {
          // Update existing user to doctor role and password if provided
          user.role = "doctor";
          if (payload.password) {
            user.password = payload.password;
            console.log("[CREATE DOCTOR] Updated password for existing user");
          }
          user.isVerified = true;
          await user.save();
          console.log(
            "[CREATE DOCTOR] Updated existing user to doctor:",
            user._id,
          );
        }
      } catch (uErr) {
        console.error(
          "[CREATE DOCTOR] Failed to create/update user account:",
          uErr,
        );
      }
    }

    console.log("[CREATE DOCTOR] Saved doctor:", doc._id);
    res.status(201).json({ ok: true, doctor: doc });
  } catch (err) {
    console.error("[CREATE DOCTOR ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    console.log("[GET DOCTORS] Request received");
    const q = {};
    if (req.query.search) q.name = { $regex: req.query.search, $options: "i" };
    const doctors = await Doctor.find(q).limit(200);
    console.log("[GET DOCTORS] Found", doctors.length, "doctors");
    res.json({ ok: true, doctors });
  } catch (err) {
    console.error("[GET DOCTORS ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    console.log("[UPDATE DOCTOR] ID:", req.params.id, "Payload:", req.body);
    const payload = { ...req.body };

    // Get the old doctor data before updating
    const oldDoctor = await Doctor.findById(req.params.id);
    if (!oldDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    // If email or name is being updated, sync with User collection
    if (payload.email || payload.name) {
      try {
        const User = require("../models/User");

        // Find user by old email first
        let user = await User.findOne({
          email: { $regex: `^${oldDoctor.email}$`, $options: "i" },
          role: "doctor",
        });

        if (user) {
          // Update existing user
          if (payload.email) {
            user.email = payload.email;
            console.log(
              "[UPDATE DOCTOR] Updated user email from",
              oldDoctor.email,
              "to",
              payload.email,
            );
          }
          if (payload.name) {
            user.name = payload.name;
            console.log("[UPDATE DOCTOR] Updated user name to", payload.name);
          }
          if (payload.password) {
            user.password = payload.password;
            console.log("[UPDATE DOCTOR] Updated user password");
          }
          user.isVerified = true;
          await user.save();
          console.log("[UPDATE DOCTOR] Synced user account:", user._id);
        } else if (payload.email) {
          // No user found with old email, try to find by new email
          user = await User.findOne({
            email: { $regex: `^${payload.email}$`, $options: "i" },
          });

          if (!user) {
            // Create new user
            const password =
              payload.password || Math.random().toString(36).slice(-10) + "A1!";
            user = new User({
              name: payload.name || doctor.name || "Doctor",
              email: payload.email,
              password: password,
              role: "doctor",
              isVerified: true,
            });
            await user.save();
            console.log(
              "[UPDATE DOCTOR] Created new user account:",
              user._id,
              payload.password
                ? "(with admin password)"
                : "(with temp password)",
            );
          } else {
            // Update existing user to doctor role
            user.role = "doctor";
            if (payload.name) user.name = payload.name;
            if (payload.password) user.password = payload.password;
            user.isVerified = true;
            await user.save();
            console.log(
              "[UPDATE DOCTOR] Updated existing user to doctor:",
              user._id,
            );
          }
        }
      } catch (uErr) {
        console.error("[UPDATE DOCTOR] Failed to sync user account:", uErr);
      }
    }

    console.log("[UPDATE DOCTOR] Updated doctor:", doctor._id);
    res.json({ ok: true, doctor });
  } catch (err) {
    console.error("[UPDATE DOCTOR ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    console.log("[DELETE DOCTOR] ID:", req.params.id);
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    console.log("[DELETE DOCTOR] Deleted doctor:", doctor._id);
    res.json({ ok: true, message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("[DELETE DOCTOR ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.backfillDoctorUsers = async (req, res) => {
  try {
    console.log("[BACKFILL] Starting backfill for doctor users...");
    const User = require("../models/User");
    const doctors = await Doctor.find({ email: { $exists: true, $ne: null } });
    console.log(`[BACKFILL] Found ${doctors.length} doctors with emails`);

    const results = [];
    for (const doctor of doctors) {
      const email = (doctor.email || "").trim();
      if (!email) continue;

      const existing = await User.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
      });
      if (existing) {
        results.push({ email, status: "exists", userId: existing._id });
        continue;
      }

      // Generate a temporary password
      const tempPass = Math.random().toString(36).slice(-10) + "A1!";
      const user = new User({
        name: doctor.name || "Doctor",
        email: doctor.email,
        password: tempPass,
        role: "doctor",
        isVerified: true,
      });

      await user.save();
      console.log(
        `[BACKFILL] Created user for ${email} with temp password: ${tempPass}`,
      );
      results.push({
        email,
        status: "created",
        userId: user._id,
        tempPassword: tempPass,
      });
    }

    console.log("[BACKFILL] Complete");
    res.json({ ok: true, results, message: "Backfill completed" });
  } catch (err) {
    console.error("[BACKFILL ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};
