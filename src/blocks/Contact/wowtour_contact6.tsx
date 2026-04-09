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

/**
 * WowtourContact5 — "Sidebar"
 * Left: Narrow sidebar (Info + Social)
 * Right: Form on top + Map on bottom
 */
const WowtourContact5: React.FC<ContactBlockType & { companyInfo?: CompanyInfo }> = ({
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
  const qrImage = companyInfo?.qrCode as MediaType | undefined | null
  const qrUrl = qrImage?.url

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        {(heading || subheading) && (
          <div className="mb-10">
            {heading && <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>}
            {subheading && <p className="text-muted-foreground mt-2 text-base">{subheading}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="bg-primary text-primary-foreground rounded-2xl p-8 lg:col-span-4">
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              {logo && (
                <Media
                  resource={logo}
                  alt="logo"
                  className="h-10 shrink-0 overflow-hidden brightness-0 invert"
                  imgClassName="!max-h-full !w-auto object-contain"
                />
              )}
              {companyName && <h3 className="text-xl font-bold">{companyName}</h3>}

              <div className="space-y-4 text-sm">
                {businessHours && (
                  <div className="flex items-center justify-center gap-3">
                    <Clock className="size-4 shrink-0 opacity-80" />
                    <span className="opacity-90">{businessHours}</span>
                  </div>
                )}
                {callCenter && (
                  <a
                    href={`tel:${callCenter.replace(/[^\d+]/g, '')}`}
                    className="flex items-center justify-center gap-3 opacity-90 transition-opacity hover:opacity-100"
                  >
                    <Phone className="size-4 shrink-0 opacity-80" />
                    {callCenter}
                  </a>
                )}
                {phones.map(
                  (p, i) =>
                    p.number && (
                      <a
                        key={i}
                        href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                        className="flex items-center justify-center gap-3 opacity-90 transition-opacity hover:opacity-100"
                      >
                        <Phone className="size-4 shrink-0 opacity-80" />
                        {p.label ? `${p.number} (${p.label})` : p.number}
                      </a>
                    ),
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center justify-center gap-3 opacity-90 transition-opacity hover:opacity-100"
                  >
                    <Mail className="size-4 shrink-0 opacity-80" />
                    {email}
                  </a>
                )}
                {address && (
                  <div className="flex items-start justify-center gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 opacity-80" />
                    <span className="whitespace-pre-line opacity-90">{address}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-full border-t border-white/20" />

              {/* QR Code + LINE OA — centered */}
              {(qrUrl || lineOA) && (
                <div className="flex flex-col items-center gap-2">
                  {qrUrl && (
                    <div className="overflow-hidden rounded-xl bg-white p-2">
                      <img src={qrUrl} alt="QR Code" width={120} height={120} className="block" />
                    </div>
                  )}
                  {lineOA &&
                    (lineLink ? (
                      <a
                        href={lineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-bold opacity-90 hover:opacity-100"
                      >
                        <SocialIcon type="line" className="size-5" />
                        {lineOA}
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-bold opacity-90">
                        <SocialIcon type="line" className="size-5" />
                        {lineOA}
                      </span>
                    ))}
                </div>
              )}

              {/* Divider */}
              {socialLinks.length > 0 && <div className="w-full border-t border-white/20" />}

              {/* Social Icons — centered */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {socialLinks.map((item, idx) => (
                    <a
                      key={item.id || idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-all hover:bg-white/20"
                      title={item.label || item.platform}
                    >
                      <SocialIcon type={item.platform} className="size-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main area */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            {form?.[0] && (
              <div className="bg-card rounded-2xl border p-8 shadow-sm">
                {formHeading && (
                  <h3 className="text-foreground mb-4 text-xl font-semibold">{formHeading}</h3>
                )}
                <FormBlock {...(form[0] as any)} enableIntro={false} disableContainer={true} />
              </div>
            )}

            {mapSrc && (
              <div className="overflow-hidden rounded-2xl border shadow-sm">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WowtourContact5
