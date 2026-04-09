import type { CompanyInfo, ContactBlock as ContactBlockType } from '@/payload-types'
import { Media } from '@/components/Media'
import { SocialIcon } from '@/components/SocialIcon'
import { FormBlock } from '@/blocks/Form/Component'
import type { FormBlock as FormBlockType } from '@/payload-types'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'
import { extractMapSrc } from './wowtour_contact2'

/**
 * WowtourContact6 — "Two-Tone"
 * Band 1: Dark/primary bg with logo + info + social
 * Band 2: Light bg with form + map side by side
 */
const WowtourContact6: React.FC<ContactBlockType & { companyInfo?: CompanyInfo }> = ({
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
    <section>
      {/* Band 1: Light - Company Info */}
      <div className="bg-background text-foreground py-14 lg:py-20">
        <div className="container">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            {logo && (
              <Media
                resource={logo}
                alt="logo"
                className="h-14 overflow-hidden"
                imgClassName="!max-h-full !w-auto object-contain mx-auto"
              />
            )}
            {heading && <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>}
            {subheading && <p className="text-muted-foreground text-base">{subheading}</p>}

            {companyName && <p className="text-lg font-semibold">{companyName}</p>}

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {businessHours && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{businessHours}</span>
                </div>
              )}
              {callCenter && (
                <a
                  href={`tel:${callCenter.replace(/[^\d+]/g, '')}`}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Phone className="size-4" />
                  {callCenter}
                </a>
              )}
              {phones.map(
                (p, i) =>
                  p.number && (
                    <a
                      key={i}
                      href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      <Phone className="size-4" />
                      {p.label ? `${p.number} (${p.label})` : p.number}
                    </a>
                  ),
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Mail className="size-4" />
                  {email}
                </a>
              )}
            </div>

            {address && (
              <div className="text-muted-foreground flex items-start justify-center gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span className="whitespace-pre-line">{address}</span>
              </div>
            )}

            {(socialLinks.length > 0 || lineOA) && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {lineOA && (
                  <a
                    href={lineLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex size-10 items-center justify-center rounded-full transition-all"
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
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex size-10 items-center justify-center rounded-full transition-all"
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

      {/* Band 2: Dark/Primary - Form + Map */}
      <div className="bg-primary/95 text-primary-foreground py-14 lg:py-20">
        <div className="container">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
            {form?.[0] && (
              <div className="bg-background text-foreground self-start rounded-2xl border-none p-8 shadow-xl">
                {formHeading && <h3 className="mb-4 text-xl font-semibold">{formHeading}</h3>}
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
              <div className="bg-background/10 overflow-hidden rounded-2xl border-none shadow-xl">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 350 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="bg-muted"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WowtourContact6
