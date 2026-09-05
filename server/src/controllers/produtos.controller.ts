import type { FastifyRequest, FastifyReply } from 'fastify'
import { connCiss } from '../database/ciss.database'
import { loadQueryGestao } from '../services/query.service'
import { resolveFiliais, resolveFiliaisSelecionadas } from '../utils/filiais'

interface BuscaQuery {
    busca?: string
}

export async function getBuscaProdutos(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const { busca } = req.query as BuscaQuery
    const termo = busca?.trim() ?? ''

    if (termo.length < 3) {
        res.code(400).send({ error: 'Informe ao menos 3 caracteres de busca.' })
        return
    }

    const sql = loadQueryGestao('produto_busca.sql')

    const conn = await connCiss()
    try {
        const linhas = await conn.query(sql, [`%${termo}%`, `${termo}%`, `${termo}%`])
        res.send(linhas)
    } finally {
        await conn.close()
    }
}

interface ProdutoDetalheParams {
    idsubproduto: string
}

function hojeISO() {
    return new Date().toISOString().slice(0, 10)
}

function diasAtras(dias: number) {
    const data = new Date()
    data.setDate(data.getDate() - dias)
    return data.toISOString().slice(0, 10)
}

export async function getProdutoDetalhe(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const { idsubproduto } = req.params as ProdutoDetalheParams
    const id = parseInt(idsubproduto, 10)
    if (!id) {
        res.code(400).send({ error: 'Produto inválido.' })
        return
    }

    const filiais = resolveFiliaisSelecionadas(req, filiaisLiberadas)
    const sqlCadastro = loadQueryGestao('produto_cadastro.sql')
    const sqlEstoquePreco = loadQueryGestao('produto_estoque_preco.sql').replaceAll('{{FILIAIS}}', filiais.join(','))
    const sqlVendaRecente = loadQueryGestao('produto_venda_recente.sql').replaceAll('{{FILIAIS}}', filiais.join(','))

    const conn = await connCiss()
    try {
        const [cadastro, estoquePreco, vendaRecente] = await Promise.all([
            conn.query(sqlCadastro, [id]),
            conn.query(sqlEstoquePreco, [id, id]),
            conn.query(sqlVendaRecente, [id, diasAtras(90), hojeISO()]),
        ])

        if (cadastro.length === 0) {
            res.code(404).send({ error: 'Produto não encontrado.' })
            return
        }

        res.send({ cadastro: cadastro[0], estoquePreco, vendaRecente })
    } finally {
        await conn.close()
    }
}
