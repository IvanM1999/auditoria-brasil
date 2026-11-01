export default function EmptyState({ icon: Icon, title, action, children }) {
  return (
    <div className="bg-card hairline px-6 py-10 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-7 w-7 text-muted-foreground" aria-hidden="true" />}
      <h2 className="font-display text-xl">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
