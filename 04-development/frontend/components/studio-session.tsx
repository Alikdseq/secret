"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const StudioContext = createContext(false);

export function StudioSession({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [on, setOn] = useState(false);

  useEffect(() => {
    let stop = false;
    fetch("/api/studio/session")
      .then((response) => response.json())
      .then((data: { ok?: boolean }) => {
        if (!stop) setOn(Boolean(data.ok));
      })
      .catch(() => {
        if (!stop) setOn(false);
      });
    return () => {
      stop = true;
    };
  }, [pathname]);

  return <StudioContext.Provider value={on}>{children}</StudioContext.Provider>;
}

export function useStudioOn() {
  return useContext(StudioContext);
}
