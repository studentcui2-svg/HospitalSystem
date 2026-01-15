const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema({
  hero: {
    title: {
      type: String,
      default: "Welcome to ZeeCare Medical Institute",
    },
    subtitle: {
      type: String,
      default: "Your Health, Our Priority",
    },
    description: {
      type: String,
      default:
        "Providing world-class healthcare services with compassion and excellence",
    },
    cta: {
      type: String,
      default: "Book Appointment",
    },
  },
  about: {
    heading: {
      type: String,
      default: "About ZeeCare",
    },
    quote: {
      type: String,
      default:
        "We are pioneering the future of healthcare with innovation and care",
    },
    excellencePanel: {
      type: String,
      default: "Excellence in every aspect of patient care",
    },
  },
  services: [
    {
      id: {
        type: String,
        default: function () {
          return Date.now().toString();
        },
      },
      name: String,
      description: String,
      icon: String,
    },
  ],
  stats: [
    {
      id: {
        type: String,
        default: function () {
          return Date.now().toString();
        },
      },
      number: String,
      label: String,
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
siteContentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("SiteContent", siteContentSchema);
