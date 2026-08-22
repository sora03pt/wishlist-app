import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function WishlistError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="mt-4 rounded-md border border-destructive-border bg-destructive-surface px-3 py-3 text-sm font-medium leading-6 text-destructive"
      role="alert"
    >
      {message}
    </div>
  );
}

export function WishlistLoadingState() {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-10 text-sm font-bold text-muted-foreground"
      role="status"
    >
      <LoadingIndicator size={18} />
      読み込み中
    </div>
  );
}

export function WishlistEmptyState() {
  return (
    <div
      className="rounded-lg border border-dashed border-border-strong px-4 py-10 text-center text-sm font-medium text-muted-foreground"
      role="status"
    >
      欲しいものがまだありません。
    </div>
  );
}

export function WishlistStatus({ message }: { message: string }) {
  return (
    <p aria-atomic="true" className="sr-only" role="status">
      {message}
    </p>
  );
}
