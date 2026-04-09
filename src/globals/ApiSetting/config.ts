import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const ApiSetting: GlobalConfig = {
  slug: 'api-setting',
  label: { en: 'API Settings', th: 'ตั้งค่า API' },
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    group: { en: 'Settings', th: 'การตั้งค่า' },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'API Key',
          fields: [
            {
              name: 'apiEndPoint',
              type: 'text',
              label: 'API End Point',
              required: true,
              defaultValue: 'http://cache.apiwow.softsq.com/JsonSOA/getdata.ashx',
              admin: {
                description:
                  'Base URL for the API (e.g., http://cache.apiwow.softsq.com/JsonSOA/getdata.ashx)',
              },
            },
            {
              name: 'apiKey',
              type: 'text',
              label: 'API Key',
              required: true,
              defaultValue: 'APIcooltravel2',
            },
          ],
        },
        {
          label: 'API Endpoints',
          fields: [
            {
              name: 'endpoints',
              type: 'array',
              label: 'Endpoints',
              labels: {
                singular: 'Endpoint',
                plural: 'Endpoints',
              },
              defaultValue: [
                {
                  endpointName: 'Search Result',
                  queryParams: [
                    { key: 'mode', value: 'searchresultsproduct' },
                    { key: 'lang', value: 'th' },
                    { key: 'pagesize', value: '10' },
                    { key: 'pagenumber', value: '1' },
                    { key: 'sortby', value: 'pricehightolow' },
                    { key: 'country_slug', value: '' },
                  ],
                },
                {
                  endpointName: 'LoadCountry',
                  queryParams: [{ key: 'mode', value: 'LoadCountry' }],
                },
                {
                  endpointName: 'LoadHomePromotion',
                  queryParams: [
                    { key: 'mode', value: 'LoadHomePromotion' },
                    { key: 'lang', value: 'th' },
                  ],
                },
                {
                  endpointName: 'loadtourbytype',
                  queryParams: [
                    { key: 'mode', value: 'loadtourbytype' },
                    { key: 'type', value: '' },
                    { key: 'lang', value: 'th' },
                  ],
                },
                {
                  endpointName: 'productdetails',
                  queryParams: [
                    { key: 'mode', value: 'productdetails' },
                    { key: 'lang', value: 'th' },
                    { key: 'product_code', value: '' },
                  ],
                },
                {
                  endpointName: 'sortproduct',
                  queryParams: [
                    { key: 'mode', value: 'sortproduct' },
                    { key: 'lang', value: 'th' },
                  ],
                },
              ],
              fields: [
                {
                  name: 'endpointName',
                  type: 'text',
                  label: 'Endpoint name',
                  required: true,
                },
                {
                  name: 'queryParams',
                  type: 'array',
                  label: 'Parameters',
                  labels: {
                    singular: 'Parameter',
                    plural: 'Parameters',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'key',
                          type: 'text',
                          label: 'Parameter Key (e.g. mode, type, lang)',
                          required: true,
                          admin: {
                            width: '50%',
                          },
                        },
                        {
                          name: 'value',
                          type: 'text',
                          label: 'Value',
                          admin: {
                            width: '50%',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'urlPreview',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/components/AdminDashboard/ApiUrlPreview/Component',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Link API Mode',
          fields: [
            {
              name: 'apiModeLinks',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/AdminDashboard/ApiModeLinks/Component',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
