import React from "react";

interface FraudShieldEmblemProps {
  className?: string;
  size?: number | "xs" | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const SIZE_MAP = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

/**
 * High-tech custom 3D vector emblem for FraudShield
 * Multi-layer cyber shield with faceted bevels, quantum core, and neural circuit traces.
 */
export function FraudShieldEmblem({
  className = "",
  size = "md",
  animated = true,
}: FraudShieldEmblemProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 32;
  const idPrefix = React.useId().replace(/:/g, "");

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 48 48"
        width={pixelSize}
        height={pixelSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Cyber outer gradient */}
          <linearGradient
            id={`${idPrefix}-outer-grad`}
            x1="4"
            y1="4"
            x2="44"
            y2="46"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="85%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Left 3D facet - lighter sheen */}
          <linearGradient
            id={`${idPrefix}-left-facet`}
            x1="8"
            y1="8"
            x2="24"
            y2="42"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.6" />
          </linearGradient>

          {/* Right 3D facet - darker bevel shadow */}
          <linearGradient
            id={`${idPrefix}-right-facet`}
            x1="40"
            y1="8"
            x2="24"
            y2="42"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.7" />
          </linearGradient>

          {/* Core quantum diamond gradient */}
          <linearGradient
            id={`${idPrefix}-core-grad`}
            x1="24"
            y1="15"
            x2="24"
            y2="33"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Ambient Glow Filter */}
          <filter
            id={`${idPrefix}-glow`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Neon Back-Halo */}
        <path
          d="M 24 4 L 42 10.5 L 42 26 C 42 36.5 32 42.5 24 45.5 C 16 42.5 6 36.5 6 26 L 6 10.5 Z"
          fill="none"
          stroke={`url(#${idPrefix}-outer-grad)`}
          strokeWidth="3.5"
          opacity="0.35"
          className={animated ? "animate-pulse" : ""}
          filter={`url(#${idPrefix}-glow)`}
        />

        {/* Outer Shield Shell (Armored Cyber Perimeter) */}
        <path
          d="M 24 4 L 42 10.5 L 42 26 C 42 36.5 32 42.5 24 45.5 C 16 42.5 6 36.5 6 26 L 6 10.5 Z"
          fill="#070c18"
          stroke={`url(#${idPrefix}-outer-grad)`}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Left 3D Armored Plate Facet */}
        <path
          d="M 24 6.5 L 9.5 12 L 9.5 25.5 C 9.5 34.2 18 39.5 24 42.5 Z"
          fill={`url(#${idPrefix}-left-facet)`}
        />

        {/* Right 3D Armored Plate Facet */}
        <path
          d="M 24 6.5 L 38.5 12 L 38.5 25.5 C 38.5 34.2 30 39.5 24 42.5 Z"
          fill={`url(#${idPrefix}-right-facet)`}
        />

        {/* Neural Circuit Defense Traces */}
        {/* Left Circuit */}
        <path
          d="M 13 19 L 19 23 L 19 30"
          stroke="#00f2fe"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
        <circle cx="13" cy="19" r="1.3" fill="#00f2fe" />
        <circle cx="19" cy="30" r="1.3" fill="#38bdf8" />

        {/* Right Circuit */}
        <path
          d="M 35 19 L 29 23 L 29 30"
          stroke="#818cf8"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
        <circle cx="35" cy="19" r="1.3" fill="#818cf8" />
        <circle cx="29" cy="30" r="1.3" fill="#a78bfa" />

        {/* Central Defense Rib (Vertical Spine) */}
        <line
          x1="24"
          y1="6.5"
          x2="24"
          y2="42.5"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.4"
          strokeDasharray="2 2"
        />

        {/* Quantum Core Diamond Shield (Central Intelligence Beacon) */}
        <path
          d="M 24 14 L 32.5 23.5 L 24 33.5 L 15.5 23.5 Z"
          fill={`url(#${idPrefix}-core-grad)`}
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinejoin="round"
          filter={`url(#${idPrefix}-glow)`}
        />

        {/* Inner Diamond Refraction Line */}
        <path
          d="M 24 17 L 30 23.5 L 24 30.5 L 18 23.5 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.75"
          opacity="0.6"
        />

        {/* Radar Pulse / Core Sentinel Dot */}
        <circle
          cx="24"
          cy="23.5"
          r="3"
          fill="#ffffff"
          className={animated ? "animate-ping origin-center" : ""}
          style={{ animationDuration: "2.8s" }}
        />
        <circle cx="24" cy="23.5" r="2.2" fill="#ffffff" />
        <circle cx="24" cy="23.5" r="1" fill="#00f2fe" />

        {/* Top Crest Cyber Notch */}
        <path
          d="M 21 4 L 24 2.2 L 27 4"
          stroke="#00f2fe"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

interface FraudShieldLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  tagline?: string;
  animated?: boolean;
}

/**
 * Full Brand Logo component with Emblem and high-contrast responsive wordmark
 */
export function FraudShieldLogo({
  className = "",
  size = "md",
  showWordmark = true,
  tagline,
  animated = true,
}: FraudShieldLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <FraudShieldEmblem size={size} animated={animated} />
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-display font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
              RAK<span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">SHAK</span>
            </span>
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
              AI 2.0
            </span>
          </div>
          {tagline && (
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 tracking-tight">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
