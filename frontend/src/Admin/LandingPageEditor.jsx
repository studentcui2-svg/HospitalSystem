import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { jsonFetch } from "../utils/api";
import {
  FaSave,
  FaUndo,
  FaEye,
  FaEdit,
  FaTimes,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
  FaLightbulb,
} from "react-icons/fa";

// ===== Styled Components =====

const EditorContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(79, 70, 229, 0.1);
  padding: 0.5rem;

  @media (min-width: 1536px) {
    max-width: 1536px;
    padding: 1rem;
  }

  @media (min-width: 1280px) and (max-width: 1535px) {
    max-width: 1280px;
    padding: 1rem;
  }
`;

const EditorHeader = styled.div`
  padding: 2.5rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EditorTitle = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &.save {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  &.reset {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &.preview {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 3px solid #e5e7eb;
  background: linear-gradient(90deg, #f9fafb 0%, #ffffff 100%);
  overflow-x: auto;
  position: relative;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
`;

const Tab = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 1.8rem 1.5rem;
  border: none;
  background: transparent;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 4px solid transparent;
  position: relative;
  font-size: 0.95rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.active {
    color: #4f46e5;
    border-bottom-color: #4f46e5;
    background: rgba(79, 70, 229, 0.05);
  }

  &:hover {
    background: rgba(79, 70, 229, 0.03);
    color: #4f46e5;
  }
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  padding: 3rem;
  min-height: 600px;

  /* lg and above: give preview column slightly less width */
  @media (min-width: 1280px) {
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
    padding: 3.5rem;
  }

  /* md to lg: single column on smaller screens */
  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (max-width: 767px) {
    padding: 1.5rem;
    min-height: auto;
  }
`;

const EditorPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const PreviewPanel = styled.div`
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px dashed #d1d5db;
  max-height: 700px;
  overflow-y: auto;
  position: sticky;
  top: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }

  /* On small screens, make preview flow naturally */
  @media (max-width: 767px) {
    position: static;
    max-height: none;
    overflow: visible;
    padding: 1rem;
  }
`;

const PreviewLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 800;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(79, 70, 229, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const Label = styled.label`
  font-weight: 700;
  color: #1f2937;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .required {
    color: #ef4444;
    font-weight: 900;
  }

  .hint {
    font-weight: 500;
    color: #6b7280;
    font-size: 0.8rem;
    margin-top: 0.35rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(59, 130, 246, 0.05);
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    border-left: 2px solid #3b82f6;
  }
`;

const Input = styled.input`
  padding: 0.95rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    background: rgba(79, 70, 229, 0.01);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  padding: 0.95rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    background: rgba(79, 70, 229, 0.01);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PreviewBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h2 {
    margin: 0 0 1.2rem 0;
    color: #111827;
    font-size: 1.8rem;
    font-weight: 800;
  }

  h3 {
    margin: 0 0 0.7rem 0;
    color: #374151;
    font-size: 1.2rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #6b7280;
    line-height: 1.7;
    font-size: 0.95rem;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    background: rgba(79, 70, 229, 0.02);
    border-radius: 8px;
    margin-bottom: 0.75rem;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .label {
      color: #6b7280;
      font-weight: 600;
    }

    .value {
      font-weight: 800;
      color: #4f46e5;
      font-size: 1.1rem;
    }
  }
`;

const SectionTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #4f46e5;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &:first-child {
    padding-top: 0;
    margin-top: 0;
    border-top: none;
  }

  &::before {
    content: "";
    width: 4px;
    height: 4px;
    background: #4f46e5;
    border-radius: 50%;
  }
`;

const ArrayItemContainer = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4f46e5 0%, #7e22ce 100%);
    border-radius: 12px 12px 0 0;
  }
`;

const ArrayItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;

  strong {
    color: #1f2937;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const RemoveButton = styled.button`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.85rem 1.8rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 0.95rem;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  color: #4f46e5;

  svg {
    font-size: 2.5rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// ===== Component =====

const LandingPageEditor = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const [data, setData] = useState({
    hero: {
      title: "Welcome to ZeeCare Medical Institute",
      subtitle: "Your Trusted Healthcare Provider",
      description:
        "State-of-the-art facility dedicated to providing comprehensive healthcare services with compassion.",
      cta: "Book Appointment Now",
    },
    about: {
      heading: "We are pioneering the future of healthcare.",
      subtitle: "With two decades of medical excellence, we care for families.",
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

  const [originalData, setOriginalData] = useState(data);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await jsonFetch("/api/site-content");
        if (res?.data) {
          // Ensure all required fields exist
          const cleanData = {
            hero: res.data.hero || {
              title: "Welcome to ZeeCare Medical Institute",
              subtitle: "Your Trusted Healthcare Provider",
              description:
                "State-of-the-art facility dedicated to providing comprehensive healthcare services with compassion.",
              cta: "Book Appointment Now",
            },
            about: res.data.about || {
              heading: "We are pioneering the future of healthcare.",
              subtitle:
                "With two decades of medical excellence, we care for families.",
              quote:
                "Your health is our mission, and your trust is our greatest achievement.",
            },
            services: Array.isArray(res.data.services) ? res.data.services : [],
            stats: Array.isArray(res.data.stats) ? res.data.stats : [],
          };
          setData(cleanData);
          setOriginalData(cleanData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load site content", err);
        toast.warning("Using default content - backend not responding");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await jsonFetch("/api/site-content", {
        method: "PUT",
        body: data,
      });
      setOriginalData(data);
      setHasChanges(false);
      toast.success("✓ Landing page saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setSaving(false);
    } catch (err) {
      console.error("Failed to save", err);
      toast.error(err?.message || "Failed to save changes");
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? This will revert all unsaved changes.")) {
      setData(originalData);
      setHasChanges(false);
      toast.info("Changes reverted to last saved version");
    }
  };

  const handleInputChange = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleArrayChange = (section, index, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    setHasChanges(true);
  };

  const handleAddArrayItem = (section) => {
    setData((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        section === "services"
          ? { name: "", description: "", icon: "🏥" }
          : { label: "", number: "" },
      ],
    }));
    setHasChanges(true);
  };

  const handleRemoveArrayItem = (section, index) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <EditorContainer>
        <EditorHeader>
          <HeaderContent>
            <EditorTitle>
              <FaEdit /> Landing Page Editor
            </EditorTitle>
          </HeaderContent>
        </EditorHeader>
        <LoadingSpinner>
          <FaSpinner />
          <p style={{ marginTop: "1rem" }}>Loading your landing page...</p>
        </LoadingSpinner>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <EditorHeader>
        <HeaderContent>
          <EditorTitle>
            <FaEdit /> Landing Page Editor
          </EditorTitle>
          <HeaderSubtitle>
            Design your hospital's digital first impression
          </HeaderSubtitle>
        </HeaderContent>
        <ActionButtons>
          {hasChanges && (
            <StatusBadge>
              <FaLightbulb /> Unsaved changes
            </StatusBadge>
          )}
          <Button
            className="reset"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <FaUndo /> Reset
          </Button>
          <Button
            className="save"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <FaSpinner style={{ animation: "spin 1s linear infinite" }} />{" "}
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </Button>
        </ActionButtons>
      </EditorHeader>

      <TabsContainer>
        {["hero", "about", "services", "stats"].map((tab) => (
          <Tab
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "hero" && "🎯"} {tab === "about" && "📋"}{" "}
            {tab === "services" && "⚕️"} {tab === "stats" && "📊"}{" "}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Tab>
        ))}
      </TabsContainer>

      <ContentWrapper>
        <EditorPanel>
          {/* Hero Tab */}
          {activeTab === "hero" && (
            <>
              <SectionTitle>Hero Section</SectionTitle>
              <FormGroup>
                <Label>
                  Main Title <span className="required">*</span>
                  <span className="hint">
                    <FaLightbulb size={12} /> Large headline visitors see first
                  </span>
                </Label>
                <Input
                  value={data.hero.title}
                  onChange={(e) =>
                    handleInputChange("hero", "title", e.target.value)
                  }
                  placeholder="e.g., Welcome to ZeeCare Medical Institute"
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Subtitle <span className="required">*</span>
                  <span className="hint">
                    <FaLightbulb size={12} /> Supporting tagline below title
                  </span>
                </Label>
                <Input
                  value={data.hero.subtitle}
                  onChange={(e) =>
                    handleInputChange("hero", "subtitle", e.target.value)
                  }
                  placeholder="e.g., Your Trusted Healthcare Provider"
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Description
                  <span className="hint">
                    <FaLightbulb size={12} /> Brief overview of your hospital
                  </span>
                </Label>
                <TextArea
                  value={data.hero.description}
                  onChange={(e) =>
                    handleInputChange("hero", "description", e.target.value)
                  }
                  placeholder="Describe what makes your hospital special..."
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Button Text
                  <span className="hint">
                    <FaLightbulb size={12} /> CTA button label
                  </span>
                </Label>
                <Input
                  value={data.hero.cta}
                  onChange={(e) =>
                    handleInputChange("hero", "cta", e.target.value)
                  }
                  placeholder="e.g., Book Appointment Now"
                />
              </FormGroup>
            </>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <>
              <SectionTitle>About Section</SectionTitle>
              <FormGroup>
                <Label>
                  Main Heading <span className="required">*</span>
                  <span className="hint">
                    <FaLightbulb size={12} /> Large heading for about section
                  </span>
                </Label>
                <Input
                  value={data.about.heading}
                  onChange={(e) =>
                    handleInputChange("about", "heading", e.target.value)
                  }
                  placeholder="e.g., We are pioneering the future of healthcare"
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Subtitle
                  <span className="hint">
                    <FaLightbulb size={12} /> Supporting text under heading
                  </span>
                </Label>
                <TextArea
                  value={data.about.subtitle}
                  onChange={(e) =>
                    handleInputChange("about", "subtitle", e.target.value)
                  }
                  placeholder="Tell your hospital's story..."
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Inspirational Quote
                  <span className="hint">
                    <FaLightbulb size={12} /> Motivational message about mission
                  </span>
                </Label>
                <TextArea
                  value={data.about.quote}
                  onChange={(e) =>
                    handleInputChange("about", "quote", e.target.value)
                  }
                  placeholder="e.g., Your health is our mission..."
                />
              </FormGroup>
            </>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <>
              <SectionTitle>Services / Departments</SectionTitle>
              <div>
                {data.services?.map((service, idx) => (
                  <ArrayItemContainer key={idx}>
                    <ArrayItemHeader>
                      <strong>
                        #{idx + 1} - {service.name || "New Service"}
                      </strong>
                      <RemoveButton
                        onClick={() => handleRemoveArrayItem("services", idx)}
                      >
                        <FaTrash /> Remove
                      </RemoveButton>
                    </ArrayItemHeader>

                    <FormGroup>
                      <Label>Service Name</Label>
                      <Input
                        value={service.name}
                        onChange={(e) =>
                          handleArrayChange(
                            "services",
                            idx,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Cardiology"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Description</Label>
                      <TextArea
                        value={service.description}
                        onChange={(e) =>
                          handleArrayChange(
                            "services",
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe this service..."
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Icon/Emoji</Label>
                      <Input
                        value={service.icon}
                        onChange={(e) =>
                          handleArrayChange(
                            "services",
                            idx,
                            "icon",
                            e.target.value
                          )
                        }
                        placeholder="e.g., ❤️"
                        maxLength="2"
                      />
                    </FormGroup>
                  </ArrayItemContainer>
                ))}
              </div>
              <AddButton onClick={() => handleAddArrayItem("services")}>
                <FaPlus /> Add Service
              </AddButton>
            </>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <>
              <SectionTitle>Statistics / Achievements</SectionTitle>
              <div>
                {data.stats?.map((stat, idx) => (
                  <ArrayItemContainer key={idx}>
                    <ArrayItemHeader>
                      <strong>
                        #{idx + 1} - {stat.label || "New Stat"}
                      </strong>
                      <RemoveButton
                        onClick={() => handleRemoveArrayItem("stats", idx)}
                      >
                        <FaTrash /> Remove
                      </RemoveButton>
                    </ArrayItemHeader>

                    <FormGroup>
                      <Label>Stat Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          handleArrayChange(
                            "stats",
                            idx,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Happy Patients"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Stat Number</Label>
                      <Input
                        value={stat.number}
                        onChange={(e) =>
                          handleArrayChange(
                            "stats",
                            idx,
                            "number",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 50,000+"
                      />
                    </FormGroup>
                  </ArrayItemContainer>
                ))}
              </div>
              <AddButton onClick={() => handleAddArrayItem("stats")}>
                <FaPlus /> Add Stat
              </AddButton>
            </>
          )}
        </EditorPanel>

        {/* Preview Panel */}
        <PreviewPanel>
          <PreviewLabel>
            <FaEye /> Live Preview
          </PreviewLabel>

          {activeTab === "hero" && (
            <PreviewBox>
              <h2>{data.hero.title || "Your Hospital Title"}</h2>
              <h3>{data.hero.subtitle || "Your Subtitle Here"}</h3>
              <p style={{ marginBottom: "1.5rem" }}>
                {data.hero.description || "Your hospital description..."}
              </p>
              <button
                style={{
                  padding: "0.9rem 2rem",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {data.hero.cta || "Book Appointment"} <FaArrowRight />
              </button>
            </PreviewBox>
          )}

          {activeTab === "about" && (
            <PreviewBox>
              <h2>{data.about.heading || "About Section"}</h2>
              <p style={{ marginBottom: "1.5rem" }}>
                {data.about.subtitle || "Your hospital's story..."}
              </p>
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1.2rem",
                  background:
                    "linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(126, 34, 206, 0.1) 100%)",
                  borderRadius: "10px",
                  borderLeft: "4px solid #4f46e5",
                  fontStyle: "italic",
                  color: "#4f46e5",
                  fontWeight: "500",
                }}
              >
                "{data.about.quote || "Your inspirational quote..."}"
              </div>
            </PreviewBox>
          )}

          {activeTab === "services" && (
            <PreviewBox>
              <h2 style={{ marginBottom: "1.5rem" }}>Our Services</h2>
              {data.services && data.services.length > 0 ? (
                data.services.map((service, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "1rem",
                      padding: "1.2rem",
                      background: "#f9fafb",
                      borderRadius: "10px",
                      borderLeft: "3px solid #4f46e5",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                      {service.icon || "🏥"}
                    </div>
                    <h3 style={{ marginTop: 0 }}>
                      {service.name || "Service"}
                    </h3>
                    <p style={{ fontSize: "0.9rem" }}>
                      {service.description || "Service description..."}
                    </p>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "#999",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  No services added yet
                </p>
              )}
            </PreviewBox>
          )}

          {activeTab === "stats" && (
            <PreviewBox>
              <h2 style={{ marginBottom: "1.5rem" }}>Our Statistics</h2>
              {data.stats && data.stats.length > 0 ? (
                data.stats.map((stat, idx) => (
                  <div key={idx} className="stat">
                    <span className="label">{stat.label || "Label"}</span>
                    <span className="value">{stat.number || "0"}</span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "#999",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  No statistics added yet
                </p>
              )}
            </PreviewBox>
          )}
        </PreviewPanel>
      </ContentWrapper>
    </EditorContainer>
  );
};

export default LandingPageEditor;
