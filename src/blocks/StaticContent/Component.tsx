import { StaticContentDesignVersion } from './config'
import WowtourStaticContent1 from '@/blocks/StaticContent/wowtour_static_content1'
import '@/blocks/StaticContent/wowtour_static_content1.css'

type About<T extends string = string> = Required<
  Record<StaticContentDesignVersion, React.FC<any>>
> &
  Record<T, React.FC<any>>

const staticContent: About = {
  STATIC_CONTENT_WOWTOUR_1: WowtourStaticContent1,
}

export const StaticContentBlockComponent: React.FC<any> = (props) => {
  if (props.blockType !== 'staticContent') return null

  const { designVersion } = props || {}

  if (!designVersion) return null

  const ComponentToRender = staticContent[designVersion as StaticContentDesignVersion]

  if (!ComponentToRender) return null

  return <ComponentToRender {...props} />
}

export default StaticContentBlockComponent
