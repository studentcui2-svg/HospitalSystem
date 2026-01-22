import React from "react";
import styled from "styled-components";
import { useGlobalLoading } from "../contexts/GlobalLoading";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  pointer-events: all;
`;

const Card = styled.div`
  width: min(1100px, 94%);
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.12);
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Block = styled.div`
  height: ${(p) => p.h || "16px"};
  width: ${(p) => p.w || "100%"};
  border-radius: 6px;
  background: linear-gradient(90deg, #f3f4f6 25%, #ececec 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s linear infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const Message = styled.div`
  margin-top: 8px;
  font-weight: 600;
  color: #374151;
`;

const GlobalSkeleton = () => {
  const { loading, message } = useGlobalLoading();

  if (!loading) return null;

  return (
    <Overlay>
      <Card aria-hidden>
        <Row>
          <Block w="40%" h="22px" />
          <Block w="20%" h="22px" />
          <Block w="15%" h="22px" />
        </Row>

        <Row>
          <Block w="22%" />
          <Block w="22%" />
          <Block w="22%" />
          <Block w="22%" />
        </Row>

        <Row>
          <Block w="12%" />
          <Block w="70%" />
        </Row>

        <Row>
          <Block w="100%" />
        </Row>

        {message && <Message>{message}</Message>}
      </Card>
    </Overlay>
  );
};

export default GlobalSkeleton;
