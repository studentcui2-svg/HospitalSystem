/* eslint-env node */
require("dotenv").config();
const mongoose = require("mongoose");
const Medicine = require("../models/Medicine");

const sampleMedicines = [
  {
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Painkiller",
    manufacturer: "GlaxoSmithKline",
    form: "Tablet",
    strength: "500mg",
    price: 2.5,
    stockQuantity: 500,
    reorderLevel: 50,
    commonDosage: "1-2 tablets every 4-6 hours",
    sideEffects: "Rare, may include nausea, rash",
    warnings: "Do not exceed 4g per day. Liver damage risk with overdose.",
    interactionWarnings: ["Avoid alcohol", "May interact with blood thinners"],
  },
  {
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    manufacturer: "Pfizer",
    form: "Capsule",
    strength: "500mg",
    price: 15,
    stockQuantity: 300,
    reorderLevel: 40,
    commonDosage: "1 capsule three times daily",
    sideEffects: "Diarrhea, nausea, skin rash",
    warnings:
      "Complete full course. Allergy risk in penicillin-sensitive patients.",
    interactionWarnings: ["May reduce effectiveness of birth control pills"],
  },
  {
    name: "Omeprazole",
    genericName: "Omeprazole",
    category: "Antacid",
    manufacturer: "AstraZeneca",
    form: "Capsule",
    strength: "20mg",
    price: 8,
    stockQuantity: 200,
    reorderLevel: 30,
    commonDosage: "1 capsule once daily before breakfast",
    sideEffects: "Headache, diarrhea, stomach pain",
    warnings: "Long-term use may affect magnesium levels",
    interactionWarnings: ["May interact with blood thinners, HIV medications"],
  },
  {
    name: "Metformin",
    genericName: "Metformin HCl",
    category: "Antidiabetic",
    manufacturer: "Bristol-Myers Squibb",
    form: "Tablet",
    strength: "500mg",
    price: 5,
    stockQuantity: 400,
    reorderLevel: 50,
    commonDosage: "1 tablet twice daily with meals",
    sideEffects: "Nausea, diarrhea, stomach upset",
    warnings: "Monitor kidney function. Risk of lactic acidosis (rare).",
    interactionWarnings: ["Avoid alcohol", "May interact with contrast dyes"],
  },
  {
    name: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    category: "Antihypertensive",
    manufacturer: "Pfizer",
    form: "Tablet",
    strength: "20mg",
    price: 12,
    stockQuantity: 250,
    reorderLevel: 30,
    commonDosage: "1 tablet once daily",
    sideEffects: "Muscle pain, digestive problems",
    warnings: "Avoid grapefruit juice. Monitor liver function.",
    interactionWarnings: ["May interact with other cholesterol medications"],
  },
  {
    name: "Cetirizine",
    genericName: "Cetirizine HCl",
    category: "Antihistamine",
    manufacturer: "Johnson & Johnson",
    form: "Tablet",
    strength: "10mg",
    price: 4,
    stockQuantity: 350,
    reorderLevel: 40,
    commonDosage: "1 tablet once daily",
    sideEffects: "Drowsiness, dry mouth",
    warnings: "May cause drowsiness. Avoid driving if affected.",
    interactionWarnings: ["Alcohol may increase drowsiness"],
  },
  {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    category: "Painkiller",
    manufacturer: "Advil",
    form: "Tablet",
    strength: "400mg",
    price: 3.5,
    stockQuantity: 600,
    reorderLevel: 60,
    commonDosage: "1-2 tablets every 6-8 hours",
    sideEffects: "Stomach upset, heartburn",
    warnings: "Take with food. Risk of stomach bleeding with prolonged use.",
    interactionWarnings: [
      "May interact with blood pressure medications, aspirin",
    ],
  },
  {
    name: "Azithromycin",
    genericName: "Azithromycin",
    category: "Antibiotic",
    manufacturer: "Pfizer",
    form: "Tablet",
    strength: "500mg",
    price: 20,
    stockQuantity: 150,
    reorderLevel: 25,
    commonDosage: "1 tablet once daily for 3-5 days",
    sideEffects: "Diarrhea, nausea, stomach pain",
    warnings: "Complete full course. May cause irregular heartbeat (rare).",
    interactionWarnings: ["May interact with antacids, blood thinners"],
  },
  {
    name: "Losartan",
    genericName: "Losartan Potassium",
    category: "Antihypertensive",
    manufacturer: "Merck",
    form: "Tablet",
    strength: "50mg",
    price: 10,
    stockQuantity: 300,
    reorderLevel: 35,
    commonDosage: "1 tablet once daily",
    sideEffects: "Dizziness, back pain",
    warnings: "Monitor blood pressure regularly. Not for use in pregnancy.",
    interactionWarnings: ["May interact with potassium supplements, NSAIDs"],
  },
  {
    name: "Vitamin D3",
    genericName: "Cholecalciferol",
    category: "Vitamin",
    manufacturer: "Nature Made",
    form: "Capsule",
    strength: "1000 IU",
    price: 6,
    stockQuantity: 500,
    reorderLevel: 50,
    commonDosage: "1 capsule once daily",
    sideEffects: "Rare, may include constipation",
    warnings: "Do not exceed recommended dose",
    interactionWarnings: ["May interact with certain heart medications"],
  },
  {
    name: "Cough Syrup",
    genericName: "Dextromethorphan",
    category: "Other",
    manufacturer: "Robitussin",
    form: "Syrup",
    strength: "100ml",
    price: 7,
    stockQuantity: 180,
    reorderLevel: 30,
    commonDosage: "10ml every 4-6 hours",
    sideEffects: "Drowsiness, dizziness",
    warnings: "Do not use with MAO inhibitors",
    interactionWarnings: ["Avoid alcohol"],
  },
  {
    name: "Insulin Glargine",
    genericName: "Insulin Glargine",
    category: "Antidiabetic",
    manufacturer: "Sanofi",
    form: "Injection",
    strength: "100 units/ml",
    price: 85,
    stockQuantity: 50,
    reorderLevel: 10,
    commonDosage: "As prescribed by doctor",
    sideEffects: "Hypoglycemia, injection site reactions",
    warnings: "Refrigerate. Monitor blood sugar regularly.",
    interactionWarnings: ["May interact with oral diabetes medications"],
  },
  {
    name: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    category: "Painkiller",
    manufacturer: "Bayer",
    form: "Tablet",
    strength: "100mg",
    price: 2,
    stockQuantity: 800,
    reorderLevel: 80,
    commonDosage: "1 tablet once daily",
    sideEffects: "Stomach irritation, bleeding risk",
    warnings: "Take with food. Not for children with viral infections.",
    interactionWarnings: ["May interact with blood thinners, NSAIDs"],
  },
  {
    name: "Salbutamol Inhaler",
    genericName: "Salbutamol",
    category: "Other",
    manufacturer: "GSK",
    form: "Inhaler",
    strength: "100mcg/dose",
    price: 18,
    stockQuantity: 100,
    reorderLevel: 20,
    commonDosage: "1-2 puffs as needed",
    sideEffects: "Tremor, rapid heartbeat",
    warnings: "Shake well before use",
    interactionWarnings: ["May interact with beta blockers"],
  },
  {
    name: "Ranitidine",
    genericName: "Ranitidine HCl",
    category: "Antacid",
    manufacturer: "GlaxoSmithKline",
    form: "Tablet",
    strength: "150mg",
    price: 4.5,
    stockQuantity: 280,
    reorderLevel: 35,
    commonDosage: "1 tablet twice daily",
    sideEffects: "Headache, constipation",
    warnings: "May mask symptoms of stomach cancer",
    interactionWarnings: ["May interact with antifungal medications"],
  },
];

const seedMedicines = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital",
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log("🗑️  Cleared existing medicines");

    // Insert sample medicines
    const inserted = await Medicine.insertMany(sampleMedicines);
    console.log(`✅ Inserted ${inserted.length} sample medicines`);

    console.log("\n📋 Sample Medicines:");
    inserted.forEach((med, idx) => {
      console.log(
        `${idx + 1}. ${med.name} (${med.strength}) - Stock: ${med.stockQuantity}`,
      );
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding medicines:", err);
    process.exit(1);
  }
};

seedMedicines();
