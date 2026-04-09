import type { CompanyInfo, ContactBlock as ContactBlockType } from '@/payload-types'
import { Media } from '@/components/Media'
import { SocialIcon } from '@/components/SocialIcon'
import { FormBlock } from '@/blocks/Form/Component'
import type { FormBlock as FormBlockType } from '@/payload-types'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'
import { extractMapSrc } from './wowtour_contact2'

/**
 * WowtourContact3 — "Map Hero"
 * Map iframe full width on top (60%) → Contact info + Form below
 */
const WowtourContact3: React.FC<ContactBlockType & { companyInfo?: CompanyInfo }> = ({
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
    <section className="py-0">
      {/* Map Hero */}
      {mapSrc && (
        <div className="relative w-full">
          <iframe
            src={mapSrc}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* Info + Form below */}
      <div className="bg-primary/5 py-12 lg:py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Left: Company Info */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-start gap-3">
                {logo && (
                  <Media
                    resource={logo}
                    alt="logo"
                    className="h-10 shrink-0 overflow-hidden"
                    imgClassName="!max-h-full !w-auto object-contain"
                  />
                )}
                {companyName && <h3 className="text-xl font-bold">{companyName}</h3>}
              </div>

              {heading && <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>}
              {subheading && <p className="text-muted-foreground text-base">{subheading}</p>}

              <div className="space-y-3">
                {businessHours && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="text-primary size-4 shrink-0" />
                    <span className="text-muted-foreground">เวลาทำการ : {businessHours}</span>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                    <span className="text-muted-foreground whitespace-pre-line">{address}</span>
                  </div>
                )}
                {callCenter && (
                  <a
                    href={`tel:${callCenter.replace(/[^\d+]/g, '')}`}
                    className="text-muted-foreground hover:text-primary flex items-center gap-3 transition-colors"
                  >
                    <Phone className="text-primary size-4 shrink-0" />
                    {callCenter}
                  </a>
                )}
                {phones.map(
                  (p, i) =>
                    p.number && (
                      <a
                        key={i}
                        href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                        className="text-muted-foreground hover:text-primary flex items-center gap-3 transition-colors"
                      >
                        <Phone className="text-primary size-4 shrink-0" />
                        {p.label ? `${p.number} (${p.label})` : p.number}
                      </a>
                    ),
                )}
                {email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="text-primary size-4 shrink-0" />
                    <a
                      href={`mailto:${email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                )}
              </div>

              {(socialLinks.length > 0 || lineOA) && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {lineOA && (
                    <a
                      href={lineLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-10 items-center justify-center rounded-full transition-all"
                      title={lineOA}
                    >
                      <SocialIcon type="line" className="size-5" />
                    </a>
                  )}
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

            {/* Right: Form */}
            {form?.[0] && (
              <div className="bg-card rounded-2xl border p-8 shadow-sm">
                {formHeading && (
                  <h3 className="text-foreground mb-4 text-xl font-semibold">{formHeading}</h3>
                )}
                <FormBlock
                  {...(form[0] as any)}
                  id={form[0].id ?? undefined}
                  blockName={form[0].blockName ?? undefined}
                  enableIntro={false}
                  disableContainer={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WowtourContact3
