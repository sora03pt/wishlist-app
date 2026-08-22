import { useId } from "react";
import { Star } from "lucide-react";
import {
  formatDesireLevel,
  getValidDesireLevel,
} from "@/features/wishlist/lib/formatters";

type StarRatingProps = {
  disabled: boolean;
  label: string;
  onChange: (value: number) => void;
  value: number;
};

export function StarRating({
  disabled,
  label,
  onChange,
  value,
}: StarRatingProps) {
  const groupName = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((level) => {
          const isFilled = level <= value;

          return (
            <label
              className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
              key={level}
            >
              <input
                checked={value === level}
                className="peer sr-only"
                disabled={disabled}
                name={groupName}
                onChange={() => onChange(level)}
                type="radio"
                value={level}
              />
              <span
                className={`inline-flex size-10 items-center justify-center rounded-full transition peer-focus-visible:ring-4 peer-focus-visible:ring-focus ${
                  isFilled
                    ? "text-accent-emphasis"
                    : "text-muted-foreground"
                } ${disabled ? "opacity-50" : "hover:bg-accent"}`}
              >
                <Star
                  aria-hidden="true"
                  className={isFilled ? "fill-current" : undefined}
                  size={24}
                />
                <span className="sr-only">{level}つ星</span>
              </span>
            </label>
          );
        })}
        <span
          aria-hidden="true"
          className="ml-2 text-sm font-bold text-selected-foreground"
        >
          {value} / 5
        </span>
      </div>
    </fieldset>
  );
}

export function StarRatingDisplay({ value }: { value: number | null }) {
  const desireLevel = getValidDesireLevel(value);

  if (desireLevel === null) {
    return (
      <span
        aria-label="欲しい度 未設定"
        className="inline-flex items-center gap-0.5 text-muted-foreground"
        role="img"
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <Star aria-hidden="true" key={level} size={17} />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-label={formatDesireLevel(desireLevel)}
      className="inline-flex items-center gap-0.5 text-accent-emphasis"
      role="img"
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <Star
          aria-hidden="true"
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
