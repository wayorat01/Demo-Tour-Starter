'use client'

import React, { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'
import { Media } from '@/components/Media'
import type { WowtourProductCardBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_serviceCard3.css'

export type TourItem = any & {
    interTourSlug?: string | null
}

type WowtourServiceCard3Props = WowtourProductCardBlock & {
    tours: TourItem[]
    apiTitle?: string | null
    publicContext: PublicContextProps
}

/** Detailed card with airline logo, pink period, and price pill */
export const TourCard3Item: React.FC<{
    tour: TourItem
    borderRadius: number
}> = ({ tour, borderRadius }) => {
    const toggle = tour.toggleSettings
    const coverImage = tour.coverImage as MediaType

    // Format travel periods
    const formatPeriods = () => {
        if (!tour.travelPeriods || tour.travelPeriods.length === 0) return null
        const p = tour.travelPeriods[0]
        if (!p.startDate) return null
        const fmt = (d: string) => {
            const date = new Date(d)
            return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
        }
        let text = ''
        if (p.endDate) {
            text = `${fmt(p.startDate)} - ${fmt(p.endDate)}`
        } else {
            text = fmt(p.startDate)
        }
        if (tour.travelPeriods.length >= 1) {
            text += ` (${tour.travelPeriods.length} ช่วงเวลาเดินทาง)`
        }
        return text
    }

    const periodText = toggle?.showTravelPeriod ? formatPeriods() : null

    return (
        <div className="tour3-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
        <div className="tour3-card" style={{ borderRadius: `${borderRadius}px` }}>
            {/* Header: Cover Image + Badges */}
            <a
                href={
                    tour.interTourSlug ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}` : (tour.directLink || '#')
                }
                className="tour3-header"
                style={{ display: 'block', textDecoration: 'none' }}
            >
                {coverImage && (
                    <Media resource={coverImage} fill imgClassName="tour3-image" size="(max-width: 430px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                )}

                {/* Country tag — bottom left */}
                {toggle?.showCountryTag && tour.countryName && (
                    <span className="tour3-country-tag">{tour.countryName}</span>
                )}

                {/* Recommended badge — bottom right */}
                {toggle?.showRecommendedTag && tour.recommendedLabel && (
                    <span className="tour3-recommended">{tour.recommendedLabel}</span>
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
            <div className="tour3-body">
                {/* Airline */}
                {toggle?.showAirline && (tour.airlineLogo || tour.airlineName) && (
                    <div className="tour3-airline">
                        {tour.airlineLogo ? (
                            <div className="tour3-airline-logo-wrap">
                                <Media
                                    resource={tour.airlineLogo as MediaType}
                                    fill
                                    imgClassName="object-contain"
                                />
                            </div>
                        ) : (
                            <>
                                <Plane size={14} className="tour3-airline-icon" />
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{tour.airlineName}</span>
                            </>
                        )}
                    </div>
                )}

                {/* Title */}
                <h3 className="tour3-title">{tour.tourTitle}</h3>

                {/* Travel period — pink */}
                {periodText && (
                    <span className="tour3-period">{periodText}</span>
                )}

                {/* Divider */}
                <div className="tour3-divider" />

                {/* Description */}
                {toggle?.showDescription && tour.tourDescription && (
                    <p className="tour3-desc">{tour.tourDescription}</p>
                )}
            </div>

            {/* Footer: Duration + Price pill */}
            <div className="tour3-footer">
                {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                    <span className="tour3-duration">
                        {tour.stayDay}
                    </span>
                )}

                {toggle?.showStartPrice && tour.startPrice && (() => {
                    const formatPrice = (val: string | number) => {
                        const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
                        return isNaN(num) ? val : num.toLocaleString('en-US')
                    }
                    const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                    return (
                        <span className={`tour3-price-pill ${hasDiscount ? 'tour3-price-pill--discount' : ''}`}>
                            <span className="tour3-price-pill-row1">
                                <span className="tour3-price-pill-label">เริ่ม</span>
                                {hasDiscount && (
                                    <span className="tour3-price-original">{formatPrice(tour.startPrice)}</span>
                                )}
                            </span>
                            <span className="tour3-price-pill-row2">
                                <span className="tour3-price-pill-amount">
                                    {hasDiscount
                                        ? formatPrice(tour.discountPrice!)
                                        : formatPrice(tour.startPrice)}
                                </span>
                                <span className="tour3-price-pill-unit">บ.</span>
                            </span>
                        </span>
                    )
                })()}
            </div>
        </div>
        </div>
    )
}

export const WowtourServiceCard3: React.FC<WowtourServiceCard3Props> = ({
    headingSettings,
    apiTitle,
    tours,
    cardSettings,

    columnsPerRow: columnsPerRowProp,
    maxItemsToShow: maxItemsToShowProp,
    publicContext,
}) => {
    const heading = apiTitle
    const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
    const headingIcon = headingSettings?.headingIcon
    const showDescription = headingSettings?.showDescription ?? false
    const description = headingSettings?.description

    const borderRadius = cardSettings?.borderRadius ?? 16
    const columns = parseInt(columnsPerRowProp as string || '2', 10)
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



    // Determine effective columns based on responsive breakpoints
    const getEffectiveCols = () => {
        if (itemsLimit === Infinity) return 4
        if (windowWidth <= 430) return 1
        if (windowWidth <= 768 && itemsLimit >= 3) return 2
        if (windowWidth <= 1024 && itemsLimit >= 4) return 3
        return itemsLimit
    }
    const effectiveCols = getEffectiveCols()

    // Cap visible items to full rows only (avoid orphans)
    const effectiveLimit = (() => {
        if (itemsLimit === Infinity || showAll) return tours.length
        // Round down to nearest multiple of effectiveCols
        const fullRows = Math.floor(itemsLimit / effectiveCols) * effectiveCols
        return fullRows > 0 ? fullRows : effectiveCols
    })()

    const hasOverflow = itemsLimit !== Infinity && tours.length > itemsLimit
    const visibleTours = tours.slice(0, effectiveLimit)
    const hiddenCount = tours.length - effectiveLimit



    const renderTourCard = (tour: TourItem, index: number) => (
        <TourCard3Item key={index} tour={tour} borderRadius={borderRadius} />
    )



    // For grid mode, use maxItemsToShow as column count
    const gridColumns = itemsLimit === Infinity ? 4 : itemsLimit

    const renderGridMode = () => (
        <>
            <div
                className={cn('tour3-grid', gridColumns >= 4 && 'tour3-grid--many-cols', gridColumns >= 3 && 'tour3-grid--3plus-cols', gridColumns === 5 && 'tour3-grid--5cols', gridColumns === 2 && 'tour3-grid--2cols')}
                style={{
                    gridTemplateColumns: `repeat(${Math.min(visibleTours.length, gridColumns)}, 1fr)`,
                    ...(visibleTours.length < gridColumns ? {
                        maxWidth: `${(visibleTours.length / gridColumns) * 100}%`,
                        margin: '0 auto'
                    } : {})
                } as React.CSSProperties}
            >
                {visibleTours.map((tour, index) => renderTourCard(tour, index))}
            </div>

            {/* Show more/less */}
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

                <div className="w-full">
                    {renderGridMode()}
                </div>
            </div>
        </section>
    )
}

export default WowtourServiceCard3
