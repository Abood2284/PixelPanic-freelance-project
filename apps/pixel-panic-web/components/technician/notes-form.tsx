"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconNotes, IconSend } from "@tabler/icons-react";

interface NotesFormProps {
  gigId: number;
  initialNotes?: string;
  onSubmit: (notes: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function NotesForm({
  gigId,
  initialNotes = "",
  onSubmit,
  isSubmitting = false,
}: NotesFormProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isDirty, setIsDirty] = useState(false);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setIsDirty(value !== initialNotes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || isSubmitting) return;

    try {
      await onSubmit(notes.trim());
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconNotes className="h-5 w-5" />
          Job Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-muted-foreground"
            >
              Add notes about the repair (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Describe what was done, any issues encountered, parts used, etc..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={!isDirty || !notes.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <IconSend className="h-4 w-4 mr-2" />
                Save Notes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
