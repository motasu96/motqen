"use client";

import { ReactNode } from "react";

export default function PageTransition({ pathname, children }: { pathname: string | null; children: ReactNode }) {
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
