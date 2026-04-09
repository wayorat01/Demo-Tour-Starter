import React from 'react'

export default function Loading() {
  return (
    <div className="container animate-pulse py-12 md:py-24">
      <div className="mb-12 space-y-4">
        <div className="bg-muted h-10 w-64 rounded-md" />
        <div className="bg-muted h-4 w-96 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="bg-muted h-64 w-full rounded-xl" />
            <div className="bg-muted h-5 w-3/4 rounded-md" />
            <div className="bg-muted h-4 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
