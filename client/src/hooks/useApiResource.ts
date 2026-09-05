import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'

export function useApiResource<T>(endpoint: string, params: Record<string, string>, enabled: boolean) {
    const [data, setData] = useState<T | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [loadedKey, setLoadedKey] = useState<string | null>(null)

    const paramsKey = JSON.stringify(params)
    const requestKey = `${endpoint}|${paramsKey}`
    const loading = enabled && loadedKey !== requestKey

    useEffect(() => {
        if (!enabled) return

        let cancelled = false

        apiGet<T>(endpoint, params)
            .then((result) => {
                if (cancelled) return
                setData(result)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, endpoint, paramsKey, requestKey])

    return { data, loading, erro }
}
