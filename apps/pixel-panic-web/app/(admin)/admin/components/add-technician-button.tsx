"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTechnicianDialog } from "./add-technician-dialog";

export function AddTechnicianButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add New Technician</Button>
      <AddTechnicianDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
