const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Calculate age from date of birth
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

async function addFatherNameAndAgeToAppointments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✓ Connected to MongoDB");

    // Find all appointments
    const appointments = await Appointment.find({});
    console.log(`\nFound ${appointments.length} appointments`);

    let updated = 0;
    let skipped = 0;

    for (const appointment of appointments) {
      let needsUpdate = false;
      const updates = {};

      // Add fatherName field if it doesn't exist
      if (appointment.fatherName === undefined) {
        updates.fatherName = "";
        needsUpdate = true;
      }

      // Calculate and update age from dateOfBirth (even if age field exists)
      if (appointment.dateOfBirth) {
        const calculatedAge = calculateAge(appointment.dateOfBirth);
        if (calculatedAge !== null && calculatedAge !== undefined) {
          // Update age even if it exists, to recalculate from dateOfBirth
          updates.age = calculatedAge;
          needsUpdate = true;
        }
      } else if (appointment.age === undefined) {
        // No dateOfBirth and no age field, set age to null
        updates.age = null;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Appointment.updateOne(
          { _id: appointment._id },
          { $set: updates },
        );
        updated++;
        console.log(
          `✓ Updated: ${appointment.patientName} (${appointment._id})`,
        );
        if (updates.age !== undefined && updates.age !== null) {
          console.log(`  - Added age: ${updates.age} years`);
        }
        if (updates.fatherName !== undefined) {
          console.log(`  - Added fatherName field (empty)`);
        }
      } else {
        skipped++;
      }
    }

    console.log(`\n✓ Migration completed!`);
    console.log(`  - Updated: ${updated} appointments`);
    console.log(`  - Skipped: ${skipped} appointments (already have fields)`);

    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
addFatherNameAndAgeToAppointments();
