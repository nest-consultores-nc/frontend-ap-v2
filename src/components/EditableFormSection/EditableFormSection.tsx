import { useMemo, useState } from 'react'
import { useHistoryStore } from '../../hooks/useHistoryStore'

type Option = { label: string; value: string | number }
type Field =
  | { type: 'text' | 'number' | 'date' | 'money'; name: string; label: string;
      placeholder?: string; required?: boolean; colSpan?: 1 | 2; help?: string;
      readonly?: boolean; disabled?: boolean; addon?: { prefix?: string; suffix?: string };
      min?: string | number; max?: string | number; step?: string | number; firstOfMonthOnly?: boolean }
  | { type: 'textarea'; name: string; label: string; placeholder?: string; rows?: number; required?: boolean; colSpan?: 1 | 2; help?: string;
      readonly?: boolean; disabled?: boolean }
  | { type: 'select'; name: string; label: string; options: Option[]; required?: boolean; colSpan?: 1 | 2; help?: string;
      readonly?: boolean; disabled?: boolean }


type Props<T extends Record<string, any>> = {
  title: string
  storageKey: string
  seed: T
  fields: Field[]
  onPersist?: (data: T) => void
  onChange?: (draft: T, name: string, value: unknown) => T | void
 
  header?: React.ReactNode                           

}


