import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useMotionValue, useTransform } from "framer-motion";
import { jsonFetch } from "../utils/api";
import SectionWithScene from "./SectionWithScene";
import { Phone, Mail, Sparkles, Zap } from "lucide-react";

// --- 1. Advanced Keyframes (Properly defined) ---
// (Reserved for future use if needed)

// --- 2. Styled Components ---

const AboutContainer = styled.section`
  padding: 120px 20px;
  background: #020617; /* Deepest dark for contrast */
  color: white;
  overflow: hidden;
  position: relative;
  perspective: 2000px;
`;

// Cyber-Medical Grid Background
const CyberGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at 2px 2px,
    rgba(99, 102, 241, 0.1) 1px,
    transparent 0
  );
  background-size: 40px 40px;
  opacity: 0.5;
  pointer-events: none;
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GlassPanel = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
`;

const SidebarGlass = styled.div`
  background: rgba(99, 102, 241, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 2rem;
`;

// Component starts here
const About = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Add cache-busting parameter to force fresh data
        const res = await jsonFetch(`/api/site-content?t=${Date.now()}`);
        if (!mounted) return;
        setSiteContent(res?.data || {});
        if (typeof window !== "undefined")
          window.__SITE_CONTENT__ = res?.data || {};
      } catch (err) {
        console.warn("Failed to load site content", err);
      }
    })();
    return () => (mounted = false);
  }, []);

  const handleContainerMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const bgX = useTransform(mouseX, [0, 1920], [-20, 20]);
  const bgY = useTransform(mouseY, [0, 1080], [-20, 20]);

  const about = siteContent?.about || {
    heading: "We are pioneering the future of healthcare.",
    subtitle:
      "With two decades of medical excellence, we don't just treat patients; we care for families.",
    quote:
      "Your health is our mission, and your trust is our greatest achievement.",
    panel: {
      badgeText: "Medical Institute 4.0",
      title: "20+ Years of Excellence",
      subtitle:
        "Setting the gold standard in clinical care and patient safety through continuous innovation and empathy.",
      items: [
        { title: "Certified Excellence", description: "" },
        { title: "Patient-Centered", description: "" },
        { title: "24/7 Available", description: "" },
      ],
    },
  };

  return (
    <SectionWithScene>
      <AboutContainer onMouseMove={handleContainerMove}>
        <CyberGrid style={{ transform: `translate(${bgX}px, ${bgY}px)` }} />

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#6366f1",
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid rgba(99,102,241,0.18)",
              }}
            >
              <Zap size={14} /> {about.panel.badgeText}
            </div>
            <h1
              style={{
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
                margin: "18px 0 10px",
                lineHeight: 1.02,
              }}
            >
              {about.heading}
            </h1>
            <p style={{ color: "#94a3b8", maxWidth: 900, margin: "0 auto" }}>
              {about.subtitle}
            </p>
          </div>

          <LayoutGrid>
            <div>
              <GlassPanel>
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    alignItems: "flex-start",
                    flexDirection: "column",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: "2rem" }}>
                      {about.heading}
                    </h2>
                    <p style={{ color: "#94a3b8", marginTop: 12 }}>
                      {about.subtitle}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      background: "rgba(255,255,255,0.03)",
                      padding: 18,
                      borderRadius: 12,
                    }}
                  >
                    <q style={{ color: "#7c3aed", fontWeight: 700 }}>
                      {about.quote}
                    </q>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 18,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: 200,
                        background: "white",
                        padding: 18,
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#6d28d9",
                        }}
                      >
                        {(siteContent?.stats && siteContent.stats[0]?.value) ||
                          "50,000+"}
                      </div>
                      <div style={{ color: "#6b7280" }}>Happy Patients</div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 200,
                        background: "white",
                        padding: 18,
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#6d28d9",
                        }}
                      >
                        {(siteContent?.stats && siteContent.stats[1]?.value) ||
                          "200+"}
                      </div>
                      <div style={{ color: "#6b7280" }}>Expert Doctors</div>
                    </div>
                  </div>
                </div>
              </GlassPanel>

              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 12,
                  }}
                >
                  {(about.panel.items || []).map((it, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        padding: 14,
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{it.title}</div>
                      {it.description ? (
                        <div style={{ color: "#9ca3af", marginTop: 6 }}>
                          {it.description}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SidebarGlass>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: "#ffd54a",
                    color: "#1f2937",
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontWeight: 800,
                  }}
                >
                  {about.panel.badgeText}
                </div>
                {siteContent?.heroImage ? (
                  <img
                    src={siteContent.heroImage}
                    alt="hero"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      objectFit: "cover",
                    }}
                  />
                ) : null}
              </div>

              <h3 style={{ marginTop: 0 }}>{about.panel.title}</h3>
              <p style={{ color: "#cbd5e1" }}>{about.panel.subtitle}</p>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {(about.panel.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      background: "rgba(255,255,255,0.02)",
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Sparkles size={16} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{it.title}</div>
                      {it.description ? (
                        <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                          {it.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </SidebarGlass>
          </LayoutGrid>
        </div>
      </AboutContainer>
    </SectionWithScene>
  );
};

export default About;
