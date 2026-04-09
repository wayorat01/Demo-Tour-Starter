'use client'

import React, { useState, useEffect } from 'react'
import { Minus, Plus, Eye } from 'lucide-react'
import { Media } from '@/components/Media'
import type { WowtourProductCardBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_serviceCard4.css'

export type TourItem = any & {
    interTourSlug?: string | null
}
type WowtourServiceCard4Props = WowtourProductCardBlock & {
    tours: TourItem[]
    apiTitle?: string | null
    publicContext: PublicContextProps
}

/** Horizontal card with collapsible travel periods */
export const TourCard4Item: React.FC<{
    tour: TourItem
    borderRadius: number
}> = ({ tour, borderRadius }) => {
    const [periodsOpen, setPeriodsOpen] = useState(false)
    const toggle = tour.toggleSettings
    const coverImage = tour.coverImage as MediaType

    const hasPeriods = toggle?.showTravelPeriod && tour.travelPeriods && tour.travelPeriods.length > 0

    const fmt = (d: string) => {
        const date = new Date(d)
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
    }

    const detailUrl = tour.interTourSlug ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}` : (tour.directLink || '#')

    return (
        <div className="tour4-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
        <div className="tour4-card" style={{ borderRadius: `${borderRadius}px` }}>
            {/* Image — left */}
            <a href={detailUrl} className="tour4-image-wrap" style={{ textDecoration: 'none' }}>
                {coverImage && (
                    <Media resource={coverImage} fill imgClassName="tour4-cover-img" size="(max-width: 768px) 100vw, 40vw" />
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

            {/* Right side */}
            <div className="tour4-content">
                <div className="tour4-body">
                    {/* Title */}
                    <h3 className="tour4-title">{tour.tourTitle}</h3>

                    {/* Tour Code */}
                    {toggle?.showTourCode && tour.tourCode && (
                        <p className="tour4-code">
                            รหัสทัวร์ <strong>{tour.tourCode}</strong>
                        </p>
                    )}

                    {/* Description */}
                    {toggle?.showDescription && tour.tourDescription && (
                        <p className="tour4-desc">{tour.tourDescription}</p>
                    )}

                    {/* Collapsible Travel Periods */}
                    {hasPeriods && (
                        <div className="tour4-periods-section">
                            <button
                                type="button"
                                className="tour4-periods-toggle"
                                onClick={() => setPeriodsOpen(!periodsOpen)}
                            >
                                <span>( {tour.travelPeriods!.length} ช่วงเวลาเดินทาง)</span>
                                <span className={cn('tour4-periods-icon', periodsOpen && 'tour4-periods-icon--open')}>
                                    {periodsOpen ? <Minus size={14} /> : <Plus size={14} />}
                                </span>
                            </button>

                            {periodsOpen && (
                                <>
                                    <div className="tour4-periods-grid">
                                        {tour.travelPeriods!.slice(0, 5).map((p, i) => (
                                            <div key={i} className="tour4-period-item">
                                                {p.startDate && p.endDate
                                                    ? `${fmt(p.startDate)} - ${fmt(p.endDate)}`
                                                    : p.startDate
                                                        ? fmt(p.startDate)
                                                        : ''}
                                            </div>
                                        ))}
                                    </div>
                                    <a href={detailUrl} className="tour4-periods-link">
                                        คลิกดูรายละเอียดเพื่อดูข้อมูลเพิ่มเติม
                                    </a>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="tour4-footer">
                    <div className="tour4-footer-left">
                        {/* Airline logo */}
                        {toggle?.showAirline && tour.airlineLogo && (
                            <div className="tour4-airline-logo">
                                <Media
                                    resource={tour.airlineLogo as MediaType}
                                    imgClassName="tour4-airline-img"
                                />
                            </div>
                        )}

                        {/* Duration + Price */}
                        <span className="tour4-footer-info">
                            {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                                <>
                                    {tour.stayDay}
                                </>
                            )}
                            {toggle?.showStartPrice && tour.startPrice && (() => {
                                const formatPrice = (val: string | number) => {
                                    const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
                                    return isNaN(num) ? val : num.toLocaleString('en-US')
                                }
                                const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                                return (
                                    <>
                                        <span className="tour4-slash"> / </span>
                                        <span className="tour4-price-section">
                                            {'เริ่มเพียง '}
                                            {hasDiscount && (
                                                <span className="tour4-footer-price-original">
                                                    {formatPrice(tour.startPrice)}
                                                </span>
                                            )}
                                            <span className="tour4-footer-price">
                                                {hasDiscount
                                                    ? formatPrice(tour.discountPrice!)
                                                    : formatPrice(tour.startPrice)}
                                            </span>
                                            {' บ.'}
                                        </span>
                                    </>
                                )
                            })()}
                        </span>
                    </div>

                    {/* Detail button */}
                    {toggle?.showDetailButton && (
                        <a href={detailUrl} className="tour4-detail-btn">
                            ดูรายละเอียด
                        </a>
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}

export const WowtourServiceCard4: React.FC<WowtourServiceCard4Props> = ({
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

    const borderRadius = cardSettings?.borderRadius ?? 12
    const columns = parseInt(columnsPerRowProp as string || '1', 10)
    const itemsLimit = maxItemsToShowProp === 'showAll' || !maxItemsToShowProp
        ? Infinity
        : parseInt(maxItemsToShowProp as string, 10)

    const [showAll, setShowAll] = useState(false)

    if (!tours || tours.length === 0) return null


    const hasOverflow = tours.length > itemsLimit
    const visibleTours = showAll ? tours : tours.slice(0, itemsLimit === Infinity ? tours.length : itemsLimit)


    const renderTourCard = (tour: TourItem, index: number) => (
        <TourCard4Item key={index} tour={tour} borderRadius={borderRadius} />
    )



    const renderGridMode = () => (
        <>
            <div
                className={cn('tour4-grid', columns === 2 && 'tour4-grid--2col', columns === 1 && 'tour4-grid--1col')}
                style={{
                    gridTemplateColumns: `repeat(${Math.min(visibleTours.length, columns)}, 1fr)`,
                    ...(visibleTours.length < columns ? {
                        maxWidth: `${(visibleTours.length / columns) * 100}%`,
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
                        {showAll ? `ซ่อน (แสดง ${itemsLimit} รายการ)` : `ดูเพิ่มเติม (${tours.length - itemsLimit} รายการ)`}
                    </button>
                </div>
            )}
        </>
    )

    return (
        <section className="w-full pt-[36px] pb-12 md:pb-16">
            <div className="container">
                {/* Heading */}
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

                {/* Tour Cards Display */}
                <div className="w-full">
                    {renderGridMode()}
                </div>
            </div>
        </section>
    )
}

export default WowtourServiceCard4

