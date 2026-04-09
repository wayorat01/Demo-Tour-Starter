import type { CompanyInfo, ContactBlock as ContactBlockType } from '@/payload-types'
import { Media } from '@/components/Media'
import { SocialIcon } from '@/components/SocialIcon'
import { FormBlock } from '@/blocks/Form/Component'
import type { FormBlock as FormBlockType } from '@/payload-types'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'
import { extractMapSrc } from './wowtour_contact2'

/**
 * WowtourContact2 — "Centered Stack"
 * Logo + Info centered on top → Social Icons → Form + Map below
 */
const WowtourContact2: React.FC<ContactBlockType & { companyInfo?: CompanyInfo }> = ({
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
    <section className="py-16 lg:py-24">
      <div className="container">
        {/* Top: Centered Info */}
        <div className="mx-auto max-w-2xl text-center">
          {logo && (
            <Media
              resource={logo}
              alt="logo"
              className="mx-auto mb-6 h-14 overflow-hidden"
              imgClassName="!max-h-full !w-auto object-contain mx-auto"
            />
          )}
          {heading && <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>}
          {subheading && <p className="text-muted-foreground mt-3 text-base">{subheading}</p>}

          {companyName && <p className="mt-4 text-lg font-semibold">{companyName}</p>}

          {/* Contact Info Row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            {businessHours && (
              <div className="flex items-center gap-2">
                <Clock className="text-primary size-4" />
                <span className="text-muted-foreground">{businessHours}</span>
              </div>
            )}
            {callCenter && (
              <a
                href={`tel:${callCenter.replace(/[^\d+]/g, '')}`}
                className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
              >
                <Phone className="text-primary size-4" />
                {callCenter}
              </a>
            )}
            {phones.map(
              (p, i) =>
                p.number && (
                  <a
                    key={i}
                    href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                    className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                  >
                    <Phone className="text-primary size-4" />
                    {p.label ? `${p.number} (${p.label})` : p.number}
                  </a>
                ),
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
              >
                <Mail className="text-primary size-4" />
                {email}
              </a>
            )}
          </div>

          {address && (
            <div className="mt-4 flex items-start justify-center gap-2 text-sm">
              <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
              <span className="text-muted-foreground whitespace-pre-line">{address}</span>
            </div>
          )}

          {/* Social Icons */}
          {(socialLinks.length > 0 || lineOA) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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

        {/* Bottom: Form + Map(s) */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
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

          {mapSrc && (
            <div className="h-full min-h-[350px] overflow-hidden rounded-2xl border shadow-sm">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '100%' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default WowtourContact2
