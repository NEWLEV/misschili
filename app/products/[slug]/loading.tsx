export default function ProductDetailLoading() {
  return (
    <div className="section-container section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-(--space-10)">
        <div className="aspect-square rounded-md bg-(--color-surface) animate-pulse" />
        <div className="space-y-(--space-4)">
          <div className="h-8 w-2/3 rounded bg-(--color-surface) animate-pulse" />
          <div className="h-5 w-1/3 rounded bg-(--color-surface) animate-pulse" />
          <div className="h-24 w-full rounded bg-(--color-surface) animate-pulse" />
          <div className="h-12 w-1/2 rounded-md bg-(--color-surface) animate-pulse" />
        </div>
      </div>
    </div>
  );
}
