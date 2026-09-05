import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'
import type { BaseRow } from '../types/gestao'

export function useRelatorio<T extends BaseRow>(
    endpoint: string,
    inicio: string,
    fim: string,
    filiais: number[],
    enabled: boolean
) {
    const [rows, setRows] = useState<T[]>([])
    const [erro, setErro] = useState<string | null>(null)
    const [loadedKey, setLoadedKey] = useState<string | null>(null)

    const filiaisKey = filiais.join(',')
    const requestKey = `${endpoint}|${inicio}|${fim}|${filiaisKey}`
    const loading = enabled && loadedKey !== requestKey

    useEffect(() => {
        if (!enabled) return

        let cancelled = false

        apiGet<T[]>(endpoint, { inicio, fim, filiais: filiaisKey })
            .then((data) => {
                if (cancelled) return
                setRows(data)
                setErro(null)
                setLoadedKey(requestKey)
            })
            .catch((err) => {
                if (cancelled) return
                setErro(err.message)
                setLoadedKey(requestKey)
            })

        return () => {
            cancelled = true
        }
    }, [enabled, endpoint, inicio, fim, filiaisKey, requestKey])

    return { rows, loading, erro }
}
