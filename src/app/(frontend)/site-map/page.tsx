import React from 'react'
import Link from 'next/link'
import { Home, Map, Globe, FileText } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const metadata = {
    title: 'แผนผังเว็บไซต์ (Sitemap)',
    description: 'แผนผังเว็บไซต์ แสดงโครงสร้างหน้าเว็บทั้งหมดเพื่อให้ง่ายต่อการค้นหาและเข้าถึง',
}

export default async function SitemapPage() {
    const payload = await getPayload({ config: configPromise })

    // 1. Fetch Pages
    const pagesResult = await payload.find({
        collection: 'pages',
        locale: 'th',
        where: {
            _status: { equals: 'published' },
        },
        limit: 100,
        sort: 'title',
    })

    // 2. Fetch Tour Categories
    const categoriesResult = await payload.find({
        collection: 'tour-categories',
        locale: 'th',
        limit: 100,
        sort: 'title',
    })

    // 3. Fetch Intertours
    const toursResult = await payload.find({
        collection: 'intertours',
        locale: 'th',
        where: {
            isActive: { equals: true },
        },
        limit: 100,
        sort: 'title',
    })

    // 4. Fetch Posts (Blog)
    const postsResult = await payload.find({
        collection: 'posts',
        locale: 'th',
        where: {
            _status: { equals: 'published' },
        },
        limit: 100,
        sort: 'title',
    })

    const pages = pagesResult.docs || []
    const categories = categoriesResult.docs || []
    const tours = toursResult.docs || []
    const posts = postsResult.docs || []

    return (
        <div className="container py-12 md:py-20">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl md:text-4xl font-bold mb-3 text-center">แผนผังเว็บไซต์ (Sitemap)</h1>
                <p className="text-muted-foreground text-center mb-10 text-sm md:text-base">
                    ภาพรวมของหน้าเว็บไซต์และโปรแกรมทัวร์ทั้งหมดของเรา
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Main Pages */}
                    <div className="sitemap-section">
                        <h2 className="text-base font-semibold mb-4 pb-2 border-b-2 border-primary/20 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                <Home className="size-4" strokeWidth={2.5} />
                            </span>
                            หน้าหลัก
                        </h2>
                        <ul className="space-y-2">
                            {pages.map((page) => (
                                <li key={page.id}>
                                    <Link
                                        href={page.slug === 'home' || page.slug === 'index' ? '/' : `/${page.slug}`}
                                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <span className="size-1.5 rounded-full bg-primary/40" />
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tour Categories */}
                    {categories.length > 0 && (
                        <div className="sitemap-section">
                            <h2 className="text-base font-semibold mb-4 pb-2 border-b-2 border-primary/20 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                    <Map className="size-4" strokeWidth={2.5} />
                                </span>
                                หมวดหมู่เส้นทางทัวร์
                            </h2>
                            <ul className="space-y-2">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            href={`/search-tour?category=${category.slug || category.id}`}
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <span className="size-1.5 rounded-full bg-primary/40" />
                                            {category.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Intertours */}
                    {tours.length > 0 && (
                        <div className="sitemap-section">
                            <h2 className="text-base font-semibold mb-4 pb-2 border-b-2 border-primary/20 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                    <Globe className="size-4" strokeWidth={2.5} />
                                </span>
                                โปรแกรมทัวร์ทั้งหมด
                            </h2>
                            <ul className="space-y-2">
                                {tours.map((tour) => (
                                    <li key={tour.id}>
                                        <Link
                                            href={`/intertours/${tour.slug}`}
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <span className="size-1.5 rounded-full bg-primary/40" />
                                            {tour.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Posts (Blog) */}
                    {posts.length > 0 && (
                        <div className="sitemap-section">
                            <h2 className="text-base font-semibold mb-4 pb-2 border-b-2 border-primary/20 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                    <FileText className="size-4" strokeWidth={2.5} />
                                </span>
                                บทความ & ข่าวสาร
                            </h2>
                            <ul className="space-y-2">
                                {posts.map((post) => (
                                    <li key={post.id}>
                                        <Link
                                            href={`/blog/${post.slug || post.id}`}
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <span className="size-1.5 rounded-full bg-primary/40" />
                                            {post.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
