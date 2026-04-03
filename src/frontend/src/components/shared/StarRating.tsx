import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sizes = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" };
  const sizeClass = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered ?? value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={`focus:outline-none transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${sizeClass} transition-colors ${
                filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
