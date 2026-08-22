import { Loader2 } from "lucide-react";

export function WishlistError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-medium leading-6 text-rose-700"
      role="alert"
    >
      {message}
    </div>
  );
}

export function WishlistLoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-sm font-bold text-zinc-500">
      <Loader2 className="animate-spin" size={18} />
      読み込み中
    </div>
  );
}

export function WishlistEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm font-medium text-zinc-500">
      欲しいものがまだありません。
    </div>
  );
}
