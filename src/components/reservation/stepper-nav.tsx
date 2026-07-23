import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Fecha y hora", "Elige tu mesa", "Pago"];

export function StepperNav({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const index = i + 1;
        const state = index < step ? "done" : index === step ? "active" : "pending";
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                state === "done" && "bg-primary text-primary-foreground",
                state === "active" && "bg-primary/20 text-primary ring-2 ring-primary",
                state === "pending" && "bg-muted text-muted-foreground",
              )}
            >
              {state === "done" ? <Check className="size-3.5" /> : index}
            </div>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                state === "pending" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {label}
            </span>
            {index < STEPS.length && <div className="h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
