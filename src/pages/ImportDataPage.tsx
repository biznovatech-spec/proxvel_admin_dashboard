import { useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Info } from 'lucide-react'
import { useImport } from '@/hooks/useImport'
import type { ImportType } from '@/api/endpoints'

const SECTIONS: { type: ImportType; label: string; description: string; columns: string; available: boolean }[] = [
  {
    type: 'absa',
    label: 'Matriz ABSA',
    description: 'Puntajes de percepción por aspecto turístico (0.0–1.0). Nuevos destinos se crean inactivos.',
    columns: 'destination, atractivos, costos, seguridad, accesibilidad, limpieza, atencion_servicio, gastronomia, alojamiento, clima, aforo_multitudes',
    available: true,
  },
  {
    type: 'tags',
    label: 'Tags de interés',
    description: 'Etiquetas de interés por destino (cultura, gastronomia, aventura…).',
    columns: 'destination, tags_interes',
    available: true,
  },
  {
    type: 'clima',
    label: 'Scores de clima',
    description: 'Score climático por destino y mes. Alimenta el contexto del motor.',
    columns: 'destination, month, month_name, pp, temp_prom, score_clima_modelo, nivel_clima_modelo',
    available: true,
  },
  {
    type: 'aforo',
    label: 'Scores de aforo',
    description: 'Aforo mensual por destino. Alimenta el contexto del motor.',
    columns: 'destination, month, month_name, score_aforo_modelo, nivel_aforo_modelo',
    available: true,
  },
]

function ImportCard({
  type, label, description, columns, available, state, onUpload,
}: (typeof SECTIONS)[0] & { state: ReturnType<typeof useImport>['states'][ImportType]; onUpload: (t: ImportType, f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(type, file)
    e.target.value = ''
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #E2E8F0',
        borderRadius: 16,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: available ? 1 : 0.6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: available ? 'rgba(216,155,31,0.10)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color={available ? '#D89B1F' : '#94A3B8'} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#0E1730', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{description}</p>
          </div>
        </div>
        {!available && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', background: '#F1F5F9', borderRadius: 6, padding: '3px 8px' }}>
            Próximamente
          </span>
        )}
      </div>

      <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ fontSize: 11, color: '#64748B', margin: 0, fontFamily: 'monospace', lineHeight: 1.6 }}>
          <strong>Columnas:</strong> {columns}
        </p>
      </div>

      {state.result && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <CheckCircle size={16} color="#16A34A" style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#15803D' }}>
            <strong>Importación exitosa</strong>
            {state.result.rows_processed != null && <div>Filas procesadas: {state.result.rows_processed}</div>}
            {state.result.destinations_created != null && <div>Destinos nuevos (inactivos): {state.result.destinations_created}</div>}
            {(state.result.scores_updated ?? state.result.records_updated) != null && (
              <div>Registros actualizados: {state.result.scores_updated ?? state.result.records_updated}</div>
            )}
            {!!state.result.errors && <div style={{ color: '#DC2626' }}>Errores: {state.result.errors}</div>}
          </div>
        </div>
      )}

      {state.error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{state.error}</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
      <button
        disabled={!available || state.loading}
        onClick={() => inputRef.current?.click()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          height: 42, borderRadius: 10, border: 'none', cursor: available ? 'pointer' : 'not-allowed',
          background: available ? '#0E1730' : '#E2E8F0', color: available ? '#fff' : '#94A3B8',
          fontWeight: 600, fontSize: 14, transition: 'opacity 0.15s',
        }}
      >
        {state.loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
        {state.loading ? 'Importando…' : 'Seleccionar CSV'}
      </button>
    </div>
  )
}

export function ImportDataPage() {
  const { states, upload } = useImport()

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0E1730', margin: 0 }}>
          Importar datos científicos
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 6 }}>
          Sube los CSV del modelo de tesis. Los datos se guardan directamente en la BD.
          Nuevos destinos detectados se crean automáticamente como <strong>inactivos</strong>.
        </p>
      </div>

      <div style={{ background: 'rgba(216,155,31,0.08)', border: '1px solid rgba(216,155,31,0.25)', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 28 }}>
        <Info size={16} color="#D89B1F" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: '#92681A', margin: 0, lineHeight: 1.55 }}>
          Los destinos nuevos importados aparecerán en <strong>Destinos turísticos</strong> como inactivos.
          Puedes completar su información y activarlos desde ahí.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
        {SECTIONS.map(s => (
          <ImportCard key={s.type} {...s} state={states[s.type]} onUpload={upload} />
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
