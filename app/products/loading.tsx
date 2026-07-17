export default function ProductsLoading() {
  return (
    <div className="section-container section-padding">
      <div className="h-8 w-48 rounded-md bg-(--color-surface) animate-pulse mb-(--space-8)" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-(--space-6)">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-(--space-3)">
            <div className="aspect-square rounded-md bg-(--color-surface) animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-(--color-surface) animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-(--color-surface) animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
