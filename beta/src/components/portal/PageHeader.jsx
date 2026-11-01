export default function PageHeader({ kicker, title, description }) {
  return (
    <header className="grid gap-3 border-b border-border pb-7 mb-8 md:grid-cols-[minmax(180px,0.65fr)_1.35fr] md:gap-10">
      {kicker && (
        <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-accent">
          {kicker}
        </span>
      )}
      <div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">{title}</h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
