import type { FastifyRequest, FastifyReply } from 'fastify'
import { checkPermission, checkBranch } from '../middlewares/auth.middlewares'

export async function resolveFiliais(req: FastifyRequest, res: FastifyReply) {
    const permission = await checkPermission(req, res)
    if (!permission) return null

    const branches = await checkBranch(req, res)
    if (!branches) return null

    return branches
}

interface FiliaisQuery {
    filiais?: string
}

/**
 * O usuário pode filtrar por um subconjunto das próprias filiais liberadas
 * (?filiais=1,3). Nunca confiamos nesse parâmetro sozinho — ele só pode
 * restringir, nunca ampliar, o que já veio verificado do JWT.
 */
export function resolveFiliaisSelecionadas(req: FastifyRequest, filiaisLiberadas: number[]) {
    const { filiais } = req.query as FiliaisQuery

    if (!filiais) return filiaisLiberadas

    const solicitadas = filiais
        .split(',')
        .map((id) => parseInt(id, 10))
        .filter((id) => !Number.isNaN(id))

    const selecionadas = filiaisLiberadas.filter((id) => solicitadas.includes(id))

    return selecionadas.length > 0 ? selecionadas : filiaisLiberadas
}

export const FILIAL_ECOMMERCE = 99
export const FILIAL_ORIGEM_ECOMMERCE = 1

/**
 * Vendas do vendedor Tray (e-commerce) ficam fisicamente no estoque do Prado
 * (IDEMPRESA=1), mas as queries de venda/lucro/cupom remapeiam essas linhas pra
 * IDEMPRESA=99 (ver IDVENDEDOR IN (...) nas queries). Quem tem acesso ao Prado
 * também enxerga essas linhas no resultado, então liberamos a exibição de
 * e-commerce automaticamente pra quem tem acesso à filial 1.
 */
export function comFiltroEcommerce(filiais: number[]): number[] {
    if (filiais.includes(FILIAL_ORIGEM_ECOMMERCE) && !filiais.includes(FILIAL_ECOMMERCE)) {
        return [...filiais, FILIAL_ECOMMERCE]
    }
    return filiais
}
