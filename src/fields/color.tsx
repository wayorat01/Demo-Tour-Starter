import { deepMerge, type ArrayField, type Field } from 'payload'

type ColorType = (options?: { overrides?: Partial<ArrayField> }) => Field

export const color: ColorType = ({ overrides = {} } = {}) => {
  const generatedColor: Field = {
    name: 'color',
    type: 'select',
    options: [
      'background',
      'foreground',
      'card',
      'card-foreground',
      'popover',
      'popover-foreground',
      'primary',
      'primary-foreground',
      'secondary',
      'secondary-foreground',
      'muted',
      'muted-foreground',
      'accent',
      'accent-foreground',
      'destructive',
      'destructive-foreground',
      'border',
      'input',
      'ring-3',
      'success',
      'warning',
      'error',
      'chart-1',
      'chart-2',
      'chart-3',
      'chart-4',
      'chart-5',
      'muted2',
      'muted2-foreground',
      'transparent',
    ],
  }
  return deepMerge(generatedColor, overrides)
}

export const backgroundColor = color({
  overrides: {
    name: 'backgroundColor',
    label: { en: 'Background Color', th: 'สีพื้นหลัง (Background Color)' },
    admin: {
      description: {
        en: 'Select background color for this section. Leaves blank for default.',
        th: 'เลือกสีพื้นหลังของส่วนนี้ หากปล่อยว่างไว้จะใช้สีเริ่มต้น',
      },
    },
  },
})
