import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'
import type { MeInfo } from '../types/gestao'

export function useMe() {
    const [me, setMe] = useState<MeInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        apiGet<MeInfo>('/gestao/me')
            .then(setMe)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return { me, loading, error }
}
