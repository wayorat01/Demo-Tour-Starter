'use client'

import React, { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

export const SiteIdentityPreview: React.FC = () => {
  const siteName = useFormFields(([fields]) => fields['siteIdentity.siteName']?.value as string)
  const siteTagline = useFormFields(
    ([fields]) => fields['siteIdentity.siteTagline']?.value as string,
  )
  const faviconValue = useFormFields(([fields]) => fields['siteIdentity.favicon']?.value)
  const ogImageValue = useFormFields(([fields]) => fields['siteIdentity.sitePreviewImage']?.value)

  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null)

  // Helper to resolve media URL from value (object with url or ID)
  const resolveMediaUrl = (
    value: unknown,
    setter: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    if (!value) {
      setter(null)
      return
    }
    if (typeof value === 'object' && value !== null && 'url' in value) {
      setter((value as { url: string }).url)
      return
    }
    const id = typeof value === 'string' || typeof value === 'number' ? value : null
    if (id) {
      fetch(`/api/media/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.url) setter(data.url)
        })
        .catch(() => setter(null))
    }
  }

  useEffect(() => resolveMediaUrl(faviconValue, setFaviconUrl), [faviconValue])
  useEffect(() => resolveMediaUrl(ogImageValue, setOgImageUrl), [ogImageValue])

  const displayName = siteName || 'My Website'
  const displayTagline = siteTagline || ''
  const fullTitle = displayTagline ? `${displayName} — ${displayTagline}` : displayName

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
      }}
    >
      <h4
        style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
        }}
      >
        👁️ ตัวอย่าง Preview
      </h4>

      {/* --- Browser Tab Preview --- */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>
          Browser Tab
        </p>
        <div
          style={{
            background: '#dee2e6',
            borderRadius: '8px 8px 0 0',
            padding: '0',
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              borderRadius: '8px 8px 0 0',
              padding: '8px 16px',
              maxWidth: '260px',
              borderBottom: '2px solid #4285f4',
            }}
          >
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt="favicon"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '2px',
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '2px',
                  background: '#ccc',
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontSize: '12px',
                color: '#333',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
              }}
            >
              {fullTitle}
            </span>
            <span style={{ fontSize: '10px', color: '#aaa', marginLeft: 'auto' }}>✕</span>
          </div>
        </div>
      </div>

      {/* --- Google Search Preview --- */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>
          Google Search
        </p>
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '600px',
            border: '1px solid #e8e8e8',
          }}
        >
          <div style={{ fontSize: '12px', color: '#4d5156', marginBottom: '4px' }}>
            www.yoursite.com
          </div>
          <div
            style={{
              fontSize: '18px',
              color: '#1a0dab',
              marginBottom: '4px',
              cursor: 'pointer',
              fontWeight: 400,
            }}
          >
            {fullTitle}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#4d5156',
              lineHeight: '1.5',
            }}
          >
            {displayTagline || 'คำโปรยเว็บไซต์จะแสดงตรงนี้...'}
          </div>
        </div>
      </div>

      {/* --- Social Media Share Preview --- */}
      <div>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>
          Social Media Share (Facebook / LINE)
        </p>
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            maxWidth: '500px',
            border: '1px solid #dadde1',
            overflow: 'hidden',
          }}
        >
          {/* OG Image */}
          <div
            style={{
              width: '100%',
              height: '260px',
              background: ogImageUrl ? `url(${ogImageUrl}) center/cover no-repeat` : '#e4e6eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!ogImageUrl && (
              <span style={{ fontSize: '13px', color: '#8a8d91' }}>
                ยังไม่ได้อัพโหลดรูป OG Image
              </span>
            )}
          </div>
          {/* Text content */}
          <div
            style={{
              padding: '12px 16px',
              background: '#f0f2f5',
              borderTop: '1px solid #dadde1',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#65676b',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '4px',
              }}
            >
              www.yoursite.com
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#1c1e21',
                lineHeight: '1.3',
                marginBottom: '4px',
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#65676b',
                lineHeight: '1.4',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {displayTagline || 'คำโปรยเว็บไซต์จะแสดงตรงนี้...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
