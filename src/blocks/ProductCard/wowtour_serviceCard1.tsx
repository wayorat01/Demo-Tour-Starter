'use client'

import React, { useState, useEffect } from 'react'
import { FileText, FileIcon, ImageIcon, Eye } from 'lucide-react'
import { Media } from '@/components/Media'
import type { WowtourProductCardBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_serviceCard1.css'

export type TourItem = any & {
    interTourSlug?: string | null
}

type WowtourServiceCard1Props = WowtourProductCardBlock & {
    tours: TourItem[]
    apiTitle?: string | null
    publicContext: PublicContextProps
}

/** Get the URL from a link group (url or upload) */
const getLinkUrl = (linkGroup: { type?: string | null; url?: string | null; file?: MediaType | string | null } | null | undefined): string | null => {
    if (!linkGroup) return null
    if (linkGroup.type === 'upload' && linkGroup.file) {
        const media = linkGroup.file as MediaType
        return media.url || null
    }
    return linkGroup.url || null
}

/** Sub-component: Tour Card with internal tab state */
export const TourCardItem: React.FC<{
    tour: TourItem
    borderRadius: number
}> = ({ tour, borderRadius }) => {
    const [activeTab, setActiveTab] = useState<'detail' | 'period'>('detail')
    const toggle = tour.toggleSettings
    const coverImage = tour.coverImage as MediaType

    const hasDescription = toggle?.showDescription && tour.tourDescription
    const hasPeriods = toggle?.showTravelPeriod && tour.travelPeriods && tour.travelPeriods.length > 0
    const showTabs = hasDescription || hasPeriods

    return (
        <div
            className="svc-card-wrap"
            style={{ borderRadius: `${borderRadius + 6}px` }}
        >
        <div
            className="svc-card"
            style={{ borderRadius: `${borderRadius}px` }}
        >
            {/* Header: Cover Image + Tags */}
            <a
                href={
                    tour.interTourSlug ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}` : (tour.directLink || '#')
                }
                className="svc-header svc-header-link"
            >
                {coverImage && (
                    <Media
                        resource={coverImage}
                        fill
                        imgClassName="svc-image"
                        size="(max-width: 430px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                )}

                {/* Country Tag */}
                {toggle?.showCountryTag && tour.countryName && (
                    <span className="svc-tag svc-tag--country">
                        {tour.countryName}
                    </span>
                )}

                {/* Recommended Tag */}
                {toggle?.showRecommendedTag && tour.recommendedLabel && (
                    <span className="svc-tag svc-tag--recommended">
                        <img
                            src="/images/icons/fire-recommended.png"
                            alt={tour.recommendedLabel}
                            className="svc-recommended-icon"
                        />
                    </span>
                )}

                {/* Tour Code */}
                {toggle?.showTourCode && tour.tourCode && (
                    <span className="svc-code">
                        {tour.tourCode}
                    </span>
                )}

                {/* Discount Percent Badge */}
                {(tour as any).discountPercent && (
                    <span className="svc-discount-badge">
                        -{(tour as any).discountPercent}%
                    </span>
                )}
            </a>

            {/* Body */}
            <div className="svc-body">
                {/* Tour Title */}
                <h3 className="svc-title">{tour.tourTitle}</h3>

                {/* Tabs: รายละเอียด / ช่วงเวลา */}
                {showTabs && (
                    <div className="svc-tabs">
                        <div className="svc-tabs-header">
                            <button
                                type="button"
                                className={cn('svc-tab-btn', activeTab === 'detail' && 'svc-tab-btn--active')}
                                onClick={() => setActiveTab('detail')}
                            >
                                รายละเอียด
                            </button>
                            {hasPeriods && (
                                <button
                                    type="button"
                                    className={cn('svc-tab-btn', activeTab === 'period' && 'svc-tab-btn--active')}
                                    onClick={() => setActiveTab('period')}
                                >
                                    ช่วงเวลา
                                </button>
                            )}
                        </div>

                        <div className="svc-tabs-content">
                            {/* Tab: รายละเอียด */}
                            {activeTab === 'detail' && hasDescription && (
                                <p className="svc-desc">{tour.tourDescription}</p>
                            )}

                            {/* Tab: ช่วงเวลา */}
                            {activeTab === 'period' && hasPeriods && (
                                <div className="svc-periods">
                                    {tour.travelPeriods!.slice(0, 5).map((p, i) => {
                                        const fmt = (d: string) => {
                                            const date = new Date(d)
                                            return date.toLocaleDateString('th-TH', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })
                                        }
                                        return (
                                            <div key={i} className="svc-period-item">
                                                {p.startDate && p.endDate
                                                    ? `${fmt(p.startDate)} - ${fmt(p.endDate)}`
                                                    : p.startDate
                                                        ? fmt(p.startDate)
                                                        : ''}
                                            </div>
                                        )
                                    })}
                                    <div className="svc-period-count">
                                        ( {tour.travelPeriods!.length} ช่วงเวลาเดินทาง )
                                    </div>
                                    {tour.travelPeriods!.length > 5 && (
                                        <a
                                            href={tour.interTourSlug ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}` : (tour.directLink || '#')}
                                            className="svc-period-count"
                                            style={{ color: 'var(--primary)', textDecoration: 'none' }}
                                        >
                                            ดูเพิ่มเติมอีก {tour.travelPeriods!.length - 5} ช่วง →
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Duration + Price Row */}
                <div className="svc-info-row">
                    {toggle?.showAirline && tour.airlineLogo && (
                        <div className="svc-airline relative shrink-0" style={{ width: 28, height: 20 }}>
                            <Media
                                resource={tour.airlineLogo as MediaType}
                                fill
                                imgClassName="object-contain"
                            />
                        </div>
                    )}
                    {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                        <span className="svc-duration">
                            {tour.stayDay}
                        </span>
                    )}
                    {/* Price Section */}
                    {toggle?.showStartPrice && tour.startPrice && (() => {
                        const formatPrice = (val: string | number) => {
                            const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
                            return isNaN(num) ? val : num.toLocaleString('en-US')
                        }
                        return (
                            <div className="svc-price-section">
                                {toggle?.showDiscountPrice && tour.discountPrice ? (
                                    <>
                                        <span className="svc-price-original">{formatPrice(tour.startPrice)} บาท</span>
                                        <span className="svc-price">
                                            เริ่ม <strong>{formatPrice(tour.discountPrice)}</strong> บาท
                                        </span>
                                    </>
                                ) : (
                                    <span className="svc-price">
                                        เริ่ม <strong>{formatPrice(tour.startPrice)}</strong> บาท
                                    </span>
                                )}
                            </div>
                        )
                    })()}
                </div>
            </div>

            {/* Footer: Buttons */}
            <div className="svc-footer">
                {(() => {
                    // New select: cardDownloadButton (pdf | word | banner | none)
                    const dlBtn = (toggle as any)?.cardDownloadButton
                    // Backward compat: fallback to old checkboxes
                    const showPdf = dlBtn === 'pdf' || (!dlBtn && (toggle as any)?.showPdfButton)
                    const showWord = dlBtn === 'word' || (!dlBtn && (toggle as any)?.showWordButton)
                    const showBanner = dlBtn === 'banner' || (!dlBtn && (toggle as any)?.showBannerButton)

                    return (
                        <>
                            {showPdf && (
                                <a
                                    href={getLinkUrl(tour.pdfLink) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="svc-btn svc-btn--pdf"
                                >
                                    <FileText size={14} />
                                    PDF
                                </a>
                            )}
                            {showWord && (
                                <a
                                    href={getLinkUrl(tour.wordLink) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="svc-btn svc-btn--word"
                                >
                                    <FileIcon size={14} />
                                    Word
                                </a>
                            )}
                            {showBanner && (
                                <a
                                    href={getLinkUrl(tour.bannerLink) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="svc-btn svc-btn--banner"
                                >
                                    <ImageIcon size={14} />
                                    Banner
                                </a>
                            )}
                        </>
                    )
                })()}
                {toggle?.showDetailButton && (
                    <a
                        href={
                            tour.interTourSlug ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}` : (tour.directLink || '#')
                        }
                        className="svc-btn svc-btn--detail"
                    >
                        <Eye size={14} />
                        ดูรายละเอียด
                    </a>
                )}
            </div>
        </div>
        </div>
    )
}

export const WowtourServiceCard1: React.FC<WowtourServiceCard1Props> = ({
    headingSettings,
    apiTitle,
    tours,
    cardSettings,

    columnsPerRow: columnsPerRowProp,
    maxItemsToShow: maxItemsToShowProp,
    publicContext,
}) => {
    // Heading
    const heading = apiTitle
    const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
    const headingIcon = headingSettings?.headingIcon
    const showDescription = headingSettings?.showDescription ?? false
    const description = headingSettings?.description

    // Card Settings
    const borderRadius = cardSettings?.borderRadius ?? 12
    const columns = parseInt(columnsPerRowProp as string || '4', 10)
    const itemsLimit = maxItemsToShowProp === 'showAll' || !maxItemsToShowProp
        ? Infinity
        : parseInt(maxItemsToShowProp as string, 10)

    const [showAll, setShowAll] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWindowWidth(window.innerWidth)
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (!tours || tours.length === 0) return null



    // Responsive columns for grid mode
    const getEffectiveCols = () => {
        if (itemsLimit === Infinity) return 4
        if (windowWidth <= 430) return 1
        if (windowWidth <= 768 && itemsLimit >= 3) return 2
        if (windowWidth <= 1024 && itemsLimit >= 4) return 3
        return itemsLimit
    }
    const effectiveCols = getEffectiveCols()

    const effectiveLimit = (() => {
        if (itemsLimit === Infinity || showAll) return tours.length
        const fullRows = Math.floor(itemsLimit / effectiveCols) * effectiveCols
        return fullRows > 0 ? fullRows : effectiveCols
    })()

    const hasOverflow = itemsLimit !== Infinity && tours.length > itemsLimit
    const visibleTours = tours.slice(0, effectiveLimit)
    const hiddenCount = tours.length - effectiveLimit



    const gridColumns = itemsLimit === Infinity ? 4 : itemsLimit

    // Render a single Tour Card
    const renderTourCard = (tour: TourItem, index: number) => (
        <TourCardItem
            key={index}
            tour={tour}
            borderRadius={borderRadius}
        />
    )



    const renderGridMode = () => (
        <>
            <div
                className="svc-grid"
                style={{
                    gridTemplateColumns: `repeat(${Math.min(visibleTours.length, gridColumns)}, 1fr)`,
                    ...(visibleTours.length < gridColumns ? {
                        maxWidth: `${(visibleTours.length / gridColumns) * 100}%`,
                        margin: '0 auto'
                    } : {})
                }}
            >
                {visibleTours.map((tour, index) => renderTourCard(tour, index))}
            </div>

            {hasOverflow && (
                <div className="flex justify-center mt-6">
                    <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="px-6 py-2 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary/5 transition-colors"
                    >
                        {showAll ? `ซ่อน (แสดง ${effectiveLimit} รายการ)` : `ดูเพิ่มเติม (${hiddenCount} รายการ)`}
                    </button>
                </div>
            )}
        </>
    )

    return (
        <section className="w-full pt-[36px] pb-12 md:pb-16">
            <div className="container">
                {/* Heading Section */}
                {(heading || (showDescription && description)) && (
                    <div className="flex flex-col items-center text-center mb-4 md:mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            {showHeadingIcon && headingIcon && (
                                <div className="w-8 h-8 relative">
                                    <Media
                                        resource={headingIcon as MediaType}
                                        fill
                                        imgClassName="object-contain"
                                    />
                                </div>
                            )}
                            {heading && (
                                <h2 className="text-2xl font-medium">
                                    {heading}
                                </h2>
                            )}
                        </div>

                        {showDescription && description && (
                            <p className="text-muted-foreground max-w-4xl mt-2">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* Tour Cards Display */}
                <div className="w-full">
                    {renderGridMode()}
                </div>
            </div>
        </section>
    )
}

export default WowtourServiceCard1
