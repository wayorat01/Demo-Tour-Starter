import { Field } from 'payload';

export type DesignVersionPreviewOptions = readonly{ label: string, value: string, image?: string }[]

/**
 * Creates a custom design version field with preview capabilities
 * @param blockType The type of block (e.g., 'feature', 'cta', etc.)
 * @param name The field name to use (default: 'designVersion')
 * @param defaultValue The default design version to use
 * @returns A field configuration object for Payload CMS
 */
export const designVersionPreview = (
  options: DesignVersionPreviewOptions
): Field => ({
  type: 'select',
  name: 'designVersion',
  defaultValue: options[0].value,
  required: true,
  options: options.map(({ label, value }) => ({ label, value })),
  admin: {
    components: {
      Field: {
        path: '@/components/AdminDashboard/DesignVersionPreview',
        serverProps: {
          options
        }
      }
    }
  }
});
