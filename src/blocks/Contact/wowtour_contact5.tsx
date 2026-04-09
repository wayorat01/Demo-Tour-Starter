import type { CompanyInfo, ContactBlock as ContactBlockType } from '@/payload-types'
import { Media } from '@/components/Media'
import { SocialIcon } from '@/components/SocialIcon'
import { FormBlock } from '@/blocks/Form/Component'
import type { FormBlock as FormBlockType } from '@/payload-types'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'
import { extractMapSrc } from './wowtour_contact2'

/**
 * WowtourContact4 — "Card Grid"
 * 3 cards: Info Card, Form Card, Map Card — responsive grid
 */
const WowtourContact4: React.FC<ContactBlockType & { companyInfo?: CompanyInfo }> = ({
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
    <section className="py-16 lg:py-20">
      <div className="container">
        {/* Heading */}
        {(heading || subheading) && (
          <div className="mb-10 text-center">
            {heading && <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>}
            {subheading && <p className="text-muted-foreground mt-3 text-base">{subheading}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Info */}
          <div className="bg-card/80 border-border/50 flex flex-col gap-5 rounded-2xl border p-8 shadow-sm backdrop-blur-md">
            <div className="flex flex-col items-start gap-3">
              {logo && (
                <Media
                  resource={logo}
                  alt="logo"
                  className="h-10 shrink-0 overflow-hidden"
                  imgClassName="!max-h-full !w-auto object-contain"
                />
              )}
              {companyName && <h3 className="text-lg font-bold">{companyName}</h3>}
            </div>

            <div className="space-y-3 text-sm">
              {businessHours && (
                <div className="flex items-center gap-3">
                  <Clock className="text-primary size-4 shrink-0" />
                  <span className="text-muted-foreground">{businessHours}</span>
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
                <a
                  href={`mailto:${email}`}
                  className="text-muted-foreground hover:text-primary flex items-center gap-3 transition-colors"
                >
                  <Mail className="text-primary size-4 shrink-0" />
                  {email}
                </a>
              )}
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground whitespace-pre-line">{address}</span>
                </div>
              )}
            </div>

            {(socialLinks.length > 0 || lineOA) && (
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                {lineOA && (
                  <a
                    href={lineLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-9 items-center justify-center rounded-lg transition-all"
                    title={lineOA}
                  >
                    <SocialIcon type="line" className="size-4" />
                  </a>
                )}
                {socialLinks.map((item, idx) => (
                  <a
                    key={item.id || idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-9 items-center justify-center rounded-lg transition-all"
                    title={item.label || item.platform}
                  >
                    <SocialIcon type={item.platform} className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Form */}
          {form?.[0] && (
            <div className="bg-card/80 border-border/50 rounded-2xl border p-8 shadow-sm backdrop-blur-md">
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

          {/* Card 3: Map */}
          {mapSrc && (
            <div className="border-border/50 overflow-hidden rounded-2xl border shadow-sm">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 350 }}
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

export default WowtourContact4
