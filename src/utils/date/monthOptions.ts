
export type MonthOption = { label: string; value: string }

const ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

export function buildMonthOptions(around = 0, forward = 15): MonthOption[] {
 
  const out: MonthOption[] = []
  const base = new Date()
  base.setDate(1)
  base.setHours(0,0,0,0)
  base.setMonth(base.getMonth() - around)

  for (let i = -around; i <= forward; i++) {
    const d = new Date(base)
    d.setMonth(base.getMonth() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const label = `${ES[d.getMonth()]}-${String(y).slice(-2)}`
    out.push({ label, value: `${y}-${m}` })
  }
  return out
}
