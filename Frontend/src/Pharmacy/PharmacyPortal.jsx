import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { jsonFetch } from "../utils/api";
import { Html5Qrcode } from "html5-qrcode";
import {
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPlusCircle,
  FiSearch,
  FiX,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    font-weight: 800;

    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(0.95rem, 2vw, 1.1rem);

    @media (max-width: 768px) {
      font-size: 0.95rem;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: ${(props) => props.color || "#10b981"};
    box-shadow: 0 8px 24px ${(props) => props.color || "#10b981"}40;
  }

  .icon {
    font-size: 2.5rem;
    color: ${(props) => props.color || "#10b981"};
  }

  .content {
    flex: 1;

    h3 {
      margin: 0 0 0.5rem 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: clamp(0.8rem, 2vw, 0.9rem);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    p {
      margin: 0;
      color: white;
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;

    .icon {
      font-size: 2rem;
    }
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #10b981, #059669)"
      : "rgba(255, 255, 255, 0.05)"};
  color: white;
  border: 2px solid
    ${(props) => (props.$active ? "#10b981" : "rgba(255, 255, 255, 0.1)")};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    background: ${(props) =>
      props.$active
        ? "linear-gradient(135deg, #10b981, #059669)"
        : "rgba(255, 255, 255, 0.1)"};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    flex: 1;
    min-width: 140px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

const ContentArea = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Toolbar = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: min(250px, 100%);
  position: relative;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: clamp(0.85rem, 2vw, 0.95rem);

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
      outline: none;
      border-color: #10b981;
    }

    @media (max-width: 768px) {
      padding: 0.65rem 0.875rem 0.65rem 2.25rem;
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.2rem;

    @media (max-width: 768px) {
      font-size: 1rem;
      left: 0.65rem;
    }
  }

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #10b981;
  }

  option {
    background: #1a1a2e;
    color: white;
  }

  @media (max-width: 768px) {
    min-width: min(120px, 45%);
    padding: 0.65rem 0.875rem;
  }

  @media (max-width: 480px) {
    min-width: 100%;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${(props) =>
    props.bg || "linear-gradient(135deg, #10b981, #059669)"};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  h2 {
    margin: 0 0 1.5rem 0;
    color: #1f2937;
    font-size: clamp(1.25rem, 3vw, 1.5rem);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 95%;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    max-height: 85vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;

  &:hover {
    color: #1f2937;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-weight: 600;
    font-size: 0.9rem;

    .required {
      color: #ef4444;
      margin-left: 0.25rem;
    }
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #10b981;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const PrescriptionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const MedicineTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  overflow-x: auto;
  display: block;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  th {
    background: #f9fafb;
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #1f2937;
    border-bottom: 2px solid #e5e7eb;

    @media (max-width: 768px) {
      padding: 0.5rem;
      font-size: 0.8rem;
    }
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    color: #4b5563;

    @media (max-width: 768px) {
      padding: 0.5rem;
      font-size: 0.85rem;
    }
  }

  tr:hover {
    background: #f9fafb;
  }
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MedicineCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 2px solid ${(props) => (props.$lowStock ? "#f59e0b" : "#e5e7eb")};
  box-shadow: ${(props) =>
    props.$lowStock
      ? "0 4px 12px rgba(245, 158, 11, 0.2)"
      : "0 2px 8px rgba(0,0,0,0.05)"};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
  }

  p {
    margin: 0.25rem 0;
    color: #6b7280;
    font-size: clamp(0.8rem, 2vw, 0.9rem);
  }

  .stock {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: 700;
    color: ${(props) => (props.$lowStock ? "#f59e0b" : "#10b981")};
    margin: 0.5rem 0;
  }

  .price {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    font-weight: 700;
    color: #059669;
    margin: 0.5rem 0;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;

    @media (max-width: 480px) {
      flex-direction: column;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.875rem;
  }
`;

const StockPreview = styled.div`
  background: #f0fdf4;
  border: 2px solid #10b981;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;

  .current {
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  .operation {
    color: #059669;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .new {
    color: #10b981;
    font-size: 1.2rem;
    font-weight: 700;
  }
`;

const PharmacyPortal = () => {
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [stats, setStats] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const qrScannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Modal states
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showEditMedicine, setShowEditMedicine] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Form states
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    genericName: "",
    category: "Other",
    form: "Tablet",
    strength: "",
    price: "",
    stockQuantity: "",
    reorderLevel: "100",
    manufacturer: "Various",
  });

  const [stockUpdate, setStockUpdate] = useState({
    quantity: "",
    operation: "add",
  });

  // Define applyFilters before useEffect that uses it
  const applyFilters = useCallback(() => {
    let filtered = [...medicines];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (med) =>
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (med.genericName &&
            med.genericName.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((med) => med.category === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "stock":
          return a.stockQuantity - b.stockQuantity;
        case "price":
          return a.price - b.price;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredMedicines(filtered);
  }, [medicines, searchQuery, categoryFilter, sortBy]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Clean up QR scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startQRScanner = async () => {
    setShowQRScanner(true);
    setScanning(true);

    try {
      // Wait for the DOM element to be available
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!qrScannerRef.current) {
        toast.error("Scanner container not found");
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // QR code successfully scanned
          try {
            // Parse QR code data - it should contain prescriptionId
            let prescriptionId;
            try {
              const qrData = JSON.parse(decodedText);
              prescriptionId = qrData.prescriptionId || decodedText;
            } catch {
              prescriptionId = decodedText;
            }

            // Fetch prescription
            const res = await jsonFetch(`/api/prescriptions/${prescriptionId}`);
            if (res.prescription) {
              toast.success(
                `✅ Prescription found for ${res.prescription.patientName}!`,
              );

              // Add to list if not already present
              if (!prescriptions.find((p) => p._id === res.prescription._id)) {
                setPrescriptions([res.prescription, ...prescriptions]);
              }

              // Stop scanner after successful scan
              stopQRScanner();
            }
          } catch (err) {
            toast.error(err.message || "Prescription not found");
            stopQRScanner();
          }
        },
        (errorMessage) => {
          console.warn("QR Code Scan Error:", errorMessage);
          // QR code scan error (not critical, happens frequently)
          // Only log, don't show error to user
        },
      );
    } catch (err) {
      console.error("Failed to start QR scanner:", err);
      toast.error("Failed to start camera. Please allow camera access.");
      setShowQRScanner(false);
      setScanning(false);
    }
  };

  const stopQRScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    } finally {
      setShowQRScanner(false);
      setScanning(false);
      html5QrCodeRef.current = null;
    }
  };

  const loadData = async () => {
    try {
      const [statsRes, prescriptionsRes, medicinesRes] = await Promise.all([
        jsonFetch("/api/pharmacy/stats"),
        jsonFetch("/api/prescriptions/pending"),
        jsonFetch("/api/pharmacy/medicines"),
      ]);

      setStats(statsRes);
      setPrescriptions(prescriptionsRes.prescriptions || []);
      setMedicines(medicinesRes.medicines || []);
    } catch (err) {
      console.error("Failed to load pharmacy data:", err);
      toast.error("Failed to load data");
    }
  };

  const dispensePrescription = async (prescriptionId, status) => {
    try {
      await jsonFetch(`/api/prescriptions/${prescriptionId}/status`, {
        method: "PATCH",
        body: { status },
      });

      toast.success(
        `✅ Prescription ${status}! Receipt sent to patient email.`,
      );
      loadData();
    } catch (err) {
      console.error("Failed to update prescription:", err);
      toast.error(err.message || "Failed to update prescription");
    }
  };

  const handleAddStock = async () => {
    if (!selectedMedicine || !stockUpdate.quantity) {
      toast.error("Please enter quantity");
      return;
    }

    try {
      await jsonFetch(`/api/pharmacy/medicines/${selectedMedicine._id}/stock`, {
        method: "PATCH",
        body: {
          quantity: parseInt(stockUpdate.quantity),
          operation: stockUpdate.operation,
        },
      });

      toast.success(
        `✅ Stock ${stockUpdate.operation === "add" ? "added" : "reduced"} successfully!`,
      );
      setShowAddStock(false);
      setSelectedMedicine(null);
      setStockUpdate({ quantity: "", operation: "add" });
      loadData();
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error(err.message || "Failed to update stock");
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();

    if (!newMedicine.name || !newMedicine.strength || !newMedicine.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await jsonFetch("/api/pharmacy/medicines", {
        method: "POST",
        body: newMedicine,
      });

      toast.success("✅ Medicine added successfully!");
      setShowAddMedicine(false);
      setNewMedicine({
        name: "",
        genericName: "",
        category: "Other",
        form: "Tablet",
        strength: "",
        price: "",
        stockQuantity: "",
        reorderLevel: "100",
        manufacturer: "Various",
      });
      loadData();
    } catch (err) {
      console.error("Failed to add medicine:", err);
      toast.error(err.message || "Failed to add medicine");
    }
  };

  const handleEditMedicine = async (e) => {
    e.preventDefault();

    try {
      await jsonFetch(`/api/pharmacy/medicines/${selectedMedicine._id}`, {
        method: "PATCH",
        body: selectedMedicine,
      });

      toast.success("✅ Medicine updated successfully!");
      setShowEditMedicine(false);
      setSelectedMedicine(null);
      loadData();
    } catch (err) {
      console.error("Failed to update medicine:", err);
      toast.error(err.message || "Failed to update medicine");
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) {
      return;
    }

    try {
      await jsonFetch(`/api/pharmacy/medicines/${medicineId}`, {
        method: "DELETE",
      });

      toast.success("✅ Medicine deleted successfully!");
      loadData();
    } catch (err) {
      console.error("Failed to delete medicine:", err);
      toast.error(err.message || "Failed to delete medicine");
    }
  };

  const categories = [
    "Antibiotic",
    "Painkiller",
    "Antacid",
    "Antihistamine",
    "Antidiabetic",
    "Antihypertensive",
    "Vitamin",
    "Supplement",
    "Antiviral",
    "Antifungal",
    "Neurological",
    "Cardiovascular",
    "Gastrointestinal",
    "Respiratory",
    "Dermatological",
    "Contrast Media",
    "Other",
  ];

  const forms = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Drops",
    "Cream",
    "Ointment",
    "Inhaler",
    "Gel",
    "Lotion",
    "Spray",
    "Suspension",
    "Solution",
    "Suppository",
    "Respules",
    "Sachet",
    "Other",
  ];

  const calculateNewStock = () => {
    if (!selectedMedicine || !stockUpdate.quantity) return 0;
    const qty = parseInt(stockUpdate.quantity);
    return stockUpdate.operation === "add"
      ? selectedMedicine.stockQuantity + qty
      : selectedMedicine.stockQuantity - qty;
  };

  return (
    <Container>
      <Header>
        <h1>💊 Pharmacy Management Portal</h1>
        <p>Manage prescriptions, inventory, and dispensing operations</p>
      </Header>

      {stats && (
        <StatsGrid>
          <StatCard color="#f59e0b">
            <FiClock className="icon" />
            <div className="content">
              <h3>Pending Prescriptions</h3>
              <p>{stats.pendingPrescriptions || 0}</p>
            </div>
          </StatCard>

          <StatCard color="#10b981">
            <FiCheckCircle className="icon" />
            <div className="content">
              <h3>Dispensed Today</h3>
              <p>{stats.dispensedToday || 0}</p>
            </div>
          </StatCard>

          <StatCard color="#ef4444">
            <FiAlertCircle className="icon" />
            <div className="content">
              <h3>Low Stock Items</h3>
              <p>{stats.lowStockCount || 0}</p>
            </div>
          </StatCard>

          <StatCard color="#059669">
            <FiPackage className="icon" />
            <div className="content">
              <h3>Total Medicines</h3>
              <p>{stats.totalMedicines || 0}</p>
            </div>
          </StatCard>
        </StatsGrid>
      )}

      <TabBar>
        <Tab
          $active={activeTab === "prescriptions"}
          onClick={() => setActiveTab("prescriptions")}
        >
          📋 Prescriptions ({prescriptions.length})
        </Tab>
        <Tab
          $active={activeTab === "inventory"}
          onClick={() => setActiveTab("inventory")}
        >
          📦 Inventory ({filteredMedicines.length})
        </Tab>
        <Tab
          $active={activeTab === "lowStock"}
          onClick={() => setActiveTab("lowStock")}
        >
          ⚠️ Low Stock ({stats?.lowStockCount || 0})
        </Tab>
      </TabBar>

      <ContentArea>
        {(activeTab === "inventory" || activeTab === "lowStock") && (
          <Toolbar>
            <SearchBox>
              <FiSearch />
              <input
                type="text"
                placeholder="Search by name or generic name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBox>

            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
            </Select>

            <Button
              bg="linear-gradient(135deg, #10b981, #059669)"
              onClick={() => setShowAddMedicine(true)}
            >
              <FiPlusCircle /> Add Medicine
            </Button>
          </Toolbar>
        )}

        {activeTab === "prescriptions" && (
          <div>
            <h2 style={{ color: "white", marginBottom: "1.5rem" }}>
              Pending Prescriptions
            </h2>

            {/* QR Code Scanner/Verifier */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  color: "white",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  flexWrap: "wrap",
                }}
              >
                <FiSearch /> Verify Prescription by ID
              </h3>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Enter Prescription ID..."
                  style={{
                    flex: 1,
                    minWidth: "min(250px, 100%)",
                    padding: "0.75rem 1rem",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                  }}
                  onKeyPress={async (e) => {
                    if (e.key === "Enter" && e.target.value) {
                      try {
                        const res = await jsonFetch(
                          `/api/prescriptions/${e.target.value}`,
                        );
                        if (res.prescription) {
                          toast.success("✅ Prescription found!");
                          // Add the prescription to the top of the list if not already there
                          if (
                            !prescriptions.find(
                              (p) => p._id === res.prescription._id,
                            )
                          ) {
                            setPrescriptions([
                              res.prescription,
                              ...prescriptions,
                            ]);
                          }
                        }
                      } catch (err) {
                        toast.error(err.message || "Prescription not found");
                      }
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  bg="linear-gradient(135deg, #3b82f6, #2563eb)"
                  onClick={startQRScanner}
                  disabled={scanning}
                >
                  📷 {scanning ? "Scanning..." : "Scan QR"}
                </Button>
              </div>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.9rem",
                  marginTop: "0.75rem",
                  marginBottom: 0,
                }}
              >
                💡 Tip: Enter the prescription ID and press Enter to verify and
                load the prescription
              </p>
            </div>

            {prescriptions.length === 0 ? (
              <p
                style={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}
              >
                No pending prescriptions
              </p>
            ) : (
              prescriptions.map((presc) => (
                <PrescriptionCard key={presc._id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <h3
                        style={{
                          margin: "0 0 0.5rem 0",
                          fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                        }}
                      >
                        {presc.patientName}
                      </h3>
                      <p
                        style={{
                          margin: "0.25rem 0",
                          color: "#6b7280",
                          fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                        }}
                      >
                        📧 {presc.patientEmail || "No email"}
                      </p>
                      <p
                        style={{
                          margin: "0.25rem 0",
                          color: "#6b7280",
                          fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                        }}
                      >
                        👨‍⚕️ Dr. {presc.doctorName}
                      </p>
                      <p
                        style={{
                          margin: "0.25rem 0",
                          color: "#6b7280",
                          fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                        }}
                      >
                        📅 {new Date(presc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      style={{
                        background: "#dbeafe",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                      }}
                    >
                      <strong style={{ color: "#1e40af" }}>
                        {presc.status}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    <strong style={{ color: "#1f2937" }}>Diagnosis:</strong>
                    <p style={{ margin: "0.5rem 0 0 0", color: "#4b5563" }}>
                      {presc.diagnosis}
                    </p>
                  </div>

                  <h4 style={{ margin: "1rem 0 0.5rem 0", color: "#1f2937" }}>
                    Medicines:
                  </h4>
                  <MedicineTable>
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presc.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{med.medicineName}</strong>
                          </td>
                          <td>{med.dosage}</td>
                          <td>{med.frequency}</td>
                          <td>{med.duration}</td>
                          <td>{med.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </MedicineTable>

                  {presc.generalInstructions && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginTop: "1rem",
                      }}
                    >
                      <strong style={{ color: "#065f46" }}>
                        General Instructions:
                      </strong>
                      <p style={{ margin: "0.5rem 0 0 0", color: "#047857" }}>
                        {presc.generalInstructions}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "1.5rem",
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      bg="linear-gradient(135deg, #10b981, #059669)"
                      onClick={() =>
                        dispensePrescription(presc._id, "Dispensed")
                      }
                    >
                      ✅ Dispense
                    </Button>
                    <Button
                      bg="linear-gradient(135deg, #f59e0b, #d97706)"
                      onClick={() =>
                        dispensePrescription(presc._id, "PartiallyDispensed")
                      }
                    >
                      ⚠️ Partial
                    </Button>
                    <Button
                      bg="linear-gradient(135deg, #ef4444, #dc2626)"
                      onClick={() =>
                        dispensePrescription(presc._id, "Cancelled")
                      }
                    >
                      ❌ Cancel
                    </Button>
                  </div>
                </PrescriptionCard>
              ))
            )}
          </div>
        )}

        {activeTab === "inventory" && (
          <div>
            <h2 style={{ color: "white", marginBottom: "1.5rem" }}>
              Medicine Inventory ({filteredMedicines.length} medicines)
            </h2>
            {filteredMedicines.length === 0 ? (
              <p
                style={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}
              >
                No medicines found
              </p>
            ) : (
              <InventoryGrid>
                {filteredMedicines.map((med) => {
                  const isLowStock = med.stockQuantity <= med.reorderLevel;
                  return (
                    <MedicineCard key={med._id} $lowStock={isLowStock}>
                      <h3>{med.name}</h3>
                      {med.genericName && <p>Generic: {med.genericName}</p>}
                      <p>
                        {med.strength} • {med.form}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                        {med.category}
                      </p>
                      <div className="stock">
                        Stock: {med.stockQuantity} {isLowStock && "⚠️"}
                      </div>
                      <div className="price">PKR {med.price}</div>
                      <p style={{ fontSize: "0.85rem" }}>
                        Reorder: {med.reorderLevel}
                      </p>
                      <div className="actions">
                        <Button
                          bg="linear-gradient(135deg, #10b981, #059669)"
                          onClick={() => {
                            setSelectedMedicine(med);
                            setStockUpdate({ quantity: "", operation: "add" });
                            setShowAddStock(true);
                          }}
                          style={{
                            flex: 1,
                            fontSize: "0.8rem",
                            padding: "0.6rem",
                          }}
                        >
                          + Stock
                        </Button>
                        <Button
                          bg="linear-gradient(135deg, #3b82f6, #2563eb)"
                          onClick={() => {
                            setSelectedMedicine({ ...med });
                            setShowEditMedicine(true);
                          }}
                          style={{ padding: "0.6rem 0.75rem" }}
                        >
                          <FiEdit />
                        </Button>
                        <Button
                          bg="linear-gradient(135deg, #ef4444, #dc2626)"
                          onClick={() => handleDeleteMedicine(med._id)}
                          style={{ padding: "0.6rem 0.75rem" }}
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    </MedicineCard>
                  );
                })}
              </InventoryGrid>
            )}
          </div>
        )}

        {activeTab === "lowStock" && (
          <div>
            <h2 style={{ color: "white", marginBottom: "1.5rem" }}>
              Low Stock Medicines
            </h2>
            {filteredMedicines.filter(
              (med) => med.stockQuantity <= med.reorderLevel,
            ).length === 0 ? (
              <p
                style={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}
              >
                No low stock medicines
              </p>
            ) : (
              <InventoryGrid>
                {filteredMedicines
                  .filter((med) => med.stockQuantity <= med.reorderLevel)
                  .map((med) => (
                    <MedicineCard key={med._id} $lowStock={true}>
                      <h3>{med.name}</h3>
                      {med.genericName && <p>Generic: {med.genericName}</p>}
                      <p>
                        {med.strength} • {med.form}
                      </p>
                      <div className="stock">{med.stockQuantity} ⚠️</div>
                      <div className="price">PKR {med.price}</div>
                      <p style={{ fontSize: "0.85rem" }}>
                        Reorder: {med.reorderLevel}
                      </p>
                      <div className="actions">
                        <Button
                          bg="linear-gradient(135deg, #10b981, #059669)"
                          onClick={() => {
                            setSelectedMedicine(med);
                            setStockUpdate({
                              quantity: "100",
                              operation: "add",
                            });
                            setShowAddStock(true);
                          }}
                          style={{ flex: 1 }}
                        >
                          + Restock
                        </Button>
                      </div>
                    </MedicineCard>
                  ))}
              </InventoryGrid>
            )}
          </div>
        )}
      </ContentArea>

      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <Modal onClick={() => setShowAddMedicine(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowAddMedicine(false)}>
              <FiX />
            </CloseButton>
            <h2>Add New Medicine</h2>
            <form onSubmit={handleAddMedicine}>
              <FormGroup>
                <label>
                  Medicine Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={newMedicine.name}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, name: e.target.value })
                  }
                  placeholder="e.g., Panadol"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Generic Name</label>
                <input
                  type="text"
                  value={newMedicine.genericName}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      genericName: e.target.value,
                    })
                  }
                  placeholder="e.g., Paracetamol"
                />
              </FormGroup>

              <FormGroup>
                <label>
                  Category <span className="required">*</span>
                </label>
                <select
                  value={newMedicine.category}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, category: e.target.value })
                  }
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>
                  Form <span className="required">*</span>
                </label>
                <select
                  value={newMedicine.form}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, form: e.target.value })
                  }
                  required
                >
                  {forms.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>
                  Strength <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={newMedicine.strength}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, strength: e.target.value })
                  }
                  placeholder="e.g., 500mg"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>
                  Price (PKR) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={newMedicine.price}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, price: e.target.value })
                  }
                  placeholder="e.g., 50"
                  min="0"
                  step="0.01"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={newMedicine.stockQuantity}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      stockQuantity: e.target.value,
                    })
                  }
                  placeholder="e.g., 500"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <label>Reorder Level</label>
                <input
                  type="number"
                  value={newMedicine.reorderLevel}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      reorderLevel: e.target.value,
                    })
                  }
                  placeholder="e.g., 100"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <label>Manufacturer</label>
                <input
                  type="text"
                  value={newMedicine.manufacturer}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      manufacturer: e.target.value,
                    })
                  }
                  placeholder="e.g., GSK"
                />
              </FormGroup>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <Button type="submit" style={{ flex: 1 }}>
                  Add Medicine
                </Button>
                <Button
                  type="button"
                  bg="linear-gradient(135deg, #6b7280, #4b5563)"
                  onClick={() => setShowAddMedicine(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Update Stock Modal */}
      {showAddStock && selectedMedicine && (
        <Modal onClick={() => setShowAddStock(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowAddStock(false)}>
              <FiX />
            </CloseButton>
            <h2>Update Stock: {selectedMedicine.name}</h2>

            <FormGroup>
              <label>Operation</label>
              <select
                value={stockUpdate.operation}
                onChange={(e) =>
                  setStockUpdate({ ...stockUpdate, operation: e.target.value })
                }
              >
                <option value="add">Add Stock</option>
                <option value="subtract">Reduce Stock</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>
                Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                value={stockUpdate.quantity}
                onChange={(e) =>
                  setStockUpdate({ ...stockUpdate, quantity: e.target.value })
                }
                placeholder="Enter quantity"
                min="1"
              />
            </FormGroup>

            {stockUpdate.quantity && (
              <StockPreview>
                <div className="current">
                  Current Stock: {selectedMedicine.stockQuantity}
                </div>
                <div className="operation">
                  {stockUpdate.operation === "add" ? "+" : "-"}{" "}
                  {stockUpdate.quantity}
                </div>
                <div className="new">New Stock: {calculateNewStock()}</div>
              </StockPreview>
            )}

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <Button onClick={handleAddStock} style={{ flex: 1 }}>
                Update Stock
              </Button>
              <Button
                bg="linear-gradient(135deg, #6b7280, #4b5563)"
                onClick={() => setShowAddStock(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Medicine Modal */}
      {showEditMedicine && selectedMedicine && (
        <Modal onClick={() => setShowEditMedicine(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowEditMedicine(false)}>
              <FiX />
            </CloseButton>
            <h2>Edit Medicine</h2>
            <form onSubmit={handleEditMedicine}>
              <FormGroup>
                <label>
                  Medicine Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={selectedMedicine.name}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Generic Name</label>
                <input
                  type="text"
                  value={selectedMedicine.genericName || ""}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      genericName: e.target.value,
                    })
                  }
                />
              </FormGroup>

              <FormGroup>
                <label>Category</label>
                <select
                  value={selectedMedicine.category}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      category: e.target.value,
                    })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Form</label>
                <select
                  value={selectedMedicine.form}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      form: e.target.value,
                    })
                  }
                >
                  {forms.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>
                  Strength <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={selectedMedicine.strength}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      strength: e.target.value,
                    })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>
                  Price (PKR) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={selectedMedicine.price}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      price: e.target.value,
                    })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Reorder Level</label>
                <input
                  type="number"
                  value={selectedMedicine.reorderLevel}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      reorderLevel: e.target.value,
                    })
                  }
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <label>Manufacturer</label>
                <input
                  type="text"
                  value={selectedMedicine.manufacturer || ""}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      manufacturer: e.target.value,
                    })
                  }
                />
              </FormGroup>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <Button type="submit" style={{ flex: 1 }}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  bg="linear-gradient(135deg, #6b7280, #4b5563)"
                  onClick={() => setShowEditMedicine(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <Modal onClick={stopQRScanner}>
          <ModalContent
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div
              style={{
                padding: "1.5rem",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white",
                borderRadius: "12px 12px 0 0",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.3rem" }}>
                  📷 Scan Prescription QR Code
                </h3>
                <button
                  onClick={stopQRScanner}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    color: "white",
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
                Point your camera at the prescription QR code
              </p>
            </div>

            <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
              {/* QR Scanner Container */}
              <div
                id="qr-reader"
                ref={qrScannerRef}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "2px solid #e5e7eb",
                }}
              ></div>

              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #bfdbfe",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "#1e40af",
                  }}
                >
                  💡 <strong>Tip:</strong> Make sure the QR code is well-lit and
                  centered in the camera view
                </p>
              </div>

              <Button
                bg="#6b7280"
                onClick={stopQRScanner}
                style={{ width: "100%", marginTop: "1rem" }}
              >
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PharmacyPortal;
