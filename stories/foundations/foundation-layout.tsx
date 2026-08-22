import type { ReactNode } from "react";

export function FoundationPage({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="min-h-screen w-full bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase text-accent-emphasis">
            Design foundations
          </p>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}

export function FoundationSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="border-t border-border-strong pt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
