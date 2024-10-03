export const getCurrentDate = () => {
  const currentDate = new Date()
  const firstDayOfCurrentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )

  return { currentDate, firstDayOfCurrentMonth }
}
