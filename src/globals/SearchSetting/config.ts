import { GlobalConfig } from 'payload'

export const SearchSetting: GlobalConfig = {
  slug: 'search-setting',
  label: { en: '(Search Page)', th: 'การตั้งค่าหน้าค้นหา (Search Page)' },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'cardStyle',
      type: 'select',
      label: { en: '(Card Style)', th: 'รูปแบบการ์ดทัวร์ (Card Style)' },
      defaultValue: 'WOWTOUR_TOUR_CARD_1',
      options: [
        {
          label: 'Tour Card Style 1 (Wowtour)',
          value: 'WOWTOUR_TOUR_CARD_1',
        },
      ],
      admin: {
        description: {
          en: 'Select card style for search results page (new designs can be selected here when available)',
          th: 'เลือกรูปแบบการ์ดที่จะแสดงผลในหน้าผลลัพธ์การค้นหา (หากเพิ่มดีไซน์ใหม่เข้ามาในอนาคต จะสามารถมาเลือกที่นี่ได้ครับ)',
        },
      },
    },
  ],
}
