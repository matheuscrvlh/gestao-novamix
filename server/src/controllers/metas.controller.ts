import type { FastifyRequest, FastifyReply } from 'fastify'
import { checkPermission } from '../middlewares/auth.middlewares'
import { resolveFiliais } from '../utils/filiais'
import { listMetas, upsertMeta, deleteMeta, resolverMetaPorLoja, IDEMPRESA_GERAL } from '../services/metas.service'

const ADMIN_ACCESS = 'admin'

interface MetasQuery {
    mesano?: string
}

export async function getMetas(req: FastifyRequest, res: FastifyReply) {
    const filiaisLiberadas = await resolveFiliais(req, res)
    if (!filiaisLiberadas) return

    const { mesano } = req.query as MetasQuery
    if (!mesano || !/^\d{6}$/.test(mesano)) {
        res.code(400).send({ error: 'Informe o parametro mesano (AAAAMM).' })
        return
    }

    const metas = await listMetas(mesano)

    const porLoja = filiaisLiberadas.map((idempresa) => {
        const resolvida = resolverMetaPorLoja(metas, idempresa)
        return {
            idempresa,
            meta_venda: resolvida?.meta_venda ?? 0,
            meta_margem_pct: resolvida?.meta_margem_pct ?? 0,
            origem: resolvida ? (resolvida.idempresa === idempresa ? 'especifica' : 'geral') : 'nenhuma',
        }
    })

    const permission = await checkPermission(req, res)
    const isAdmin = permission === ADMIN_ACCESS

    res.send({
        mesano,
        porLoja,
        bruto: isAdmin ? metas : undefined,
    })
}

interface SalvarMetaBody {
    idempresa: number
    mesano: string
    meta_venda: number
    meta_margem_pct: number
}

export async function salvarMeta(req: FastifyRequest, res: FastifyReply) {
    const permission = await checkPermission(req, res)
    if (!permission) return
    if (permission !== ADMIN_ACCESS) {
        res.code(403).send({ error: 'Acesso restrito a administradores.' })
        return
    }

    const body = req.body as SalvarMetaBody
    if (!body.mesano || !/^\d{6}$/.test(body.mesano) || !body.idempresa) {
        res.code(400).send({ error: 'Dados invalidos para salvar meta.' })
        return
    }

    await upsertMeta({
        idempresa: body.idempresa,
        mesano: body.mesano,
        meta_venda: Number(body.meta_venda) || 0,
        meta_margem_pct: Number(body.meta_margem_pct) || 0,
    })

    res.send({ ok: true })
}

interface DeletarMetaParams {
    id: string
}

export async function deletarMeta(req: FastifyRequest, res: FastifyReply) {
    const permission = await checkPermission(req, res)
    if (!permission) return
    if (permission !== ADMIN_ACCESS) {
        res.code(403).send({ error: 'Acesso restrito a administradores.' })
        return
    }

    const { id } = req.params as DeletarMetaParams
    await deleteMeta(parseInt(id, 10))

    res.send({ ok: true })
}

export { IDEMPRESA_GERAL }
