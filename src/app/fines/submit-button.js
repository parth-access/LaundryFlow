"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

// Disabled while its form is saving, so a double-click does not send it twice.
export default function SubmitButton({ children, ...props }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {children}
    </Button>
  );
}
