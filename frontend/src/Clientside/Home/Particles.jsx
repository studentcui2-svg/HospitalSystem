import React, { useRef, useEffect } from "react";

const Particles = ({ color = "#9fb8ff", count = 40, speed = 0.5 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = canvas.clientWidth);
    let h = (canvas.height = canvas.clientHeight);

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.scale(DPR, DPR);

    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.2) * speed,
        alpha: 0.2 + Math.random() * 0.6,
      });
    }

    let raf = null;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(
          color.slice(3, 5),
          16
        )},${parseInt(color.slice(5, 7), 16)},${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(render);
    };

    const handleResize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.scale(DPR, DPR);
    };

    window.addEventListener("resize", handleResize);
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [count, speed, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        opacity: 0.95,
        pointerEvents: "none",
      }}
    />
  );
};

export default Particles;
