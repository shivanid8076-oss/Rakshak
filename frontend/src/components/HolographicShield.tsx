import { useEffect, useRef } from "react";
import { Activity, Brain, Network, ShieldCheck } from "lucide-react";

export function HolographicShield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 560);
    let height = (canvas.height = canvas.offsetHeight || 560);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 560;
      height = canvas.height = canvas.offsetHeight || 560;
    };
    window.addEventListener("resize", onResize);

    // Particles rising from pedestal
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      maxLife: number;
      life: number;
      color: string;
    }

    const particles: Particle[] = [];
    const maxParticles = 45;

    const createParticle = (): Particle => {
      // Spawn near the bottom pedestal center
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (width * 0.32);
      return {
        x: width / 2 + Math.cos(angle) * radius,
        y: height * 0.76 + (Math.sin(angle) * radius * 0.35),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.8 + 0.4), // Float upwards
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        maxLife: Math.random() * 120 + 80,
        life: 0,
        color: Math.random() > 0.4 ? "#38bdf8" : "#06b6d4",
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife; // Stagger initial life
      p.y += p.vy * p.life;
      particles.push(p);
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle constellation
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        const currentAlpha =
          progress < 0.2
            ? (progress / 0.2) * p.alpha
            : progress > 0.8
              ? ((1 - progress) / 0.2) * p.alpha
              : p.alpha;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with faint electric line
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 48) {
            ctx.strokeStyle = "#38bdf8";
            ctx.globalAlpha = Math.max(0, (1 - dist / 48) * 0.25 * currentAlpha);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        if (p.life >= p.maxLife) {
          particles[i] = createParticle();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center select-none overflow-visible">
      {/* ── Ambient Radial Core Glow ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(56,189,248,0.22),rgba(14,165,233,0.06)_45%,transparent_70%)] pointer-events-none blur-xl" />

      {/* ── Particle Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* ── Holographic Laser Light Beam / Cone ── */}
      <div
        className="absolute top-[32%] bottom-[20%] left-[24%] right-[24%] pointer-events-none z-[1] opacity-40"
        style={{
          background:
            "linear-gradient(to top, rgba(56,189,248,0.25) 0%, rgba(6,182,212,0.08) 60%, transparent 100%)",
          clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* ── 3D Isometric Digital Pedestal on Floor ── */}
      <div
        className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[440px] h-[220px] pointer-events-none z-[2]"
        style={{ perspective: "600px" }}
      >
        <div
          className="w-full h-full relative"
          style={{ transform: "rotateX(72deg) translateY(20px)" }}
        >
          {/* Outer Rotating Digital Tech Ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/30 border-dashed animate-[spin_30s_linear_infinite] shadow-[0_0_20px_rgba(56,189,248,0.25)]" />

          {/* Second Tech Ring with Ticks */}
          <div className="absolute inset-[24px] rounded-full border-2 border-cyan-500/40 border-dotted animate-[spin_20s_linear_infinite_reverse]" />

          {/* Third Concentric Tech Ring */}
          <div className="absolute inset-[52px] rounded-full border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-[spin_15s_linear_infinite]" />

          {/* Luminous Inner Disc Platform */}
          <div className="absolute inset-[80px] rounded-full bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-cyan-400/40 border border-cyan-300 shadow-[0_0_35px_rgba(56,189,248,0.8),inset_0_0_25px_rgba(56,189,248,0.6)] animate-pulse" />

          {/* Center Energy Core */}
          <div className="absolute inset-[130px] rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.9),0_0_60px_rgba(56,189,248,1)] animate-ping opacity-60" />
        </div>
      </div>

      {/* ── Central Levitating 3D Cyber Shield Hologram ── */}
      <div className="relative z-10 w-[260px] h-[310px] flex items-center justify-center animate-[shield-float_4s_ease-in-out_infinite] filter drop-shadow-[0_0_35px_rgba(56,189,248,0.55)]">
        {/* Orbital Gyroscope Ring 1 */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full border border-cyan-400/20 border-dashed animate-[spin_24s_linear_infinite] pointer-events-none"
          style={{ transform: "rotateX(65deg) rotateY(20deg)" }}
        />
        {/* Orbital Gyroscope Ring 2 */}
        <div
          className="absolute w-[290px] h-[290px] rounded-full border border-blue-400/25 animate-[spin_18s_linear_infinite_reverse] pointer-events-none"
          style={{ transform: "rotateX(-60deg) rotateY(30deg)" }}
        />

        {/* Elaborate 3D Cyber Shield Vector Structure */}
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hologram Gradient */}
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
            </linearGradient>

            {/* Shield Glass Infill */}
            <linearGradient id="shieldFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#0c1a36" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
            </linearGradient>

            {/* Glowing Scan Sweep */}
            <linearGradient id="scanlineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Facet Layer 1 (Outer Shield) */}
          <path
            d="M 100 12 L 180 42 L 180 120 C 180 178 142 216 100 232 C 58 216 20 178 20 120 L 20 42 Z"
            fill="url(#shieldFill)"
            stroke="url(#shieldGrad)"
            strokeWidth="2.5"
            filter="url(#neonGlow)"
          />

          {/* Inner Facet Layer 2 */}
          <path
            d="M 100 26 L 166 52 L 166 118 C 166 166 134 198 100 214 C 66 198 34 166 34 118 L 34 52 Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeOpacity="0.6"
            strokeDasharray="6 3"
          />

          {/* Inner Facet Layer 3 (Core Frame) */}
          <path
            d="M 100 42 L 150 62 L 150 114 C 150 152 126 178 100 192 C 74 178 50 152 50 114 L 50 62 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="#67e8f9"
            strokeWidth="1.8"
          />

          {/* Hexagonal Cyber Pattern Texture Inside Shield */}
          <g stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.8" fill="none">
            <polygon points="100,68 114,76 114,92 100,100 86,92 86,76" />
            <polygon points="100,100 114,108 114,124 100,132 86,124 86,108" />
            <polygon points="128,84 142,92 142,108 128,116 114,108 114,92" />
            <polygon points="72,84 86,92 86,108 72,116 58,108 58,92" />
          </g>

          {/* Digital Circuit Bus Lines */}
          <path
            d="M 40 70 L 60 70 L 76 86 M 160 70 L 140 70 L 124 86 M 100 28 L 100 58 M 100 170 L 100 205 M 50 135 L 70 145 M 150 135 L 130 145"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Nodes on circuit lines */}
          <circle cx="76" cy="86" r="2.5" fill="#ffffff" />
          <circle cx="124" cy="86" r="2.5" fill="#ffffff" />
          <circle cx="100" cy="58" r="2" fill="#38bdf8" />
          <circle cx="70" cy="145" r="2" fill="#38bdf8" />
          <circle cx="130" cy="145" r="2" fill="#38bdf8" />

          {/* Central Cyber Lock / Emblem */}
          <g transform="translate(85, 100)">
            {/* Shackle */}
            <path
              d="M 6 12 L 6 7 C 6 2 24 2 24 7 L 24 12"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Body */}
            <rect
              x="2"
              y="11"
              width="26"
              height="20"
              rx="4"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Keyhole */}
            <circle cx="15" cy="19" r="2.5" fill="#ffffff" />
            <path d="M 15 21.5 L 15 26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Energy Scan Sweep Beam Over Shield */}
          <rect
            x="20"
            y="20"
            width="160"
            height="18"
            fill="url(#scanlineGrad)"
            className="animate-[shield-scan_3s_ease-in-out_infinite] opacity-60 pointer-events-none"
          />
        </svg>

        {/* Surrounding Energy Aura Particles */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] animate-ping" />
        <div className="absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
        <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#38bdf8]" />
      </div>

      {/* ── SVG Connection Beams to Callout Cards ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[8]">
        {/* Beam to Top Left (Real-time Monitoring) */}
        <line
          x1="22%"
          y1="22%"
          x2="42%"
          y2="38%"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="animate-[pulse_2s_infinite]"
          opacity="0.6"
        />
        {/* Beam to Bottom Left (AI Detection) */}
        <line
          x1="24%"
          y1="76%"
          x2="40%"
          y2="58%"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="animate-[pulse_2s_infinite]"
          opacity="0.6"
        />
        {/* Beam to Top Right (Graph Intelligence) */}
        <line
          x1="76%"
          y1="24%"
          x2="58%"
          y2="40%"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="animate-[pulse_2s_infinite]"
          opacity="0.6"
        />
        {/* Beam to Bottom Right (Fraud Prevention) */}
        <line
          x1="76%"
          y1="74%"
          x2="58%"
          y2="58%"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="animate-[pulse_2s_infinite]"
          opacity="0.6"
        />
      </svg>

      {/* ── 4 Floating Interactive Callout Badges ── */}

      {/* Callout 1: Real-time Monitoring (Top Left) */}
      <div className="absolute top-[8%] left-[2%] sm:left-[4%] z-20 bg-[#0c1427]/90 backdrop-blur-md border border-cyan-500/35 hover:border-cyan-400 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-2.5 transition-all hover:scale-105 animate-[float-card-1_4.5s_ease-in-out_infinite]">
        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
          <Activity className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white text-[11px] sm:text-xs">
            Real-time Monitoring
          </div>
        </div>
      </div>

      {/* Callout 2: AI Detection (Bottom Left) */}
      <div className="absolute bottom-[16%] left-[2%] sm:left-[6%] z-20 bg-[#0c1427]/90 backdrop-blur-md border border-cyan-500/35 hover:border-cyan-400 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-2.5 transition-all hover:scale-105 animate-[float-card-2_5.2s_ease-in-out_infinite]">
        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
          <Brain className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white text-[11px] sm:text-xs">
            AI Detection
          </div>
        </div>
      </div>

      {/* Callout 3: Graph Intelligence (Top Right) */}
      <div className="absolute top-[12%] right-[2%] sm:right-[4%] z-20 bg-[#0c1427]/90 backdrop-blur-md border border-cyan-500/35 hover:border-cyan-400 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-2.5 transition-all hover:scale-105 animate-[float-card-3_4.8s_ease-in-out_infinite]">
        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
          <Network className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white text-[11px] sm:text-xs">
            Graph Intelligence
          </div>
        </div>
      </div>

      {/* Callout 4: Fraud Prevention (Bottom Right) */}
      <div className="absolute bottom-[18%] right-[2%] sm:right-[6%] z-20 bg-[#0c1427]/90 backdrop-blur-md border border-cyan-500/35 hover:border-cyan-400 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-2.5 transition-all hover:scale-105 animate-[float-card-4_5.5s_ease-in-out_infinite]">
        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white text-[11px] sm:text-xs">
            Fraud Prevention
          </div>
        </div>
      </div>
    </div>
  );
}
