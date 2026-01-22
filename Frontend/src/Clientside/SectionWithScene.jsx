import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import ThreeScene from "./Home/ThreeScene.jsx";
import Particles from "./Home/Particles.jsx";

const Wrapper = styled.section`
  position: relative;
  overflow: hidden;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
`;

const SceneLayer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1;
  pointer-events: none;
  opacity: ${(p) => (typeof p.opacity !== "undefined" ? p.opacity : 0.95)};
`;

const SectionWithScene = ({ children, scene = true, opacity = 0.95 }) => {
  const wrapRef = useRef(null);
  const [height, setHeight] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setHeight(el.clientHeight || el.scrollHeight || null);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Wrapper ref={wrapRef}>
      {scene && (
        <SceneLayer
          opacity={opacity}
          style={height ? { height } : { minHeight: 200 }}
        >
          <ThreeScene />
          <div style={{ position: "absolute", inset: 0 }}>
            <Particles count={28} speed={0.25} color="#9fb8ff" />
          </div>
        </SceneLayer>
      )}
      <Content>{children}</Content>
    </Wrapper>
  );
};

export default SectionWithScene;
