'use client'

import React, { useState, useEffect } from 'react'

import { ChevronLeft, ChevronRight, Clock, Plane, CalendarDays, FileText, FileIcon, ImageIcon, Eye } from 'lucide-react'
import { Media } from '@/components/Media'
import type { WowtourProductCardBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_serviceCard2.css'

export type TourItem = any & {
    interTourSlug?: string | null
}

type WowtourServiceCard2Props = WowtourProductCardBlock & {
    tours: TourItem[]
    apiTitle?: string | null
    publicContext: PublicContextProps
}

/** Get the URL from a link group */
const getLinkUrl = (
    linkGroup: { type?: string | null; url?: string | null; file?: MediaType | string | null } | null | undefined,
): string | null => {
    if (!linkGroup) return null
    if (linkGroup.type === 'upload' && linkGroup.file) {
        const media = linkGroup.file as MediaType
        return media.url || null
    }
    return linkGroup.url || null
}

/** Compact mobile card matching the provided design */
export const TourCard2Item: React.FC<{
    tour: TourItem
    borderRadius: number
}> = ({ tour, borderRadius }) => {
    const toggle = tour.toggleSettings
    const coverImage = tour.coverImage as MediaType

    // Format travel period
    const formatPeriod = () => {
        if (!tour.travelPeriods || tour.travelPeriods.length === 0) return null
        const p = tour.travelPeriods[0]
        if (!p.startDate) return null
        const fmt = (d: string) => {
            const date = new Date(d)
            return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
        }
        if (p.endDate) return `${fmt(p.startDate)} - ${fmt(p.endDate)}`
        return fmt(p.startDate)
    }

    const periodText = toggle?.showTravelPeriod ? formatPeriod() : null

    return (
        <div className="tour2-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
        <div className="tour2-card" style={{ borderRadius: `${borderRadius}px` }}>
            {/* Header: Cover Image + Badges */}
            <a
                href={
                    tour.interTourSlug ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}` : (tour.directLink || '#')
                }
                className="tour2-header"
                style={{ display: 'block', textDecoration: 'none' }}
            >
                {coverImage && (
                    <Media resource={coverImage} fill imgClassName="tour2-image" size="(max-width: 430px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                )}

                {/* Tour Code — top left */}
                {toggle?.showTourCode && tour.tourCode && (
                    <span className="tour2-svc-code">
                        รหัสทัวร์ {tour.tourCode}
                    </span>
                )}

                {/* Recommended badge — top right */}
                {toggle?.showRecommendedTag && tour.recommendedLabel && (
                    <span className="tour2-recommended">
                        {tour.recommendedLabel}
                    </span>
                )}

                {/* Discount Percent Badge */}
                {(tour as any).discountPercent && (
                    <span style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                        color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                        padding: '3px 8px', borderRadius: '6px',
                        lineHeight: 1.2, zIndex: 2,
                        boxShadow: '0 2px 8px rgba(255,71,87,0.4)',
                    }}>
                        -{(tour as any).discountPercent}%
                    </span>
                )}
            </a>

            {/* Body */}
            <div className="tour2-body">
                {/* Country Tag */}
                {toggle?.showCountryTag && tour.countryName && (
                    <span className="tour2-country">{tour.countryName}</span>
                )}

                {/* Title */}
                <h3 className="tour2-title">{tour.tourTitle}</h3>

                {/* Duration */}
                {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                    <div className="tour2-info-row">
                        <Clock size={18} />
                        <span>
                            {tour.stayDay}
                        </span>
                    </div>
                )}

                {/* Airline */}
                {toggle?.showAirline && tour.airlineName && (
                    <div className="tour2-info-row">
                        {tour.airlineLogo ? (
                            <div className="relative" style={{ width: 28, height: 20 }}>
                                <Media
                                    resource={tour.airlineLogo as MediaType}
                                    fill
                                    imgClassName="tour2-airline-logo"
                                />
                            </div>
                        ) : (
                            <Plane size={18} />
                        )}
                        <span>{tour.airlineName}</span>
                    </div>
                )}

                {/* Description */}
                {toggle?.showDescription && tour.tourDescription && (
                    <p className="tour2-desc">{tour.tourDescription}</p>
                )}

                {/* Travel period */}
                {periodText && (
                    <div className="tour2-period">
                        <CalendarDays size={18} />
                        <span>{periodText}</span>
                        {tour.travelPeriods && tour.travelPeriods.length > 0 && (
                            <span className="tour2-period-count">({tour.travelPeriods.length} ช่วงเวลา)</span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer: Price */}
            {toggle?.showStartPrice && tour.startPrice && (() => {
                const formatPrice = (val: string | number) => {
                    const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
                    return isNaN(num) ? val : num.toLocaleString('en-US')
                }
                return (
                    <>
                        <div className="tour2-divider" />
                        <div className="tour2-footer">
                            <span className="tour2-price-label">เริ่ม</span>
                            {toggle?.showDiscountPrice && tour.discountPrice ? (
                                <>
                                    <span className="tour2-price-original">{formatPrice(tour.startPrice)}</span>
                                    <span className="tour2-price">{formatPrice(tour.discountPrice)}</span>
                                </>
                            ) : (
                                <span className="tour2-price">{formatPrice(tour.startPrice)}</span>
                            )}
                            <span className="tour2-price-unit">บ.</span>
                        </div>
                    </>
                )
            })()}
        </div>
        </div>
    )
}

export const WowtourServiceCard2: React.FC<WowtourServiceCard2Props> = ({
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
    const borderRadius = cardSettings?.borderRadius ?? 16
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

    const renderTourCard = (tour: TourItem, index: number) => (
        <TourCard2Item key={index} tour={tour} borderRadius={borderRadius} />
    )



    const renderGridMode = () => (
        <>
            <div
                className="tour2-grid"
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
                                <h2 className="text-2xl font-medium">{heading}</h2>
                            )}
                        </div>

                        {showDescription && description && (
                            <p className="text-muted-foreground max-w-4xl mt-2">{description}</p>
                        )}
                    </div>
                )}

                {/* Tour Cards */}
                <div className="w-full">
                    {renderGridMode()}
                </div>
            </div>
        </section>
    )
}

export default WowtourServiceCard2
