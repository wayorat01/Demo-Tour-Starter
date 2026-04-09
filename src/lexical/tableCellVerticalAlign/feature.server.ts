import { createServerFeature } from '@payloadcms/richtext-lexical'

export const TableCellVerticalAlignFeature = createServerFeature({
  feature: {
    ClientFeature:
      '@/lexical/tableCellVerticalAlign/feature.client#TableCellVerticalAlignFeatureClient',
    clientFeatureProps: null,
  },
  key: 'tableCellVerticalAlign',
})
