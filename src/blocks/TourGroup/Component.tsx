import { TourGroupDesignVersion } from './config'
import WowtourTourGroup1 from './wowtour_tour_group1'
import WowtourTourGroup2 from './wowtour_tour_group2'

type TourGroupDesigns<T extends string = string> = Required<
  Record<TourGroupDesignVersion, React.FC<any>>
> &
  Record<T, React.FC<any>>

const tourGroupDesigns: TourGroupDesigns = {
  TOUR_GROUP_WOWTOUR_1: WowtourTourGroup1,
  TOUR_GROUP_WOWTOUR_2: WowtourTourGroup2,
}

export const TourGroupBlockComponent: React.FC<any> = (props) => {
  if (props.blockType !== 'wowtourTourGroup') return null

  const { designVersion } = props || {}

  if (!designVersion) return null

  const ComponentToRender = tourGroupDesigns[designVersion as TourGroupDesignVersion]

  if (!ComponentToRender) return null

  return <ComponentToRender {...props} />
}

export default TourGroupBlockComponent
