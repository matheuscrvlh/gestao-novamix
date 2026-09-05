const cache = new Map<string, { data: unknown; expiresAt: number }>()

/**
 * Cache em memória simples pra respostas caras de consultar (ex: evolução
 * mensal de 2 anos no CISS leva ~30s). Um processo só, sem cluster — se o
 * servidor rodar com múltiplas instâncias isso vira um cache por instância,
 * o que é aceitável aqui (só reduz carga repetida, não é fonte de verdade).
 */
export async function comCache<T>(chave: string, ttlMs: number, carregar: () => Promise<T>): Promise<T> {
    const existente = cache.get(chave)
    if (existente && existente.expiresAt > Date.now()) {
        return existente.data as T
    }

    const data = await carregar()
    cache.set(chave, { data, expiresAt: Date.now() + ttlMs })
    return data
}
