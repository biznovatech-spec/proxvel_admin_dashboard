import { useState } from 'react'
import { importApi, type ImportResult, type ImportType } from '@/api/endpoints'

interface ImportState {
  loading: boolean
  result: ImportResult | null
  error: string | null
}

const initial: ImportState = { loading: false, result: null, error: null }

export function useImport() {
  const [states, setStates] = useState<Record<ImportType, ImportState>>({
    absa:  { ...initial },
    tags:  { ...initial },
    clima: { ...initial },
    aforo: { ...initial },
  })

  const upload = async (type: ImportType, file: File) => {
    setStates(s => ({ ...s, [type]: { loading: true, result: null, error: null } }))
    try {
      const result = await importApi.upload(type, file)
      setStates(s => ({ ...s, [type]: { loading: false, result, error: null } }))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Error al importar'
      setStates(s => ({ ...s, [type]: { loading: false, result: null, error: msg } }))
    }
  }

  return { states, upload }
}
