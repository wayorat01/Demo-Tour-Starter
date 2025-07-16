import * as React from 'react'
import SectionSelectClient, { OptionsData } from './index.client'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const SectionSelect: React.FC<any> = async (data) => {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    locale: 'all',
    overrideAccess: false,
  })

  const options = pages?.docs.reduce((akku, page) => {
    if (!page.id) {
      return akku
    }
    akku[page.id] = page.layout?.map((block, i) => {
      return {
        label: `Section ${i + 1} (${block?.blockName || block?.blockType})`,
        value: block?.id!,
      }
    })
    return akku
  }, {} as OptionsData)

  return <SectionSelectClient path={data.path} options={options} />
}

export default SectionSelect
