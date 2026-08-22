import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatDesireLevel,
  getValidDesireLevel,
} from "@/features/wishlist/lib/formatters";

type StarRatingProps = {
  ariaLabel: string;
  disabled: boolean;
  onChange: (value: number) => void;
  value: number;
};

export function StarRating({
  ariaLabel,
  disabled,
  onChange,
  value,
}: StarRatingProps) {
  return (
    <div
      aria-label={ariaLabel}
      className="mt-2 flex items-center gap-1"
      role="group"
    >
      {[1, 2, 3, 4, 5].map((level) => {
        const isSelected = level <= value;

        return (
          <Button
            aria-label={`${level}つ星`}
            className={`size-10 rounded-full p-0 ${
              isSelected
                ? "text-accent-emphasis hover:text-accent-foreground"
                : "text-accent-border hover:text-accent-emphasis"
            }`}
            disabled={disabled}
            key={level}
            onClick={() => onChange(level)}
            type="button"
            variant="ghost"
          >
            <Star
              className={isSelected ? "fill-current" : undefined}
              size={24}
            />
          </Button>
        );
      })}
      <span className="ml-2 text-sm font-bold text-selected-foreground">
        {value} / 5
      </span>
    </div>
  );
}

export function StarRatingDisplay({ value }: { value: number | null }) {
  const desireLevel = getValidDesireLevel(value);

  if (desireLevel === null) {
    return (
      <span
        aria-label="欲しい度 未設定"
        className="inline-flex items-center gap-0.5 text-muted-foreground/40"
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <Star key={level} size={17} />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-label={formatDesireLevel(desireLevel)}
      className="inline-flex items-center gap-0.5 text-accent-emphasis"
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <Star
          className={
            level <= desireLevel ? "fill-current" : "text-accent-border"
          }
          key={level}
          size={17}
        />
      ))}
    </span>
  );
}
