import React from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.06);
  overflow: hidden;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
`;

const TitleIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;

  @media (max-width: 768px) {
    height: 250px;
  }

  @media (max-width: 480px) {
    height: 220px;
  }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 480px) {
    gap: 0.75rem;
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #4f46e5;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

// Custom tooltip for better styling
const CustomTooltip = styled.div`
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

// Chart Components
export const AppointmentTrendChart = ({ data = [] }) => {
  const chartData = data.length
    ? data
    : [
        { month: "Jan", appointments: 65, accepted: 45, pending: 15 },
        { month: "Feb", appointments: 78, accepted: 55, pending: 18 },
        { month: "Mar", appointments: 92, accepted: 68, pending: 20 },
        { month: "Apr", appointments: 81, accepted: 60, pending: 18 },
        { month: "May", appointments: 95, accepted: 72, pending: 19 },
        { month: "Jun", appointments: 110, accepted: 85, pending: 22 },
      ];

  return (
    <ChartCard>
      <ChartTitle>
        <TitleIcon>📈</TitleIcon>
        Appointment Trends
      </ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: "0.85rem" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "0.85rem" }} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="appointments"
              stroke="#4f46e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAppt)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPending)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartCard>
  );
};

export const StatusDistributionChart = ({ data = [] }) => {
  const chartData = data.length
    ? data
    : [
        { name: "Accepted", value: 45, color: "#10b981" },
        { name: "Pending", value: 30, color: "#f59e0b" },
        { name: "Rejected", value: 15, color: "#ef4444" },
        { name: "Cancelled", value: 10, color: "#6b7280" },
      ];

  const COLORS = chartData.map((item) => item.color);

  return (
    <ChartCard>
      <ChartTitle>
        <TitleIcon>📊</TitleIcon>
        Status Distribution
      </ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
      <StatRow>
        {chartData.map((item, idx) => (
          <StatItem key={idx}>
            <StatValue style={{ color: item.color }}>{item.value}</StatValue>
            <StatLabel>{item.name}</StatLabel>
          </StatItem>
        ))}
      </StatRow>
    </ChartCard>
  );
};

export const DoctorPerformanceChart = ({ data = [] }) => {
  const chartData = data.length
    ? data
    : [
        { doctor: "Dr. Ahmed", appointments: 28, rating: 4.8 },
        { doctor: "Dr. Fatima", appointments: 32, rating: 4.9 },
        { doctor: "Dr. Hassan", appointments: 25, rating: 4.6 },
        { doctor: "Dr. Ayesha", appointments: 35, rating: 4.7 },
        { doctor: "Dr. Omar", appointments: 22, rating: 4.5 },
      ];

  return (
    <ChartCard>
      <ChartTitle>
        <TitleIcon>👨‍⚕️</TitleIcon>
        Top Doctors Performance
      </ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="doctor"
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#6b7280"
              style={{ fontSize: "0.75rem" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "0.85rem" }} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="appointments" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            <Bar dataKey="rating" fill="#7e22ce" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartCard>
  );
};

export const DepartmentAnalyticsChart = ({ data = [] }) => {
  const chartData = data.length
    ? data
    : [
        { department: "Cardiology", patients: 45, revenue: 12000 },
        { department: "Neurology", patients: 38, revenue: 9500 },
        { department: "Orthopedics", patients: 52, revenue: 14200 },
        { department: "Dermatology", patients: 28, revenue: 7800 },
        { department: "Pediatrics", patients: 41, revenue: 10500 },
      ];

  return (
    <ChartCard>
      <ChartTitle>
        <TitleIcon>🏥</TitleIcon>
        Department Analytics
      </ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="department"
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#6b7280"
              style={{ fontSize: "0.75rem" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "0.85rem" }} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="patients"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ fill: "#4f46e5", r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#7e22ce"
              strokeWidth={3}
              dot={{ fill: "#7e22ce", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartCard>
  );
};

export const PaymentStatusChart = ({ data = [] }) => {
  const chartData = data.length
    ? data
    : [
        { name: "completed", value: 0, color: "#10b981" },
        { name: "pending", value: 0, color: "#f59e0b" },
        { name: "refunded", value: 0, color: "#ef4444" },
        { name: "failed", value: 0, color: "#6b7280" },
      ];

  const COLORS = chartData.map((item) => item.color);

  return (
    <ChartCard>
      <ChartTitle>
        <TitleIcon>💳</TitleIcon>
        Payment Status Distribution
      </ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
      <StatRow>
        {chartData.map((item, idx) => (
          <StatItem key={idx}>
            <StatValue style={{ color: item.color }}>{item.value}</StatValue>
            <StatLabel>{item.name}</StatLabel>
          </StatItem>
        ))}
      </StatRow>
    </ChartCard>
  );
};

export const RevenueTrackingChart = ({ data = [] }) => {
  const chartData = data.length
    ? data
    : [
        { month: "Jan", revenue: 8500, target: 9000, expenses: 3200 },
        { month: "Feb", revenue: 9200, target: 9000, expenses: 3400 },
        { month: "Mar", revenue: 10500, target: 9000, expenses: 3600 },
        { month: "Apr", revenue: 9800, target: 9000, expenses: 3300 },
        { month: "May", revenue: 11200, target: 9000, expenses: 3800 },
        { month: "Jun", revenue: 12500, target: 9000, expenses: 4000 },
      ];

  return (
    <ChartCard>
      <ChartTitle>
        <TitleIcon>💰</TitleIcon>
        Revenue Tracking
      </ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: "0.85rem" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "0.85rem" }} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Actual Revenue"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTarget)"
              name="Target Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
      <StatRow>
        <StatItem>
          <StatValue style={{ color: "#10b981" }}>$12.5K</StatValue>
          <StatLabel>Latest Revenue</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue style={{ color: "#f59e0b" }}>$9K</StatValue>
          <StatLabel>Monthly Target</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue style={{ color: "#ef4444" }}>$4K</StatValue>
          <StatLabel>Avg Expenses</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue style={{ color: "#3b82f6" }}>39%</StatValue>
          <StatLabel>Profit Margin</StatLabel>
        </StatItem>
      </StatRow>
    </ChartCard>
  );
};

