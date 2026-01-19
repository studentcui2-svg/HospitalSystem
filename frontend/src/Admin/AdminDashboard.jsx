import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "./Adminsidebar";
import DashboardHome from "./DashboardHome";
import DoctorsList from "./DocterList";
import AddAdmin from "./AddAdmin";
import AddDoctor from "./AddDoctor";
import Messages from "./Messages";
import AppointmentsTable from "./AppointmentsTable";
import LandingPageEditor from "./LandingPageEditor";
import { jsonFetch } from "../utils/api";
import io from "socket.io-client";

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background: #f8fafc; /* ensure main content area is visible */
  z-index: 2;
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const AdminDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [doctors, setDoctors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser =
    typeof window !== "undefined" ? window.__APP_USER__ || null : null;
  // Sidebar visibility now controlled purely by CSS responsive rules

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [doctorRes, messageRes, appointmentRes] = await Promise.all([
        jsonFetch("/api/doctors"),
        jsonFetch("/api/messages"),
        jsonFetch("/api/appointments?all=true"),
      ]);

      console.log("[ADMIN DASHBOARD] Data payload", {
        doctors: doctorRes,
        messages: messageRes,
        appointments: appointmentRes,
      });

      setDoctors(doctorRes?.doctors || []);
      setMessages(messageRes?.messages || []);
      setAppointments(appointmentRes?.appointments || []);
    } catch (err) {
      console.error("[ADMIN DASHBOARD] Failed to fetch dashboard data", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for payment updates via socket to refresh dashboard data
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
    socket.on("payment-updated", (payload) => {
      console.log("[ADMIN DASHBOARD] payment-updated", payload);
      fetchDashboardData();
    });
    return () => socket.disconnect();
  }, [fetchDashboardData]);

  const handleReply = async (messageId, replyText) => {
    try {
      console.log("[ADMIN] Replying to message", messageId);
      const res = await jsonFetch(`/api/messages/${messageId}/reply`, {
        method: "PATCH",
        body: { reply: replyText },
      });
      const updated = res?.message;
      if (updated) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m)),
        );
        // show immediate toast depending on delivery status
        if (updated.status === "delivered") {
          toast.success("Reply saved and email delivered to sender");
        } else {
          toast.success("Reply saved (email may not have been delivered)");
        }
      } else {
        toast.error("Failed to save reply");
      }
    } catch (err) {
      console.error("[ADMIN] Reply failed", err);
      const msg = err?.message || "Failed to send reply";
      toast.error(msg);
    }
  };

  const handleStatusUpdate = useCallback((appointmentId, status) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt._id === appointmentId ? { ...appt, status } : appt,
      ),
    );
  }, []);

  const handleUpdateDoctor = async (doctorId, updatedData) => {
    try {
      console.log("[ADMIN] Updating doctor", doctorId, updatedData);
      const res = await jsonFetch(`/api/doctors/${doctorId}`, {
        method: "PUT",
        body: updatedData,
      });
      if (res?.doctor) {
        setDoctors((prev) =>
          prev.map((doc) => (doc._id === doctorId ? res.doctor : doc)),
        );
        toast.success("Doctor updated successfully");
      }
    } catch (err) {
      console.error("[ADMIN] Update doctor failed", err);
      toast.error(err?.message || "Failed to update doctor");
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      console.log("[ADMIN] Deleting doctor", doctorId);
      await jsonFetch(`/api/doctors/${doctorId}`, {
        method: "DELETE",
      });
      setDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      toast.success("Doctor deleted successfully");
    } catch (err) {
      console.error("[ADMIN] Delete doctor failed", err);
      toast.error(err?.message || "Failed to delete doctor");
    }
  };

  // fetch data from backend
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    console.log("[ADMIN DASHBOARD] State updated", {
      doctors,
      messages,
      appointments,
    });
  }, [doctors, messages, appointments]);

  const statusSummary = useMemo(() => {
    const summary = {
      Pending: 0,
      Accepted: 0,
      Rejected: 0,
    };

    appointments.forEach((appt) => {
      const key = (appt.status || "Pending").toLowerCase();
      if (key === "accepted") summary.Accepted += 1;
      else if (key === "rejected") summary.Rejected += 1;
      else summary.Pending += 1;
    });

    return summary;
  }, [appointments]);

  const monthlyChart = useMemo(() => {
    const now = new Date();
    const months = [];
    const counts = [];
    const bucketMap = new Map();

    for (let i = 5; i >= 0; i -= 1) {
      const cursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      const label = cursor.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
      months.push(label);
      counts.push(0);
      bucketMap.set(key, months.length - 1);
    }

    appointments.forEach((appt) => {
      const rawDate = appt.date || appt.createdAt;
      if (!rawDate) return;
      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.getTime())) return;
      const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
      const index = bucketMap.get(key);
      if (typeof index === "number") {
        counts[index] += 1;
      }
    });

    return { labels: months, values: counts };
  }, [appointments]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [appointments]);

  const stats = useMemo(() => {
    const completedPayments = appointments.filter(
      (appt) => appt.payment?.status === "completed",
    );

    // Group payments by currency
    const paymentsByCurrency = completedPayments.reduce((acc, appt) => {
      const currency = (appt.payment?.currency || "usd").toLowerCase();
      const amount = appt.payment?.amount || 0;
      acc[currency] = (acc[currency] || 0) + amount;
      return acc;
    }, {});

    return {
      totalAppointments: appointments.length,
      pendingAppointments: statusSummary.Pending,
      acceptedAppointments: statusSummary.Accepted,
      rejectedAppointments: statusSummary.Rejected,
      doctorsCount: doctors.length,
      paymentsByCurrency,
      returningPatients: appointments.filter((appt) => appt.visitedBefore)
        .length,
    };
  }, [appointments, doctors, statusSummary]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardHome
            loading={loading}
            error={error}
            stats={stats}
            chart={monthlyChart}
            appointments={appointments}
            recentAppointments={recentAppointments}
            user={currentUser}
            onRefresh={fetchDashboardData}
          />
        );
      case "doctors":
        return (
          <DoctorsList
            doctors={doctors}
            onUpdateDoctor={handleUpdateDoctor}
            onDeleteDoctor={handleDeleteDoctor}
          />
        );
      case "add-admin":
        return <AddAdmin />;
      case "add-doctor":
        return <AddDoctor />;
      case "appointments":
        return (
          <AppointmentsTable
            data={appointments}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case "messages":
        return <Messages messages={messages} onReply={handleReply} />;
      case "landing":
        return <LandingPageEditor />;
      default:
        return (
          <DashboardHome
            loading={loading}
            error={error}
            stats={stats}
            chart={monthlyChart}
            appointments={appointments}
            recentAppointments={recentAppointments}
            user={currentUser}
            onRefresh={fetchDashboardData}
          />
        );
    }
  };

  return (
    <DashboardContainer className="admin-layout">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={() => onLogout?.()}
      />

      <MainContent className="admin-main">{renderContent()}</MainContent>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </DashboardContainer>
  );
};

export default AdminDashboard;
