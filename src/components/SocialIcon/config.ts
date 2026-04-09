import type { Field } from 'payload'

export const socialIconOptions = {
  facebook: {
    label: 'Facebook',
    value: 'facebook',
  },
  twitter: {
    label: 'Twitter',
    value: 'twitter',
  },
  instagram: {
    label: 'Instagram',
    value: 'instagram',
  },
  linkedin: {
    label: 'LinkedIn',
    value: 'linkedin',
  },
  discord: {
    label: 'Discord',
    value: 'discord',
  },
  reddit: {
    label: 'Reddit',
    value: 'reddit',
  },
  telegram: {
    label: 'Telegram',
    value: 'telegram',
  },
  github: {
    label: 'GitHub',
    value: 'github',
  },
  youtube: {
    label: 'YouTube',
    value: 'youtube',
  },
  tiktok: {
    label: 'TikTok',
    value: 'tiktok',
  },
  apple: {
    label: 'Apple',
    value: 'apple',
  },
  android: {
    label: 'Android',
    value: 'android',
  },
  googleplay: {
    label: 'Google Play',
    value: 'googleplay',
  },
  email: {
    label: 'Email',
    value: 'email',
  },
  phone: {
    label: 'Phone',
    value: 'phone',
  },
  clock: {
    label: 'Clock / Business Hours',
    value: 'clock',
  },
  mappin: {
    label: 'Map Pin / Address',
    value: 'mappin',
  },
  line: {
    label: 'LINE',
    value: 'line',
  },
  website: {
    label: 'Website / Globe',
    value: 'website',
  },
  whatsapp: {
    label: 'WhatsApp',
    value: 'whatsapp',
  },
} as const

export type SocialIconType = keyof typeof socialIconOptions

export const socialIcon: Field = {
  name: 'icon',
  type: 'select',
  required: true,
  options: Object.values(socialIconOptions),
}
