import type { CompanyInfo, ContactBlock as ContactBlockType } from '@/payload-types'
import { Media } from '@/components/Media'
import { SocialIcon } from '@/components/SocialIcon'
import { FormBlock } from '@/blocks/Form/Component'
import type { FormBlock as FormBlockType } from '@/payload-types'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'

/**
 * WowtourContact1 — "Hero Split"
 * Left: Company info + Social (primary/5 bg)
 * Right: Form + Map
 */
const WowtourContact1: React.FC<ContactBlockType & { companyInfo?: CompanyInfo }> = ({
  companyInfo,
  form,
  heading,
  mapIframe,
  subheading,
  formHeading,
}) => {
  const logo = companyInfo?.companyLogo
  const companyName = companyInfo?.companyName
  const businessHours = companyInfo?.businessHours
  const address = companyInfo?.address
  const callCenter = companyInfo?.callCenter
  const phones = (companyInfo?.phones ?? []) as { number: string; label?: string | null }[]
  const email = companyInfo?.email
  const lineOA = companyInfo?.lineOA
  const lineLink = companyInfo?.lineLink
  const socialLinks = companyInfo?.socialLinks ?? []
  const mapSrc = extractMapSrc(mapIframe)

  return (
    <section className="pt-16 lg:pt-20">
      <div className="container">
        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl lg:grid-cols-2">
          {/* Left: Company Info */}
          <div className="bg-primary/5 flex flex-col gap-6 p-8 lg:p-12">
            {logo && (
              <Media
                resource={logo}
                alt="logo"
                className="h-12 shrink-0 overflow-hidden"
                imgClassName="!max-h-full !w-auto object-contain"
              />
            )}

            {heading && <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>}
            {subheading && <p className="text-foreground text-xl font-normal">{subheading}</p>}

            {companyName && <p className="text-2xl font-medium">{companyName}</p>}

            <div className="space-y-3">
              {businessHours && (
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Clock className="size-4" />
                  </span>
                  <span className="text-muted-foreground text-sm">เวลาทำการ : {businessHours}</span>
                </div>
              )}
              {callCenter && (
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Phone className="size-4" />
                  </span>
                  <a
                    href={`tel:${callCenter.replace(/[^\d+]/g, '')}`}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {callCenter}
                  </a>
                </div>
              )}
              {phones.map(
                (p, i) =>
                  p.number && (
                    <div key={i} className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <Phone className="size-4" />
                      </span>
                      <a
                        href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors"
                      >
                        {p.label ? `${p.number} (${p.label})` : p.number}
                      </a>
                    </div>
                  ),
              )}
              {email && (
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Mail className="size-4" />
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {email}
                  </a>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="size-4" />
                  </span>
                  <span className="text-muted-foreground text-sm whitespace-pre-line">
                    {address}
                  </span>
                </div>
              )}
            </div>

            {/* Social Icons */}
            {(socialLinks.length > 0 || lineOA) &&
              (() => {
                const brandColors: Record<string, string> = {
                  facebook: '#1877F2',
                  line: '#06C755',
                  email: '#F5A623',
                  phone: '#FF6B81',
                  tiktok: '#010101',
                  instagram: '#E4405F',
                  youtube: '#FF0000',
                  twitter: '#1DA1F2',
                  website: '#6C63FF',
                }
                return (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {lineOA && (
                      <a
                        href={lineLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-12 items-center justify-center rounded-xl text-white transition-all hover:scale-110 hover:shadow-lg"
                        style={{ background: '#06C755' }}
                        title={lineOA}
                      >
                        <SocialIcon type="line" className="size-6" />
                      </a>
                    )}
                    {socialLinks.map((item, idx) => (
                      <a
                        key={item.id || idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-12 items-center justify-center rounded-xl text-white transition-all hover:scale-110 hover:shadow-lg"
                        style={{ background: brandColors[item.platform] || '#6C63FF' }}
                        title={item.label || item.platform}
                      >
                        <SocialIcon type={item.platform} className="size-6" />
                      </a>
                    ))}
                  </div>
                )
              })()}
          </div>

          {/* Right: Form */}
          <div className="bg-muted/30 flex flex-col gap-8 p-8 lg:p-12">
            {formHeading && <h3 className="text-foreground text-2xl font-medium">{formHeading}</h3>}
            {form?.[0] && (
              <div>
                <FormBlock
                  {...(form[0] as any)}
                  id={form[0].id ?? undefined}
                  blockName={form[0].blockName ?? undefined}
                  enableIntro={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps — Full Width */}
      {mapSrc && (
        <div className="mt-12 w-full">
          <iframe
            src={mapSrc}
            width="100%"
            height="450"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </section>
  )
}

/** Extract src from iframe tag or use raw URL */
function extractMapSrc(input?: string | null): string | null {
  if (!input) return null
  const match = input.match(/src="([^"]+)"/)
  if (match) return match[1]
  if (input.startsWith('http')) return input
  return null
}

export { extractMapSrc }
export default WowtourContact1
