export function TypeBadge({ type }: { type: string }) {
  return <span className={`type type-${type}`}>{type}</span>;
}