// Main wrapper
export const AdvancedChartsSection = ({
  appointments = [],
  chart = { labels: [], values: [] },
}) => {
  // Build trend data from `chart` and appointments
  const trendData = (chart.labels || []).map((label, i) => ({
    month: label,
    appointments: chart.values?.[i] || 0,
    accepted: 0,
    pending: 0,
  }));

  // populate accepted/pending counts per bucket using appointment dates
  if (appointments && appointments.length && chart.labels?.length) {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i -= 1) {
      const cursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      buckets.push(key);
    }

    appointments.forEach((appt) => {
      const raw = appt.date || appt.createdAt;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = buckets.indexOf(key);
      if (idx !== -1) {
        trendData[idx].appointments += 0; // already seeded from chart.values
        const st = (appt.status || "Pending").toLowerCase();
        if (st === "accepted") trendData[idx].accepted += 1;
        else if (st === "rejected") trendData[idx].pending += 0;
        else trendData[idx].pending += 1;
      }
    });
  }

  // Status distribution from appointments
  const statusMap = { Accepted: 0, Pending: 0, Rejected: 0, Cancelled: 0 };
  (appointments || []).forEach((a) => {
    const s = a.status || "Pending";
    if (s === "Accepted") statusMap.Accepted += 1;
    else if (s === "Rejected") statusMap.Rejected += 1;
    else if (s === "Cancelled") statusMap.Cancelled += 1;
    else statusMap.Pending += 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
    color:
      name === "Accepted"
        ? "#10b981"
        : name === "Pending"
        ? "#f59e0b"
        : name === "Rejected"
        ? "#ef4444"
        : "#6b7280",
  }));

  // Doctor performance (top doctors by appointments)
  const docMap = {};
  (appointments || []).forEach((a) => {
    const doc = a.doctor || "Unknown";
    docMap[doc] = (docMap[doc] || 0) + 1;
  });
  const docData = Object.entries(docMap)
    .map(([doctor, appointments]) => ({ doctor, appointments }))
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 6);

  // Department analytics
  const deptMap = {};
  (appointments || []).forEach((a) => {
    const dept = a.department || "Unknown";
    deptMap[dept] = deptMap[dept] || { patients: 0, revenue: 0 };
    deptMap[dept].patients += 1;
    if (a.payment && a.payment.status === "completed") {
      deptMap[dept].revenue += a.payment.amount || 0;
    }
  });
  const deptData = Object.entries(deptMap).map(([department, v]) => ({
    department,
    patients: v.patients,
    revenue: v.revenue,
  }));

  // Payment status distribution (completed, pending, refunded, failed)
  const paymentMap = {};
  (appointments || []).forEach((a) => {
    const p = (a.payment && a.payment.status) || "pending";
    paymentMap[p] = (paymentMap[p] || 0) + 1;
  });
  const paymentStatusData = Object.entries(paymentMap).map(([name, value]) => ({
    name,
    value,
    color:
      name === "completed"
        ? "#10b981"
        : name === "pending"
        ? "#f59e0b"
        : name === "refunded"
        ? "#ef4444"
        : "#6b7280",
  }));

  // Revenue tracking per month (based on payment paidAt or createdAt)
  const revenueBuckets = (chart.labels || []).map((label) => ({
    month: label,
    revenue: 0,
  }));
  if (appointments && appointments.length && chart.labels?.length) {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i -= 1) {
      const cursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      buckets.push(key);
    }
    appointments.forEach((a) => {
      if (!a.payment || a.payment.status !== "completed") return;
      const raw = a.payment.paidAt || a.updatedAt || a.createdAt || a.date;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = buckets.indexOf(key);
      if (idx !== -1) {
        revenueBuckets[idx].revenue += a.payment.amount || 0;
      }
    });
  }

  return (
    <ChartsContainer>
      <AppointmentTrendChart data={trendData} />
      <StatusDistributionChart data={statusData} />
      <DoctorPerformanceChart data={docData} />
      <DepartmentAnalyticsChart data={deptData} />
      <PaymentStatusChart data={paymentStatusData} />
      <RevenueTrackingChart data={revenueBuckets} />
    </ChartsContainer>
  );
};

export default AdvancedChartsSection;
