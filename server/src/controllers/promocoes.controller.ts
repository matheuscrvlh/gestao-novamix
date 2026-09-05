import type { FastifyRequest, FastifyReply } from 'fastify'
import { connCiss } from '../database/ciss.database'
import { loadQueryGestao } from '../services/query.service'
import { resolveFiliais, resolveFiliaisSelecionadas } from '../utils/filiais'
import { hojeISO, diasEntreISO, deslocarDiasISO } from '../utils/datas'

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

interface DetalheParams {
    idpromocao: string
}

interface PromocaoHeaderRow {
    IDPROMOCAO: number
    DESCRPROMOCAO: string
    DTINIPROMOCAO: string
    DTFIMPROMOCAO: string
}

interface PromocaoProdutoRow {
    IDSUBPRODUTO: number
    DESCRICAOPRODUTO: string
    IDCODBARPROD: number
    VALPRECO: number
    VALDESCONTO: number
    PERDESCONTO: number
}

interface PromocaoDesempenhoRow {
    IDSUBPRODUTO: number
    VENDA: number
    LUCRO: number
    QTD_VENDIDA: number
}

export async function getPromocaoDetalhe(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const { idpromocao } = req.params as DetalheParams
    const idPromocaoNum = parseInt(idpromocao, 10)
    if (!idPromocaoNum) {
        res.code(400).send({ error: 'Promoção inválida.' })
        return
    }

    const headerSql = loadQueryGestao('promocao_header.sql')
    const lojasSql = loadQueryGestao('promocao_lojas.sql')
    const produtosSql = loadQueryGestao('promocao_produtos.sql')

    const conn = await connCiss()
    try {
        const [headerRows, lojasBrutas, produtos] = await Promise.all([
            conn.query(headerSql, [idPromocaoNum]) as Promise<PromocaoHeaderRow[]>,
            conn.query(lojasSql, [idPromocaoNum]) as Promise<{ IDEMPRESA: number }[]>,
            conn.query(produtosSql, [idPromocaoNum]) as Promise<PromocaoProdutoRow[]>,
        ])

        const header = headerRows[0]
        if (!header) {
            res.code(404).send({ error: 'Promoção não encontrada.' })
            return
        }

        const lojas = lojasBrutas.filter((l) => filiaisLiberadas.includes(l.IDEMPRESA))
        if (lojas.length === 0) {
            res.code(403).send({ error: 'Sem acesso às lojas dessa promoção.' })
            return
        }

        const filiaisStr = lojas.map((l) => l.IDEMPRESA).join(',')
        const dtIni = String(header.DTINIPROMOCAO).slice(0, 10)
        const dtFim = String(header.DTFIMPROMOCAO).slice(0, 10)

        const hoje = hojeISO()
        const diasPromo = diasEntreISO(dtIni, dtFim)
        const dtFimEfetivo = dtFim < hoje ? dtFim : hoje
        const diasDecorridos = dtIni <= hoje ? diasEntreISO(dtIni, dtFimEfetivo) : 0

        const baselineFim = deslocarDiasISO(dtIni, -1)
        const baselineInicio = deslocarDiasISO(dtIni, -diasPromo)

        const desempenhoSql = loadQueryGestao('promocao_desempenho.sql').replaceAll('{{FILIAIS}}', filiaisStr)
        const [desempenho, desempenhoAntes] = await Promise.all([
            conn.query(desempenhoSql, [dtIni, dtFimEfetivo, idPromocaoNum]) as Promise<PromocaoDesempenhoRow[]>,
            diasDecorridos > 0
                ? (conn.query(desempenhoSql, [baselineInicio, baselineFim, idPromocaoNum]) as Promise<PromocaoDesempenhoRow[]>)
                : Promise.resolve([]),
        ])
        const desempenhoPorProduto = new Map(desempenho.map((d) => [d.IDSUBPRODUTO, d]))
        const desempenhoAntesPorProduto = new Map(desempenhoAntes.map((d) => [d.IDSUBPRODUTO, d]))

        const produtosComDesempenho = produtos.map((p) => {
            const d = desempenhoPorProduto.get(p.IDSUBPRODUTO)
            const antes = desempenhoAntesPorProduto.get(p.IDSUBPRODUTO)
            return {
                IDSUBPRODUTO: p.IDSUBPRODUTO,
                DESCRICAOPRODUTO: p.DESCRICAOPRODUTO.trim(),
                IDCODBARPROD: p.IDCODBARPROD,
                VALPRECO: Number(p.VALPRECO) || 0,
                VALDESCONTO: Number(p.VALDESCONTO) || 0,
                PERDESCONTO: Number(p.PERDESCONTO) || 0,
                VENDA: Number(d?.VENDA) || 0,
                LUCRO: Number(d?.LUCRO) || 0,
                QTD_VENDIDA: Number(d?.QTD_VENDIDA) || 0,
                VENDA_MEDIA_DIARIA_ANTES: diasPromo > 0 ? (Number(antes?.VENDA) || 0) / diasPromo : 0,
                QTD_MEDIA_DIARIA_ANTES: diasPromo > 0 ? (Number(antes?.QTD_VENDIDA) || 0) / diasPromo : 0,
            }
        })

        const totalVendaDurante = produtosComDesempenho.reduce((acc, p) => acc + p.VENDA, 0)
        const totalVendaAntes = desempenhoAntes.reduce((acc, d) => acc + (Number(d.VENDA) || 0), 0)
        const mediaDiariaDurante = diasDecorridos > 0 ? totalVendaDurante / diasDecorridos : null
        const mediaDiariaAntes = diasDecorridos > 0 ? totalVendaAntes / diasPromo : null
        const liftVendaPct =
            mediaDiariaDurante !== null && mediaDiariaAntes !== null && mediaDiariaAntes > 0
                ? (mediaDiariaDurante - mediaDiariaAntes) / mediaDiariaAntes
                : null

        res.send({
            IDPROMOCAO: header.IDPROMOCAO,
            DESCRPROMOCAO: String(header.DESCRPROMOCAO).trim(),
            DTINIPROMOCAO: header.DTINIPROMOCAO,
            DTFIMPROMOCAO: header.DTFIMPROMOCAO,
            lojas: lojas.map((l) => l.IDEMPRESA),
            produtos: produtosComDesempenho,
            analitico: {
                mediaDiariaDurante,
                mediaDiariaAntes,
                liftVendaPct,
                diasComparados: diasDecorridos > 0 ? Math.min(diasDecorridos, diasPromo) : 0,
            },
        })
    } finally {
        await conn.close()
    }
}
