import React from 'react'

export default function Loading() {
  return (
    <article className="container animate-pulse py-16">
      {/* Hero Header Skeleton */}
      <div className="mx-auto mb-12 max-w-3xl space-y-4">
        <div className="bg-muted h-10 w-full rounded-md" />
        <div className="bg-muted h-10 w-3/4 rounded-md" />
        <div className="bg-muted mt-6 h-4 w-32 rounded-md" />
      </div>

      {/* Hero Image Skeleton */}
      <div className="bg-muted mb-16 aspect-video w-full rounded-2xl md:aspect-[21/9]" />

      {/* Content Skeleton */}
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-5/6 rounded" />
        <div className="bg-muted mt-8 h-4 w-full rounded" />
        <div className="bg-muted h-4 w-11/12 rounded" />
        <div className="bg-muted h-4 w-full rounded" />

        {/* Gallery Image Skeleton */}
        <div className="bg-muted my-12 h-80 w-full rounded-xl" />
      </div>
    </article>
  )
}
