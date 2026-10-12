import { useEffect, useRef } from "react";

export function CyberShieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position for subtle interactive cyber reaction
    const mouse = {
      x: width / 2,
      y: height / 2,
      isActive: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Particle nodes for cyber telemetry
    interface Node {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
    }

    const nodes: Node[] = [];
    const count = Math.min(65, Math.floor((width * height) / 18000));

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1,
        alpha: Math.random() * 0.45 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Render each particle
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Natural organic drift
        n1.x += n1.vx;
        n1.y += n1.vy;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        // Subtle interactive mouse reaction
        if (mouse.isActive) {
          const dx = mouse.x - n1.x;
          const dy = mouse.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const force = (1 - dist / 140) * 1.5;
            n1.x -= (dx / dist) * force;
            n1.y -= (dy / dist) * force;
          }
        }

        // Check theme for dynamic particle contrast
        const isLight = document.documentElement.classList.contains("light");

        // Pulse alpha softly
        const pulsingAlpha =
          n1.alpha * (0.8 + 0.2 * Math.sin(frame * n1.pulseSpeed));

        ctx.fillStyle = isLight ? "#2563eb" : "#38bdf8";
        ctx.globalAlpha = isLight ? pulsingAlpha * 0.5 : pulsingAlpha;
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes with faint cyber line
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.strokeStyle = isLight ? "#3b82f6" : "#38bdf8";
            ctx.globalAlpha = (1 - dist / 110) * (isLight ? 0.12 : 0.18);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* ── Background Cyber Grid Mesh ── */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 80%)",
        }}
      />

      {/* ── Atmospheric Radial Lighting ── */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px]" />

      {/* ── Particle Canvas ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
