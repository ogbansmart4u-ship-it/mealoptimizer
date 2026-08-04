export function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded mb-2" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  );
}

export function SkeletonGoalCard() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded-full" />
      </div>
      <div className="flex justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-gray-200 rounded-xl" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonGoalList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonGoalCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <SkeletonList count={2} />
    </div>
  );
}

export function SkeletonProfileCard() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-8 bg-gray-200 rounded mb-2 mx-auto w-12" />
            <div className="h-3 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 h-4 bg-gray-200 rounded" />
            <div className="w-4 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
