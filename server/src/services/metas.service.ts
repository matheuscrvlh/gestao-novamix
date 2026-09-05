import { supabasePool } from '../database/supabase.database'

export const IDEMPRESA_GERAL = 100

export interface MetaLoja {
    id: number
    idempresa: number
    mesano: string
    meta_venda: number
    meta_margem_pct: number
}

export async function listMetas(mesano: string): Promise<MetaLoja[]> {
    const { rows } = await supabasePool.query(
        'SELECT id, idempresa, mesano, meta_venda, meta_margem_pct FROM gestao.metas_loja WHERE mesano = $1 ORDER BY idempresa',
        [mesano]
    )
    return rows
}

export interface UpsertMetaInput {
    idempresa: number
    mesano: string
    meta_venda: number
    meta_margem_pct: number
}

export async function upsertMeta(input: UpsertMetaInput) {
    await supabasePool.query(
        `INSERT INTO gestao.metas_loja (idempresa, mesano, meta_venda, meta_margem_pct, updated_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (idempresa, mesano) DO UPDATE SET
            meta_venda = excluded.meta_venda,
            meta_margem_pct = excluded.meta_margem_pct,
            updated_at = now()`,
        [input.idempresa, input.mesano, input.meta_venda, input.meta_margem_pct]
    )
}

export async function deleteMeta(id: number) {
    await supabasePool.query('DELETE FROM gestao.metas_loja WHERE id = $1', [id])
}

/**
 * Resolve a meta de uma loja específica: usa a meta cadastrada pra ela, e se não
 * existir cai pra meta "Geral" (idempresa = IDEMPRESA_GERAL) do mesmo mês.
 */
export function resolverMetaPorLoja(metas: MetaLoja[], idempresa: number): MetaLoja | null {
    return metas.find((m) => m.idempresa === idempresa) ?? metas.find((m) => m.idempresa === IDEMPRESA_GERAL) ?? null
}
