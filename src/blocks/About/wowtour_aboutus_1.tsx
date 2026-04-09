'use client'

import React, { useState } from 'react'
import RichText from '@/components/RichText'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { ZoomIn } from 'lucide-react'
import type { Media as MediaType } from '@/payload-types'

const FALLBACK_IMAGE_URL = '/media/default-fallback-1.png'

type CompanyInfoData = {
  companyLogo?: MediaType | string | null
  companyName?: string | null
  companyNameEn?: string | null
  tatLicense?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  website?: string | null
  lineOA?: string | null
}

type WowtourAboutUs1Props = {
  companySlogan?: string | null
  tourLicenseImage?: MediaType | string | null
  companyCertificateImage?: MediaType | string | null
  aboutBanner?: MediaType | string | null
  aboutArticleSections?: Array<{
    sectionTitle?: string | null
    sectionDescription?: any
    id?: string | null
  }> | null

  aboutContactInfo?: Array<{
    sectionTitle?: string | null
    sectionDescription?: any
    id?: string | null
  }> | null
  publicContext?: any
  companyInfo?: CompanyInfoData | null
}

function ImageZoomDialog({ image, alt, title }: { image: MediaType; alt: string; title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative mx-auto aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <Image
            src={image.url!}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="translate-y-4 transform rounded-full bg-white/90 p-2.5 shadow-lg transition-transform duration-300 group-hover:translate-y-0">
              <ZoomIn className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-[90vw] items-center justify-center border-none bg-transparent p-0">
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <div className="relative flex h-full w-full items-center justify-center">
          <Image
            src={image.url!}
            alt={`${alt} - ขยาย`}
            width={1200}
            height={1600}
            className="max-h-[85vh] max-w-full rounded-sm object-contain shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const WowtourAboutUs1: React.FC<WowtourAboutUs1Props> = ({
  companySlogan,
  tourLicenseImage,
  companyCertificateImage,
  aboutBanner,
  aboutArticleSections,

  aboutContactInfo,
  publicContext,
  companyInfo,
}) => {
  const logo = companyInfo?.companyLogo
  const companyName = companyInfo?.companyName

  return (
    <section className="container py-12 lg:py-24">
      <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-12 lg:gap-12">
        {/* ===== Sidebar (Left on Desktop, Bottom on Mobile) ===== */}
        <div className="h-fit space-y-8 lg:sticky lg:top-32 lg:col-span-4">
          {/* Logo */}
          {logo && typeof logo === 'object' && logo.url && (
            <div className="flex justify-center">
              <Image
                src={logo.url}
                alt={logo.alt || companyName || 'Company Logo'}
                width={logo.width || 315}
                height={logo.height || 315}
                className="h-auto w-full max-w-[280px] object-contain"
              />
            </div>
          )}

          {/* Company Badge */}
          {companyName && (
            <div className="bg-primary text-primary-foreground rounded-lg p-6 text-center">
              <h3 className="mb-2 text-xl font-bold">{companyName}</h3>
              {companySlogan && (
                <p className="text-base leading-relaxed whitespace-pre-wrap opacity-90">
                  {companySlogan}
                </p>
              )}
            </div>
          )}

          {/* Tour License */}
          {(() => {
            const licenseImg =
              tourLicenseImage && typeof tourLicenseImage === 'object' && tourLicenseImage.url
                ? tourLicenseImage
                : ({ url: FALLBACK_IMAGE_URL, alt: 'ใบอนุญาตนำเที่ยว' } as MediaType)
            return (
              <div className="space-y-3 text-center">
                <h3 className="text-lg font-bold text-gray-800">ใบอนุญาตนำเที่ยว</h3>
                <ImageZoomDialog
                  image={licenseImg}
                  alt="ใบอนุญาตนำเที่ยว"
                  title="ใบอนุญาตนำเที่ยว"
                />
              </div>
            )
          })()}

          {/* Company Certificate */}
          {(() => {
            const certImg =
              companyCertificateImage &&
              typeof companyCertificateImage === 'object' &&
              companyCertificateImage.url
                ? companyCertificateImage
                : ({ url: FALLBACK_IMAGE_URL, alt: 'หนังสือรับรอง' } as MediaType)
            return (
              <div className="space-y-3 text-center">
                <h3 className="text-lg font-bold text-gray-800">หนังสือรับรอง</h3>
                <ImageZoomDialog image={certImg} alt="หนังสือรับรอง" title="หนังสือรับรอง" />
              </div>
            )
          })()}
        </div>

        {/* ===== Main Content (Right on Desktop, Top on Mobile) ===== */}
        <div className="space-y-10 lg:col-span-8">
          {/* Banner */}
          {aboutBanner && typeof aboutBanner === 'object' && aboutBanner.url && (
            <div className="relative h-[200px] w-full overflow-hidden rounded-xl sm:h-[250px] lg:h-[300px]">
              <Image
                src={aboutBanner.url}
                alt={aboutBanner.alt || 'About Us Banner'}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Sections */}
          {aboutArticleSections && aboutArticleSections.length > 0 && (
            <div className="space-y-8">
              {aboutArticleSections.map((section, index) => (
                <div key={section.id || index} className="space-y-3">
                  {section.sectionTitle && (
                    <h2 className="text-primary text-xl font-bold">{section.sectionTitle}</h2>
                  )}
                  {section.sectionDescription && (
                    <div className="prose prose-slate max-w-none text-base">
                      <RichText
                        content={section.sectionDescription}
                        publicContext={publicContext}
                        overrideStyle={{
                          p: 'text-base mb-3 leading-relaxed',
                          li: 'text-base',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Company Info & Contact Info */}
          <div className="space-y-4">
            {/* Company Info Box - ดึงจาก company-info global */}
            {companyInfo && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 lg:p-8">
                <h3 className="mb-6 text-xl font-bold text-gray-800">ข้อมูลบริษัท</h3>
                <div className="grid gap-4">
                  {companyInfo.companyName && (
                    <div className="grid grid-cols-1 gap-1 border-b border-gray-200 pb-3 sm:grid-cols-4 sm:gap-2">
                      <span className="text-base font-semibold text-gray-600 sm:col-span-1">
                        ชื่อบริษัท :
                      </span>
                      <span className="text-base text-gray-800 sm:col-span-3">
                        {companyInfo.companyName}
                      </span>
                    </div>
                  )}
                  {companyInfo.tatLicense && (
                    <div className="grid grid-cols-1 gap-1 border-b border-gray-200 pb-3 sm:grid-cols-4 sm:gap-2">
                      <span className="text-base font-semibold text-gray-600 sm:col-span-1">
                        ใบอนุญาตนำเที่ยว :
                      </span>
                      <span className="text-base text-gray-800 sm:col-span-3">
                        {companyInfo.tatLicense}
                      </span>
                    </div>
                  )}
                  {companyInfo.address && (
                    <div className="grid grid-cols-1 gap-1 border-b border-gray-200 pb-3 sm:grid-cols-4 sm:gap-2">
                      <span className="text-base font-semibold text-gray-600 sm:col-span-1">
                        ที่อยู่ :
                      </span>
                      <span className="text-base whitespace-pre-wrap text-gray-800 sm:col-span-3">
                        {companyInfo.address}
                      </span>
                    </div>
                  )}
                  {companyInfo.email && (
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:gap-2">
                      <span className="text-base font-semibold text-gray-600 sm:col-span-1">
                        อีเมล :
                      </span>
                      <span className="text-base text-gray-800 sm:col-span-3">
                        <a
                          href={`mailto:${companyInfo.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {companyInfo.email}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {aboutContactInfo && aboutContactInfo.length > 0 && (
              <div className="space-y-6">
                {aboutContactInfo.map((section, index) => (
                  <div
                    key={section.id || index}
                    className="bg-primary/5 border-primary/10 rounded-2xl border p-6 lg:p-8"
                  >
                    {section.sectionTitle && (
                      <h3 className="text-primary mb-4 text-xl font-bold">
                        {section.sectionTitle}
                      </h3>
                    )}
                    {section.sectionDescription && (
                      <div className="prose prose-blue max-w-none text-base">
                        <RichText
                          content={section.sectionDescription}
                          publicContext={publicContext}
                          overrideStyle={{
                            p: 'text-base mb-3 leading-relaxed',
                            li: 'text-base',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WowtourAboutUs1
