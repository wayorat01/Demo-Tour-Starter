import type {
  CompanyInfo,
  ContactBlock as ContactBlockType,
  Media as MediaType,
} from '@/payload-types'
import { Media } from '@/components/Media'
import { SocialIcon } from '@/components/SocialIcon'
import { FormBlock } from '@/blocks/Form/Component'
import type { FormBlock as FormBlockType } from '@/payload-types'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'
import { extractMapSrc } from './wowtour_contact2'
import Image from 'next/image'

/**
 * WowtourContact7 — "Compact"
 * Left: Form (wider)
 * Right: Company info + Social + Map stacked
 */
const WowtourContact7: React.FC<ContactBlockType & { companyInfo?: CompanyInfo }> = ({
  companyInfo,
  form,
  heading,
  mapIframe,
  subheading,
  formHeading,
}) => {
  const qrImage = companyInfo?.qrCode as MediaType | undefined | null
  const qrUrl = qrImage?.url
  const qrAlt = qrImage?.alt || 'QR Code'
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
        {/* Header */}
        {(heading || subheading) && (
          <div className="mb-10 text-center">
            {heading && <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>}
            {subheading && <p className="text-muted-foreground mt-3 text-base">{subheading}</p>}
          </div>
        )}

        {/* Top Row: Form + Info */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: Form (wider) */}
          {form?.[0] && (
            <div className="bg-card self-start rounded-2xl border p-8 shadow-sm lg:col-span-3">
              {formHeading && (
                <h3 className="text-foreground mb-4 w-full text-xl font-semibold">{formHeading}</h3>
              )}
              <FormBlock {...(form[0] as any)} enableIntro={false} disableContainer={true} />
            </div>
          )}

          {/* Right: Info Card — left=contact, right=social */}
          <div className="bg-primary/5 grid grid-cols-1 gap-6 rounded-2xl px-8 py-8 md:grid-cols-2 lg:col-span-2">
            {/* Left: Company info */}
            <div className="flex flex-col items-center justify-center gap-4 md:items-start">
              <div className="flex flex-col items-center gap-3 md:items-start">
                {logo && (
                  <Media
                    resource={logo}
                    alt="logo"
                    className="h-10 shrink-0 overflow-hidden"
                    imgClassName="!max-h-full !w-auto object-contain"
                  />
                )}
                {companyName && <h3 className="text-base font-bold">{companyName}</h3>}
              </div>

              <div className="space-y-2.5 text-sm">
                {businessHours && (
                  <div className="flex items-center gap-2.5">
                    <Clock className="text-primary size-4 shrink-0" />
                    <span className="text-muted-foreground">{businessHours}</span>
                  </div>
                )}
                {callCenter && (
                  <a
                    href={`tel:${callCenter.replace(/[^\d+]/g, '')}`}
                    className="text-muted-foreground hover:text-primary flex items-center gap-2.5 transition-colors"
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
                        className="text-muted-foreground hover:text-primary flex items-center gap-2.5 transition-colors"
                      >
                        <Phone className="text-primary size-4 shrink-0" />
                        {p.label ? `${p.number} (${p.label})` : p.number}
                      </a>
                    ),
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="text-muted-foreground hover:text-primary flex items-center gap-2.5 transition-colors"
                  >
                    <Mail className="text-primary size-4 shrink-0" />
                    {email}
                  </a>
                )}
                {address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                    <span className="text-muted-foreground whitespace-pre-line">{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider: horizontal on mobile, vertical on md+ */}
            <div className="border-border/50 border-t md:hidden" />

            {/* Right: Social + QR/LINE */}
            <div className="border-border/50 flex flex-col items-center justify-center gap-4 md:border-l md:pl-6">
              {/* Social Icons */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
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

              {/* QR Code + LINE OA */}
              {(qrUrl || lineOA) && (
                <div className="flex flex-col items-center gap-2">
                  {qrUrl && (
                    <div className="overflow-hidden rounded-lg border bg-white p-1.5">
                      <Image
                        src={qrUrl}
                        alt={qrAlt}
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>
                  )}
                  {lineOA && (
                    <div className="text-lg font-bold">
                      {lineLink ? (
                        <a
                          href={lineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary flex items-center justify-center gap-2 transition-colors"
                        >
                          <SocialIcon type="line" className="size-5 text-green-500" />
                          {lineOA}
                        </a>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <SocialIcon type="line" className="size-5 text-green-500" />
                          {lineOA}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map — full width below */}
        {mapSrc && (
          <div className="mt-8 overflow-hidden rounded-2xl border shadow-sm">
            <iframe
              src={mapSrc}
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourContact7
