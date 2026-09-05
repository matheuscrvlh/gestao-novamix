import { useState } from 'react'
import PageShell from '../components/PageShell'
import DataTable from '../components/DataTable'
import DateRangeFilter from '../components/DateRangeFilter'
import Spinner from '../components/Spinner'
import { useMe } from '../hooks/useMe'
import { useApiResource } from '../hooks/useApiResource'
import { nomeFilial } from '../constants/filiais'
import { formatCurrency, formatNumber, formatDate } from '../lib/format'
import { getPresetRange } from '../lib/date'
import type { EstoqueResumoResponse, ValidadeRow, ProdutoBuscaRow, ProdutoDetalheResponse } from '../types/gestao'

type Aba = 'estoque' | 'validade' | 'produtos'

const DIAS_DESTAQUE_VALIDADE = 7

function diasAte(dataISO: string) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const data = new Date(`${dataISO}T00:00:00`)
    return Math.round((data.getTime() - hoje.getTime()) / 86400000)
}

const cardClass =
    'rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6 shadow-sm'
const selectClass =
    'rounded-lg border border-gray-base/30 bg-white px-3 py-2 text-sm text-gray-text dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'

export default function EstoqueProdutos() {
    const { me, loading: loadingMe, error: meError } = useMe()
    const habilitado = me !== null

    const [aba, setAba] = useState<Aba>('estoque')

    // Estoque
    const [inicio, setInicio] = useState(() => getPresetRange('mes').inicio)
    const [fim, setFim] = useState(() => getPresetRange('mes').fim)
    const [diasParado, setDiasParado] = useState('60')
    const estoque = useApiResource<EstoqueResumoResponse>(
        '/gestao/estoque-resumo',
        { inicio, fim, dias: diasParado },
        habilitado && aba === 'estoque'
    )

    // Validade
    const [diasValidade, setDiasValidade] = useState('30')
    const validade = useApiResource<ValidadeRow[]>(
        '/gestao/validade',
        { dias: diasValidade },
        habilitado && aba === 'validade'
    )

    // Produtos
    const [busca, setBusca] = useState('')
    const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null)
    const buscaValida = busca.trim().length >= 3
    const resultados = useApiResource<ProdutoBuscaRow[]>(
        '/gestao/produtos/busca',
        { busca },
        habilitado && aba === 'produtos' && buscaValida
    )
    const detalhe = useApiResource<ProdutoDetalheResponse>(
        produtoSelecionado ? `/gestao/produtos/${produtoSelecionado}` : '/gestao/produtos/0',
        {},
        habilitado && aba === 'produtos' && produtoSelecionado !== null
    )

    const abas: { id: Aba; label: string }[] = [
        { id: 'estoque', label: 'Estoque' },
        { id: 'validade', label: 'Validade' },
        { id: 'produtos', label: 'Produtos' },
    ]

    const tabBar = (
        <div className='mb-6 flex gap-2'>
            {abas.map((a) => (
                <button
                    key={a.id}
                    type='button'
                    onClick={() => setAba(a.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        aba === a.id
                            ? 'bg-orange-base text-white'
                            : 'text-gray-text hover:bg-orange-base/10 hover:text-orange-base dark:text-dark-text dark:hover:bg-orange-base/10 dark:hover:text-orange-light'
                    }`}
                >
                    {a.label}
                </button>
            ))}
        </div>
    )

    const filtrosEstoque = (
        <div className='flex flex-wrap items-end gap-4'>
            <DateRangeFilter inicio={inicio} fim={fim} onChangeInicio={setInicio} onChangeFim={setFim} />
            <div className='flex flex-col gap-2'>
                <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                    Parado há mais de
                </span>
                <select className={selectClass} value={diasParado} onChange={(e) => setDiasParado(e.target.value)}>
                    <option value='30'>30 dias</option>
                    <option value='60'>60 dias</option>
                    <option value='90'>90 dias</option>
                    <option value='120'>120 dias</option>
                </select>
            </div>
        </div>
    )

    const filtrosValidade = (
        <div className='flex flex-col gap-2'>
            <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                Janela
            </span>
            <select className={`${selectClass} w-fit`} value={diasValidade} onChange={(e) => setDiasValidade(e.target.value)}>
                <option value='7'>Próximos 7 dias</option>
                <option value='15'>Próximos 15 dias</option>
                <option value='30'>Próximos 30 dias</option>
                <option value='60'>Próximos 60 dias</option>
                <option value='90'>Próximos 90 dias</option>
            </select>
        </div>
    )

    const filtrosProdutos = (
        <div className='flex flex-col gap-2'>
            <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                Buscar
            </span>
            <input
                type='text'
                placeholder='Nome, código de barras ou código do produto…'
                value={busca}
                onChange={(e) => {
                    setBusca(e.target.value)
                    setProdutoSelecionado(null)
                }}
                className={`${selectClass} w-full max-w-md`}
            />
        </div>
    )

    return (
        <PageShell
            isAdmin={me?.isAdmin ?? false}
            loadingMe={loadingMe}
            meError={meError}
            autorizado={me !== null}
            titulo='Estoque e produtos'
            subtitulo='Transferências, estoque negativo/parado, validade e consulta de produtos.'
            filtros={
                <div className='mb-8'>
                    {tabBar}
                    {aba === 'estoque' && filtrosEstoque}
                    {aba === 'validade' && filtrosValidade}
                    {aba === 'produtos' && filtrosProdutos}
                </div>
            }
        >
            {aba === 'estoque' && (
                <>
                    <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mb-4'>Transferências entre lojas</h2>
                    <DataTable
                        columns={[
                            { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                            { key: 'enviado', label: 'Enviado', align: 'right', render: (r) => formatCurrency(r.VALOR_ENVIADO) },
                            { key: 'recebido', label: 'Recebido', align: 'right', render: (r) => formatCurrency(r.VALOR_RECEBIDO) },
                        ]}
                        rows={estoque.data?.transferencias ?? []}
                        loading={estoque.loading}
                        erro={estoque.erro}
                        rodape='Período selecionado no filtro acima.'
                    />

                    <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mt-8 mb-4'>Estoque negativo</h2>
                    <DataTable
                        columns={[
                            { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                            { key: 'produto', label: 'Produto', render: (r) => r.DESCRICAOPRODUTO.trim() },
                            { key: 'qtd', label: 'Qtd', align: 'right', render: (r) => formatNumber(r.QTDATUALESTOQUE) },
                        ]}
                        rows={estoque.data?.negativo ?? []}
                        loading={estoque.loading}
                        erro={estoque.erro}
                        rodape='Saldo de estoque abaixo de zero — geralmente indica erro de lançamento ou balanço pendente.'
                    />

                    <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mt-8 mb-4'>Estoque parado</h2>
                    <DataTable
                        columns={[
                            { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                            { key: 'produto', label: 'Produto', render: (r) => r.DESCRICAOPRODUTO.trim() },
                            { key: 'qtd', label: 'Qtd', align: 'right', render: (r) => formatNumber(r.QTDATUALESTOQUE) },
                            { key: 'valor', label: 'Valor parado', align: 'right', render: (r) => formatCurrency(r.VALATUALESTOQUE) },
                            {
                                key: 'ultimaVenda',
                                label: 'Última venda',
                                align: 'right',
                                render: (r) => (r.DTULTIMAVENDA ? formatDate(r.DTULTIMAVENDA.slice(0, 10)) : 'Nunca vendeu'),
                            },
                        ]}
                        rows={estoque.data?.parado ?? []}
                        loading={estoque.loading}
                        erro={estoque.erro}
                        rodape='Top 50 por valor parado, sem venda no período selecionado ao lado.'
                    />
                </>
            )}

            {aba === 'validade' && (
                <DataTable
                    columns={[
                        { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                        { key: 'produto', label: 'Produto', render: (r) => r.DESCRICAOPRODUTO.trim() },
                        {
                            key: 'validade',
                            label: 'Vence em',
                            align: 'right',
                            render: (r) => `${formatDate(r.DTVALIDADE.slice(0, 10))} (${diasAte(r.DTVALIDADE.slice(0, 10))}d)`,
                            destaque: (r) => diasAte(r.DTVALIDADE.slice(0, 10)) <= DIAS_DESTAQUE_VALIDADE,
                        },
                        { key: 'qtd', label: 'Qtd', align: 'right', render: (r) => formatNumber(r.QTDPRODUTO) },
                        { key: 'valor', label: 'Valor estimado', align: 'right', render: (r) => formatCurrency(r.VALOR_ESTIMADO) },
                    ]}
                    rows={validade.data ?? []}
                    loading={validade.loading}
                    erro={validade.erro}
                    rodape={`${(validade.data ?? []).length} lote(s) — em vermelho, vencendo em até ${DIAS_DESTAQUE_VALIDADE} dias.`}
                />
            )}

            {aba === 'produtos' && (
                <>
                    {!buscaValida ? (
                        <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                            Digite ao menos 3 caracteres pra buscar um produto.
                        </p>
                    ) : produtoSelecionado === null ? (
                        <div className={cardClass}>
                            {resultados.erro ? (
                                <span className='text-sm text-red-base'>{resultados.erro}</span>
                            ) : resultados.loading ? (
                                <div className='flex justify-center py-6'>
                                    <Spinner className='h-5 w-5' />
                                </div>
                            ) : (resultados.data ?? []).length === 0 ? (
                                <p className='text-sm text-gray-dark dark:text-dark-text-muted'>Nenhum produto encontrado.</p>
                            ) : (
                                <ul className='divide-y divide-gray-base/20 dark:divide-dark-border'>
                                    {(resultados.data ?? []).map((p) => (
                                        <li key={p.IDSUBPRODUTO}>
                                            <button
                                                type='button'
                                                onClick={() => setProdutoSelecionado(p.IDSUBPRODUTO)}
                                                className='flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm hover:text-orange-base'
                                            >
                                                <span className='text-gray-text dark:text-dark-text'>{p.DESCRICAOPRODUTO.trim()}</span>
                                                <span className='shrink-0 text-xs text-gray-dark dark:text-dark-text-muted'>
                                                    {p.DESCRSECAO?.trim() ?? '—'}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                type='button'
                                onClick={() => setProdutoSelecionado(null)}
                                className='mb-4 text-sm font-medium text-orange-base hover:text-orange-light'
                            >
                                ← Voltar aos resultados
                            </button>

                            {detalhe.erro ? (
                                <span className='text-sm text-red-base'>{detalhe.erro}</span>
                            ) : detalhe.loading || !detalhe.data ? (
                                <div className='flex justify-center py-10'>
                                    <Spinner className='h-6 w-6' />
                                </div>
                            ) : (
                                <>
                                    <div className={cardClass}>
                                        <span className='text-lg font-semibold text-gray-text dark:text-dark-text'>
                                            {detalhe.data.cadastro.DESCRICAOPRODUTO.trim()}
                                        </span>
                                        <p className='mt-1 text-sm text-gray-dark dark:text-dark-text-muted'>
                                            {[detalhe.data.cadastro.DESCRDIVISAO, detalhe.data.cadastro.DESCRSECAO, detalhe.data.cadastro.DESCRGRUPO]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                        <p className='mt-1 text-xs text-gray-dark dark:text-dark-text-muted'>
                                            {detalhe.data.cadastro.FABRICANTE ? `Fabricante: ${detalhe.data.cadastro.FABRICANTE} · ` : ''}
                                            Código de barras: {detalhe.data.cadastro.IDCODBARPROD}
                                        </p>
                                    </div>

                                    <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mt-8 mb-4'>
                                        Estoque e preço por loja
                                    </h2>
                                    <DataTable
                                        columns={[
                                            { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                                            {
                                                key: 'qtd',
                                                label: 'Estoque',
                                                align: 'right',
                                                render: (r) => formatNumber(r.QTDATUALESTOQUE ?? 0),
                                            },
                                            {
                                                key: 'valor',
                                                label: 'Valor em estoque',
                                                align: 'right',
                                                render: (r) => formatCurrency(r.VALATUALESTOQUE ?? 0),
                                            },
                                            {
                                                key: 'preco',
                                                label: 'Preço de venda',
                                                align: 'right',
                                                render: (r) => (r.VALPRECOVENDA != null ? formatCurrency(r.VALPRECOVENDA) : '—'),
                                            },
                                            {
                                                key: 'ultimaVenda',
                                                label: 'Última venda',
                                                align: 'right',
                                                render: (r) => (r.DTULTIMAVENDA ? formatDate(r.DTULTIMAVENDA.slice(0, 10)) : '—'),
                                            },
                                        ]}
                                        rows={detalhe.data.estoquePreco}
                                        loading={false}
                                        erro={null}
                                    />

                                    <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mt-8 mb-4'>
                                        Venda nos últimos 90 dias
                                    </h2>
                                    <DataTable
                                        columns={[
                                            { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                                            { key: 'venda', label: 'Venda', align: 'right', render: (r) => formatCurrency(r.VENDA) },
                                            { key: 'lucro', label: 'Lucro', align: 'right', render: (r) => formatCurrency(r.LUCRO) },
                                            { key: 'qtd', label: 'Quantidade', align: 'right', render: (r) => formatNumber(r.QTD_VENDIDA) },
                                        ]}
                                        rows={detalhe.data.vendaRecente}
                                        loading={false}
                                        erro={null}
                                    />
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </PageShell>
    )
}
