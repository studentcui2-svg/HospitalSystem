import React, { useState } from "react";
import styled from "styled-components";
import {
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaIdCard,
  FaLock,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCamera,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const DoctorsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const DoctorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const DoctorAvatarImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(79, 70, 229, 0.2);

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const DoctorCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

const DoctorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

const DoctorAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
`;

const DoctorInfo = styled.div`
  flex: 1;
`;

const DoctorName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const DoctorDepartment = styled.p`
  color: #4f46e5;
  font-weight: 600;
  font-size: 0.9rem;
`;

const DoctorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailIcon = styled.div`
  color: #4f46e5;
  font-size: 1.1rem;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DetailContent = styled.div`
  flex: 1;
`;

const DetailLabel = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #1f2937;
  font-weight: 500;
  display: block;
  margin-top: 0.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &.edit {
    background: #4f46e5;
    color: white;
    &:hover {
      background: #4338ca;
    }
  }

  &.delete {
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
  }

  &.save {
    background: #10b981;
    color: white;
    &:hover {
      background: #059669;
    }
  }

  &.cancel {
    background: #6b7280;
    color: white;
    &:hover {
      background: #4b5563;
    }
  }
`;

const EditInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 0.25rem;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const AvatarEditWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const PhotoEditButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);

  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: scale(1.15);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.6);
  }

  input {
    display: none;
  }
`;

const DoctorsList = ({ doctors = [], onUpdateDoctor, onDeleteDoctor }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleEdit = (doctor) => {
    setEditingId(doctor._id);
    setEditForm({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      department: doctor.department || "",
      nic: doctor.nic || "",
      gender: doctor.gender || "",
      photo: doctor.photo || "",
      password: "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (doctorId) => {
    if (onUpdateDoctor) {
      await onUpdateDoctor(doctorId, editForm);
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      if (onDeleteDoctor) {
        await onDeleteDoctor(doctorId);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <DoctorsContainer>
      <Header>
        <Title>DOCTORS</Title>
      </Header>

      <DoctorsGrid>
        {doctors.length === 0 ? (
          <div style={{ padding: 20 }}>No doctors found.</div>
        ) : (
          doctors.map((doctor, index) => {
            const isEditing = editingId === doctor._id;
            return (
              <DoctorCard key={doctor._id || index}>
                <DoctorHeader>
                  {isEditing ? (
                    <AvatarEditWrapper>
                      {editForm.photo ? (
                        <DoctorAvatarImage
                          src={editForm.photo}
                          alt="Doctor avatar"
                        />
                      ) : (
                        <DoctorAvatar>
                          {(editForm.name || "DR")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </DoctorAvatar>
                      )}
                      <PhotoEditButton>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                        <FaCamera size={16} />
                      </PhotoEditButton>
                    </AvatarEditWrapper>
                  ) : doctor.photo ? (
                    <DoctorAvatarImage
                      src={doctor.photo}
                      alt={`${doctor.name || "Doctor"} avatar`}
                    />
                  ) : (
                    <DoctorAvatar>
                      {(doctor.name || "DR")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </DoctorAvatar>
                  )}
                  <DoctorInfo>
                    <DoctorName>
                      {isEditing ? (
                        <EditInput
                          value={editForm.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Doctor Name"
                        />
                      ) : (
                        doctor.name
                      )}
                    </DoctorName>
                    <DoctorDepartment>
                      {isEditing ? (
                        <EditInput
                          value={editForm.department}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          placeholder="Department"
                        />
                      ) : (
                        `Department of ${doctor.department}`
                      )}
                    </DoctorDepartment>
                  </DoctorInfo>
                </DoctorHeader>

                <DoctorDetails>
                  <DetailItem>
                    <DetailIcon>
                      <FaEnvelope />
                    </DetailIcon>
                    <DetailContent>
                      <DetailLabel>Email</DetailLabel>
                      {isEditing ? (
                        <EditInput
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Email"
                        />
                      ) : (
                        <DetailValue>{doctor.email}</DetailValue>
                      )}
                    </DetailContent>
                  </DetailItem>

                  <DetailItem>
                    <DetailIcon>
                      <FaLock />
                    </DetailIcon>
                    <DetailContent>
                      <DetailLabel>Set / Update Password</DetailLabel>
                      {isEditing ? (
                        <div style={{ position: "relative" }}>
                          <EditInput
                            type={showPassword ? "text" : "password"}
                            value={editForm.password || ""}
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
                            placeholder="Leave blank to keep existing"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            style={{
                              position: "absolute",
                              right: 8,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              color: "#6b7280",
                              cursor: "pointer",
                              fontSize: 14,
                              padding: 4,
                            }}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      ) : (
                        <DetailValue>********</DetailValue>
                      )}
                    </DetailContent>
                  </DetailItem>

                  <DetailItem>
                    <DetailIcon>
                      <FaPhone />
                    </DetailIcon>
                    <DetailContent>
                      <DetailLabel>Phone</DetailLabel>
                      {isEditing ? (
                        <EditInput
                          value={editForm.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Phone"
                        />
                      ) : (
                        <DetailValue>{doctor.phone}</DetailValue>
                      )}
                    </DetailContent>
                  </DetailItem>

                  <DetailItem>
                    <DetailIcon>
                      <FaIdCard />
                    </DetailIcon>
                    <DetailContent>
                      <DetailLabel>NIC</DetailLabel>
                      {isEditing ? (
                        <EditInput
                          value={editForm.nic}
                          onChange={(e) =>
                            handleInputChange("nic", e.target.value)
                          }
                          placeholder="NIC"
                        />
                      ) : (
                        <DetailValue>{doctor.nic}</DetailValue>
                      )}
                    </DetailContent>
                  </DetailItem>

                  <DetailItem>
                    <DetailIcon>
                      <FaVenusMars />
                    </DetailIcon>
                    <DetailContent>
                      <DetailLabel>Gender</DetailLabel>
                      {isEditing ? (
                        <EditInput
                          value={editForm.gender}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                          placeholder="Gender"
                        />
                      ) : (
                        <DetailValue>{doctor.gender}</DetailValue>
                      )}
                    </DetailContent>
                  </DetailItem>
                </DoctorDetails>

                <ActionButtons>
                  {isEditing ? (
                    <>
                      <ActionButton
                        className="save"
                        onClick={() => handleSave(doctor._id)}
                      >
                        <FaSave /> Save
                      </ActionButton>
                      <ActionButton className="cancel" onClick={handleCancel}>
                        <FaTimes /> Cancel
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton
                        className="edit"
                        onClick={() => handleEdit(doctor)}
                      >
                        <FaEdit /> Edit
                      </ActionButton>
                      <ActionButton
                        className="delete"
                        onClick={() => handleDelete(doctor._id)}
                      >
                        <FaTrash /> Delete
                      </ActionButton>
                    </>
                  )}
                </ActionButtons>
              </DoctorCard>
            );
          })
        )}
      </DoctorsGrid>
    </DoctorsContainer>
  );
};

export default DoctorsList;
