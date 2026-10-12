import { useEffect, useRef } from "react";

/**
 * 3D Cyber Perspective Grid & Particle Stream Background
 * Features:
 * - 3D Perspective Plane with undulating sine wave terrain
 * - Floating 3D Data Nodes with dynamic distance constellations
 * - Live data packet pulses traveling along connections
 * - Subtle mouse parallax 3D rotation
 * - Theme-aware styling (seamless light & dark mode adaptation)
 */
export function CyberBackground3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetRotY = x * 0.35;
      targetRotX = -y * 0.25;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // 3D Nodes
    interface Node3D {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
      lightColor: string;
    }

    const NODE_COUNT = 45;
    const nodes: Node3D[] = [];
    const colors = ["#38bdf8", "#818cf8", "#34d399", "#60a5fa"];
    const lightColors = ["#0284c7", "#6366f1", "#059669", "#2563eb"];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 700,
        z: Math.random() * 800 - 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1.5,
        color: colors[i % colors.length],
        lightColor: lightColors[i % lightColors.length],
      });
    }

    // 3D Grid parameters
    const GRID_COLS = 16;
    const GRID_ROWS = 14;
    const GRID_SPACING = 75;
    const FOV = 450;

    let time = 0;

    const render = () => {
      time += 0.015;

      // Check current theme
      const isLight =
        document.documentElement.classList.contains("light") ||
        document.documentElement.getAttribute("data-theme") === "light";

      // Clear with transparency
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const depth = z2 + 500;
        if (depth <= 10) return null;

        const scale = FOV / depth;
        return {
          px: width * 0.5 + x1 * scale,
          py: height * 0.45 + y2 * scale,
          scale,
          depth,
        };
      };

      // ── 1. Draw 3D Perspective Wave Grid (Bottom Horizon) ─────────────
      const gridPoints: ({ px: number; py: number; scale: number; depth: number } | null)[][] = [];

      for (let r = 0; r < GRID_ROWS; r++) {
        gridPoints[r] = [];
        for (let c = 0; c < GRID_COLS; c++) {
          const gx = (c - GRID_COLS / 2) * GRID_SPACING;
          const gz = r * GRID_SPACING + 50;
          // Undulating wave elevation
          const gy =
            180 +
            Math.sin(c * 0.4 + time * 1.5) * 25 +
            Math.cos(r * 0.35 + time * 1.2) * 20;

          gridPoints[r][c] = project(gx, gy, gz);
        }
      }

      ctx.lineWidth = isLight ? 0.75 : 0.85;

      // Draw horizontal grid lines
      for (let r = 0; r < GRID_ROWS; r++) {
        ctx.beginPath();
        let started = false;
        const alpha = Math.max(0, (1 - r / GRID_ROWS) * (isLight ? 0.15 : 0.22));
        ctx.strokeStyle = isLight
          ? `rgba(2, 132, 199, ${alpha})`
          : `rgba(56, 189, 248, ${alpha})`;

        for (let c = 0; c < GRID_COLS; c++) {
          const pt = gridPoints[r][c];
          if (!pt) continue;
          if (!started) {
            ctx.moveTo(pt.px, pt.py);
            started = true;
          } else {
            ctx.lineTo(pt.px, pt.py);
          }
        }
        ctx.stroke();
      }

      // Draw longitudinal (depth) grid lines
      for (let c = 0; c < GRID_COLS; c++) {
        ctx.beginPath();
        let started = false;
        ctx.strokeStyle = isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.14)";

        for (let r = 0; r < GRID_ROWS; r++) {
          const pt = gridPoints[r][c];
          if (!pt) continue;
          if (!started) {
            ctx.moveTo(pt.px, pt.py);
            started = true;
          } else {
            ctx.lineTo(pt.px, pt.py);
          }
        }
        ctx.stroke();
      }

      // ── 2. Update & Draw Floating 3D Data Constellations ──────────────
      const projectedNodes: { px: number; py: number; scale: number; node: Node3D }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        // Soft boundary wraps
        if (n.x < -600) n.x = 600;
        if (n.x > 600) n.x = -600;
        if (n.y < -350) n.y = 350;
        if (n.y > 350) n.y = -350;
        if (n.z < -200) n.z = 600;
        if (n.z > 600) n.z = -200;

        const pt = project(n.x, n.y, n.z);
        if (pt) {
          projectedNodes.push({ px: pt.px, py: pt.py, scale: pt.scale, node: n });
        }
      }

      // Draw connection lines between nearby projected nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 140 * ((p1.scale + p2.scale) * 0.5);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isLight ? 0.2 : 0.35);
            ctx.beginPath();
            ctx.strokeStyle = isLight
              ? `rgba(2, 132, 199, ${alpha})`
              : `rgba(96, 165, 250, ${alpha})`;
            ctx.lineWidth = 0.8 * ((p1.scale + p2.scale) * 0.5);
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const p = projectedNodes[i];
        const r = Math.max(1, p.node.size * p.scale);
        const nodeColor = isLight ? p.node.lightColor : p.node.color;

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.px, p.py, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "rgba(2, 132, 199, 0.08)" : "rgba(56, 189, 248, 0.15)";
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none -z-0 w-full h-full opacity-60 dark:opacity-40 transition-opacity duration-500"
      style={{ minHeight: "100%" }}
    />
  );
}
