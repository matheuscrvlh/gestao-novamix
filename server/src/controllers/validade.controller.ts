import type { FastifyRequest, FastifyReply } from 'fastify'
import { connCiss } from '../database/ciss.database'
import { loadQueryGestao } from '../services/query.service'
import { resolveFiliais, resolveFiliaisSelecionadas } from '../utils/filiais'

interface ValidadeQuery {
    dias?: string
}

export async function getValidade(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const { dias } = req.query as ValidadeQuery
    const diasJanela = Math.min(Math.max(parseInt(dias ?? '30', 10) || 30, 1), 180)

    const filiais = resolveFiliaisSelecionadas(req, filiaisLiberadas)
    const sql = loadQueryGestao('validade_proxima.sql').replaceAll('{{FILIAIS}}', filiais.join(','))

    const conn = await connCiss()
    try {
        const linhas = await conn.query(sql, [diasJanela])
        res.send(linhas)
    } finally {
        await conn.close()
    }
}
