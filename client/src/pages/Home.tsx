import { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import DataTable from '../components/DataTable'
import EvolucaoChart from '../components/EvolucaoChart'
import Spinner from '../components/Spinner'
import { useMe } from '../hooks/useMe'
import { useApiResource } from '../hooks/useApiResource'
import { nomeFilial, comFiltroEcommerce } from '../constants/filiais'
import { formatCurrency, formatNumber, formatPercent } from '../lib/format'
import { formatMes, getUltimoMesFechado } from '../lib/date'
import type { EvolucaoMensalResponse, EvolucaoRedeRow, TopProdutosResponse } from '../types/gestao'

type RankMetric = 'FATURAMENTO' | 'LUCRO' | 'MARGEM' | 'N_CUPONS' | 'TICKET_MEDIO'
type ProdMetric = 'FATURAMENTO' | 'QUANTIDADE' | 'MARGEM' | 'NRO_CUPONS'

const PROD_PAGE_SIZE = 10

export default function Home() {
    const { me, loading: loadingMe, error: meError } = useMe()
    const habilitado = me !== null

    const [rankMetric, setRankMetric] = useState<RankMetric>('FATURAMENTO')
    const [lojaSelecionada, setLojaSelecionada] = useState<number | null>(null)
    const [prodMetric, setProdMetric] = useState<ProdMetric>('FATURAMENTO')
    const [prodBusca, setProdBusca] = useState('')
    const [prodVerTodos, setProdVerTodos] = useState(false)
    const [mesProdutos, setMesProdutos] = useState<string | null>(null)

    const evolucao = useApiResource<EvolucaoMensalResponse>('/gestao/evolucao-mensal', { meses: '24' }, habilitado)

    const rede = evolucao.data?.rede ?? []
    const porLoja = evolucao.data?.porLoja ?? []

    // O mês corrente nunca conta como referência: ainda está em andamento, então
    // comparar contra ele distorce o delta (ex: 5 dias de set/26 vs ago/26 inteiro).
    const mesFechado = getUltimoMesFechado().fim.slice(0, 7)
    const idxFechado = rede.findIndex((r) => r.MES === mesFechado)
    const ultimoMes = idxFechado >= 0 ? mesFechado : rede[rede.length - 2]?.MES ?? rede[rede.length - 1]?.MES
    const penultimoMes = idxFechado >= 0 ? rede[idxFechado - 1]?.MES : rede[rede.length - 3]?.MES
    const cur = rede.find((r) => r.MES === ultimoMes)
    const prev = rede.find((r) => r.MES === penultimoMes)

    const mesProdutosEfetivo = mesProdutos ?? ultimoMes ?? null
    const topProdutos = useApiResource<TopProdutosResponse>(
        '/gestao/top-produtos',
        mesProdutosEfetivo ? { mes: mesProdutosEfetivo } : {},
        habilitado
    )

    const branchesDisponiveis = useMemo(() => comFiltroEcommerce(me?.branches ?? []), [me])
    const lojaAtiva = lojaSelecionada ?? branchesDisponiveis[0] ?? null

    const rankingLojas = useMemo(() => {
        const linhas = porLoja.filter((r) => r.MES === ultimoMes).map((r) => ({
            ...r,
            MARGEM: r.FATURAMENTO !== 0 ? r.LUCRO / r.FATURAMENTO : 0,
            TICKET_MEDIO: r.N_CUPONS > 0 ? r.FATURAMENTO / r.N_CUPONS : 0,
        }))
        return linhas.slice().sort((a, b) => b[rankMetric] - a[rankMetric])
    }, [porLoja, ultimoMes, rankMetric])

    const drillRows: EvolucaoRedeRow[] = useMemo(() => {
        if (lojaAtiva == null) return []
        return porLoja
            .filter((r) => r.IDEMPRESA === lojaAtiva)
            .map((r) => ({
                MES: r.MES,
                FATURAMENTO: r.FATURAMENTO,
                LUCRO: r.LUCRO,
                N_CUPONS: r.N_CUPONS,
                MARGEM: r.FATURAMENTO !== 0 ? r.LUCRO / r.FATURAMENTO : 0,
                TICKET_MEDIO: r.N_CUPONS > 0 ? r.FATURAMENTO / r.N_CUPONS : 0,
            }))
    }, [porLoja, lojaAtiva])

    const produtosFiltrados = useMemo(() => {
        const produtos = topProdutos.data?.produtos ?? []
        const termo = prodBusca.trim().toLowerCase()
        const filtrados = termo ? produtos.filter((p) => p.PRODUTO.toLowerCase().includes(termo)) : produtos
        return filtrados.slice().sort((a, b) => b[prodMetric] - a[prodMetric])
    }, [topProdutos.data, prodBusca, prodMetric])

    const produtosVisiveis = prodVerTodos ? produtosFiltrados : produtosFiltrados.slice(0, PROD_PAGE_SIZE)

    if (loadingMe) {
        return (
            <div className='flex w-full min-h-screen bg-gray dark:bg-dark-bg'>
                <Sidebar isAdmin={false} />
                <main className='flex-1 min-w-0 flex items-center justify-center lg:ml-64'>
                    <span className='text-sm text-gray-dark dark:text-dark-text-muted'>Carregando...</span>
                </main>
            </div>
        )
    }

    if (meError || !me) {
        return (
            <div className='flex w-full min-h-screen bg-gray dark:bg-dark-bg'>
                <Sidebar isAdmin={false} />
                <main className='flex-1 min-w-0 flex items-center justify-center lg:ml-64'>
                    <span className='text-sm text-red-base'>{meError ?? 'Não foi possível carregar seus dados.'}</span>
                </main>
            </div>
        )
    }

    const cardClass =
        'rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6 shadow-sm'
    const selectClass =
        'rounded-lg border border-gray-base/30 bg-white px-3 py-2 text-sm text-gray-text dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'

    return (
        <div className='flex w-full min-h-screen bg-gray dark:bg-dark-bg'>
            <Sidebar isAdmin={me.isAdmin} />

            <main className='flex-1 min-w-0 flex flex-col lg:ml-64'>
                <section className='flex-1 w-full max-w-6xl mx-auto px-6 pt-20 pb-10 lg:pt-10'>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>Gestão Novamix</h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-6'>
                        Performance da rede — faturamento, margem e produtos.
                    </p>

                    {/* KPI strip */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
                        {(
                            [
                                {
                                    label: 'Venda',
                                    valor: cur ? formatCurrency(cur.FATURAMENTO) : '—',
                                    up: cur && prev ? cur.FATURAMENTO >= prev.FATURAMENTO : null,
                                    delta:
                                        cur && prev && prev.FATURAMENTO !== 0
                                            ? formatPercent(Math.abs(cur.FATURAMENTO / prev.FATURAMENTO - 1))
                                            : null,
                                },
                                {
                                    label: 'Nº de cupons',
                                    valor: cur ? formatNumber(cur.N_CUPONS) : '—',
                                    up: cur && prev ? cur.N_CUPONS >= prev.N_CUPONS : null,
                                    delta:
                                        cur && prev && prev.N_CUPONS !== 0
                                            ? formatPercent(Math.abs(cur.N_CUPONS / prev.N_CUPONS - 1))
                                            : null,
                                },
                                {
                                    label: 'Margem',
                                    valor: cur ? formatPercent(cur.MARGEM) : '—',
                                    up: cur && prev ? cur.MARGEM >= prev.MARGEM : null,
                                    delta: cur && prev ? `${Math.abs((cur.MARGEM - prev.MARGEM) * 100).toFixed(1)}pp` : null,
                                },
                                {
                                    label: 'Ticket médio',
                                    valor: cur ? formatCurrency(cur.TICKET_MEDIO) : '—',
                                    up: cur && prev ? cur.TICKET_MEDIO >= prev.TICKET_MEDIO : null,
                                    delta:
                                        cur && prev && prev.TICKET_MEDIO !== 0
                                            ? formatPercent(Math.abs(cur.TICKET_MEDIO / prev.TICKET_MEDIO - 1))
                                            : null,
                                },
                            ] as const
                        ).map((kpi) => (
                            <div key={kpi.label} className={cardClass}>
                                <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                                    {kpi.label} {ultimoMes ? `· ${formatMes(ultimoMes)}` : ''}
                                </span>
                                <div className='mt-2 text-2xl font-semibold text-gray-text dark:text-dark-text'>
                                    {evolucao.loading ? <Spinner className='h-5 w-5' /> : kpi.valor}
                                </div>
                                {kpi.delta && penultimoMes && (
                                    <div className='mt-1 text-xs text-gray-dark dark:text-dark-text-muted'>
                                        {kpi.up ? '▲' : '▼'} {kpi.delta} vs {formatMes(penultimoMes)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Evolução da rede */}
                    <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mb-1'>Evolução da rede</h2>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-4'>
                        Faturamento e margem mensal, últimos 2 anos.
                    </p>
                    <div className={`${cardClass} mb-8`} style={{ height: 320 }}>
                        {evolucao.erro ? (
                            <span className='text-sm text-red-base'>{evolucao.erro}</span>
                        ) : evolucao.loading ? (
                            <div className='flex h-full items-center justify-center'>
                                <Spinner className='h-6 w-6' />
                            </div>
                        ) : (
                            <EvolucaoChart rows={rede} />
                        )}
                    </div>

                    {/* Ranking de lojas */}
                    <div className='flex items-baseline justify-between mt-8 mb-4 flex-wrap gap-2'>
                        <div>
                            <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text'>Ranking de lojas</h2>
                            <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                                {ultimoMes ? formatMes(ultimoMes) : ''}
                            </p>
                        </div>
                        <select
                            className={selectClass}
                            value={rankMetric}
                            onChange={(e) => setRankMetric(e.target.value as RankMetric)}
                        >
                            <option value='FATURAMENTO'>Faturamento</option>
                            <option value='LUCRO'>Lucro</option>
                            <option value='MARGEM'>Margem %</option>
                            <option value='N_CUPONS'>Nº de cupons</option>
                            <option value='TICKET_MEDIO'>Ticket médio</option>
                        </select>
                    </div>
                    <DataTable
                        columns={[
                            { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                            { key: 'fat', label: 'Faturamento', align: 'right', render: (r) => formatCurrency(r.FATURAMENTO) },
                            { key: 'lucro', label: 'Lucro', align: 'right', render: (r) => formatCurrency(r.LUCRO) },
                            { key: 'margem', label: 'Margem', align: 'right', render: (r) => formatPercent(r.MARGEM) },
                            { key: 'cupons', label: 'Nº cupons', align: 'right', render: (r) => formatNumber(r.N_CUPONS) },
                            { key: 'ticket', label: 'Ticket médio', align: 'right', render: (r) => formatCurrency(r.TICKET_MEDIO) },
                        ]}
                        rows={rankingLojas}
                        loading={evolucao.loading}
                        erro={evolucao.erro}
                    />

                    {/* Loja em detalhe */}
                    <div className='flex items-baseline justify-between mt-8 mb-4 flex-wrap gap-2'>
                        <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text'>Loja em detalhe</h2>
                        <select
                            className={selectClass}
                            value={lojaAtiva ?? ''}
                            onChange={(e) => setLojaSelecionada(Number(e.target.value))}
                        >
                            {branchesDisponiveis.map((id) => (
                                <option key={id} value={id}>
                                    {nomeFilial(id)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={cardClass} style={{ height: 280 }}>
                        {evolucao.loading ? (
                            <div className='flex h-full items-center justify-center'>
                                <Spinner className='h-6 w-6' />
                            </div>
                        ) : (
                            <EvolucaoChart rows={drillRows} />
                        )}
                    </div>

                    {/* Top produtos */}
                    <div className='flex items-baseline justify-between mt-8 mb-4 flex-wrap gap-2'>
                        <div>
                            <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text'>Top produtos</h2>
                            <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                                {topProdutos.data ? formatMes(topProdutos.data.mes) : ultimoMes ? formatMes(ultimoMes) : ''}
                            </p>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            <select
                                className={selectClass}
                                value={mesProdutos ?? ultimoMes ?? ''}
                                onChange={(e) => setMesProdutos(e.target.value)}
                            >
                                {rede
                                    .slice()
                                    .reverse()
                                    .map((r) => (
                                        <option key={r.MES} value={r.MES}>
                                            {formatMes(r.MES)}
                                        </option>
                                    ))}
                            </select>
                            <select
                                className={selectClass}
                                value={prodMetric}
                                onChange={(e) => setProdMetric(e.target.value as ProdMetric)}
                            >
                                <option value='FATURAMENTO'>Faturamento</option>
                                <option value='QUANTIDADE'>Quantidade</option>
                                <option value='MARGEM'>Margem</option>
                                <option value='NRO_CUPONS'>Nº de cupons</option>
                            </select>
                            <input
                                type='text'
                                placeholder='Buscar produto…'
                                value={prodBusca}
                                onChange={(e) => setProdBusca(e.target.value)}
                                className={selectClass}
                            />
                        </div>
                    </div>
                    <DataTable
                        columns={[
                            { key: 'produto', label: 'Produto', render: (r) => r.PRODUTO },
                            { key: 'fat', label: 'Faturamento', align: 'right', render: (r) => formatCurrency(r.FATURAMENTO) },
                            { key: 'qtd', label: 'Quantidade', align: 'right', render: (r) => formatNumber(r.QUANTIDADE) },
                            { key: 'margem', label: 'Margem', align: 'right', render: (r) => formatPercent(r.MARGEM) },
                            { key: 'cupons', label: 'Nº cupons', align: 'right', render: (r) => formatNumber(r.NRO_CUPONS) },
                        ]}
                        rows={produtosVisiveis}
                        loading={topProdutos.loading}
                        erro={topProdutos.erro}
                    />
                    {produtosFiltrados.length > PROD_PAGE_SIZE && (
                        <button
                            type='button'
                            onClick={() => setProdVerTodos((v) => !v)}
                            className='mt-3 text-sm font-medium text-orange-base hover:text-orange-light'
                        >
                            {prodVerTodos ? '← Ver menos' : `Ver todos os produtos (${produtosFiltrados.length}) →`}
                        </button>
                    )}
                </section>

                <div className='pb-6'>
                    <Footer />
                </div>
            </main>
        </div>
    )
}
