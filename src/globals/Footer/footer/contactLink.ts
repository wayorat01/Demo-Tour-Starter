/**
 * Smart contact link helper.
 * Auto-generates tel: / mailto: from text when icon type is phone or email,
 * so CMS users don't need to manually enter the link field.
 */
export function getContactHref(item: {
  icon?: string
  text?: string
  link?: string
}): string | null {
  // If explicit link provided, use it
  if (item.link) return item.link

  // Auto-generate based on icon type
  if (item.icon === 'phone' && item.text) {
    // Strip non-numeric except leading +
    const cleaned = item.text.replace(/[^\d+]/g, '')
    return `tel:${cleaned}`
  }

  if (item.icon === 'email' && item.text) {
    return `mailto:${item.text.trim()}`
  }

  return null
}
