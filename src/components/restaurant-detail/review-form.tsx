"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReviewAction } from "@/actions/reviews/create-review";
import { cn } from "@/lib/utils";

export function ReviewForm({ reservationCode }: { reservationCode: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { execute, isExecuting } = useAction(createReviewAction, {
    onSuccess() {
      toast.success("¡Gracias por tu reseña!");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo enviar la reseña.");
    },
  });

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-sm font-medium text-foreground">¿Cómo estuvo tu experiencia?</p>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button key={value} type="button" onClick={() => setRating(value)}>
              <Star
                className={cn(
                  "size-6 transition-colors",
                  value <= rating ? "fill-terracota-400 text-terracota-400" : "text-muted-foreground",
                )}
              />
            </button>
          );
        })}
      </div>
      <Textarea
        className="mt-3"
        placeholder="Cuéntanos más (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        className="mt-3"
        disabled={rating === 0 || isExecuting}
        onClick={() => execute({ reservationCode, rating, comment: comment || undefined })}
      >
        {isExecuting ? "Enviando..." : "Enviar reseña"}
      </Button>
    </div>
  );
}
