import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string | null; image: string | null };
};

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este restaurante todavía no tiene reseñas. ¡Sé el primero en reservar y calificarlo!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {reviews.map((review) => (
        <li key={review.id} className="flex gap-3">
          <Avatar className="size-9">
            <AvatarImage src={review.user.image ?? undefined} alt="" />
            <AvatarFallback>{review.user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {review.user.name ?? "Usuario LlamaEats"}
              </span>
              <span className="flex items-center gap-0.5 text-xs text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3 ${i < review.rating ? "fill-primary" : "fill-transparent text-muted-foreground"}`}
                  />
                ))}
              </span>
            </div>
            {review.comment && (
              <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
