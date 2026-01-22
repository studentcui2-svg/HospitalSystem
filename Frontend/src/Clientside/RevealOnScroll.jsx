import React, { useRef, useEffect, useState } from "react";

const RevealOnScroll = ({ children, threshold = 0.12, rootMargin = "0px" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  const style = {
    transform: visible ? "none" : "translateY(18px)",
    opacity: visible ? 1 : 0,
    transition:
      "opacity 650ms cubic-bezier(.2,.9,.3,1), transform 650ms cubic-bezier(.2,.9,.3,1)",
    willChange: "transform, opacity",
  };

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
};

export default RevealOnScroll;
