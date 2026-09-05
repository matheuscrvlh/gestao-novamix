import type { FastifyRequest, FastifyReply } from 'fastify'
import { connCiss } from '../database/ciss.database'
import { loadQueryGestao } from '../services/query.service'
import { resolveFiliais, resolveFiliaisSelecionadas } from '../utils/filiais'

interface EstoqueQuery {
    inicio?: string
    fim?: string
    dias?: string
}

export async function getEstoqueResumo(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const { inicio, fim, dias } = req.query as EstoqueQuery
    if (!inicio || !fim) {
        res.code(400).send({ error: 'Informe os parametros inicio e fim (YYYY-MM-DD).' })
        return
    }

    const diasParado = Math.min(Math.max(parseInt(dias ?? '60', 10) || 60, 1), 365)
    const filiais = resolveFiliaisSelecionadas(req, filiaisLiberadas)
    const filiaisStr = filiais.join(',')

    const transferenciasSql = loadQueryGestao('transferencias_loja.sql').replaceAll('{{FILIAIS}}', filiaisStr)
    const negativoSql = loadQueryGestao('estoque_negativo.sql').replaceAll('{{FILIAIS}}', filiaisStr)
    const paradoSql = loadQueryGestao('estoque_parado.sql').replaceAll('{{FILIAIS}}', filiaisStr)

    const conn = await connCiss()
    try {
        const [transferencias, negativo, parado] = await Promise.all([
            conn.query(transferenciasSql, [inicio, fim, inicio, fim]),
            conn.query(negativoSql),
            conn.query(paradoSql, [diasParado]),
        ])
        res.send({ transferencias, negativo, parado })
    } finally {
        await conn.close()
    }
}
