import type { TextField, TextFieldSingleValidation } from 'payload'

const validateCssColor: TextFieldSingleValidation = (value: string | null | undefined) => {
  if (!value) return true // Allow empty

  // Match HSL or HEX formats
  const hslRegex = /^hsl\(\s*\d+(?:\.\d+)?,?\s*\d+(?:\.\d+)?%?,?\s*\d+(?:\.\d+)?%?\s*\)$/i
  const hexRegex = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i

  if (!hslRegex.test(value) && !hexRegex.test(value)) {
    return 'Please enter a valid color (e.g. hsl(0, 100%, 50%) or #FF0000)'
  }
  return true
}

type ColorPickerOptions = {
  name: string
  label?: TextField['label']
  defaultValue?: string
  admin?: Partial<TextField['admin']>
  required?: boolean
}

export const colorPickerField = (options: ColorPickerOptions): TextField => {
  const defaultVal = options.defaultValue ?? 'hsl(0, 0%, 100%)'
  return {
    name: options.name,
    type: 'text',
    label: options.label,
    defaultValue: defaultVal,
    required: options.required,
    validate: validateCssColor,
    admin: {
      ...options.admin,
      components: {
        Field: {
          path: '@/fields/colorPicker/ColorPickerComponent#ColorPickerComponent',
          clientProps: {
            defaultValue: defaultVal,
          },
        },
      },
    },
  }
}
