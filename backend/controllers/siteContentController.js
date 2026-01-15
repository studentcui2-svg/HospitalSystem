const SiteContent = require("../models/SiteContent");

// Get all site content
const getSiteContent = async (req, res) => {
  try {
    let content = await SiteContent.findOne();

    // If no content exists, create default content
    if (!content) {
      content = new SiteContent({
        hero: {
          title: "Welcome to ZeeCare Medical Institute",
          subtitle: "Your Health, Our Priority",
          description:
            "Providing world-class healthcare services with compassion and excellence",
          cta: "Book Appointment",
        },
        about: {
          heading: "We are pioneering the future of healthcare.",
          subtitle:
            "With two decades of medical excellence, we care for families.",
          quote:
            "Your health is our mission, and your trust is our greatest achievement.",
        },
        services: [
          {
            name: "Cardiology",
            description: "Expert heart and cardiovascular care",
            icon: "❤️",
          },
          {
            name: "Neurology",
            description: "Advanced neurological treatments",
            icon: "🧠",
          },
          {
            name: "Orthopedics",
            description: "Comprehensive bone and joint care",
            icon: "🦴",
          },
        ],
        stats: [
          { label: "Happy Patients", number: "50,000+" },
          { label: "Expert Doctors", number: "200+" },
          { label: "Emergency Care", number: "24/7" },
        ],
      });

      await content.save();
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching site content:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching site content",
      error: error.message,
    });
  }
};

// Update site content
const updateSiteContent = async (req, res) => {
  try {
    const { hero, about, services, stats } = req.body;

    let content = await SiteContent.findOne();

    if (!content) {
      content = new SiteContent({
        hero,
        about,
        services,
        stats,
      });
    } else {
      if (hero) content.hero = hero;
      if (about) content.about = about;
      if (services) content.services = services;
      if (stats) content.stats = stats;
    }

    await content.save();

    res.status(200).json({
      success: true,
      message: "Site content updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Error updating site content:", error);
    res.status(500).json({
      success: false,
      message: "Error updating site content",
      error: error.message,
    });
  }
};

module.exports = {
  getSiteContent,
  updateSiteContent,
};
