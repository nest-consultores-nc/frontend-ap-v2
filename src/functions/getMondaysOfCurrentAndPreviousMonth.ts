export function getMondaysOfCurrentAndPreviousMonth(): string[] {
  const mondays: string[] = []

  // Get the current date
  const today = new Date()
  const currentMonth = today.getMonth()
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const currentYear = today.getFullYear()
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Helper function to get all Mondays of a given month and format them
  const getMondaysOfMonth = (year: number, month: number): string[] => {
    const mondaysInMonth: string[] = []
    const date = new Date(year, month, 1)

    // Find the first Monday of the month
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1)
    }

    // Push all Mondays of the month in the format "dd-mm-yyyy"
    while (date.getMonth() === month) {
      const formattedDate = `${('0' + date.getDate()).slice(-2)}-${(
        '0' +
        (date.getMonth() + 1)
      ).slice(-2)}-${date.getFullYear()}`
      mondaysInMonth.push(formattedDate)
      date.setDate(date.getDate() + 7) // Move to the next Monday
    }

    return mondaysInMonth
  }

  // Get all Mondays of the previous month
  mondays.push(...getMondaysOfMonth(previousMonthYear, previousMonth))

  // Get all Mondays of the current month
  mondays.push(...getMondaysOfMonth(currentYear, currentMonth))

  return mondays
}