export function EditableFormSection<T extends Record<string, any>>({
  title, storageKey, seed, fields, onPersist, onChange, header
}: Props<T>) {

  const { current, setCurrent, history, saveVersion, revertTo} =
    useHistoryStore<T>({ storageKey, seed })

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (name: string, value: unknown) => {
    const next = { ...current, [name]: value } as T
    const computed = onChange?.(next, name, value)
    setCurrent((computed ?? next) as T)
  }


  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CLP', maximumFractionDigits: 2 }).format(n || 0)

  const prettyDate = (n: number) => new Date(n).toLocaleString()

  const inputCls = "w-full border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"


  const labelCls = "text-sm font-medium text-gray-700"
  const helpCls  = "text-xs text-gray-500"

  const form = useMemo(() => (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(f => {
        const span = f.colSpan === 2 ? "md:col-span-2" : ""
        const value = (current as any)[f.name] ?? ''
        const valueForInput =
          (f.name === 'id' && typeof value === 'number' && value < 0)
            ? ''
            : (f.type === 'money'
                ? (typeof value === 'number' ? String(value) : String(value ?? ''))
                : (value === 0 ? 0 : value))

        const required = (f as any).required
        const showError = required && touched[f.name] && (value === '' || value === null)

        return (
          <div key={f.name} className={`flex flex-col gap-1 ${span}`}>
            <label className={labelCls}>{f.label}{required && <span className="text-red-500"> *</span>}</label>

            {f.type === 'textarea' && (
              <textarea
                rows={(f as any).rows ?? 6}
                placeholder={(f as any).placeholder}
                value={value}
                readOnly={(f as any).readonly}
                disabled={(f as any).disabled}
                onBlur={() => setTouched(t => ({ ...t, [f.name]: true }))}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className={`${inputCls} min-h-32 ${(f as any).readonly || (f as any).disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
            )}


            {f.type !== 'textarea' && f.type !== 'select' && (
              <div className="flex items-stretch">
                {f.type !== 'money' && (f as any).addon?.prefix && (
                  <span className="px-2.5 inline-flex items-center rounded-l-xl border border-r-0 bg-gray-50 text-gray-600">{(f as any).addon?.prefix}</span>
                )}
                {f.type === 'money' && (
                  <span className="px-2.5 inline-flex items-center rounded-l-xl border border-r-0 bg-gray-50 text-gray-600">$</span>
                )}
                  {f.type === 'date' && (f as any).firstOfMonthOnly ? (
                        <input
                          type="month"                            
                          value={
                            (() => {
                              const raw = String(valueForInput || '')
                          
                              if (/^\d{4}-\d{2}$/.test(raw)) return raw
                              if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.slice(0, 7)
                              return '' 
                            })()
                          }
                          readOnly={(f as any).readonly}
                          disabled={(f as any).disabled}
                          onBlur={() => setTouched(t => ({ ...t, [f.name]: true }))}
                          onChange={(e) => {
                       
                            const ym = e.target.value 
                            const normalized = ym ? `${ym}-01` : ''
                            handleChange(f.name, normalized)
                          }}
                          className={`${inputCls} ${(f as any).readonly || (f as any).disabled ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                        />
                      ) : (
                <input
                
                  type={f.type === 'money' ? 'text' : f.type}
                  inputMode={f.type === 'money' ? 'numeric' : undefined}
                  pattern={f.type === 'money' ? '-?[0-9]*' : undefined}
                  step={f.type !== 'money' ? (f as any).step : undefined}
                  min={f.type !== 'money' ? (f as any).min : undefined}
                  max={f.type !== 'money' ? (f as any).max : undefined}

                  placeholder={(f as any).placeholder}
                  value={
                    f.type === 'money'
                      ? (() => {
                          const s = String(valueForInput ?? '')
                          const neg = s.trim().startsWith('-')
                          const digits = s.replace(/\D/g, '')
                          return (neg ? '-' : '') + digits
                        })()
                      : valueForInput
                  }

                  readOnly={(f as any).readonly}
                  disabled={(f as any).disabled}
                  onBlur={() => setTouched(t => ({ ...t, [f.name]: true }))}

                  onChange={(e) => {
                    if (f.type === 'money') {
                      const raw = e.target.value || ''
                      const hasSign = raw.trim().startsWith('-')
                      const digits = raw.replace(/\D/g, '')
                      const text = (hasSign ? '-' : '') + digits
                      handleChange(f.name, (text === '' || text === '-') ? '' : Number(text))
                      return
                    }
                    const v = f.type === 'number' ? Number(e.target.value) : e.target.value
                    handleChange(f.name, v)
                  }}

                  onKeyDown={(e) => {
                    if (f.type !== 'money') return

                    const control = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End','Enter','Escape']
                    const isCtrl = e.ctrlKey || e.metaKey
                    if (control.includes(e.key) || isCtrl) return

                    const input = e.currentTarget as HTMLInputElement
                    const selStart = input.selectionStart ?? 0
                    const selEnd = input.selectionEnd ?? 0
                    const hasMinus = input.value.trim().startsWith('-')

                    if (/^[0-9]$/.test(e.key)) return
                    if (e.key === '-' && selStart === 0 && (!hasMinus || selEnd > 0)) return

                    e.preventDefault()
                  }}

                  onPaste={(e) => {
                    if (f.type !== 'money') return
                    e.preventDefault()

                    const input = e.currentTarget as HTMLInputElement
                    const selStart = input.selectionStart ?? 0
                    const selEnd = input.selectionEnd ?? 0
                    const pasted = e.clipboardData.getData('text') || ''

                    const pastedHasSign = /^\s*-/.test(pasted)
                    const pastedDigits = pasted.replace(/\D/g, '')
                    const prefix = (selStart === 0 && pastedHasSign) ? '-' : ''

                    const current = input.value
                    const nextRaw = current.slice(0, selStart) + prefix + pastedDigits + current.slice(selEnd)

                    const hasSign = nextRaw.trim().startsWith('-')
                    const digits  = nextRaw.replace(/\D/g, '')
                    const text    = (hasSign ? '-' : '') + digits

                    input.value = text
                    handleChange(f.name, (text === '' || text === '-') ? 0 : Number(text))
                  }}


                  className={`${inputCls} ${((f as any).addon?.prefix || f.type === 'money') ? 'rounded-l-none' : ''} ${(f as any).addon?.suffix ? 'rounded-r-none' : ''} ${((f as any).readonly || (f as any).disabled) ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                />
                )}


                {(f as any).addon?.suffix && (
                  <span className="px-2.5 inline-flex items-center rounded-r-xl border border-l-0 bg-gray-50 text-gray-600">{(f as any).addon?.suffix}</span>
                )}
              </div>
            )}

            {f.type === 'select' && (
              <select
                value={value}
                disabled={(f as any).readonly || (f as any).disabled}
                onBlur={() => setTouched(t => ({ ...t, [f.name]: true }))}
                onChange={(e) => {
                  const v = e.target.value
                  if (String(v).startsWith('#sep#')) return
                  handleChange(f.name, (isNaN(Number(v)) ? v : Number(v)))
                }}

                className={`${inputCls} ${((f as any).readonly || (f as any).disabled) ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Seleccione...</option>
 
              {(() => {
                const seen = new Set<string>()
                const cleanOptions = (f as any).options.filter((op: Option) => {
                  const v = String(op.value)
                  if (seen.has(v)) return false
                  seen.add(v)
                  return true
                })

                return cleanOptions.map((op: Option, idx: number) => {
                  const v = String(op.value)
                  const isSep = v.startsWith('#sep#')
                  return (
                    <option
                      key={`${v}-${idx}`}           
                      value={v}
                      disabled={isSep}
                      className={isSep ? 'text-gray-400 font-semibold' : ''}
                    >
                      {op.label}
                    </option>
                  )
                })
              })()}


              </select>
            )}


            {(f as any).help && <span className={helpCls}>{(f as any).help}</span>}
            {showError && <span className="text-xs text-red-600">Este campo es obligatorio</span>}

          </div>
        )
      })}
    </div>
  ), [fields, current, touched])

  return (
    <div className="grid gap-6 2xl:[grid-template-columns:minmax(22rem,2fr)_minmax(16rem,1fr)]">


      <div className="space-y-4">
        <div className="white border rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
            {form}
            <h3 className="text-xl font-semibold mb-4 translate-y-2">{header}</h3>
    
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              onClick={() => {
                saveVersion('Guardado manual')
                onPersist?.(current)
              }}
              className="w-full sm:w-auto px-3 py-3 rounded-xl border bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black transition"
            >
              Guardar versión
            </button>

          </div>


        </div>
      </div>

        <aside className="space-y-2 md:mt-4 2xl:mt-0">

        <div className="white border rounded-2xl shadow-sm p-4">
          <h3 className="font-medium">Historial de versiones</h3>
          <ul className="space-y-2 max-h-[65vh] overflow-auto pr-1 mt-2">
            {history.map(h => (
              <li key={h.id} className="border rounded-xl p-2">
                <div className="text-xs text-gray-600">{prettyDate(h.at)}</div>
                {h.note && <div className="text-sm">{h.note}</div>}
          {(() => {

            const prev = history
              .filter(x => x.at < h.at)
              .sort((a, b) => b.at - a.at)[0];

          
            const fieldMap = Object.fromEntries(fields.map(f => [f.name, f]));


            const formatVal = (key: string, v: any) => {
              if (v === null || v === undefined || v === '') return '—';
              if (key === 'id' && typeof v === 'number' && v < 0) return '—nuevo—'; 

              const f = fieldMap[key] as any | undefined;

              if (f?.type === 'money' && typeof v === 'number') return fmtMoney(v);

              if (f?.type === 'select' && f?.options) {
                const op = (f.options as Option[]).find(o => String(o.value) === String(v));
                return op ? op.label : String(v);
              }

              return (typeof v === 'object') ? JSON.stringify(v) : String(v);
            };


          
            const keys = Array.from(new Set([
              ...Object.keys(prev?.data ?? {}),
              ...Object.keys(h.data ?? {})
            ]));

            const diffs = keys
              .map(k => {
             
                if (k === 'uf') return null;   
                
                const fromV = prev?.data?.[k];
                const toV   = h.data?.[k];
                const changed = JSON.stringify(fromV) !== JSON.stringify(toV);
                if (!changed) return null;
                const type = fromV === undefined ? 'added' : (toV === undefined ? 'removed' : 'changed');
                return { key: k, fromV, toV, type };
              })
              .filter(Boolean) as Array<{ key: string; fromV: any; toV: any; type: 'added'|'removed'|'changed' }>;

                  return (
                    <div className="mt-2 rounded-lg border bg-gray-50">
                      <div className="px-3 py-2 text-xs text-gray-600">
                        {diffs.length ? `${diffs.length} cambio(s)` : 'Sin cambios en esta versión'}
                      </div>

                      {diffs.length > 0 && (
                        <ul className="divide-y">
                          {diffs.map(d => (
                              <li key={d.key} className="px-3 py-2 text-sm">
                                <div className="text-xs text-gray-500">
                                  {(() => {
                               
                                    const friendlyNames: Record<string, string> = {
                                 
                                      'outlay_category_id': 'Categoría',
                                      'project_id': 'Proyecto',
                                      'outlay_types_id': 'Tipo',
                                      'outlay_temporalities_id': 'Temporalidad',
                                      
                                
                                      'temporalities_id': 'Temporalidad',
                                      'month': 'Mes',
                                      
                          
                                      'uf': 'UF',   
                                    }
                                    
                                    const label = (fieldMap[d.key] as any)?.label
                                    return friendlyNames[d.key] ?? label ?? d.key
                                  })()}
                                </div>

                              {d.type === 'changed' && (
                                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                                  <span className="text-red-700 line-through">− {formatVal(d.key, d.fromV)}</span>
                                  <span className="text-green-700">→ {formatVal(d.key, d.toV)}</span>
                                </div>
                              )}

                              {d.type === 'added' && (
                                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                                  <span className="text-green-700">+ {formatVal(d.key, d.toV)}</span>
                                </div>
                              )}

                              {d.type === 'removed' && (
                                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                                  <span className="text-red-700">− {formatVal(d.key, d.fromV)}</span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })()}

                <button onClick={() => revertTo(h.id)} className="mt-2 text-sm underline">
                  Revertir a esta versión
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
