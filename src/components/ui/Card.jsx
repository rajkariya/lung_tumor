// components/ui/card.jsx or card.tsx
import React from "react";
import { cn } from "@/lib/utils"; // Optional: utility for merging class names

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-md border p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
