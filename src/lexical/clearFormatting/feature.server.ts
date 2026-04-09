import { createServerFeature } from '@payloadcms/richtext-lexical'

export const ClearFormattingFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical/clearFormatting/feature.client#ClearFormattingFeatureClient',
    clientFeatureProps: null,
  },
  key: 'clearFormatting',
})
