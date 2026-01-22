import React, { useEffect, useRef, useState } from "react";

const CountUp = ({ end = 1000, duration = 1400, decimals = 0, start = 0 }) => {
  const [value, setValue] = useState(start);
  const rafRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setValue(Number(current.toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration, decimals, start]);

  return <>{value.toLocaleString()}</>;
};

export default CountUp;
