interface Props {
  user_id: number
  project_id: string
  week: string
  dedicated: number
}

export function checkNotNullInputs(data: Props) {
  return Object.values(data).every((value) => {
    if (typeof value === 'number') {
      console.log(value)
      return value > 0
    }
    console.log(value)
    return value !== null && value !== '' 
  })
}
