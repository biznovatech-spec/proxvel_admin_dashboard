import { FileSpreadsheet, UploadCloud, Info, CheckCircle2, Download } from 'lucide-react'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

const EXPECTED_COLUMNS = [
  { name: 'destination_id', desc: 'Identificador único (slug) del destino' },
  { name: 'destination', desc: 'Nombre del destino turístico' },
  { name: 'city', desc: 'Ciudad' },
  { name: 'region', desc: 'Región / departamento' },
  { name: 'category', desc: 'Categoría turística' },
  { name: 'type', desc: 'Tipo' },
  { name: 'subtype', desc: 'Subtipo' },
  { name: 'official_source_name', desc: 'Fuente oficial (MINCETUR u otra)' },
]

function downloadTemplate() {
  const headers = EXPECTED_COLUMNS.map((c) => c.name).join(',')
  const example = 'machu-picchu,Machu Picchu,Aguas Calientes,Cusco,Cultural,Arqueológico,Ciudadela Inca,MINCETUR'
  const blob = new Blob([`${headers}\n${example}\n`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'plantilla_destinos_proxvel.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ExcelImportPage() {
  return (
    <div>
      <PageHeader
        title="Importar Excel"
        description="Carga masiva de destinos turísticos desde una hoja de cálculo."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate} leftIcon={<Download className="h-4 w-4" />}>
              Descargar plantilla
            </Button>
            <Badge variant="warning">Importación · fase posterior</Badge>
          </div>
        }
        backTo="/destinos"
        backLabel="Volver a destinos"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Dropzone deshabilitado */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center opacity-80">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-soft">
              <UploadCloud className="h-8 w-8" />
            </div>
            <p className="text-base font-semibold text-slate-700">
              Arrastra tu archivo .xlsx aquí
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              La importación masiva por Excel está <strong>planificada para una fase
              posterior</strong>. Por ahora, agrega destinos individualmente desde
              «Nuevo destino» en el catálogo.
            </p>
            <Tooltip content="Requiere el endpoint POST /admin/destinations/import">
              <span className="mt-5 inline-block">
                <Button disabled variant="primary" leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
                  Seleccionar archivo
                </Button>
              </span>
            </Tooltip>
          </div>

          <Card className="mt-6 border-lake-100 bg-lake-50/40">
            <CardContent className="flex gap-3 p-5">
              <Info className="h-5 w-5 shrink-0 text-lake-600" />
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Endpoints backend necesarios</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <Badge variant="outline">POST</Badge> /api/v1/admin/destinations/import
                    {' '}— recibe el archivo, valida y devuelve un resumen previo.
                  </li>
                  <li>
                    <Badge variant="outline">POST</Badge>{' '}
                    /api/v1/admin/destinations/import/confirm — confirma la inserción.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columnas esperadas */}
        <Card>
          <CardHeader>
            <CardTitle>Columnas esperadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EXPECTED_COLUMNS.map((col) => (
              <div key={col.name} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-jungle-500" />
                <div>
                  <code className="text-sm font-semibold text-slate-800">{col.name}</code>
                  <p className="text-xs text-slate-500">{col.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
