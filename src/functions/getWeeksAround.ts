export function getWeeksAround(baseWeek?: string, before = 2, after = 2): string[] {
  const base = toMonday(baseWeek ? parseDDMMYYYY(baseWeek) : new Date());
  const weeks: string[] = [];


  for (let i = before; i > 0; i--) {
    weeks.push(formatDate(addDays(base, -7 * i)));
  }

  weeks.push(formatDate(base));
  
  for (let i = 1; i <= after; i++) {
    weeks.push(formatDate(addDays(base, 7 * i)));
  }
  return weeks;
}


function toMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();             
  const diff = (day + 6) % 7;        
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

/**
 * Etiqueta relativa de una semana "DD-MM-AAAA" respecto a la semana actual.
 * Ej: "semana actual", "semana pasada", "hace 3 semanas".
 */
export function getWeekLabel(week: string): string {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(week)) return ''
  const current = toMonday(new Date())
  const target = toMonday(parseDDMMYYYY(week))
  const diff = Math.round((current.getTime() - target.getTime()) / (7 * 24 * 60 * 60 * 1000))
  if (diff === 0) return 'semana actual'
  if (diff === 1) return 'semana pasada'
  if (diff > 1) return `hace ${diff} semanas`
  if (diff === -1) return 'próxima semana'
  return `en ${-diff} semanas`
}

/** Fecha con su etiqueta relativa: "19-10-2026 - semana actual". */
export function formatWeekWithLabel(week: string): string {
  const label = getWeekLabel(week)
  return label ? `${week} - ${label}` : week
}
