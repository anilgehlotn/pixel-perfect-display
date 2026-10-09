import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { NotifyContext } from "./notify-context";

// Site-wide notice for short confirmations ("Address saved", "You've been signed out").
// Polite live region: announced by screen readers without moving focus; hides after 4s.
export function NotifyProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 4000);
  }, []);
  const value = useMemo(() => ({ notice, notify }), [notice, notify]);
  return <NotifyContext.Provider value={value}>{children}</NotifyContext.Provider>;
}
