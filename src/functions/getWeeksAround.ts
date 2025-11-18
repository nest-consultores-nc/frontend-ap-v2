// Devuelve semanas [-2, -1, base, +1, +2] en formato DD-MM-YYYY
export function getWeeksAround(baseWeek?: string, before = 2, after = 2): string[] {
  const base = toMonday(baseWeek ? parseDDMMYYYY(baseWeek) : new Date());
  const weeks: string[] = [];

  // anteriores
  for (let i = before; i > 0; i--) {
    weeks.push(formatDate(addDays(base, -7 * i)));
  }
  // base
  weeks.push(formatDate(base));
  // posteriores
  for (let i = 1; i <= after; i++) {
    weeks.push(formatDate(addDays(base, 7 * i)));
  }
  return weeks;
}

// ===== Helpers =====
function toMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();              // 0=Dom,1=Lun...
  const diff = (day + 6) % 7;             // 0 si ya es lunes
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function parseDDMMYYYY(s: string): Date {
  const [dd, mm, yyyy] = s.split('-').map(Number);
  return new Date(yyyy, (mm ?? 1) - 1, dd ?? 1);
}

function formatDate(date: Date): string {
  return `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
}
