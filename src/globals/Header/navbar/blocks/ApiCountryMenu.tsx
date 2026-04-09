'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export type ApiCountryMenuProps = {
  id?: string | null
  blockType: string
  title?: string
  interToursData?: any[]
}

type CountryItem = {
  id: string
  title: string
  slug: string
  flagCode?: string
  tourCount?: number
  categoryTitle?: string
  categorySlug?: string
  categoryOrder?: number
}

type CategoryGroup = {
  title: string
  slug: string
  order: number
  countries: CountryItem[]
}

export const ApiCountryMenu: React.FC<ApiCountryMenuProps> = ({ title, interToursData = [] }) => {
  // จัดข้อมูลจาก props (ดึง server-side แล้ว)
  const categoryGroups = useMemo(() => {
    const docs = interToursData

    // หา "ประเทศหลัก" = document ที่ถูก reference เป็น parentCountry โดยตัวอื่น
    const parentIds = new Set<string>()
    docs.forEach((d: any) => {
      if (d.parentCountry) {
        const pid = typeof d.parentCountry === 'object' ? d.parentCountry.id : d.parentCountry
        parentIds.add(pid)
      }
    })

    // เอาเฉพาะประเทศหลัก + map ข้อมูล
    const parentCountries: CountryItem[] = docs
      .filter((d: any) => parentIds.has(d.id))
      .map((d: any) => {
        const cat = typeof d.category === 'object' ? d.category : null
        let catTitle = ''
        if (cat?.title) {
          catTitle = typeof cat.title === 'object'
            ? (cat.title.th || '')
            : cat.title
        }

        return {
          id: d.id,
          title: d.title || '',
          slug: d.slug || '',
          flagCode: (d.flagCode || '').toLowerCase(),
          tourCount: d.tourCount || 0,
          categoryTitle: catTitle,
          categorySlug: cat?.slug || '',
          categoryOrder: cat?.order ?? 999,
        }
      })
      .sort((a: CountryItem, b: CountryItem) => a.title.localeCompare(b.title, 'th'))

    // จัดกลุ่มตาม category แบบ dynamic
    const groupMap = new Map<string, CategoryGroup>()

    for (const country of parentCountries) {
      const key = country.categorySlug || '_other'
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          title: country.categoryTitle || 'อื่นๆ',
          slug: key,
          order: country.categoryOrder ?? 999,
          countries: [],
        })
      }
      groupMap.get(key)!.countries.push(country)
    }

    return Array.from(groupMap.values()).sort((a, b) => a.order - b.order)
  }, [interToursData])

  const getCountryList = (list: CountryItem[]) => {
    if (list.length === 0) return <div className="text-gray-400 text-sm italic">ไม่มีข้อมูล</div>

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
        {list.map((c, idx) => (
          <Link 
            key={`${c.slug}-${idx}`} 
            href={`/intertours/${c.slug}`}
            prefetch={false}
            className="flex items-center justify-between group hover:bg-gray-50/80 p-1.5 -mx-1.5 rounded-md transition-colors w-full"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {c.flagCode ? (
                <div className="w-5 h-5 relative rounded-full overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 border border-gray-200">
                  <Image 
                    src={`https://flagcdn.com/w40/${c.flagCode}.png`}
                    alt={`${c.title} flag`}
                    fill
                    sizes="20px"
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 border border-gray-200" />
              )}
              <span className="text-[14px] text-gray-800 font-medium group-hover:text-primary transition-colors flex-1 line-clamp-1">
                {c.title}
              </span>
              {(c.tourCount ?? 0) > 0 && (
                <span className="text-[11px] text-gray-400 font-normal ml-1">
                  ({c.tourCount})
                </span>
              )}
            </div>
            <ChevronRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    )
  }

  if (categoryGroups.length === 0) {
    return (
      <div className="w-full flex p-12 justify-center items-center">
        <div className="text-gray-400 text-sm italic">ไม่มีข้อมูลประเทศ</div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center">
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(categoryGroups.length, 3)} gap-y-8 gap-x-8 w-auto min-w-[280px] sm:min-w-[500px] lg:min-w-[750px] xl:min-w-[850px] max-w-[90vw] p-6 bg-white/95 backdrop-blur-sm rounded-md`}>
        {categoryGroups.map((group) => (
          <div key={group.slug}>
            <h3 className="mb-4 text-base font-bold text-gray-900 border-b border-red-600 pb-2">
              {group.title}
            </h3>
            {getCountryList(group.countries)}
          </div>
        ))}
      </div>
    </div>
  )
}


