import React from 'react'

export default function Loading() {
  return (
    <div className="container flex animate-pulse flex-col gap-6 py-8">
      {/* Search Header Skeleton */}
      <div className="bg-muted h-16 w-full rounded-xl" />

      {/* Results Controls Skeleton */}
      <div className="flex items-center justify-between border-b py-4">
        <div className="bg-muted h-5 w-32 rounded" />
        <div className="bg-muted h-10 w-48 rounded" />
      </div>

      {/* Grid Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border p-3 shadow-sm">
            <div className="bg-muted h-48 w-full rounded-lg" />
            <div className="bg-muted mt-2 h-5 w-full rounded-md" />
            <div className="bg-muted h-5 w-2/3 rounded-md" />
            <div className="bg-muted mt-4 h-4 w-1/3 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
