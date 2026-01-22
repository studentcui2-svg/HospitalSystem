import React from "react";
import styled from "styled-components";

const Wrap = styled.div`
  display: inline-flex;
  gap: 10px;
  align-items: center;
`;

const Img = styled.img`
  width: ${(p) => p.size || 40}px;
  height: ${(p) => p.size || 40}px;
  object-fit: contain;
  display: block;
`;

const Text = styled.div`
  font-weight: 800;
  font-size: ${(p) => (p.small ? "1rem" : "1.25rem")};
  color: var(--accent-dark, #0f766e);
  letter-spacing: -0.5px;
`;

const Subtitle = styled.div`
  font-size: 0.75rem;
  color: var(--muted, #6b7280);
  font-weight: 600;
`;

const BrandLogo = ({ size = 44, showText = true, subtitle }) => {
  // expects a logo file at /logo.png or /logo.svg in public folder
  const src = "/logo.png";

  return (
    <Wrap className="brand-logo">
      <Img
        src={src}
        alt="ZeeCare logo"
        size={size}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      {showText && (
        <div>
          <Text>{/* fallback text if image missing */}ZeeCare</Text>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </div>
      )}
    </Wrap>
  );
};

export default BrandLogo;
