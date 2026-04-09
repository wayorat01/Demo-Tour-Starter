import type { GlobalConfig, TextFieldSingleValidation } from 'payload'

import { revalidateThemeConfig } from './hooks/revalidateThemeConfig'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import localization from '@/localization.config'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import { isAdminFieldLevel } from '@/access/isAdmin'
import { colorPickerField } from '@/fields/colorPicker'

const validateCssColor: TextFieldSingleValidation = (value: string) => {
  const cssColorRegex =
    /^#(?:[\da-f]{3}){1,2}$|^#(?:[\da-f]{4}){1,2}$|(rgb|hsl)a?\((\s*-?\d+(?:\.\d+)?%?\s*,){2}(\s*-?\d+(?:\.\d+)?%?\s*)\)|(rgb|hsl)a?\((\s*-?\d+(?:\.\d+)?%?\s*,){3}\s*(0|(0?\.\d+)|1)\)/gim
  if (!cssColorRegex.test(value)) {
    return 'Please enter a valid css color (e.g. #FF0000, #F00, rgb(255, 0, 0), hsl(0, 100%, 50%), rgba(255, 0, 0, 0.5), hsla(0, 100%, 50%, 0.5))'
  }
  return true
}

const validateCssSize: TextFieldSingleValidation = (value: string) => {
  const cssSizeRegex = /^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax|pt|pc|in|cm|mm|ex|ch)$/i
  if (!cssSizeRegex.test(value)) {
    return 'Please enter a valid CSS size (e.g. 10px, 1.5rem, 50%, 100vh)'
  }
  return true
}

// Available font options for Theme Typography (shared between bodyFont & headingFont)
const fontSelectOptions: { label: string; value: string }[] = [
  // Built-in Fonts (Local — fastest, no network request)
  { label: 'Kanit (Built-in)', value: 'kanit' },
  { label: 'Noto Sans Thai (Built-in)', value: 'noto-sans-thai' },
  { label: 'Noto Sans Thai Looped (Built-in)', value: 'noto-sans-thai-looped' },
  // Google Fonts — Thai
  { label: 'Sarabun (Google)', value: 'google:Sarabun' },
  { label: 'Prompt (Google)', value: 'google:Prompt' },
  { label: 'IBM Plex Sans Thai (Google)', value: 'google:IBM Plex Sans Thai' },
  { label: 'Mitr (Google)', value: 'google:Mitr' },
  { label: 'Chakra Petch (Google)', value: 'google:Chakra Petch' },
  { label: 'Bai Jamjuree (Google)', value: 'google:Bai Jamjuree' },
  { label: 'K2D (Google)', value: 'google:K2D' },
  { label: 'Kodchasan (Google)', value: 'google:Kodchasan' },
  { label: 'Athiti (Google)', value: 'google:Athiti' },
  { label: 'Pridi (Google) — Serif', value: 'google:Pridi' },
  { label: 'Charm (Google) — Handwritten', value: 'google:Charm' },
  { label: 'Sriracha (Google) — Casual', value: 'google:Sriracha' },
  { label: 'Itim (Google) — Fun', value: 'google:Itim' },
  { label: 'Mali (Google) — Friendly', value: 'google:Mali' },
  { label: 'Thasadith (Google) — Modern Serif', value: 'google:Thasadith' },
  // Google Fonts — International
  { label: 'Inter (Google) — Latin', value: 'google:Inter' },
  { label: 'Poppins (Google) — Latin', value: 'google:Poppins' },
  { label: 'Montserrat (Google) — Latin', value: 'google:Montserrat' },
  { label: 'Nunito (Google) — Latin', value: 'google:Nunito' },
  { label: 'Open Sans (Google) — Latin', value: 'google:Open Sans' },
  // Custom
  { label: 'Custom Google Font (พิมพ์ชื่อเอง)', value: 'custom' },
]

