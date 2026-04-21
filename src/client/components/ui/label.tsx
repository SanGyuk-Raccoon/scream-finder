import * as React from "react";
import { cn } from "@/client/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-medium tracking-[0.01em] text-foreground", className)}
      {...props}
    />
  );
}

export { Label };
