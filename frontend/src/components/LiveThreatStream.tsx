import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface ThreatEvent {
  id: string;
  amount: string;
  description: string;
  timeAgo: string;
  severity: "critical" | "warning";
}

const INITIAL_THREATS: ThreatEvent[] = [
  {
    id: "t1",
    amount: "₹ 2,48,000",
    description: "Suspected mule account detected",
    timeAgo: "4m ago",
    severity: "critical",
  },
  {
    id: "t2",
    amount: "₹ 89,500",
    description: "Velocity anomaly flagged",
    timeAgo: "7m ago",
    severity: "warning",
  },
  {
    id: "t3",
    amount: "₹ 1,32,000",
    description: "New fraud ring identified",
    timeAgo: "12m ago",
    severity: "critical",
  },
  {
    id: "t4",
    amount: "₹ 4,75,000",
    description: "Rapid layering across 8 UPI IDs",
    timeAgo: "Just now",
    severity: "critical",
  },
  {
    id: "t5",
    amount: "₹ 64,800",
    description: "Device fingerprint spoofing detected",
    timeAgo: "1m ago",
    severity: "warning",
  },
  {
    id: "t6",
    amount: "₹ 3,90,000",
    description: "Syndicate burst withdrawal isolated",
    timeAgo: "Just now",
    severity: "critical",
  },
  {
    id: "t7",
    amount: "₹ 1,18,000",
    description: "Beneficiary velocity spike flagged",
    timeAgo: "2m ago",
    severity: "warning",
  },
];

export function LiveThreatStream() {
  const [startIndex, setStartIndex] = useState(0);
  const [isNewAlertFlash, setIsNewAlertFlash] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Automatically cycle threats every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIsNewAlertFlash(true);
      setStartIndex((prev) => (prev + 1) % INITIAL_THREATS.length);

      const timeout = setTimeout(() => {
        setIsNewAlertFlash(false);
      }, 700);

      return () => clearTimeout(timeout);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Display 3 items from the rotating queue
  const visibleThreats = [
    INITIAL_THREATS[startIndex % INITIAL_THREATS.length],
    INITIAL_THREATS[(startIndex + 1) % INITIAL_THREATS.length],
    INITIAL_THREATS[(startIndex + 2) % INITIAL_THREATS.length],
  ];

  return (
    <section
      id="threats"
      className="relative z-20 px-4 sm:px-6 max-w-7xl mx-auto w-full my-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-2xl lg:rounded-full bg-[#050b18]/85 backdrop-blur-xl border border-sky-500/25 shadow-[0_0_35px_rgba(2,132,199,0.18)] py-3.5 px-5 sm:px-7 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-5 text-xs font-mono transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)]">
        {/* Subtle Ambient Glow Pill */}
        <div className="absolute inset-0 rounded-2xl lg:rounded-full bg-gradient-to-r from-rose-500/5 via-sky-500/5 to-cyan-500/5 pointer-events-none" />

        {/* ── Left Label: LIVE THREAT STREAM ── */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
          </span>
          <span className="font-bold text-rose-500 tracking-wider text-[11px] sm:text-xs">
            LIVE THREAT STREAM
          </span>
          {isPaused && (
            <span className="text-[10px] text-slate-500 border border-slate-700 rounded px-1 py-0.2">
              PAUSED
            </span>
          )}
        </div>

        {/* Vertical Divider 1 */}
        <div className="h-4 w-[1px] bg-white/10 hidden lg:block shrink-0" />

        {/* ── Rotating 3 Threat Items ── */}
        <div
          className={`flex-1 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-4 overflow-hidden w-full transition-opacity duration-300 ${
            isNewAlertFlash ? "opacity-90" : "opacity-100"
          }`}
        >
          {visibleThreats.map((threat, idx) => {
            const isCritical = threat.severity === "critical";

            return (
              <div
                key={`${threat.id}-${idx}`}
                className="flex items-center justify-between lg:justify-start gap-2 text-slate-300 text-xs truncate group/item hover:text-white transition-all cursor-pointer"
              >
                {/* Threat Dot Indicator */}
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    isCritical
                      ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                      : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  }`}
                />

                {/* Amount in bold */}
                <span
                  className={`font-bold tracking-tight text-white ${
                    isCritical ? "text-white" : "text-amber-200"
                  }`}
                >
                  {threat.amount}
                </span>

                {/* Description */}
                <span className="truncate text-slate-300 font-sans text-xs">
                  {threat.description}
                </span>

                {/* Relative timestamp */}
                <span className="text-slate-500 text-[11px] shrink-0 font-mono ml-auto lg:ml-0">
                  · {threat.timeAgo}
                </span>

                {/* Inner divider between items in desktop */}
                {idx < visibleThreats.length - 1 && (
                  <div className="h-4 w-[1px] bg-white/10 hidden lg:block mx-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Vertical Divider 2 */}
        <div className="h-4 w-[1px] bg-white/10 hidden lg:block shrink-0" />

        {/* Action Link to Cases / Stream Telemetry */}
        <Link
          to="/cases"
          className="shrink-0 inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-sans font-semibold transition-colors group"
        >
          <span className="underline-offset-4 group-hover:underline">View All Alerts</span>
          <span className="text-cyan-400 transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </section>
  );
}
