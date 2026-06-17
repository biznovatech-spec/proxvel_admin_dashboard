import type { ReactNode } from 'react'
import { Activity, CheckCircle2, XCircle, Clock, Database } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { env } from '@/config/env'
import { formatDateTime } from '@/utils/format'
import type { MetricsOverview } from '@/types'

interface SystemStatusPanelProps {
  apiOnline: boolean
  apiChecking: boolean
  metrics?: MetricsOverview
  lastSync?: string | null
}

function StatusLine({
  ok,
  label,
  value,
}: {
  ok: boolean | null
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <div className="flex items-center gap-2">
        {ok === null ? (
          <Clock className="h-4 w-4 text-slate-300" />
        ) : ok ? (
          <CheckCircle2 className="h-4 w-4 text-jungle-500" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-500" />
        )}
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}

export function SystemStatusPanel({
  apiOnline,
  apiChecking,
  metrics,
  lastSync,
}: SystemStatusPanelProps) {
  const withoutMedia = metrics?.destinations.without_media
  const pendingModules = ['Importación Excel', 'Gestión de usuarios', 'Analítica de uso']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-lake-600" />
          Estado de la aplicación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StatusLine
          ok={apiChecking ? null : apiOnline}
          label="API"
          value={
            apiChecking ? (
              <Badge variant="neutral">Verificando…</Badge>
            ) : apiOnline ? (
              <Badge variant="success">Disponible</Badge>
            ) : (
              <Badge variant="danger">No disponible</Badge>
            )
          }
        />
        <StatusLine
          ok={apiChecking ? null : apiOnline}
          label="Backend conectado"
          value={apiOnline ? 'Sí' : 'No'}
        />
        <StatusLine ok={true} label="Autenticación admin" value={<Badge variant="success">Activa</Badge>} />
        <StatusLine
          ok={null}
          label="Base URL"
          value={<code className="text-xs">{env.apiBaseUrl}</code>}
        />
        <StatusLine
          ok={null}
          label="Última sincronización de datos"
          value={lastSync ? formatDateTime(lastSync) : '—'}
        />
        <StatusLine
          ok={withoutMedia === 0}
          label="Destinos sin multimedia"
          value={
            <span className="inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-slate-400" />
              {withoutMedia ?? '—'}
            </span>
          }
        />
        <div className="pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Módulos pendientes ({pendingModules.length})
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pendingModules.map((m) => (
              <Badge key={m} variant="warning">
                {m}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
