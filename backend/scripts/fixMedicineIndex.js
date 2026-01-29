require("dotenv").config();
const mongoose = require("mongoose");

async function fixMedicineIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("medicines");

    // Drop the old unique index on 'name'
    try {
      await collection.dropIndex("name_1");
      console.log("🗑️  Dropped old unique index on name");
    } catch (err) {
      if (err.code === 27) {
        console.log("ℹ️  Index name_1 does not exist (already dropped)");
      } else {
        throw err;
      }
    }

    // Ensure the new compound index exists
    await collection.createIndex(
      { name: 1, strength: 1, form: 1 },
      { unique: true },
    );
    console.log("✅ Created compound index on name + strength + form");

    // List all indexes
    const indexes = await collection.indexes();
    console.log(
      "\n📋 Current indexes:",
      indexes.map((idx) => idx.name).join(", "),
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixMedicineIndex();
