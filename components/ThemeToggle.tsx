'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering once mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-[4px] border-2 border-black bg-card shadow-[2px_2px_0_var(--color-primary)] shrink-0" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-9 w-9 rounded-[4px] border-2 border-black bg-card text-foreground flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0_var(--color-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)] outline-none select-none"
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 text-foreground" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-foreground" />
      )}
    </button>
  );
}