export const ThemeConfig: GlobalConfig = {
  slug: 'themeConfig',
  label: { en: 'Theme', th: 'ธีม' },
  access: {
    read: () => true,
    update: isAdminFieldLevel,
  },
  admin: {
    description: 'Theme configuration (For live preview config has to be saved)',
    livePreview: {
      url: () => {
        const path = generatePreviewPath({
          slug: 'home',
          breadcrumbs: undefined,
          collection: 'pages',
          locale: localization.defaultLocale,
        })

        return `${NEXT_PUBLIC_SERVER_URL}${path}`
      },
    },
    preview: () => {
      const path = generatePreviewPath({
        slug: 'home',
        breadcrumbs: undefined,
        collection: 'pages',
        locale: localization.defaultLocale,
      })

      return `${NEXT_PUBLIC_SERVER_URL}${path}`
    },
  },
  fields: [
    {
      name: 'typography',
      label: 'Typography',
      type: 'group',
      fields: [
        {
          name: 'bodyFont',
          label: { en: 'Body Font', de: 'Schriftart für Text' },
          type: 'select',
          defaultValue: 'kanit',
          options: fontSelectOptions,
          admin: {
            description: {
              en: 'Body text font. Google Fonts load on-demand — only the selected font is downloaded.',
              de: 'Schriftart für Fließtext. Google Fonts werden bei Bedarf geladen.',
            },
          },
        },
        {
          name: 'customBodyFontName',
          label: { en: 'Custom Body Font Name' },
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.bodyFont === 'custom',
            description: {
              en: 'Exact Google Font name (e.g. "Roboto", "Lato"). Browse at fonts.google.com',
            },
          },
        },
        {
          name: 'headingFont',
          label: { en: 'Heading Font', de: 'Schriftart für Überschriften' },
          type: 'select',
          defaultValue: 'kanit',
          options: fontSelectOptions,
          admin: {
            description: {
              en: 'Heading font (h1-h6). Google Fonts load on-demand — only the selected font is downloaded.',
              de: 'Schriftart für Überschriften. Google Fonts werden bei Bedarf geladen.',
            },
          },
        },
        {
          name: 'customHeadingFontName',
          label: { en: 'Custom Heading Font Name' },
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.headingFont === 'custom',
            description: {
              en: 'Exact Google Font name (e.g. "Roboto", "Lato"). Browse at fonts.google.com',
            },
          },
        },
      ],
    },
    {
      name: 'radius',
      type: 'text',
      validate: validateCssSize,
      defaultValue: '0.6rem',
    },
    {
      name: 'regularColors',
      label: 'Regular Colors',
      type: 'group',
      fields: [
        {
          name: 'clearAllColors',
          type: 'ui',
          admin: {
            components: {
              Field: '@/fields/colorPicker/ClearAllColorsButton#ClearAllColorsButton',
            },
          },
        },
        colorPickerField({
          name: 'background',
          label: { en: 'Background Color', de: 'Hintergrundfarbe' },
          defaultValue: 'hsl(0, 0%, 100%)',
          admin: {
            description: {
              en: 'The main background color of the website. Used for the overall page background and provides the base canvas for all content.',
              de: 'Die Haupthintergrundfarbe der Website. Wird für den gesamten Seitenhintergrund verwendet und bildet die Grundlage für alle Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'foreground',
          label: { en: 'Text Color', de: 'Textfarbe' },
          defaultValue: 'hsl(222, 84%, 5%)',
          admin: {
            description: {
              en: 'The primary text color used throughout the website. Provides optimal contrast against the background for readability.',
              de: 'Die primäre Textfarbe, die auf der gesamten Website verwendet wird. Bietet optimalen Kontrast zum Hintergrund für beste Lesbarkeit.',
            },
          },
        }),
        colorPickerField({
          name: 'card',
          label: { en: 'Card Background', de: 'Karten-Hintergrund' },
          defaultValue: 'hsl(240, 5%, 96%)',
          admin: {
            description: {
              en: 'Background color for card components. Used for elevated surfaces that contain grouped content.',
              de: 'Hintergrundfarbe für Kartenkomponenten. Wird für erhöhte Oberflächen verwendet, die gruppierten Inhalt enthalten.',
            },
          },
        }),
        colorPickerField({
          name: 'card-foreground',
          label: { en: 'Card Text Color', de: 'Karten-Textfarbe' },
          defaultValue: 'hsl(222, 84%, 5%)',
          admin: {
            description: {
              en: 'Text color used within card components. Ensures readable content against the card background.',
              de: 'Textfarbe innerhalb von Kartenkomponenten. Gewährleistet lesbare Inhalte auf dem Kartenhintergrund.',
            },
          },
        }),
        colorPickerField({
          name: 'popover',
          label: { en: 'Popover Background', de: 'Popover-Hintergrund' },
          defaultValue: 'hsl(0, 0%, 100%)',
          admin: {
            description: {
              en: 'Background color for floating elements like dropdowns, tooltips, and popovers.',
              de: 'Hintergrundfarbe für schwebende Elemente wie Dropdown-Menüs, Tooltips und Popovers.',
            },
          },
        }),
        colorPickerField({
          name: 'popover-foreground',
          label: { en: 'Popover Text Color', de: 'Popover-Textfarbe' },
          defaultValue: 'hsl(222, 84%, 5%)',
          admin: {
            description: {
              en: 'Text color used within popover elements. Ensures content is readable against the popover background.',
              de: 'Textfarbe in Popover-Elementen. Stellt sicher, dass der Inhalt auf dem Popover-Hintergrund lesbar ist.',
            },
          },
        }),
        colorPickerField({
          name: 'primary',
          label: { en: 'Primary Color', de: 'Primärfarbe' },
          defaultValue: 'hsl(222, 47%, 11%)',
          admin: {
            description: {
              en: 'Main brand color used for important interactive elements like primary buttons, links, and key UI components. This color should reflect your brand identity.',
              de: 'Hauptmarkenfarbe für wichtige interaktive Elemente wie primäre Schaltflächen, Links und zentrale UI-Komponenten. Diese Farbe sollte Ihre Markenidentität widerspiegeln.',
            },
          },
        }),
        colorPickerField({
          name: 'primary-foreground',
          label: { en: 'Primary Text Color', de: 'Primäre Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            description: {
              en: 'Text color used on primary backgrounds. Ensures optimal contrast and readability for emphasized content.',
              de: 'Textfarbe auf primären Hintergründen. Gewährleistet optimalen Kontrast und Lesbarkeit für hervorgehobene Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'secondary',
          label: { en: 'Secondary Color', de: 'Sekundärfarbe' },
          defaultValue: 'hsl(210, 40%, 96%)',
          admin: {
            description: {
              en: 'Used for secondary UI elements and alternative actions. Provides visual hierarchy and contrast to primary elements.',
              de: 'Verwendet für sekundäre UI-Elemente und alternative Aktionen. Bietet visuelle Hierarchie und Kontrast zu primären Elementen.',
            },
          },
        }),
        colorPickerField({
          name: 'secondary-foreground',
          label: { en: 'Secondary Text Color', de: 'Sekundäre Textfarbe' },
          defaultValue: 'hsl(222, 47%, 11%)',
          admin: {
            description: {
              en: 'Text color for secondary UI elements. Ensures readability while maintaining visual distinction from primary text.',
              de: 'Textfarbe für sekundäre UI-Elemente. Gewährleistet Lesbarkeit bei gleichzeitiger visueller Unterscheidung vom primären Text.',
            },
          },
        }),
        colorPickerField({
          name: 'muted',
          label: { en: 'Muted Background', de: 'Gedämpfter Hintergrund' },
          defaultValue: 'hsl(210, 40%, 96%)',
          admin: {
            description: {
              en: 'Used for subtle background variations and disabled states. Creates visual depth without drawing attention.',
              de: 'Verwendet für subtile Hintergrundvariationen und deaktivierte Zustände. Erzeugt visuelle Tiefe ohne Aufmerksamkeit zu erregen.',
            },
          },
        }),
        colorPickerField({
          name: 'muted-foreground',
          label: { en: 'Muted Text Color', de: 'Gedämpfte Textfarbe' },
          defaultValue: 'hsl(215, 16%, 47%)',
          admin: {
            description: {
              en: 'Used for less prominent text like placeholders and disabled content. Provides subtle contrast against the background.',
              de: 'Verwendet für weniger prominenten Text wie Platzhalter und deaktivierte Inhalte. Bietet subtilen Kontrast zum Hintergrund.',
            },
          },
        }),
        colorPickerField({
          name: 'accent',
          label: { en: 'Accent Color', de: 'Akzentfarbe' },
          defaultValue: 'hsl(210, 40%, 96%)',
          admin: {
            description: {
              en: 'Used for highlighting and emphasizing specific UI elements. Adds visual interest and draws attention to important features.',
              de: 'Verwendet für die Hervorhebung bestimmter UI-Elemente. Fügt visuelles Interesse hinzu und lenkt die Aufmerksamkeit auf wichtige Funktionen.',
            },
          },
        }),
        colorPickerField({
          name: 'accent-foreground',
          label: { en: 'Accent Text Color', de: 'Akzent-Textfarbe' },
          defaultValue: 'hsl(222, 47%, 11%)',
          admin: {
            description: {
              en: 'Text color used on accent backgrounds. Ensures optimal contrast and readability for emphasized content.',
              de: 'Textfarbe auf Akzenthintergründen. Gewährleistet optimalen Kontrast und Lesbarkeit für hervorgehobene Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'destructive',
          label: { en: 'Destructive Color', de: 'Destruktive Farbe' },
          defaultValue: 'hsl(0, 84%, 60%)',
          admin: {
            description: {
              en: 'Used for destructive actions like deleting or removing content. Provides clear visual indication of potential negative consequences.',
              de: 'Verwendet für destruktive Aktionen wie das Löschen oder Entfernen von Inhalten. Bietet klare visuelle Anzeige möglicher negativer Konsequenzen.',
            },
          },
        }),
        colorPickerField({
          name: 'destructive-foreground',
          label: { en: 'Destructive Text Color', de: 'Destruktive Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            description: {
              en: 'Text color used on destructive backgrounds. Ensures optimal contrast and readability for emphasized content.',
              de: 'Textfarbe auf destruktiven Hintergründen. Gewährleistet optimalen Kontrast und Lesbarkeit für hervorgehobene Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'border',
          label: { en: 'Border Color', de: 'Rahmenfarbe' },
          defaultValue: 'hsl(240, 6%, 90%)',
          admin: {
            description: {
              en: 'Used for borders and outlines of UI elements. Provides visual separation and definition.',
              de: 'Verwendet für Ränder und Umrandungen von UI-Elementen. Bietet visuelle Trennung und Definition.',
            },
          },
        }),
        colorPickerField({
          name: 'input',
          label: { en: 'Input Background', de: 'Eingabehintergrund' },
          defaultValue: 'hsl(214, 32%, 91%)',
          admin: {
            description: {
              en: 'Background color for input fields and text areas. Provides a clear and readable surface for user input.',
              de: 'Hintergrundfarbe für Eingabefelder und Textbereiche. Bietet eine klare und lesbare Oberfläche für Benutzereingaben.',
            },
          },
        }),
        colorPickerField({
          name: 'ring-3',
          label: { en: 'Ring Color', de: 'Ringfarbe' },
          defaultValue: 'hsl(222, 84%, 5%)',
          admin: {
            description: {
              en: 'Used for ring or glow effects around interactive elements. Provides visual feedback and emphasis.',
              de: 'Verwendet für Ring- oder Glowe-Effekte um interaktive Elemente. Bietet visuelles Feedback und Betonung.',
            },
          },
        }),
        colorPickerField({
          name: 'success',
          label: { en: 'Success Color', de: 'Erfolgfarbe' },
          defaultValue: 'hsl(196, 52%, 74%)',
          admin: {
            description: {
              en: 'Used for success messages and positive feedback. Provides a clear visual indication of successful actions.',
              de: 'Verwendet für Erfolgsmeldungen und positives Feedback. Bietet eine klare visuelle Anzeige erfolgreicher Aktionen.',
            },
          },
        }),
        colorPickerField({
          name: 'warning',
          label: { en: 'Warning Color', de: 'Warnfarbe' },
          defaultValue: 'hsl(34, 89%, 85%)',
          admin: {
            description: {
              en: 'Used for warning messages and cautionary feedback. Provides a clear visual indication of potential issues.',
              de: 'Verwendet für Warnmeldungen und vorsichtiges Feedback. Bietet eine klare visuelle Anzeige möglicher Probleme.',
            },
          },
        }),
        colorPickerField({
          name: 'error',
          label: { en: 'Error Color', de: 'Fehlerfarbe' },
          defaultValue: 'hsl(10, 100%, 86%)',
          admin: {
            description: {
              en: 'Used for error messages and critical feedback. Provides a clear visual indication of errors or problems.',
              de: 'Verwendet für Fehlermeldungen und kritische Feedback. Bietet eine klare visuelle Anzeige von Fehlern oder Problemen.',
            },
          },
        }),
        colorPickerField({
          name: 'chart-1',
          label: { en: 'Chart Color 1', de: 'Diagrammfarbe 1' },
          defaultValue: 'hsl(12, 76%, 61%)',
          admin: {
            description: {
              en: 'Used for the first series of data in charts and graphs. Provides visual distinction and clarity.',
              de: 'Verwendet für die erste Reihe von Daten in Diagrammen und Grafiken. Bietet visuelle Unterscheidung und Klarheit.',
            },
          },
        }),
        colorPickerField({
          name: 'chart-2',
          label: { en: 'Chart Color 2', de: 'Diagrammfarbe 2' },
          defaultValue: 'hsl(173, 58%, 39%)',
          admin: {
            description: {
              en: 'Used for the second series of data in charts and graphs. Provides visual distinction and clarity.',
              de: 'Verwendet für die zweite Reihe von Daten in Diagrammen und Grafiken. Bietet visuelle Unterscheidung und Klarheit.',
            },
          },
        }),
        colorPickerField({
          name: 'chart-3',
          label: { en: 'Chart Color 3', de: 'Diagrammfarbe 3' },
          defaultValue: 'hsl(197, 37%, 24%)',
          admin: {
            description: {
              en: 'Used for the third series of data in charts and graphs. Provides visual distinction and clarity.',
              de: 'Verwendet für die dritte Reihe von Daten in Diagrammen und Grafiken. Bietet visuelle Unterscheidung und Klarheit.',
            },
          },
        }),
        colorPickerField({
          name: 'chart-4',
          label: { en: 'Chart Color 4', de: 'Diagrammfarbe 4' },
          defaultValue: 'hsl(43, 74%, 66%)',
          admin: {
            description: {
              en: 'Used for the fourth series of data in charts and graphs. Provides visual distinction and clarity.',
              de: 'Verwendet für die vierte Reihe von Daten in Diagrammen und Grafiken. Bietet visuelle Unterscheidung und Klarheit.',
            },
          },
        }),
        colorPickerField({
          name: 'chart-5',
          label: { en: 'Chart Color 5', de: 'Diagrammfarbe 5' },
          defaultValue: 'hsl(27, 87%, 67%)',
          admin: {
            description: {
              en: 'Used for the fifth series of data in charts and graphs. Provides visual distinction and clarity.',
              de: 'Verwendet für die fünfte Reihe von Daten in Diagrammen und Grafiken. Bietet visuelle Unterscheidung und Klarheit.',
            },
          },
        }),
        colorPickerField({
          name: 'muted2',
          label: { en: 'Muted Background 2', de: 'Gedämpfter Hintergrund 2' },
          defaultValue: 'hsl(0, 0%, 91%)',
          admin: {
            description: {
              en: 'Used for subtle background variations and disabled states. Creates visual depth without drawing attention.',
              de: 'Verwendet für subtile Hintergrundvariationen und deaktivierte Zustände. Erzeugt visuelle Tiefe ohne Aufmerksamkeit zu erregen.',
            },
          },
        }),
        colorPickerField({
          name: 'muted2-foreground',
          label: { en: 'Muted Text Color 2', de: 'Gedämpfte Textfarbe 2' },
          defaultValue: 'hsl(240, 4%, 46%)',
          admin: {
            description: {
              en: 'Used for less prominent text like placeholders and disabled content. Provides subtle contrast against the background.',
              de: 'Verwendet für weniger prominenten Text wie Platzhalter und deaktivierte Inhalte. Bietet subtilen Kontrast zum Hintergrund.',
            },
          },
        }),
      ],
    },
    {
      name: 'darkmodeColors',
      label: 'Darkmode Colors',
      type: 'group',
      fields: [
        {
          name: 'enableDarkMode',
          label: 'Enable Darkmode',
          type: 'checkbox',
        },
        {
          name: 'clearAllDarkmodeColors',
          type: 'ui',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            components: {
              Field:
                '@/fields/colorPicker/ClearAllDarkmodeColorsButton#ClearAllDarkmodeColorsButton',
            },
          },
        },
        colorPickerField({
          name: 'background',
          label: { en: 'Background Color', de: 'Hintergrundfarbe' },
          defaultValue: 'hsl(0, 0%, 0%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'The main background color of the website. Used for the overall page background and provides the base canvas for all content.',
              de: 'Die Haupthintergrundfarbe der Website. Wird für den gesamten Seitenhintergrund verwendet und bildet die Grundlage für alle Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'foreground',
          label: { en: 'Text Color', de: 'Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'The primary text color used throughout the website. Provides optimal contrast against the background for readability.',
              de: 'Die primäre Textfarbe, die auf der gesamten Website verwendet wird. Bietet optimalen Kontrast zum Hintergrund für beste Lesbarkeit.',
            },
          },
        }),
        colorPickerField({
          name: 'card',
          label: { en: 'Card Background', de: 'Karten-Hintergrund' },
          defaultValue: 'hsl(240, 6%, 10%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Background color for card components. Used for elevated surfaces that contain grouped content.',
              de: 'Hintergrundfarbe für Kartenkomponenten. Wird für erhöhte Oberflächen verwendet, die gruppierten Inhalt enthalten.',
            },
          },
        }),
        colorPickerField({
          name: 'card-foreground',
          label: { en: 'Card Text Color', de: 'Karten-Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Text color used within card components. Ensures readable content against the card background.',
              de: 'Textfarbe innerhalb von Kartenkomponenten. Gewährleistet lesbare Inhalte auf dem Kartenhintergrund.',
            },
          },
        }),
        colorPickerField({
          name: 'popover',
          label: { en: 'Popover Background', de: 'Popover-Hintergrund' },
          defaultValue: 'hsl(222.2 84%, 4.9%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Background color for floating elements like dropdowns, tooltips, and popovers.',
              de: 'Hintergrundfarbe für schwebende Elemente wie Dropdown-Menüs, Tooltips und Popovers.',
            },
          },
        }),
        colorPickerField({
          name: 'popover-foreground',
          label: { en: 'Popover Text Color', de: 'Popover-Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Text color used within popover elements. Ensures content is readable against the popover background.',
              de: 'Textfarbe in Popover-Elementen. Stellt sicher, dass der Inhalt auf dem Popover-Hintergrund lesbar ist.',
            },
          },
        }),
        colorPickerField({
          name: 'primary',
          label: { en: 'Primary Color', de: 'Primärfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Main brand color used for important interactive elements like primary buttons, links, and key UI components. This color should reflect your brand identity.',
              de: 'Hauptmarkenfarbe für wichtige interaktive Elemente wie primäre Schaltflächen, Links und zentrale UI-Komponenten. Diese Farbe sollte Ihre Markenidentität widerspiegeln.',
            },
          },
        }),
        colorPickerField({
          name: 'primary-foreground',
          label: { en: 'Primary Text Color', de: 'Primäre Textfarbe' },
          defaultValue: 'hsl(222.2 47.4%, 11.2%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Text color used on primary backgrounds. Ensures optimal contrast and readability for emphasized content.',
              de: 'Textfarbe auf primären Hintergründen. Gewährleistet optimalen Kontrast und Lesbarkeit für hervorgehobene Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'secondary',
          label: { en: 'Secondary Color', de: 'Sekundärfarbe' },
          defaultValue: 'hsl(217.2 32.6%, 17.5%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for secondary UI elements and alternative actions. Provides visual hierarchy and contrast to primary elements.',
              de: 'Verwendet für sekundäre UI-Elemente und alternative Aktionen. Bietet visuelle Hierarchie und Kontrast zu primären Elementen.',
            },
          },
        }),
        colorPickerField({
          name: 'secondary-foreground',
          label: { en: 'Secondary Text Color', de: 'Sekundäre Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Text color for secondary UI elements. Ensures readability while maintaining visual distinction from primary text.',
              de: 'Textfarbe für sekundäre UI-Elemente. Gewährleistet Lesbarkeit bei gleichzeitiger visueller Unterscheidung vom primären Text.',
            },
          },
        }),
        colorPickerField({
          name: 'muted',
          label: { en: 'Muted Background', de: 'Gedämpfter Hintergrund' },
          defaultValue: 'hsl(217.2 32.6%, 17.5%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for subtle background variations and disabled states. Creates visual depth without drawing attention.',
              de: 'Verwendet für subtile Hintergrundvariationen und deaktivierte Zustände. Erzeugt visuelle Tiefe ohne Aufmerksamkeit zu erregen.',
            },
          },
        }),
        colorPickerField({
          name: 'muted-foreground',
          label: { en: 'Muted Text Color', de: 'Gedämpfte Textfarbe' },
          defaultValue: 'hsl(215, 20.2%, 65.1%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for less prominent text like placeholders and disabled content. Provides subtle contrast against the background.',
              de: 'Verwendet für weniger prominenten Text wie Platzhalter und deaktivierte Inhalte. Bietet subtilen Kontrast zum Hintergrund.',
            },
          },
        }),
        colorPickerField({
          name: 'accent',
          label: { en: 'Accent Color', de: 'Akzentfarbe' },
          defaultValue: 'hsl(217.2 32.6%, 17.5%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for highlighting and emphasizing specific UI elements. Adds visual interest and draws attention to important features.',
              de: 'Verwendet für die Hervorhebung bestimmter UI-Elemente. Fügt visuelles Interesse hinzu und lenkt die Aufmerksamkeit auf wichtige Funktionen.',
            },
          },
        }),
        colorPickerField({
          name: 'accent-foreground',
          label: { en: 'Accent Text Color', de: 'Akzent-Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Text color used on accent backgrounds. Ensures optimal contrast and readability for emphasized content.',
              de: 'Textfarbe auf Akzenthintergründen. Gewährleistet optimalen Kontrast und Lesbarkeit für hervorgehobene Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'destructive',
          label: { en: 'Destructive Color', de: 'Destruktive Farbe' },
          defaultValue: 'hsl(0, 62.8%, 30.6%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for destructive actions like deleting or removing content. Provides clear visual indication of potential negative consequences.',
              de: 'Verwendet für destruktive Aktionen wie das Löschen oder Entfernen von Inhalten. Bietet klare visuelle Anzeige möglicher negativer Konsequenzen.',
            },
          },
        }),
        colorPickerField({
          name: 'destructive-foreground',
          label: { en: 'Destructive Text Color', de: 'Destruktive Textfarbe' },
          defaultValue: 'hsl(210, 40%, 98%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Text color used on destructive backgrounds. Ensures optimal contrast and readability for emphasized content.',
              de: 'Textfarbe auf destruktiven Hintergründen. Gewährleistet optimalen Kontrast und Lesbarkeit für hervorgehobene Inhalte.',
            },
          },
        }),
        colorPickerField({
          name: 'border',
          label: { en: 'Border Color', de: 'Rahmenfarbe' },
          defaultValue: 'hsl(240, 4%, 16%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for borders and outlines of UI elements. Provides visual separation and definition.',
              de: 'Verwendet für Ränder und Umrandungen von UI-Elementen. Bietet visuelle Trennung und Definition.',
            },
          },
        }),
        colorPickerField({
          name: 'input',
          label: { en: 'Input Background', de: 'Eingabehintergrund' },
          defaultValue: 'hsl(217.2 32.6%, 17.5%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Background color for input fields and text areas. Provides a clear and readable surface for user input.',
              de: 'Hintergrundfarbe für Eingabefelder und Textbereiche. Bietet eine klare und lesbare Oberfläche für Benutzereingaben.',
            },
          },
        }),
        colorPickerField({
          name: 'ring-3',
          label: { en: 'Ring Color', de: 'Ringfarbe' },
          defaultValue: 'hsl(212,.7 26.8%, 83.9%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for ring-3 or glow effects around interactive elements. Provides visual feedback and emphasis.',
              de: 'Verwendet für Ring- oder Glowe-Effekte um interaktive Elemente. Bietet visuelles Feedback und Betonung.',
            },
          },
        }),
        colorPickerField({
          name: 'success',
          label: { en: 'Success Color', de: 'Erfolgfarbe' },
          defaultValue: 'hsl(196, 100%, 14%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for success messages and positive feedback. Provides a clear visual indication of successful actions.',
              de: 'Verwendet für Erfolgsmeldungen und positives Feedback. Bietet eine klare visuelle Anzeige erfolgreicher Aktionen.',
            },
          },
        }),
        colorPickerField({
          name: 'warning',
          label: { en: 'Warning Color', de: 'Warnfarbe' },
          defaultValue: 'hsl(34, 51%, 25%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for warning messages and cautionary feedback. Provides a clear visual indication of potential issues.',
              de: 'Verwendet für Warnmeldungen und vorsichtiges Feedback. Bietet eine klare visuelle Anzeige möglicher Probleme.',
            },
          },
        }),
        colorPickerField({
          name: 'error',
          label: { en: 'Error Color', de: 'Fehlerfarbe' },
          defaultValue: 'hsl(10, 39%, 43%)',
          admin: {
            condition: (_, { enableDarkMode } = {}) => enableDarkMode,
            description: {
              en: 'Used for error messages and critical feedback. Provides a clear visual indication of errors or failures.',
              de: 'Verwendet für Fehlermeldungen und kritisches Feedback. Bietet eine klare visuelle Anzeige von Fehlern oder Ausfällen.',
            },
          },
        }),
      ],
    },
    {
      name: 'buttonColors',
      label: 'Button Colors',
      type: 'group',
      admin: {
        description:
          'Button styling with gradient support. These settings apply to all buttons site-wide.',
      },
      fields: [
        // Button Background
        {
          type: 'collapsible',
          label: 'Button Background',
          admin: {
            initCollapsed: false,
            description:
              'Primary button background color or gradient. Enable gradient for a two-tone effect.',
          },
          fields: [
            {
              name: 'buttonBgPreview',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/fields/buttonPreview/ButtonPreview#ButtonBgPreview',
                },
              },
            },
            {
              name: 'enableButtonBgGradient',
              label: 'Enable Gradient',
              type: 'checkbox',
              defaultValue: false,
            },
            colorPickerField({
              name: 'buttonBgColor',
              label: { en: 'Button Color', de: 'Buttonfarbe' },
              defaultValue: '#DC1F26',
              admin: {
                condition: (_, siblingData) => !siblingData?.enableButtonBgGradient,
                description: {
                  en: 'Solid background color for buttons when gradient is disabled.',
                  de: 'Einfarbiger Hintergrund für Buttons wenn Farbverlauf deaktiviert ist.',
                },
              },
            }),
            {
              type: 'row',
              admin: {
                condition: (_, siblingData) => siblingData?.enableButtonBgGradient,
              },
              fields: [
                colorPickerField({
                  name: 'buttonBgGradientStartColor',
                  label: { en: 'Start Color', de: 'Startfarbe' },
                  defaultValue: '#DC1F26',
                  admin: {
                    width: '50%',
                  },
                }),
                colorPickerField({
                  name: 'buttonBgGradientEndColor',
                  label: { en: 'End Color', de: 'Endfarbe' },
                  defaultValue: '#8B0D11',
                  admin: {
                    width: '50%',
                  },
                }),
              ],
            },
            {
              type: 'row',
              admin: {
                condition: (_, siblingData) => siblingData?.enableButtonBgGradient,
              },
              fields: [
                {
                  name: 'buttonBgGradientType',
                  label: 'Gradient Type',
                  type: 'select',
                  defaultValue: 'linear',
                  options: [
                    { label: 'Linear', value: 'linear' },
                    { label: 'Radial', value: 'radial' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'buttonBgGradientPosition',
                  label: 'Position',
                  type: 'select',
                  defaultValue: 'to bottom',
                  options: [
                    { label: 'Top', value: 'to top' },
                    { label: 'Top Right', value: 'to top right' },
                    { label: 'Right', value: 'to right' },
                    { label: 'Bottom Right', value: 'to bottom right' },
                    { label: 'Bottom', value: 'to bottom' },
                    { label: 'Bottom Left', value: 'to bottom left' },
                    { label: 'Left', value: 'to left' },
                    { label: 'Top Left', value: 'to top left' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        // Button Hover Background
        {
          type: 'collapsible',
          label: 'Button Hover Background',
          admin: {
            initCollapsed: true,
            description: 'Button background on hover state.',
          },
          fields: [
            {
              name: 'buttonHoverPreview',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/fields/buttonPreview/ButtonPreview#ButtonHoverPreview',
                },
              },
            },
            {
              name: 'enableButtonHoverBgGradient',
              label: 'Enable Gradient',
              type: 'checkbox',
              defaultValue: false,
            },
            colorPickerField({
              name: 'buttonHoverBgColor',
              label: { en: 'Button Color', de: 'Buttonfarbe' },
              defaultValue: '#B31117',
              admin: {
                condition: (_, siblingData) => !siblingData?.enableButtonHoverBgGradient,
                description: {
                  en: 'Solid background color for button hover state when gradient is disabled.',
                  de: 'Einfarbiger Hintergrund für Button Hover-Zustand wenn Farbverlauf deaktiviert ist.',
                },
              },
            }),
            {
              type: 'row',
              admin: {
                condition: (_, siblingData) => siblingData?.enableButtonHoverBgGradient,
              },
              fields: [
                colorPickerField({
                  name: 'buttonHoverBgGradientStartColor',
                  label: { en: 'Start Color', de: 'Startfarbe' },
                  defaultValue: '#B31117',
                  admin: {
                    width: '50%',
                  },
                }),
                colorPickerField({
                  name: 'buttonHoverBgGradientEndColor',
                  label: { en: 'End Color', de: 'Endfarbe' },
                  defaultValue: '#6B0A0E',
                  admin: {
                    width: '50%',
                  },
                }),
              ],
            },
            {
              type: 'row',
              admin: {
                condition: (_, siblingData) => siblingData?.enableButtonHoverBgGradient,
              },
              fields: [
                {
                  name: 'buttonHoverBgGradientType',
                  label: 'Gradient Type',
                  type: 'select',
                  defaultValue: 'linear',
                  options: [
                    { label: 'Linear', value: 'linear' },
                    { label: 'Radial', value: 'radial' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'buttonHoverBgGradientPosition',
                  label: 'Position',
                  type: 'select',
                  defaultValue: 'to bottom',
                  options: [
                    { label: 'Top', value: 'to top' },
                    { label: 'Top Right', value: 'to top right' },
                    { label: 'Right', value: 'to right' },
                    { label: 'Bottom Right', value: 'to bottom right' },
                    { label: 'Bottom', value: 'to bottom' },
                    { label: 'Bottom Left', value: 'to bottom left' },
                    { label: 'Left', value: 'to left' },
                    { label: 'Top Left', value: 'to top left' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        // Button Text Colors
        colorPickerField({
          name: 'buttonTextColor',
          label: { en: 'Button Text Color', de: 'Button Textfarbe' },
          defaultValue: '#FFFFFF',
          admin: {
            description: {
              en: 'Text color for all buttons.',
              de: 'Textfarbe für alle Buttons.',
            },
          },
        }),
        colorPickerField({
          name: 'buttonTextHoverColor',
          label: { en: 'Button Text Hover Color', de: 'Button Text Hover Farbe' },
          defaultValue: '#FFFFFF',
          admin: {
            description: {
              en: 'Text color for buttons on hover.',
              de: 'Textfarbe für Buttons beim Hover.',
            },
          },
        }),
        // Button Border Radius
        {
          name: 'buttonBorderRadius',
          label: 'Button Border Radius',
          type: 'select',
          defaultValue: '6px',
          options: [
            { label: 'None (0px)', value: '0px' },
            { label: 'Small (4px)', value: '4px' },
            { label: 'Medium (6px)', value: '6px' },
            { label: 'Large (8px)', value: '8px' },
            { label: 'XL (12px)', value: '12px' },
            { label: '2XL (16px)', value: '16px' },
            { label: '3XL (24px)', value: '24px' },
            { label: 'Full / Pill (9999px)', value: '9999px' },
          ],
          admin: {
            description: { en: '(Border Radius)', th: 'ปรับความมนของปุ่มทั้งเว็บ (Border Radius)' },
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateThemeConfig],
  },
}
