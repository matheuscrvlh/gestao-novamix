import { authenticate } from '../middlewares/auth.middlewares'
import { getMe, getEvolucaoMensal, getTopProdutos } from '../controllers/gestao.controller'
import { getEstoqueResumo } from '../controllers/estoque.controller'
import { getValidade } from '../controllers/validade.controller'
import { getPromocoes } from '../controllers/promocoes.controller'
import { getMetas, salvarMeta, deletarMeta } from '../controllers/metas.controller'

export function gestaoRoutes(fastify) {
    fastify.get('/gestao/me', { preHandler: [authenticate] }, getMe)
    fastify.get('/gestao/evolucao-mensal', { preHandler: [authenticate] }, getEvolucaoMensal)
    fastify.get('/gestao/top-produtos', { preHandler: [authenticate] }, getTopProdutos)
    fastify.get('/gestao/estoque-resumo', { preHandler: [authenticate] }, getEstoqueResumo)
    fastify.get('/gestao/validade', { preHandler: [authenticate] }, getValidade)
    fastify.get('/gestao/promocoes', { preHandler: [authenticate] }, getPromocoes)
    fastify.get('/gestao/metas', { preHandler: [authenticate] }, getMetas)
    fastify.post('/gestao/metas', { preHandler: [authenticate] }, salvarMeta)
    fastify.delete('/gestao/metas/:id', { preHandler: [authenticate] }, deletarMeta)
}
