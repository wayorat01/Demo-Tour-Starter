'use client'

import React, { useState } from 'react'
import { FileText, FileIcon, ImageIcon, Eye, Hotel, UtensilsCrossed } from 'lucide-react'
import { Media } from '@/components/Media'
import type { WowtourProductCardBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_serviceCard6.css'

export type TourItem = any & {
    interTourSlug?: string | null
}

type WowtourServiceCard6Props = WowtourProductCardBlock & {
    tours: TourItem[]
    apiTitle?: string | null
    publicContext: PublicContextProps
}

/** Get the URL from a link group (url or upload) */
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

/** Format a number with commas */
const formatPrice = (val: string | number | null | undefined): string => {
    if (val == null || val === '') return '-'
    const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
    return isNaN(num) ? String(val) : num.toLocaleString('en-US')
}

/** Format date in Thai short */
const fmtDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

/** Single tour card item */
export const TourCard6Item: React.FC<{
    tour: TourItem
    borderRadius: number
    footerText?: string | null
}> = ({ tour, borderRadius, footerText }) => {
    const toggle = tour.toggleSettings
    const coverImage = tour.coverImage as MediaType
    const hasPeriods = toggle?.showTravelPeriod && tour.travelPeriods && tour.travelPeriods.length > 0

    const detailUrl = tour.interTourSlug ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}` : (tour.directLink || '#')

    // Count accommodation items for hotel star display
    const accommodationItems = tour.highlights?.accommodation || []
    const hotelStars = accommodationItems.length

    // Food items
    const foodItems = tour.highlights?.food || []

    // Determine which download buttons to show — Card 6 shows all 3
    const pdfUrl = getLinkUrl(tour.pdfLink)
    const wordUrl = getLinkUrl(tour.wordLink)
    const bannerUrl = getLinkUrl(tour.bannerLink)
    const hasAnyDownload = pdfUrl || wordUrl || bannerUrl

    return (
        <div className="tour6-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
        <div className="tour6-card" style={{ borderRadius: `${borderRadius}px` }}>
            {/* ====== Top Section: Image + Content ====== */}
            <div className="tour6-top">
                {/* Cover Image */}
                <a href={detailUrl} className="tour6-image-wrap" style={{ textDecoration: 'none' }}>
                    {coverImage && (
                        <Media resource={coverImage} fill imgClassName="tour6-cover-img" size="(max-width: 768px) 100vw, 40vw" />
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

                {/* Content */}
                <div className="tour6-content">
                    {/* Title */}
                    <h3 className="tour6-title">{tour.tourTitle}</h3>

                    {/* Tour Code */}
                    {toggle?.showTourCode && tour.tourCode && (
                        <p className="tour6-code">
                            รหัสทัวร์ <strong>{tour.tourCode}</strong>
                        </p>
                    )}

                    {/* Description */}
                    {toggle?.showDescription && tour.tourDescription && (
                        <p className="tour6-desc">{tour.tourDescription}</p>
                    )}

                    {/* Hotel rating */}
                    {hotelStars > 0 && (
                        <div className="tour6-hotel">
                            <Hotel className="tour6-hotel-icon" />
                            <span>{hotelStars} ดาว</span>
                        </div>
                    )}

                    {/* Food highlights */}
                    {foodItems.length > 0 && (
                        <div className="tour6-food">
                            <UtensilsCrossed className="tour6-food-icon" />
                            <span>{foodItems.map((f) => f.item).filter(Boolean).join(', ')}</span>
                        </div>
                    )}

                    {/* Summary info — inside content area (before download buttons) */}
                    <div className="tour6-summary-inline">
                        {toggle?.showAirline && tour.airlineLogo && (
                            <div className="tour6-airline-logo">
                                <Media
                                    resource={tour.airlineLogo as MediaType}
                                    fill
                                    imgClassName="object-contain"
                                />
                            </div>
                        )}
                        {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                            <span className="tour6-duration">
                                {tour.stayDay}
                            </span>
                        )}
                        {toggle?.showStartPrice && tour.startPrice && (
                            <span className="tour6-summary-divider">/</span>
                        )}
                        {toggle?.showStartPrice && tour.startPrice && (() => {
                            const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                            return (
                                <span>
                                    <span className="tour6-summary-price-label">เริ่มเพียง </span>
                                    {hasDiscount && (
                                        <span className="tour6-summary-price-original">
                                            {formatPrice(tour.startPrice)}
                                        </span>
                                    )}
                                    <span className="tour6-summary-price">
                                        {hasDiscount
                                            ? formatPrice(tour.discountPrice!)
                                            : formatPrice(tour.startPrice)}
                                    </span>
                                    {' '}
                                    <span className="tour6-summary-price-unit">บ.</span>
                                </span>
                            )
                        })()}
                        {toggle?.showDetailButton && (
                            <a href={detailUrl} className="tour6-detail-btn">
                                ดูรายละเอียด
                            </a>
                        )}
                    </div>

                    {/* Download Buttons */}
                    {hasAnyDownload && (
                        <div className="tour6-actions">
                            {pdfUrl && (
                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="tour6-dl-btn">
                                    <FileText className="tour6-dl-icon-pdf" />
                                    PDF
                                </a>
                            )}
                            {wordUrl && (
                                <a href={wordUrl} target="_blank" rel="noopener noreferrer" className="tour6-dl-btn">
                                    <FileIcon className="tour6-dl-icon-word" />
                                    Word
                                </a>
                            )}
                            {bannerUrl && (
                                <a href={bannerUrl} target="_blank" rel="noopener noreferrer" className="tour6-dl-btn">
                                    <ImageIcon className="tour6-dl-icon-banner" />
                                    Banner
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ====== Summary Bar (mobile stacked only) ====== */}
            <div className="tour6-summary tour6-summary-mobile">
                <div className="tour6-summary-left">
                    {toggle?.showAirline && tour.airlineLogo && (
                        <div className="tour6-airline-logo">
                            <Media
                                resource={tour.airlineLogo as MediaType}
                                fill
                                imgClassName="object-contain"
                            />
                        </div>
                    )}
                    {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                        <span className="tour6-duration">
                            {tour.stayDay}
                        </span>
                    )}
                    {toggle?.showStartPrice && tour.startPrice && (
                        <span className="tour6-summary-divider">/</span>
                    )}
                    {toggle?.showStartPrice && tour.startPrice && (() => {
                        const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                        return (
                            <span>
                                <span className="tour6-summary-price-label">เริ่มเพียง </span>
                                {hasDiscount && (
                                    <span className="tour6-summary-price-original">
                                        {formatPrice(tour.startPrice)}
                                    </span>
                                )}
                                <span className="tour6-summary-price">
                                    {hasDiscount
                                        ? formatPrice(tour.discountPrice!)
                                        : formatPrice(tour.startPrice)}
                                </span>
                                {' '}
                                <span className="tour6-summary-price-unit">บ.</span>
                            </span>
                        )
                    })()}
                </div>
                {toggle?.showDetailButton && (
                    <a href={detailUrl} className="tour6-detail-btn">
                        ดูรายละเอียด
                    </a>
                )}
            </div>

            {/* ====== Pricing Table ====== */}
            {hasPeriods && (
                <div className="tour6-table-wrap">
                    <table className="tour6-table">
                        <thead>
                            <tr>
                                <th>วันที่เดินทาง</th>
                                <th>ผู้ใหญ่<br />(พักคู่)</th>
                                <th>ผู้ใหญ่<br />(พักเดี่ยว)</th>
                                <th>ผู้ใหญ่<br />(พักสาม)</th>
                                <th>เด็ก<br />(2-20ปี)</th>
                                <th>เด็ก<br />(ไม่มีเตียง)</th>
                                <th>รับได้</th>
                                <th>Group Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tour.travelPeriods!.slice(0, 5).map((p, i) => {
                                const seats = p.availableSeats ?? 0
                                const isSoldOut = seats <= 0
                                const dateStr = p.startDate && p.endDate
                                    ? `${fmtDate(p.startDate)} - ${fmtDate(p.endDate)}`
                                    : p.startDate
                                        ? fmtDate(p.startDate)
                                        : ''

                                return (
                                    <tr key={i}>
                                        <td>{dateStr}</td>
                                        <td>{formatPrice(p.priceAdultTwin)}</td>
                                        <td>{formatPrice(p.priceAdultSingle)}</td>
                                        <td>{formatPrice(p.priceAdultTriple)}</td>
                                        <td>{formatPrice(p.priceChildWithBed)}</td>
                                        <td>{formatPrice(p.priceChildNoBed)}</td>
                                        <td>
                                            <span className={
                                                seats > 0 ? 'tour6-seats-positive'
                                                    : seats < 0 ? 'tour6-seats-negative'
                                                        : 'tour6-seats-zero'
                                            }>
                                                {seats}
                                            </span>
                                        </td>
                                        <td>
                                            {isSoldOut ? (
                                                <span className="tour6-sold-out">Sold out</span>
                                            ) : (
                                                p.groupSize ?? '-'
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                        ( {tour.travelPeriods!.length} ช่วงเวลาเดินทาง )
                    </div>
                    {tour.travelPeriods!.length > 5 && (
                        <a
                            href={detailUrl}
                            style={{ display: 'block', marginTop: '4px', fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', textAlign: 'center' }}
                        >
                            ดูเพิ่มเติมอีก {tour.travelPeriods!.length - 5} ช่วง →
                        </a>
                    )}
                </div>
            )}

            {/* ====== Footer ====== */}
            {footerText && (
                <div className="tour6-footer">
                    <span className="tour6-footer-text">{footerText}</span>
                </div>
            )}
        </div>
        </div>
    )
}

export const WowtourServiceCard6: React.FC<WowtourServiceCard6Props> = ({
    headingSettings,
    apiTitle,
    tours,
    cardSettings,
    columnsPerRow: columnsPerRowProp,
    maxItemsToShow: maxItemsToShowProp,

    publicContext,
    ...rest
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

    // Get footer text from top-level block props
    const footerText = (rest as any)?.card6FooterText || null

    const [showAll, setShowAll] = useState(false)

    if (!tours || tours.length === 0) return null


    const hasOverflow = tours.length > itemsLimit
    const visibleTours = showAll ? tours : tours.slice(0, itemsLimit === Infinity ? tours.length : itemsLimit)

    // Determine slide basis class based on columns

    const renderTourCard = (tour: TourItem, index: number) => (
        <TourCard6Item
            key={index}
            tour={tour}
            borderRadius={borderRadius}
            footerText={footerText}
        />
    )



    const renderGridMode = () => (
        <>
            <div
                className={`tour6-grid${columns === 2 ? ' tour6-grid-2col' : ''}`}
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

export default WowtourServiceCard6
