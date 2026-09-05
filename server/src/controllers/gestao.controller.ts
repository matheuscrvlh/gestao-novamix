import type { FastifyRequest, FastifyReply } from 'fastify'
import { checkPermission, checkBranch } from '../middlewares/auth.middlewares'
import { connCiss } from '../database/ciss.database'
import { loadQueryGestao } from '../services/query.service'
import { resolveFiliais, resolveFiliaisSelecionadas } from '../utils/filiais'
import { primeiroDiaMesesAtras, primeiroDiaDoMes, primeiroDiaProximoMes, mesAtual } from '../utils/datas'

const ADMIN_ACCESS = 'admin'

export async function getMe(req: FastifyRequest, res: FastifyReply) {
    const permission = await checkPermission(req, res)
    if (!permission) return

    const branches = await checkBranch(req, res)
    if (!branches) return

    res.send({ permission, branches, isAdmin: permission === ADMIN_ACCESS })
}

interface EvolucaoMensalQuery {
    meses?: string
}

interface EvolucaoMensalRow {
    IDEMPRESA: number
    MES: string
    FATURAMENTO: number
    LUCRO: number
}

export async function getEvolucaoMensal(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const filiais = resolveFiliaisSelecionadas(req, filiaisLiberadas)
    const { meses } = req.query as EvolucaoMensalQuery
    const qtdMeses = Math.min(Math.max(parseInt(meses ?? '12', 10) || 12, 1), 24)
    const inicio = primeiroDiaMesesAtras(qtdMeses)

    const sql = loadQueryGestao('evolucao_mensal_loja.sql').replaceAll('{{FILIAIS}}', filiais.join(','))

    const conn = await connCiss()
    try {
        const porLoja = (await conn.query(sql, [inicio])) as EvolucaoMensalRow[]

        const porMes = new Map<string, { FATURAMENTO: number; LUCRO: number }>()
        for (const linha of porLoja) {
            const acumulado = porMes.get(linha.MES) ?? { FATURAMENTO: 0, LUCRO: 0 }
            acumulado.FATURAMENTO += Number(linha.FATURAMENTO)
            acumulado.LUCRO += Number(linha.LUCRO)
            porMes.set(linha.MES, acumulado)
        }

        const rede = Array.from(porMes.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([MES, { FATURAMENTO, LUCRO }]) => ({
                MES,
                FATURAMENTO,
                LUCRO,
                MARGEM: FATURAMENTO !== 0 ? LUCRO / FATURAMENTO : 0,
            }))

        res.send({ porLoja, rede })
    } finally {
        await conn.close()
    }
}

interface TopProdutosQuery {
    mes?: string
}

interface TopProdutoRow {
    PRODUTO: string
    FATURAMENTO: number
    QUANTIDADE: number
    LUCRO: number
    NRO_CUPONS: number
}

export async function getTopProdutos(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const filiais = resolveFiliaisSelecionadas(req, filiaisLiberadas)
    const { mes } = req.query as TopProdutosQuery
    const mesAlvo = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : mesAtual()

    const sql = loadQueryGestao('top_produtos.sql').replaceAll('{{FILIAIS}}', filiais.join(','))

    const conn = await connCiss()
    try {
        const rows = (await conn.query(sql, [primeiroDiaDoMes(mesAlvo), primeiroDiaProximoMes(mesAlvo)])) as TopProdutoRow[]

        const produtos = rows.map((row) => ({
            ...row,
            PRODUTO: row.PRODUTO.trim(),
            FATURAMENTO: Number(row.FATURAMENTO),
            QUANTIDADE: Number(row.QUANTIDADE),
            LUCRO: Number(row.LUCRO),
            MARGEM: Number(row.FATURAMENTO) !== 0 ? Number(row.LUCRO) / Number(row.FATURAMENTO) : 0,
        }))

        res.send({ mes: mesAlvo, produtos })
    } finally {
        await conn.close()
    }
}
