import { createContext, useContext } from "react";

export type NotifyCtx = { notice: string | null; notify: (message: string) => void };

export const NotifyContext = createContext<NotifyCtx | null>(null);

export function useNotify() {
  const c = useContext(NotifyContext);
  if (!c) throw new Error("useNotify must be inside NotifyProvider");
  return c;
}
