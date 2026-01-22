import React from "react";
import styled from "styled-components";

const ChartWrap = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
`;

const Legend = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
  width: 100%;
`;

// Enhanced, responsive line chart using SVG (no external deps)
const SimpleChart = ({
  data = [20, 50, 40, 70, 90, 60, 80],
  labels = [],
  height = 140,
  gridLines = 4,
  legend = "Overview",
}) => {
  if (!data || data.length === 0) {
    return (
      <ChartWrap>
        <EmptyState>No data to display</EmptyState>
      </ChartWrap>
    );
  }

  const padding = { top: 12, right: 12, bottom: 28, left: 44 };
  const svgWidth = 600; // viewBox width; svg will be responsive with width="100%"
  const svgHeight = height;
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const max = Math.max(...data) * 1.05;
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding.left + (i * innerWidth) / (data.length - 1);
    const y = padding.top + innerHeight - ((v - min) / range) * innerHeight;
    return { x, y, v };
  });

  // Build path d
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  // Area path for fill under the line
  const areaD = `${pathD} L ${padding.left + innerWidth} ${
    padding.top + innerHeight
  } L ${padding.left} ${padding.top + innerHeight} Z`;

  // Y axis ticks
  const ticks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const t = min + (i * range) / gridLines;
    const y = padding.top + innerHeight - ((t - min) / range) * innerHeight;
    return { value: Math.round(t), y };
  });

  return (
    <ChartWrap>
      <div style={{ width: "100%" }}>
        <Legend>{legend}</Legend>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height={svgHeight}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7e22ce" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          {/* grid lines + y labels */}
          {ticks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerWidth}
                y1={tick.y}
                y2={tick.y}
                stroke="#eef2ff"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                fontSize="11"
                fill="#6b7280"
                textAnchor="end"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* area under line */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={6} fill="#fff" />
              <circle cx={p.x} cy={p.y} r={4} fill="#4f46e5" />
              {/* simple tooltip using title element */}
              <title>{labels[i] ? `${labels[i]}: ${p.v}` : `${p.v}`}</title>
            </g>
          ))}

          {/* x labels */}
          {labels && labels.length === data.length
            ? labels.map((lab, i) => (
                <text
                  key={i}
                  x={points[i].x}
                  y={padding.top + innerHeight + 18}
                  fontSize="11"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {lab}
                </text>
              ))
            : data.map((_, i) => (
                <text
                  key={i}
                  x={points[i].x}
                  y={padding.top + innerHeight + 18}
                  fontSize="11"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {i + 1}
                </text>
              ))}

          {/* axes lines */}
          <line
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={padding.top + innerHeight}
            stroke="#e6edf7"
            strokeWidth={1}
          />
          <line
            x1={padding.left}
            x2={padding.left + innerWidth}
            y1={padding.top + innerHeight}
            y2={padding.top + innerHeight}
            stroke="#e6edf7"
            strokeWidth={1}
          />
        </svg>
      </div>
    </ChartWrap>
  );
};

export default SimpleChart;
