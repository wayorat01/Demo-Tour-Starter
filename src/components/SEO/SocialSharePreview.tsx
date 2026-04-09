'use client'

import React, { useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

type Platform = 'facebook' | 'line' | 'twitter' | 'google'
type ViewMode = 'desktop' | 'mobile'

export const SocialSharePreview: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('facebook')
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')

  const title = useFormFields(([fields]) => fields?.['meta.title']?.value as string) || ''
  const description =
    useFormFields(([fields]) => fields?.['meta.description']?.value as string) || ''
  const image = useFormFields(([fields]) => fields?.['meta.image']?.value as string) || ''

  const domain = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/https?:\/\//, '') || 'wowtour.com'

  if (!title && !description && !image) {
    return (
      <div
        style={{
          padding: '12px 16px',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          color: '#92400e',
          fontSize: '13px',
          marginTop: '16px',
        }}
      >
        ⚠️ ยังไม่มีข้อมูล SEO — กรุณากรอก Title, Description และ Image ด้านบน
      </div>
    )
  }

  const isMobile = viewMode === 'mobile'

  const platforms: { key: Platform; label: string; color: string; icon: React.ReactNode }[] = [
    {
      key: 'facebook',
      label: 'Facebook',
      color: '#1877f2',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: 'line',
      label: 'LINE',
      color: '#06c755',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
    },
    {
      key: 'twitter',
      label: 'X',
      color: '#000',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'google',
      label: 'Google',
      color: '#4285f4',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div style={{ marginTop: '8px' }}>
      <h4
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '12px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px',
        }}
      >
        📱 ตัวอย่างเมื่อแชร์ลิงก์ (Social Share Preview)
      </h4>

      <div
        style={{ display: 'flex', gap: '0', marginBottom: '16px', flexWrap: 'wrap', rowGap: '8px' }}
      >
        {/* Platform Tabs */}
        <div style={{ display: 'flex' }}>
          {platforms.map((p, i) => (
            <button
              key={p.key}
              onClick={() => setPlatform(p.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                borderLeft: i === 0 ? '1px solid #d1d5db' : 'none',
                borderRadius:
                  i === 0 ? '8px 0 0 8px' : i === platforms.length - 1 ? '0 8px 8px 0' : '0',
                background: platform === p.key ? p.color : '#fff',
                color: platform === p.key ? '#fff' : '#6b7280',
                transition: 'all 0.15s ease',
              }}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Desktop / Mobile Toggle */}
        <div
          style={{
            display: 'flex',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              borderRight: '1px solid #d1d5db',
              background: viewMode === 'desktop' ? '#3b82f6' : '#fff',
              color: viewMode === 'desktop' ? '#fff' : '#6b7280',
              transition: 'all 0.15s ease',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
            Desktop
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'mobile' ? '#3b82f6' : '#fff',
              color: viewMode === 'mobile' ? '#fff' : '#6b7280',
              transition: 'all 0.15s ease',
            }}
          >
            <svg
              width="12"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M12 18h.01" />
            </svg>
            Mobile
          </button>
        </div>
      </div>

      {/* Preview */}
      <div style={{ maxWidth: isMobile ? '340px' : '520px', transition: 'max-width 0.3s ease' }}>
        {platform === 'facebook' && (
          <FacebookPreview
            title={title}
            description={description}
            image={image}
            domain={domain}
            isMobile={isMobile}
          />
        )}
        {platform === 'line' && (
          <LinePreview
            title={title}
            description={description}
            image={image}
            domain={domain}
            isMobile={isMobile}
          />
        )}
        {platform === 'twitter' && (
          <TwitterPreview
            title={title}
            description={description}
            image={image}
            domain={domain}
            isMobile={isMobile}
          />
        )}
        {platform === 'google' && (
          <GooglePreview
            title={title}
            description={description}
            domain={domain}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  )
}

/* ===== Facebook ===== */
function FacebookPreview({
  title,
  description,
  image,
  domain,
  isMobile,
}: {
  title: string
  description: string
  image: string
  domain: string
  isMobile: boolean
}) {
  return (
    <div
      style={{
        border: '1px solid #dadde1',
        borderRadius: isMobile ? '12px' : '4px',
        overflow: 'hidden',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {image && (
        <div
          style={{
            width: '100%',
            height: isMobile ? '180px' : '270px',
            overflow: 'hidden',
            background: '#f0f2f5',
          }}
        >
          <img
            src={image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).parentElement!.style.display = 'none'
            }}
          />
        </div>
      )}
      <div
        style={{
          padding: '10px 12px',
          borderTop: image ? '1px solid #dadde1' : 'none',
          background: '#f2f3f5',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#606770',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {domain}
        </div>
        <div
          style={{
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 600,
            color: '#1d2129',
            lineHeight: '1.35',
            marginTop: '3px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as any,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: isMobile ? '12px' : '14px',
              color: '#606770',
              lineHeight: '1.4',
              marginTop: '3px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: isMobile ? 1 : 2,
              WebkitBoxOrient: 'vertical' as any,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

/* ===== LINE ===== */
function LinePreview({
  title,
  description,
  image,
  domain,
  isMobile,
}: {
  title: string
  description: string
  image: string
  domain: string
  isMobile: boolean
}) {
  return (
    <div
      style={{
        maxWidth: isMobile ? '280px' : '100%',
        background: '#aedca2',
        borderRadius: '20px',
        padding: '8px 8px 4px 8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {image && (
          <div style={{ width: '100%', height: isMobile ? '148px' : '200px', overflow: 'hidden' }}>
            <img
              src={image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).parentElement!.style.display = 'none'
              }}
            />
          </div>
        )}
        <div style={{ padding: '10px 12px' }}>
          <div
            style={{
              fontSize: isMobile ? '13px' : '15px',
              fontWeight: 600,
              color: '#111',
              lineHeight: '1.35',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: isMobile ? '11px' : '13px',
                color: '#666',
                lineHeight: '1.35',
                marginTop: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 2 : 3,
                WebkitBoxOrient: 'vertical' as any,
              }}
            >
              {description}
            </div>
          )}
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>{domain}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '10px', color: '#6b9f5e', padding: '2px 4px' }}>
        {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
      </div>
    </div>
  )
}

/* ===== Twitter/X ===== */
function TwitterPreview({
  title,
  description,
  image,
  domain,
  isMobile,
}: {
  title: string
  description: string
  image: string
  domain: string
  isMobile: boolean
}) {
  return (
    <div
      style={{
        border: '1px solid #cfd9de',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {image && (
        <div style={{ width: '100%', height: isMobile ? '180px' : '250px', overflow: 'hidden' }}>
          <img
            src={image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).parentElement!.style.display = 'none'
            }}
          />
        </div>
      )}
      <div style={{ padding: '12px' }}>
        <div
          style={{
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: 700,
            color: '#0f1419',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: isMobile ? '13px' : '15px',
              color: '#536471',
              lineHeight: '1.4',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any,
            }}
          >
            {description}
          </div>
        )}
        <div
          style={{
            fontSize: '13px',
            color: '#536471',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#536471"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {domain}
        </div>
      </div>
    </div>
  )
}

/* ===== Google Search Result ===== */
function GooglePreview({
  title,
  description,
  domain,
  isMobile,
}: {
  title: string
  description: string
  domain: string
  isMobile: boolean
}) {
  return (
    <div
      style={{
        maxWidth: isMobile ? '340px' : '600px',
        fontFamily: 'Arial, sans-serif',
        padding: '16px',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e8eaed',
      }}
    >
      {/* Breadcrumb / URL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#f1f3f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </div>
        <div>
          <div
            style={{ fontSize: isMobile ? '12px' : '14px', color: '#202124', lineHeight: '1.3' }}
          >
            {domain}
          </div>
          <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#4d5156' }}>
            https://{domain} › intertours › ...
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: isMobile ? '18px' : '20px',
          color: '#1a0dab',
          lineHeight: '1.3',
          marginBottom: '4px',
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: isMobile ? 2 : 1,
          WebkitBoxOrient: 'vertical' as any,
        }}
      >
        {title}
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#4d5156',
            lineHeight: '1.58',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: isMobile ? 3 : 2,
            WebkitBoxOrient: 'vertical' as any,
          }}
        >
          {description}
        </div>
      )}
    </div>
  )
}
