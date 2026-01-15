import React from "react";
import styled from "styled-components";
import {
  FaCalendarCheck,
  FaUserMd,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaSyncAlt,
  FaTimesCircle,
} from "react-icons/fa";
import SimpleChart from "./SimpleChart";
import { AdvancedChartsSection } from "./AdvancedCharts";

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.25rem;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.06);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const WelcomeSubtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.75rem 1.75rem;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.06);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 50px rgba(2, 6, 23, 0.08);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const StatIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.95),
    rgba(126, 34, 206, 0.95)
  );
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.08);

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }
`;

const StatIconAlt = styled(StatIcon)`
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.95),
    rgba(6, 95, 70, 0.95)
  );
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 2.6rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const AppointmentsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.05);
  overflow-x: auto;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    border-radius: 12px;
    overflow-x: visible;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    border-radius: 8px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;

  @media (max-width: 1024px) {
    font-size: 1.4rem;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
`;

const ChartSection = styled.div`
  background: linear-gradient(180deg, #fff 0%, #fcfdff 100%);
  border-radius: 16px;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.05);
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;

  @media (max-width: 1024px) {
    min-width: 850px;
  }

  @media (max-width: 767px) {
    display: block;
    min-width: unset;
    width: 100%;
    border: none;

    thead {
      display: none;
    }

    tbody {
      display: block;
      width: 100%;
    }
  }
`;

const TableHeader = styled.thead`
  background: #0b1220; /* darker header */

  @media (max-width: 767px) {
    display: none;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eef2f7;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    display: block;
    width: 100%;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    border-bottom: none;
    box-sizing: border-box;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 6px;
  }
`;

const TableHead = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;

  @media (max-width: 767px) {
    display: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #374151;
  font-size: 0.95rem;

  @media (max-width: 1024px) {
    padding: 0.9rem 0.75rem;
    font-size: 0.9rem;
  }

  @media (max-width: 767px) {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 0.5rem;
    padding: 0.4rem 0;
    align-items: flex-start;
    border-bottom: none;
    font-size: 0.85rem;
    word-break: break-word;

    &::before {
      content: attr(data-label);
      font-weight: 700;
      color: #111827;
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    grid-template-columns: 80px 1fr;
    gap: 0.35rem;
    padding: 0.35rem 0;
    font-size: 0.8rem;

    &::before {
      font-size: 0.75rem;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  background: ${(props) => {
    switch (props.$status) {
      case "Accepted":
        return "#D1FAE5";
      case "Rejected":
        return "#FEE2E2";
      case "Pending":
        return "#FEF3C7";
      default:
        return "#E5E7EB";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case "Accepted":
        return "#065F46";
      case "Rejected":
        return "#991B1B";
      case "Pending":
        return "#92400E";
      default:
        return "#6B7280";
    }
  }};

  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  background: #0f172a;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: #6b7280;
  font-weight: 500;
`;

// Helper function to format payments by currency
const formatPaymentsByCurrency = (paymentsByCurrency) => {
  if (!paymentsByCurrency || Object.keys(paymentsByCurrency).length === 0) {
    return "$0";
  }

  const currencySymbols = {
    usd: "$",
    pkr: "PKR ",
    eur: "€",
    gbp: "£",
    inr: "₹",
  };

  const formattedParts = Object.entries(paymentsByCurrency).map(
    ([currency, amount]) => {
      const symbol = currencySymbols[currency] || currency.toUpperCase() + " ";
      return `${symbol}${amount.toLocaleString()}`;
    }
  );

  return formattedParts.join(" | ");
};

const DashboardHome = ({
  loading,
  error,
  stats,
  chart,
  appointments = [],
  doctors = [],
  recentAppointments = [],
  user,
  onRefresh,
}) => {
  const statCards = [
    {
      key: "total",
      icon: <FaCalendarCheck />,
      label: "Total Appointments",
      value: stats?.totalAppointments ?? 0,
    },
    {
      key: "pending",
      icon: <FaClock />,
      label: "Pending Approvals",
      value: stats?.pendingAppointments ?? 0,
    },
    {
      key: "accepted",
      icon: <FaCheckCircle />,
      label: "Accepted",
      value: stats?.acceptedAppointments ?? 0,
    },
    {
      key: "doctors",
      icon: <FaUserMd />,
      label: "Active Doctors",
      value: stats?.doctorsCount ?? 0,
      alt: true,
    },
    {
      key: "payments",
      icon: <FaCreditCard />,
      label: "Total Revenue",
      value: formatPaymentsByCurrency(stats?.paymentsByCurrency),
      alt: true,
    },
    {
      key: "rejected",
      icon: <FaTimesCircle />,
      label: "Rejected Bookings",
      value: stats?.rejectedAppointments ?? 0,
    },
  ];

  return (
    <DashboardContainer>
      <WelcomeSection>
        <HeaderRow>
          <div>
            <WelcomeTitle>Hello, {user?.name || "Admin"}</WelcomeTitle>
            <WelcomeSubtitle>
              Here is a live snapshot of appointments, doctors, and inbound
              messages from MongoDB. Use the refresh button to pull the latest
              activity.
            </WelcomeSubtitle>
          </div>
          <Controls>
            <RefreshButton onClick={onRefresh} disabled={loading}>
              <FaSyncAlt />
              {loading ? "Refreshing" : "Refresh"}
            </RefreshButton>
          </Controls>
        </HeaderRow>
      </WelcomeSection>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <StatsGrid>
        {statCards.map((card) => (
          <StatCard key={card.key}>
            {card.alt ? (
              <StatIconAlt>{card.icon}</StatIconAlt>
            ) : (
              <StatIcon>{card.icon}</StatIcon>
            )}
            <StatContent>
              <StatNumber>{loading ? "--" : card.value}</StatNumber>
              <StatLabel>{card.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <ChartSection>
        <SectionTitle>Appointments in the Last 6 Months</SectionTitle>
        <SimpleChart
          data={chart?.values || []}
          labels={chart?.labels || []}
          height={220}
          legend="Monthly total"
        />

        <AdvancedChartsSection
          appointments={appointments}
          doctors={doctors}
          stats={stats}
          chart={chart}
        />
      </ChartSection>

      <AppointmentsSection>
        <SectionTitle>Recent Appointments</SectionTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState>Loading appointments...</EmptyState>
                </TableCell>
              </TableRow>
            ) : recentAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState>No appointments recorded yet.</EmptyState>
                </TableCell>
              </TableRow>
            ) : (
              recentAppointments.map((appointment) => {
                const status = appointment.status || "Pending";
                return (
                  <TableRow key={appointment._id}>
                    <TableCell data-label="Patient">
                      {appointment.patientName || "Unknown"}
                    </TableCell>
                    <TableCell data-label="Email">
                      {appointment.patientEmail || "-"}
                    </TableCell>
                    <TableCell data-label="Date">
                      {appointment.date
                        ? new Date(appointment.date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell data-label="Doctor">
                      {appointment.doctor || "-"}
                    </TableCell>
                    <TableCell data-label="Department">
                      {appointment.department || "-"}
                    </TableCell>
                    <TableCell data-label="Status">
                      <StatusBadge $status={status}>{status}</StatusBadge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </tbody>
        </Table>
      </AppointmentsSection>
    </DashboardContainer>
  );
};

export default DashboardHome;
