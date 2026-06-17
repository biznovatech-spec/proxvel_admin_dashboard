import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CoverageChartProps {
  withCover: number
  withoutCover: number
}

export function CoverageChart({ withCover, withoutCover }: CoverageChartProps) {
  const total = withCover + withoutCover
  const data = [
    { name: 'Con portada', value: withCover, color: '#0e9151' },
    { name: 'Sin portada', value: withoutCover, color: '#e2e8f0' },
  ]
  const percent = total > 0 ? Math.round((withCover / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobertura de portadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={total > 0 ? data : [{ name: 'Sin datos', value: 1, color: '#e2e8f0' }]}
                dataKey="value"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {(total > 0 ? data : [{ name: 'Sin datos', value: 1, color: '#e2e8f0' }]).map(
                  (entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ),
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{percent}%</span>
            <span className="text-xs text-slate-400">con portada</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-5 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-jungle-600" /> Con portada ({withCover})
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Sin portada ({withoutCover})
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
