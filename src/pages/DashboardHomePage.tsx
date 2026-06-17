import { Link } from 'react-router-dom'
import {
  MapPinned,
  ImageOff,
  ImageUp,
  Map,
  MessageSquare,
  Users as UsersIcon,
  Megaphone,
  LineChart,
  ArrowRight,
} from 'lucide-react'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { MetricCard } from '@/components/metrics/MetricCard'
import { CoverageChart } from '@/components/metrics/CoverageChart'
import { SystemStatusPanel } from '@/components/metrics/SystemStatusPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useMetricsOverview, useSystemHealth } from '@/hooks/useMetrics'
import { useAuth } from '@/auth/useAuth'

export function DashboardHomePage() {
  const { user } = useAuth()
  const metricsQuery = useMetricsOverview()
  const health = useSystemHealth()
  const m = metricsQuery.data

  return (
    <div>
      <PageHeader
        title={`Hola, ${user?.name || 'administrador'}`}
        description="Resumen del contenido turístico gestionado en PROXVEL."
        actions={
          <Button asChild variant="secondary">
            <Link to="/destinos">
              Ver destinos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {metricsQuery.isError ? (
        <ErrorState
          title="No se pudieron cargar las métricas"
          message="Verifica que el backend esté disponible y que tu sesión tenga permisos administrativos."
          onRetry={() => void metricsQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Destinos activos"
              value={m?.destinations.total}
              icon={MapPinned}
              accent="navy"
              loading={metricsQuery.isLoading}
              index={0}
            />
            <MetricCard
              label="Destinos con portada"
              value={m?.destinations.with_cover}
              icon={ImageUp}
              accent="gold"
              loading={metricsQuery.isLoading}
              index={1}
            />
            <MetricCard
              label="Destinos sin portada"
              value={m?.destinations.without_cover}
              icon={ImageOff}
              accent="slate"
              hint="Requieren imagen de portada"
              loading={metricsQuery.isLoading}
              index={2}
            />
            <MetricCard
              label="Marcadores en mapa"
              value={m?.map_markers}
              icon={Map}
              accent="gold"
              loading={metricsQuery.isLoading}
              index={3}
            />
            <MetricCard
              label="Total de reseñas"
              value={m?.reviews.total}
              icon={MessageSquare}
              accent="navy"
              loading={metricsQuery.isLoading}
              index={4}
            />
            <MetricCard
              label="Total de usuarios"
              value={m?.users.total}
              icon={UsersIcon}
              accent="slate"
              hint={
                m
                  ? `${m.users.travelers} viajeros · ${m.users.admins + m.users.super_admins} admins`
                  : undefined
              }
              loading={metricsQuery.isLoading}
              index={5}
            />
            <MetricCard
              label="Anuncios activos"
              value={m?.announcements.active}
              icon={Megaphone}
              accent="gold"
              hint={m ? `${m.announcements.total} en total` : undefined}
              loading={metricsQuery.isLoading}
              index={6}
            />
            <MetricCard
              label="Destinos sin multimedia"
              value={m?.destinations.without_media}
              icon={ImageOff}
              accent="rose"
              loading={metricsQuery.isLoading}
              index={7}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <CoverageChart
                withCover={m?.destinations.with_cover ?? 0}
                withoutCover={m?.destinations.without_cover ?? 0}
              />
            </div>
            <div className="lg:col-span-2">
              <SystemStatusPanel
                apiOnline={health.isSuccess}
                apiChecking={health.isLoading}
                metrics={m}
                lastSync={m?.generated_at}
              />
            </div>
          </div>

          {/* Analítica de uso — honesta: aún no instrumentada */}
          <Card className="mt-6 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-slate-400" />
                Analítica de uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Analítica de uso aún no disponible. Requiere instrumentación de eventos en la
                app móvil y endpoints de métricas dedicados. No se muestran usuarios activos,
                carga del servidor ni uso de CPU porque no existe una fuente real para esos datos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <code className="rounded-md bg-slate-900 px-2.5 py-1 text-xs text-slate-100">
                  POST /analytics/events
                </code>
                <code className="rounded-md bg-slate-900 px-2.5 py-1 text-xs text-slate-100">
                  GET /admin/metrics/usage
                </code>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
