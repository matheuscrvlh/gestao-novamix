import type { FastifyRequest, FastifyReply } from 'fastify'
import { connCiss } from '../database/ciss.database'
import { loadQueryGestao } from '../services/query.service'
import { resolveFiliais, resolveFiliaisSelecionadas } from '../utils/filiais'
import { hojeISO } from '../utils/datas'

interface PromocoesQuery {
    inicio?: string
    fim?: string
}

type StatusPromocao = 'ativa' | 'futura' | 'encerrada'

function statusPromocao(dtIni: string, dtFim: string, hoje: string): StatusPromocao {
    const dtIniISO = String(dtIni).slice(0, 10)
    const dtFimISO = String(dtFim).slice(0, 10)
    if (hoje < dtIniISO) return 'futura'
    if (hoje > dtFimISO) return 'encerrada'
    return 'ativa'
}

export async function getPromocoes(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const hoje = hojeISO()
    const { inicio, fim } = req.query as PromocoesQuery
    const inicioBusca = inicio ?? hoje
    const fimBusca = fim ?? hoje

    const filiais = resolveFiliaisSelecionadas(req, filiaisLiberadas)
    const sql = loadQueryGestao('promocoes_periodo.sql').replaceAll('{{FILIAIS}}', filiais.join(','))

    const conn = await connCiss()
    try {
        const linhas = await conn.query(sql, [inicioBusca, fimBusca])
        const resultado = linhas.map((row: any) => ({
            IDPROMOCAO: row.IDPROMOCAO,
            DESCRPROMOCAO: String(row.DESCRPROMOCAO).trim(),
            DTINIPROMOCAO: row.DTINIPROMOCAO,
            DTFIMPROMOCAO: row.DTFIMPROMOCAO,
            QTD_PRODUTOS: Number(row.QTD_PRODUTOS) || 0,
            QTD_LOJAS: Number(row.QTD_LOJAS) || 0,
            STATUS: statusPromocao(row.DTINIPROMOCAO, row.DTFIMPROMOCAO, hoje),
        }))
        res.send(resultado)
    } finally {
        await conn.close()
    }
}
