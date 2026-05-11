/**
 * @file loading.tsx (Categories listing)
 */

export default function CategoriesLoading() {
  return (
    <div className="space-y-6" aria-label="Loading categories" aria-busy="true">
      <div className="h-8 w-36 rounded bg-muted shimmer" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-muted shimmer" />
        ))}
      </div>
    </div>
  );
}
