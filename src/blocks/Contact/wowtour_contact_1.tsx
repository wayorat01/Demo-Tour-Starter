'use client'

import React, { useCallback, useState } from 'react'
import RichText from '@/components/RichText'
import Image from 'next/image'
import { SocialIcon } from '@/components/SocialIcon'
import type { ContactBlock as ContactBlockType, CompanyInfo } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import type { Media as MediaType } from '@/payload-types'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { FormBlock as FormBlockType } from '@/payload-types'

const FALLBACK_IMAGE_URL = '/media/default-fallback-1.png'

type WowtourContact1Props = ContactBlockType & {
  publicContext: PublicContextProps
  companyInfo?: CompanyInfo
}

const WowtourContact1: React.FC<WowtourContact1Props> = ({
  formHeading,
  contactCardHeading,
  companyInfo,
  publicContext,
  form,
  showLabels,
}) => {
  const qrImage = companyInfo?.qrCode as MediaType | undefined | null
  const qrUrl = qrImage?.url || FALLBACK_IMAGE_URL
  const qrAlt = qrImage?.alt || 'QR Code'

  // Extract form data from the FormBlock
  const formBlock = form?.[0] as FormBlockType | undefined
  const formData = formBlock?.form as FormType | undefined

  // Company Info data
  const businessHours = companyInfo?.businessHours
  const callCenter = companyInfo?.callCenter
  const phones = (companyInfo?.phones ?? []) as { number: string; label?: string | null }[]
  const email = companyInfo?.email
  const lineOA = companyInfo?.lineOA
  const socialLinks = companyInfo?.socialLinks ?? []

  return (
    <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="container">
        {/* Main Card Container */}
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
            {/* Left Column — Contact Form */}
            <div className="flex flex-col p-6 sm:p-8 md:p-10">
              {formHeading && (
                <h2 className="mb-6 text-lg font-semibold md:text-xl">{formHeading}</h2>
              )}
              {formData ? (
                <ContactForm formData={formData} showLabels={!!showLabels} />
              ) : (
                <p className="text-muted-foreground text-sm">กรุณาเลือกฟอร์มใน Admin Panel</p>
              )}
            </div>

            {/* Right Column — Contact Info Card */}
            <div className="flex min-h-full flex-col items-center justify-center bg-gray-100 p-6 text-center sm:p-8 md:p-10">
              {contactCardHeading && (
                <h3 className="mb-4 text-lg font-semibold md:text-xl">{contactCardHeading}</h3>
              )}

              {qrImage && (
                <div className="mb-2 overflow-hidden rounded-lg border bg-white p-1.5">
                  <Image
                    src={qrUrl}
                    alt={qrAlt}
                    width={150}
                    height={150}
                    className="object-contain"
                  />
                </div>
              )}

              {/* LINE Official Account */}
              {lineOA && (
                <div className="mb-3 text-lg font-bold">
                  {companyInfo?.lineLink ? (
                    <a
                      href={companyInfo.lineLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="text-green-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                      </span>
                      {lineOA}
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-green-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                      </span>
                      {lineOA}
                    </span>
                  )}
                </div>
              )}

              {/* Company contact details from CompanyInfo */}
              <div className="w-full space-y-1 text-center text-base">
                {businessHours && (
                  <>
                    <p className="font-semibold">วัน-เวลาทำการ</p>
                    <p>{businessHours}</p>
                  </>
                )}
                {callCenter && (
                  <p>
                    Call Center :{' '}
                    <a
                      href={`tel:${callCenter.replace(/[^\d+]/g, '')}`}
                      className="hover:text-primary transition-colors"
                    >
                      {callCenter}
                    </a>
                  </p>
                )}
                {phones.map((p, i) =>
                  p.number ? (
                    <p key={i}>
                      {p.label ? `${p.label} : ` : 'เบอร์โทรติดต่อ : '}
                      <a
                        href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                        className="hover:text-primary transition-colors"
                      >
                        {p.number}
                      </a>
                    </p>
                  ) : null,
                )}
                {email && (
                  <p>
                    Email :{' '}
                    <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                      {email}
                    </a>
                  </p>
                )}
              </div>

              {/* Social Icons */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  {socialLinks.map((item, idx) => (
                    <a
                      key={item.id || idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-10 items-center justify-center rounded-full transition-all"
                      title={item.label || item.platform}
                    >
                      <SocialIcon type={item.platform} className="size-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── ContactForm sub-component ───────────────────────────────────────────────

interface ContactFormProps {
  formData: FormType
  showLabels: boolean
}

const ContactForm: React.FC<ContactFormProps> = ({ formData, showLabels }) => {
  const {
    id: formID,
    fields: formFields,
    submitButtonLabel,
    confirmationType,
    confirmationMessage,
  } = formData

  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    formFields?.forEach((field) => {
      if ('name' in field && field.name) {
        initial[field.name] = (field.defaultValue as string) || ''
      }
    })
    return initial
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setIsLoading(true)

      const submissionData = Object.entries(formValues).map(([field, value]) => ({
        field,
        value,
      }))

      try {
        const res = await fetch('/api/form-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form: formID,
            submissionData,
          }),
        })

        const data = await res.json()

        if (res.status >= 400) {
          setError(data.errors?.[0]?.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
          setIsLoading(false)
          return
        }

        setIsLoading(false)
        setHasSubmitted(true)
      } catch {
        setError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
        setIsLoading(false)
      }
    },
    [formID, formValues],
  )

  // Show confirmation message after successful submit
  if (hasSubmitted && confirmationType === 'message' && confirmationMessage) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <div className="mb-2 text-2xl">✅</div>
        <div className="text-foreground text-sm [&_p]:my-1">
          {typeof confirmationMessage === 'object' ? (
            <RichTextSimple content={confirmationMessage} />
          ) : (
            <p>{String(confirmationMessage)}</p>
          )}
        </div>
      </div>
    )
  }

  if (hasSubmitted) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <div className="mb-2 text-2xl">✅</div>
        <p className="text-sm text-green-700">ส่งข้อมูลเรียบร้อยแล้ว ขอบคุณครับ</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Responsive grid wrapper */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {formFields?.map((field, index) => {
          if (field.blockType === 'message') return null
          if (!('name' in field) || !field.name) return null

          const name = field.name
          const label = field.label || field.name
          const required = 'required' in field ? field.required : false
          const placeholder = `${label}${required ? ' *' : ''}`
          const width = 'width' in field ? (field.width as number) : 100

          const inputClasses =
            'w-full rounded-md border bg-gray-100 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring'

          // 50% width → 1 column, 100% width → span 2 columns
          const colSpanClass = width && width < 100 ? '' : 'md:col-span-2'

          return (
            <div key={field.name || index} className={colSpanClass}>
              {showLabels && (
                <label htmlFor={name} className="text-foreground mb-1.5 block text-sm font-medium">
                  {label}
                  {required && <span className="ml-1 text-red-500">*</span>}
                </label>
              )}

              {field.blockType === 'textarea' ? (
                <textarea
                  id={name}
                  name={name}
                  placeholder={placeholder}
                  required={!!required}
                  rows={5}
                  value={formValues[name] || ''}
                  onChange={(e) => handleChange(name, e.target.value)}
                  className={`${inputClasses} resize-none`}
                />
              ) : (
                <input
                  id={name}
                  name={name}
                  type={field.blockType === 'email' ? 'email' : 'text'}
                  placeholder={placeholder}
                  required={!!required}
                  value={formValues[name] || ''}
                  onChange={(e) => handleChange(name, e.target.value)}
                  className={inputClasses}
                />
              )}
            </div>
          )
        })}
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background: 'var(--btn-bg)',
            color: 'var(--btn-text)',
            borderRadius: 'var(--btn-radius)',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--btn-bg-hover)'
            e.currentTarget.style.color = 'var(--btn-text-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--btn-bg)'
            e.currentTarget.style.color = 'var(--btn-text)'
          }}
        >
          {isLoading ? 'กำลังส่ง...' : submitButtonLabel || 'ส่งข้อความ'}
        </button>
      </div>
    </form>
  )
}

// ─── Simple RichText renderer for confirmation message ──────────────────────

const RichTextSimple: React.FC<{ content: any }> = ({ content }) => {
  if (!content?.root?.children) return null

  return (
    <>
      {content.root.children.map((node: any, i: number) => {
        if (node.type === 'paragraph') {
          const text = node.children?.map((child: any) => child.text || '').join('') || ''
          return <p key={i}>{text}</p>
        }
        return null
      })}
    </>
  )
}

export default WowtourContact1
