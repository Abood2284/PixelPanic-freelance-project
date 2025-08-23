import type { ReactNode } from "react";
import { TechnicianHeader } from "@/components/shared/TechnicianHeader";

export default function TechnicianLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <TechnicianHeader />
      {children}
    </>
  );
}
