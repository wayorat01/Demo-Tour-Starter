import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container min-h-[70vh] flex flex-col items-center justify-center py-16 md:py-24" key="not-found">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-12 md:gap-12 items-center max-w-6xl mx-auto w-full">
        {/* Left Side: Content */}
        <div className="flex flex-col items-start order-2 md:order-1 text-center md:text-left space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              ฮัลโหล! <br/>คุณดูเหมือนจะหลงทาง
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              หน้าที่คุณกำลังตามหาอาจถูกย้าย หรือไม่มีอยู่จริงในระบบ 
              ลองกลับไปตั้งต้นที่หน้าหลัก หรือค้นหาโปรแกรมทัวร์ใหม่ดูสิครับ
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center md:justify-start pt-4">
            <Button asChild variant="default" size="lg" className="h-14 px-8 text-lg font-medium hover:scale-105 transition-transform">
              <Link href="/">กลับหน้าหลัก</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-medium bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all">
              <Link href="/search-tour">ค้นหาโปรแกรมทัวร์</Link>
            </Button>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="flex justify-center md:justify-end order-1 md:order-2 animate-in fade-in zoom-in-95 duration-1000 delay-150">
          <div className="relative w-full aspect-[724/906]">
            <Image
              src="/images/404-illustration.png"
              alt="404 Page Not Found Illustration"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 800px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
