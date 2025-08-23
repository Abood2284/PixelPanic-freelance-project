"use client";

import { NotesForm } from "./notes-form";

interface NotesWrapperProps {
  gigId: number;
  initialNotes: string;
}

export function NotesWrapper({ gigId, initialNotes }: NotesWrapperProps) {
  const handleSubmit = async (notes: string) => {
    // TODO: Implement notes submission
    console.log("Saving notes for gig", gigId, ":", notes);

    // For now, just show a success message
    alert("Notes saved successfully!");
  };

  return (
    <NotesForm
      gigId={gigId}
      initialNotes={initialNotes}
      onSubmit={handleSubmit}
      isSubmitting={false}
    />
  );
}
