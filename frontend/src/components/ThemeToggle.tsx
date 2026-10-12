import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "floating";
}

export function ThemeToggle({ className = "", variant = "icon" }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === "floating") {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className="h-11 w-11 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md group"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-300 transition-transform group-hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 text-blue-400 transition-transform group-hover:-rotate-12" />
          )}
        </button>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
          isDark
            ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
            : "bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden sm:inline">Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
        isDark
          ? "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
          : "border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 shadow-xs"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-300 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-blue-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
