export interface IOutlay {
  success: boolean
  outlayTypes: IOutlayType[]
  outlayTemporalities: IOutlayTemporality[]
}

export interface IOutlayTemporality {
  id: number
  name: string
}

export interface IOutlayType {
  id: number
  name: string
  contains: string
}

export interface IOutlayCategories {
  outlayCategories: IOutlayCategoryDetail[]
}

export interface IOutlayCategoryDetail {
  id: number
  name: string
}

export interface IOutlayData {
  typeId: string
  projectOrCategoryId: string
  amount: string
  detail: string
  date: string
  temporalityId: string
  isProject: boolean
}
